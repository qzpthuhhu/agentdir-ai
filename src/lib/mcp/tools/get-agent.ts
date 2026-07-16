import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_agent",
  title: "Get agent details",
  description:
    "Fetch full details for one AI agent by slug: description, features, use cases, provider, pricing, GitHub stars, language, license, tags, and links.",
  inputSchema: {
    slug: z.string().trim().min(1).describe("Agent slug, e.g. 'autogen' or 'devin'"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase
      .from("agents")
      .select("*, github_repos(*)")
      .eq("slug", slug)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: `No agent found with slug '${slug}'` }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { agent: data },
    };
  },
});
