import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ---------- helpers ----------

function normalizeUrl(u?: string | null): string | null {
  if (!u) return null;
  try {
    const url = new URL(u.trim());
    let host = url.hostname.replace(/^www\./, "").toLowerCase();
    let path = url.pathname.replace(/\/+$/, "").toLowerCase();
    return `${host}${path}`;
  } catch {
    return u.trim().toLowerCase().replace(/\/+$/, "");
  }
}

function normalizeGithub(u?: string | null): string | null {
  if (!u) return null;
  const m = u.match(/github\.com\/([^\/\s\?#]+)\/([^\/\s\?#]+)/i);
  if (!m) return null;
  return `${m[1].toLowerCase()}/${m[2].toLowerCase().replace(/\.git$/, "")}`;
}

function normalizeName(n?: string | null): string {
  return (n || "").toLowerCase().replace(/[\s\-_.]+/g, "");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function fetchPage(url: string): Promise<string> {
  const resp = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; AgentDirBot/1.0; +https://agentdir.online)",
      Accept: "text/html,application/xhtml+xml,*/*",
    },
  });
  if (!resp.ok) throw new Error(`Fetch ${url} failed: ${resp.status}`);
  const text = await resp.text();
  // If HTML, strip; if markdown, keep as-is
  if (url.endsWith(".md") || text.startsWith("#") || text.startsWith("<!--")) {
    return text.slice(0, 60000);
  }
  return text
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60000);
}

interface ExtractedAgent {
  name: string;
  tagline?: string;
  description?: string;
  provider?: string;
  country?: string;
  website_url?: string;
  github_url?: string;
  is_open_source?: boolean;
  pricing?: string;
  ecosystem?: string;
  release_year?: number;
  release_month?: number;
  tags?: string[];
}

