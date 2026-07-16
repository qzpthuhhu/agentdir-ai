import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchAgents from "./tools/search-agents";
import getAgent from "./tools/get-agent";
import listTrending from "./tools/list-trending";
import listCategories from "./tools/list-categories";
import createReview from "./tools/create-review";
import listMyReviews from "./tools/list-my-reviews";

// Build the OAuth issuer from the Supabase project ref (inlined by Vite at build time)
// so the entry stays import-safe — no runtime env reads at module top level.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "agentdir-mcp",
  title: "AgentDir MCP",
  version: "0.1.0",
  instructions:
    "Tools for AgentDir — the directory of AI agents. Use `search_agents` and `get_agent` to browse the catalog, `list_trending_agents` for what's hot this week, `list_categories` for taxonomy, and `create_review` / `list_my_reviews` to manage the signed-in user's reviews.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchAgents, getAgent, listTrending, listCategories, createReview, listMyReviews],
});
