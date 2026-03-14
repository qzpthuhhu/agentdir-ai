import { supabase } from "@/integrations/supabase/client";
import type { Agent } from "@/types/agent";

// Map DB ecosystem enum to frontend ecosystem slug
const ecosystemMap: Record<string, string> = {
  open_source: "open-source",
  startups: "startup",
  big_tech: "big-tech",
  china_ai: "china-ai",
};

// Transform a DB agent row + relations into the frontend Agent shape
function transformAgent(row: any): Agent {
  const types = (row.agent_to_types || []).map((r: any) => r.agent_types);
  const archs = (row.agent_to_architectures || []).map((r: any) => r.agent_architectures);
  const domains = (row.agent_to_domains || []).map((r: any) => r.agent_domains);
  const github = Array.isArray(row.github_repos) ? row.github_repos[0] : row.github_repos;
  const primaryType = types.find((t: any) => t)?.slug || "assistant";

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline || "",
    description: row.description || "",
    category: primaryType,
    agentType: primaryType,
    architectures: archs.map((a: any) => a?.slug).filter(Boolean),
    domains: domains.map((d: any) => d?.slug).filter(Boolean),
    ecosystem: ecosystemMap[row.ecosystem] || row.ecosystem,
    provider: row.provider || "",
    country: row.country || "",
    tags: row.tags || [],
    pricing: row.pricing || "free",
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count || 0,
    imageUrl: row.logo_url || "/placeholder.svg",
    website: row.website_url || "",
    githubUrl: row.github_url || github?.repo_url || "",
    features: row.features || [],
    useCases: row.use_cases || [],
    createdAt: row.created_at,
    githubStars: github?.stars ?? undefined,
    language: row.primary_language || github?.language || undefined,
    license: row.license || github?.license || undefined,
    isOpenSource: row.is_open_source || false,
  };
}

const AGENT_SELECT = `
  *,
  agent_to_types(agent_types(*)),
  agent_to_architectures(agent_architectures(*)),
  agent_to_domains(agent_domains(*)),
  github_repos(*)
`;

export async function getAllAgents(): Promise<Agent[]> {
  const { data, error } = await supabase
    .from("agents")
    .select(AGENT_SELECT)
    .order("rating", { ascending: false });
  if (error) throw error;
  return (data || []).map(transformAgent);
}

export async function getAgentBySlug(slug: string): Promise<Agent | null> {
  const { data, error } = await supabase
    .from("agents")
    .select(AGENT_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? transformAgent(data) : null;
}

export async function searchAgents(query: string): Promise<Agent[]> {
  const { data, error } = await supabase
    .from("agents")
    .select(AGENT_SELECT)
    .or(`name.ilike.%${query}%,tagline.ilike.%${query}%,description.ilike.%${query}%`)
    .order("rating", { ascending: false });
  if (error) throw error;
  return (data || []).map(transformAgent);
}

export async function getAgentsByEcosystem(ecosystem: string): Promise<Agent[]> {
  // Convert frontend slug back to DB enum
  const dbEco = Object.entries(ecosystemMap).find(([, v]) => v === ecosystem)?.[0] || ecosystem;
  const { data, error } = await supabase
    .from("agents")
    .select(AGENT_SELECT)
    .eq("ecosystem", dbEco as any)
    .order("rating", { ascending: false });
  if (error) throw error;
  return (data || []).map(transformAgent);
}
