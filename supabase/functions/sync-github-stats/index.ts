import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RepoResult {
  url: string;
  owner: string;
  repo: string;
  stars: number;
  forks: number;
  language: string | null;
  license: string | null;
  error?: string;
}

function extractOwnerRepo(url: string): { owner: string; repo: string } | null {
  const cleaned = url.replace(/\.git$/, "").replace(/\/$/, "");
  const m = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (m) return { owner: m[1], repo: m[2] };
  return null;
}

async function fetchGitHubRepo(owner: string, repo: string): Promise<RepoResult> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const headers: Record<string, string> = { "User-Agent": "agentdir-sync" };

  // Use GitHub token if available for higher rate limits
  const ghToken = Deno.env.get("GITHUB_TOKEN");
  if (ghToken) {
    headers["Authorization"] = `Bearer ${ghToken}`;
  }

  const resp = await fetch(apiUrl, { headers });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`GitHub API ${resp.status}: ${text.slice(0, 200)}`);
  }
  const data = await resp.json();
  return {
    url: `https://github.com/${owner}/${repo}`,
    owner,
    repo,
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    language: data.language ?? null,
    license: data.license?.spdx_id ?? null,
  };
}

const CONCURRENCY = 6;
const SKIP_IF_UPDATED_WITHIN_HOURS = 20;

async function runPool<T, R>(items: T[], worker: (item: T) => Promise<R>, size: number): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await worker(items[i]);
    }
  });
  await Promise.all(runners);
  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  let triggerType = "manual";
  let force = false;
  try {
    const body = await req.json().catch(() => ({}));
    triggerType = body.trigger_type || "manual";
    force = !!body.force;
  } catch {
    // default
  }

  const { data: syncLog, error: logErr } = await supabase
    .from("github_sync_logs")
    .insert({ trigger_type: triggerType, status: "running" })
    .select("id")
    .single();

  if (logErr) {
    return new Response(JSON.stringify({ error: logErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const logId = syncLog.id;

  try {
    const { data: candidates } = await supabase
      .from("candidate_agents")
      .select("id, github_url")
      .not("github_url", "is", null)
      .neq("github_url", "");

    const { data: agents } = await supabase
      .from("agents")
      .select("id, github_url")
      .not("github_url", "is", null)
      .neq("github_url", "");

    const urlMap = new Map<string, { candidateIds: string[]; agentIds: string[] }>();
    for (const c of candidates || []) {
      const parsed = extractOwnerRepo(c.github_url);
      if (!parsed) continue;
      const key = `${parsed.owner}/${parsed.repo}`;
      const entry = urlMap.get(key) || { candidateIds: [], agentIds: [] };
      entry.candidateIds.push(c.id);
      urlMap.set(key, entry);
    }
    for (const a of agents || []) {
      const parsed = extractOwnerRepo(a.github_url);
      if (!parsed) continue;
      const key = `${parsed.owner}/${parsed.repo}`;
      const entry = urlMap.get(key) || { candidateIds: [], agentIds: [] };
      entry.agentIds.push(a.id);
      urlMap.set(key, entry);
    }

    // Load existing github_repos to enable skip-if-fresh
    const agentIdList = Array.from(urlMap.values()).flatMap((v) => v.agentIds);
    const freshAgentIds = new Set<string>();
    if (!force && triggerType === "scheduled" && agentIdList.length > 0) {
      const cutoff = new Date(Date.now() - SKIP_IF_UPDATED_WITHIN_HOURS * 3600 * 1000).toISOString();
      const { data: freshRepos } = await supabase
        .from("github_repos")
        .select("agent_id, updated_at")
        .in("agent_id", agentIdList)
        .gt("updated_at", cutoff);
      for (const r of freshRepos || []) freshAgentIds.add(r.agent_id);
    }

    const jobs = Array.from(urlMap.entries()).filter(([, v]) => {
      if (force || triggerType !== "scheduled") return true;
      // skip only if ALL linked agents are fresh and there are no candidates
      if (v.candidateIds.length > 0) return true;
      if (v.agentIds.length === 0) return true;
      return !v.agentIds.every((id) => freshAgentIds.has(id));
    });

    const totalRepos = urlMap.size;
    const skippedRepos = totalRepos - jobs.length;
    let updatedRepos = 0;
    let failedRepos = 0;
    const details: any[] = [];
    const ghToken = Deno.env.get("GITHUB_TOKEN");
    const concurrency = ghToken ? CONCURRENCY : 2;

    await runPool(jobs, async ([key, { candidateIds, agentIds }]) => {
      const [owner, repo] = key.split("/");
      try {
        const result = await fetchGitHubRepo(owner, repo);

        for (const cid of candidateIds) {
          await supabase.from("candidate_agents").update({
            stars: result.stars,
            forks: result.forks,
            primary_language: result.language || undefined,
            license: result.license || undefined,
          }).eq("id", cid);
        }

        for (const aid of agentIds) {
          const { data: existing } = await supabase
            .from("github_repos")
            .select("id")
            .eq("agent_id", aid)
            .maybeSingle();

          if (existing) {
            await supabase.from("github_repos").update({
              stars: result.stars,
              forks: result.forks,
              language: result.language,
              license: result.license,
              updated_at: new Date().toISOString(),
            }).eq("id", existing.id);
          } else {
            await supabase.from("github_repos").insert({
              agent_id: aid,
              repo_url: result.url,
              stars: result.stars,
              forks: result.forks,
              language: result.language,
              license: result.license,
            });
          }
        }

        updatedRepos++;
        details.push({ repo: key, stars: result.stars, forks: result.forks, status: "ok" });
      } catch (e: any) {
        failedRepos++;
        details.push({ repo: key, status: "error", error: e.message });
      }
      // small delay to smooth API burst; token gives us 5000/hr
      if (!ghToken) await new Promise((r) => setTimeout(r, 400));
    }, concurrency);

    await supabase.from("github_sync_logs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      total_repos: totalRepos,
      updated_repos: updatedRepos,
      failed_repos: failedRepos,
      details: { skipped: skippedRepos, items: details },
    }).eq("id", logId);

    return new Response(
      JSON.stringify({ success: true, total: totalRepos, updated: updatedRepos, skipped: skippedRepos, failed: failedRepos }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    await supabase.from("github_sync_logs").update({
      status: "failed",
      completed_at: new Date().toISOString(),
      error_message: e.message,
    }).eq("id", logId);

    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
