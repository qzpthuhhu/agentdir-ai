// Weekly trending score sync.
// Composite score: 60% news heat (Firecrawl monthly news count) + 40% GitHub weekly star delta.
// Runs every Monday 03:00 UTC via pg_cron. Manual invocation supported.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY")!;

const GATEWAY = "https://connector-gateway.lovable.dev/firecrawl";
const NEWS_WEIGHT = 60; // out of 100
const STAR_WEIGHT = 40;
const CONCURRENCY = 12; // must finish all agents within the 150s edge function limit
// Log-scale normalizers so we don't need a global max pass (enables incremental writes).
const NEWS_LOG_CAP = Math.log10(21);   // ~20 news mentions saturates
const STAR_LOG_CAP = Math.log10(1001); // ~1000 weekly stars saturates

type AgentRow = {
  id: string;
  name: string;
  provider: string | null;
  stars_snapshot: number;
  github_repos: { stars: number | null }[] | { stars: number | null } | null;
};

async function firecrawlNewsCount(query: string): Promise<number> {
  try {
    const res = await fetch(`${GATEWAY}/v2/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": FIRECRAWL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit: 20,
        tbs: "qdr:m", // past month
        sources: ["news", "web"],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.warn(`firecrawl ${res.status} for "${query}": ${t.slice(0, 160)}`);
      return 0;
    }
    const data = await res.json();
    const news = Array.isArray(data?.data?.news) ? data.data.news.length : 0;
    const web = Array.isArray(data?.data?.web) ? data.data.web.length : 0;
    // News mentions weigh 2x web mentions
    return news * 2 + web;
  } catch (e) {
    console.warn(`firecrawl error for "${query}":`, (e as Error).message);
    return 0;
  }
}

async function runPool<T, R>(items: T[], size: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: size }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

function currentStars(row: AgentRow): number {
  const g = row.github_repos;
  if (!g) return 0;
  const r = Array.isArray(g) ? g[0] : g;
  return r?.stars ?? 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const startedAt = Date.now();
  let body: any = {};
  try { body = await req.json(); } catch { /* no body ok */ }
  const dryRun = body?.dry_run === true;
  const limit = typeof body?.limit === "number" ? body.limit : null;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  let q = supabase
    .from("agents")
    .select("id,name,provider,stars_snapshot,github_repos(stars)");
  if (limit) q = q.limit(limit);
  const { data: agents, error } = await q;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rows = (agents ?? []) as AgentRow[];

  // Phase 1: fetch news counts + star deltas
  const metrics = await runPool(rows, CONCURRENCY, async (row) => {
    const query = `${row.name}${row.provider ? " " + row.provider : ""} AI agent`;
    const news = await firecrawlNewsCount(query);
    const stars = currentStars(row);
    const delta = Math.max(0, stars - (row.stars_snapshot ?? 0));
    return { id: row.id, name: row.name, news, stars, delta };
  });

  // Phase 2: normalize to 0..100 each, blend
  const maxNews = Math.max(1, ...metrics.map((m) => m.news));
  const maxDelta = Math.max(1, ...metrics.map((m) => m.delta));

  const scored = metrics.map((m) => {
    const newsNorm = (m.news / maxNews) * 100;
    const deltaNorm = (m.delta / maxDelta) * 100;
    const score = +(NEWS_WEIGHT * newsNorm + STAR_WEIGHT * deltaNorm).toFixed(2);
    return { ...m, score };
  });

  if (!dryRun) {
    // Write back sequentially in small batches
    for (const s of scored) {
      const { error: upErr } = await supabase
        .from("agents")
        .update({
          news_count: s.news,
          star_delta_weekly: s.delta,
          stars_snapshot: s.stars,
          trending_score: s.score,
          trending_updated_at: new Date().toISOString(),
        })
        .eq("id", s.id);
      if (upErr) console.warn(`update ${s.id} failed:`, upErr.message);
    }
  }

  const top = [...scored].sort((a, b) => b.score - a.score).slice(0, 10);

  return new Response(
    JSON.stringify({
      ok: true,
      total: rows.length,
      duration_ms: Date.now() - startedAt,
      dry_run: dryRun,
      top,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
