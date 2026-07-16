import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_trending_agents",
  title: "List trending agents",
  description:
    "Return the most trending AI agents on AgentDir this week, ranked by composite trending score (news mentions + weekly GitHub star growth).",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 10)"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase
      .from("agents")
      .select("slug,name,tagline,provider,trending_score,news_count,star_delta_weekly,website_url")
      .order("trending_score", { ascending: false, nullsFirst: false })
      .limit(limit ?? 10);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { agents: data ?? [] },
    };
  },
});
