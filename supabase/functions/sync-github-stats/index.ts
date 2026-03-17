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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  let triggerType = "manual";
  try {
    const body = await req.json().catch(() => ({}));
    triggerType = body.trigger_type || "manual";
  } catch {
    // default
  }

  // Create sync log
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
    // Collect all unique GitHub URLs from candidates and agents
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

    // Deduplicate by URL
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

    const totalRepos = urlMap.size;
    let updatedRepos = 0;
    let failedRepos = 0;
    const details: any[] = [];

    for (const [key, { candidateIds, agentIds }] of urlMap) {
      const [owner, repo] = key.split("/");
      try {
        const result = await fetchGitHubRepo(owner, repo);
        
        // Update candidate_agents
        for (const cid of candidateIds) {
          await supabase.from("candidate_agents").update({
            stars: result.stars,
            forks: result.forks,
            primary_language: result.language || undefined,
            license: result.license || undefined,
          }).eq("id", cid);
        }

        // Upsert github_repos for published agents
        for (const aid of agentIds) {
          const { data: existing } = await supabase
            .from("github_repos")
            .select("id")
            .eq("agent_id", aid)
            .maybeSingle();

          const repoData = {
            agent_id: aid,
            repo_url: result.url,
            stars: result.stars,
            forks: result.forks,
            language: result.language,
            license: result.license,
          };

          if (existing) {
            await supabase.from("github_repos").update({
              stars: result.stars,
              forks: result.forks,
              language: result.language,
              license: result.license,
              updated_at: new Date().toISOString(),
            }).eq("id", existing.id);
          } else {
            await supabase.from("github_repos").insert(repoData);
          }
        }

        updatedRepos++;
        details.push({ repo: key, stars: result.stars, forks: result.forks, status: "ok" });
      } catch (e: any) {
        failedRepos++;
        details.push({ repo: key, status: "error", error: e.message });
      }

      // Rate limit: 1 req/sec without token, faster with token
      const ghToken = Deno.env.get("GITHUB_TOKEN");
      await new Promise((r) => setTimeout(r, ghToken ? 200 : 1200));
    }

    // Update sync log
    await supabase.from("github_sync_logs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      total_repos: totalRepos,
      updated_repos: updatedRepos,
      failed_repos: failedRepos,
      details,
    }).eq("id", logId);

    return new Response(
      JSON.stringify({ success: true, total: totalRepos, updated: updatedRepos, failed: failedRepos }),
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