async function aiExtractList(
  sourceTitle: string,
  sourceUrl: string,
  content: string,
): Promise<ExtractedAgent[]> {
  const system = `You are an expert at extracting AI agent product entries from web pages or markdown lists.
Return ONLY agents that are clearly real, named products or projects. Skip generic mentions, marketing fluff, navigation items, and category headers.
For each agent extract structured data. Be conservative — if a field is not clearly stated, leave it empty/undefined. Do not invent URLs.
For ecosystem use: "open_source" (has GitHub repo & OSS license), "big_tech" (Google/Microsoft/Meta/Amazon/OpenAI/Anthropic/Apple), "china_ai" (Chinese provider like Baidu/Alibaba/Tencent/Bytedance/Zhipu/Moonshot/MiniMax/DeepSeek), or "startups" (other commercial).
Only include release_year/release_month when explicitly stated in the content (e.g. "released March 2026"). Do not guess.`;

  const user = `Source: ${sourceTitle} (${sourceUrl})

Extract every distinct AI agent / agent framework / agent product mentioned below. Limit to the top 30 most clearly described entries.

Content:
${content}`;

  const resp = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_agent_list",
              description: "Extract a list of AI agents from the content",
              parameters: {
                type: "object",
                properties: {
                  agents: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        tagline: { type: "string" },
                        description: { type: "string" },
                        provider: { type: "string" },
                        country: { type: "string" },
                        website_url: { type: "string" },
                        github_url: { type: "string" },
                        is_open_source: { type: "boolean" },
                        pricing: {
                          type: "string",
                          enum: ["free", "freemium", "paid", "enterprise"],
                        },
                        ecosystem: {
                          type: "string",
                          enum: [
                            "open_source",
                            "startups",
                            "big_tech",
                            "china_ai",
                          ],
                        },
                        release_year: { type: "number" },
                        release_month: { type: "number" },
                        tags: { type: "array", items: { type: "string" } },
                      },
                      required: ["name"],
                    },
                  },
                },
                required: ["agents"],
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "extract_agent_list" },
        },
      }),
    },
  );

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI extract failed ${resp.status}: ${t.slice(0, 200)}`);
  }
  const json = await resp.json();
  const tool = json.choices?.[0]?.message?.tool_calls?.[0];
  if (!tool) return [];
  const parsed = JSON.parse(tool.function.arguments);
  return parsed.agents || [];
}

interface ExistingKey {
  slugs: Set<string>;
  webs: Set<string>;
  ghs: Set<string>;
  names: Set<string>;
}

async function loadExistingKeys(): Promise<ExistingKey> {
  const slugs = new Set<string>();
  const webs = new Set<string>();
  const ghs = new Set<string>();
  const names = new Set<string>();

  // agents
  const { data: agents } = await sb
    .from("agents")
    .select("slug, name, website_url, github_url");
  for (const a of agents ?? []) {
    if (a.slug) slugs.add(a.slug.toLowerCase());
    if (a.name) names.add(normalizeName(a.name));
    const w = normalizeUrl(a.website_url);
    if (w) webs.add(w);
    const g = normalizeGithub(a.github_url);
    if (g) ghs.add(g);
  }

  // candidates not yet rejected
  const { data: cands } = await sb
    .from("candidate_agents")
    .select("slug, name, website_url, github_url, status")
    .in("status", ["draft", "new", "duplicate", "approved"]);
  for (const a of cands ?? []) {
    if (a.slug) slugs.add(a.slug.toLowerCase());
    if (a.name) names.add(normalizeName(a.name));
    const w = normalizeUrl(a.website_url);
    if (w) webs.add(w);
    const g = normalizeGithub(a.github_url);
    if (g) ghs.add(g);
  }

  return { slugs, webs, ghs, names };
}

function isDuplicate(a: ExtractedAgent, keys: ExistingKey): boolean {
  const slug = slugify(a.name);
  if (keys.slugs.has(slug)) return true;
  const w = normalizeUrl(a.website_url);
  if (w && keys.webs.has(w)) return true;
  const g = normalizeGithub(a.github_url);
  if (g && keys.ghs.has(g)) return true;
  if (keys.names.has(normalizeName(a.name))) return true;
  return false;
}

function uniqueSlug(base: string, taken: Set<string>): string {
  let s = base;
  let i = 2;
  while (taken.has(s)) {
    s = `${base}-${i}`;
    i++;
  }
  taken.add(s);
  return s;
}

// ---------- main per-source ----------

async function syncOneSource(source: any) {
  const runIns = await sb
    .from("ingestion_runs")
    .insert({
      source_id: source.id,
      source_slug: source.slug,
      status: "running",
    })
    .select()
    .single();
  const run = runIns.data!;

  const details: any[] = [];
  let fetched = 0,
    newCount = 0,
    dupCount = 0,
    failed = 0;

  try {
    const content = await fetchPage(source.url);
    const agents = await aiExtractList(source.title || source.slug, source.url, content);
    fetched = agents.length;

    const keys = await loadExistingKeys();

    for (const a of agents) {
      try {
        if (!a.name || a.name.length < 2) {
          failed++;
          continue;
        }
        const dup = isDuplicate(a, keys);
        const baseSlug = slugify(a.name);
        const slug = uniqueSlug(baseSlug, keys.slugs);

        const status = dup ? "duplicate" : "new";

        const { error } = await sb.from("candidate_agents").insert({
          name: a.name,
          slug,
          tagline: a.tagline ?? null,
          description: a.description ?? null,
          provider: a.provider ?? null,
          country: a.country ?? null,
          ecosystem: a.ecosystem ?? "startups",
          pricing: a.pricing ?? "free",
          is_open_source: a.is_open_source ?? false,
          website_url: a.website_url ?? null,
          github_url: a.github_url ?? null,
          tags: a.tags ?? [],
          release_year: a.release_year ?? null,
          release_month: a.release_month ?? null,
          released_at:
            a.release_year && a.release_month
              ? `${a.release_year}-${String(a.release_month).padStart(2, "0")}-01`
              : a.release_year
                ? `${a.release_year}-01-01`
                : null,
          source_id: source.id,
          submission_source: `fixed_feed:${source.slug}`,
          status,
          confidence_score: dup ? 50 : 70,
          extraction_notes: dup ? "Duplicate detected vs existing record" : null,
        });
        if (error) {
          failed++;
          details.push({ name: a.name, error: error.message });
        } else {
          if (dup) dupCount++;
          else newCount++;
          // update keys to avoid intra-batch duplicates
          if (a.website_url) {
            const w = normalizeUrl(a.website_url);
            if (w) keys.webs.add(w);
          }
          if (a.github_url) {
            const g = normalizeGithub(a.github_url);
            if (g) keys.ghs.add(g);
          }
          keys.names.add(normalizeName(a.name));
        }
      } catch (err) {
        failed++;
        details.push({
          name: a?.name,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    await sb
      .from("ingestion_runs")
      .update({
        status: "completed",
        finished_at: new Date().toISOString(),
        fetched_count: fetched,
        new_count: newCount,
        duplicate_count: dupCount,
        failed_count: failed,
        details,
      })
      .eq("id", run.id);

    return { source: source.slug, fetched, newCount, dupCount, failed };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await sb
      .from("ingestion_runs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        error_message: message,
        fetched_count: fetched,
        new_count: newCount,
        duplicate_count: dupCount,
        failed_count: failed,
        details,
      })
      .eq("id", run.id);
    return { source: source.slug, error: message };
  }
}

// ---------- HTTP entry ----------

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const onlySlug: string | undefined = body?.source_slug;

    let q = sb
      .from("source_records")
      .select("*")
      .eq("source_type", "fixed_feed")
      .eq("is_enabled", true);
    if (onlySlug) q = q.eq("slug", onlySlug);

    const { data: sources, error } = await q;
    if (error) throw error;

    const results = [];
    for (const s of sources ?? []) {
      results.push(await syncOneSource(s));
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("sync-fixed-sources error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Sync failed",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
