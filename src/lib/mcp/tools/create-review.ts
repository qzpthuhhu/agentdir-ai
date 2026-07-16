import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export default defineTool({
  name: "create_review",
  title: "Create or update a review",
  description:
    "Post a rating (1-5) and optional text review for an AI agent, as the signed-in user. Updates the existing review if you already reviewed this agent.",
  inputSchema: {
    agent_slug: z.string().trim().min(1).describe("Slug of the agent to review"),
    rating: z.number().int().min(1).max(5).describe("Rating from 1 to 5"),
    review_text: z.string().trim().max(4000).optional().describe("Optional review text"),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ agent_slug, rating, review_text }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const db = supabaseForUser(ctx);
    const { data: agent, error: aErr } = await db
      .from("agents")
      .select("id,slug,name")
      .eq("slug", agent_slug)
      .maybeSingle();
    if (aErr) return { content: [{ type: "text", text: aErr.message }], isError: true };
    if (!agent) return { content: [{ type: "text", text: `No agent found with slug '${agent_slug}'` }], isError: true };

    const userId = ctx.getUserId();
    const { data: existing } = await db
      .from("agent_reviews")
      .select("id")
      .eq("agent_id", agent.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await db
        .from("agent_reviews")
        .update({ rating, review_text: review_text ?? null })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) return { content: [{ type: "text", text: error.message }], isError: true };
      return {
        content: [{ type: "text", text: `Updated review for ${agent.name} (rating: ${rating}/5).` }],
        structuredContent: { review: data },
      };
    }

    const { data, error } = await db
      .from("agent_reviews")
      .insert({ agent_id: agent.id, user_id: userId, rating, review_text: review_text ?? null })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Posted review for ${agent.name} (rating: ${rating}/5).` }],
      structuredContent: { review: data },
    };
  },
});
