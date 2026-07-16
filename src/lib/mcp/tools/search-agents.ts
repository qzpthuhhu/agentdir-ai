import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "search_agents",
  title: "Search agents",
  description:
    "Search the AgentDir directory for AI agents by keyword (matches name, tagline, or description). Returns up to 20 agents with slug, name, tagline, provider, ecosystem, rating, GitHub stars, and website.",
  inputSchema: {
    query: z.string().trim().min(1).describe("Search keyword, e.g. 'coding' or 'browser'"),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase
      .from("agents")
      .select("slug,name,tagline,provider,ecosystem,rating,website_url,github_url,trending_score,github_repos(stars)")
      .or(`name.ilike.%${query}%,tagline.ilike.%${query}%,description.ilike.%${query}%`)
      .order("rating", { ascending: false })
      .limit(limit ?? 20);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const rows = (data ?? []).map((r: any) => ({
      slug: r.slug,
      name: r.name,
      tagline: r.tagline,
      provider: r.provider,
      ecosystem: r.ecosystem,
      rating: Number(r.rating) || 0,
      website: r.website_url,
      github: r.github_url,
      githubStars: Array.isArray(r.github_repos) ? r.github_repos[0]?.stars ?? null : r.github_repos?.stars ?? null,
      trendingScore: r.trending_score != null ? Number(r.trending_score) : 0,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { agents: rows },
    };
  },
});
