import { supabase } from "@/integrations/supabase/client";

export interface AgentFormData {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  provider: string;
  country: string;
  ecosystem: "open_source" | "startups" | "big_tech" | "china_ai";
  pricing: "free" | "freemium" | "paid" | "enterprise";
  is_open_source: boolean;
  website_url: string;
  github_url: string;
  docs_url: string;
  primary_language: string;
  license: string;
  logo_url: string;
  features: string[];
  use_cases: string[];
  tags: string[];
  // Relations (IDs)
  type_ids: string[];
  architecture_ids: string[];
  domain_ids: string[];
  // GitHub
  stars: number;
  forks: number;
}

export async function createAgent(data: AgentFormData) {
  const { type_ids, architecture_ids, domain_ids, stars, forks, ...agentData } = data;

  const { data: agent, error } = await supabase
    .from("agents")
    .insert(agentData)
    .select("id")
    .single();
  if (error) throw error;

  await syncRelations(agent.id, type_ids, architecture_ids, domain_ids);

  if (data.is_open_source && data.github_url) {
    await supabase.from("github_repos").insert({
      agent_id: agent.id,
      repo_url: data.github_url,
      stars: stars || 0,
      forks: forks || 0,
      language: data.primary_language || null,
      license: data.license || null,
    });
  }

  return agent;
}

export async function updateAgent(id: string, data: AgentFormData) {
  const { type_ids, architecture_ids, domain_ids, stars, forks, ...agentData } = data;

  const { error } = await supabase
    .from("agents")
    .update(agentData)
    .eq("id", id);
  if (error) throw error;

  await syncRelations(id, type_ids, architecture_ids, domain_ids);

  // Upsert github repo
  if (data.is_open_source && data.github_url) {
    const { data: existing } = await supabase
      .from("github_repos")
      .select("id")
      .eq("agent_id", id)
      .maybeSingle();

    if (existing) {
      await supabase.from("github_repos").update({
        repo_url: data.github_url,
        stars: stars || 0,
        forks: forks || 0,
        language: data.primary_language || null,
        license: data.license || null,
      }).eq("id", existing.id);
    } else {
      await supabase.from("github_repos").insert({
        agent_id: id,
        repo_url: data.github_url,
        stars: stars || 0,
        forks: forks || 0,
        language: data.primary_language || null,
        license: data.license || null,
      });
    }
  }
}

export async function deleteAgent(id: string) {
  // Delete relations first
  await supabase.from("agent_to_types").delete().eq("agent_id", id);
  await supabase.from("agent_to_architectures").delete().eq("agent_id", id);
  await supabase.from("agent_to_domains").delete().eq("agent_id", id);
  await supabase.from("github_repos").delete().eq("agent_id", id);

  const { error } = await supabase.from("agents").delete().eq("id", id);
  if (error) throw error;
}

async function syncRelations(
  agentId: string,
  typeIds: string[],
  archIds: string[],
  domainIds: string[]
) {
  // Clear existing
  await supabase.from("agent_to_types").delete().eq("agent_id", agentId);
  await supabase.from("agent_to_architectures").delete().eq("agent_id", agentId);
  await supabase.from("agent_to_domains").delete().eq("agent_id", agentId);

  // Insert new
  if (typeIds.length > 0) {
    await supabase.from("agent_to_types").insert(
      typeIds.map((id, i) => ({ agent_id: agentId, type_id: id, is_primary: i === 0 }))
    );
  }
  if (archIds.length > 0) {
    await supabase.from("agent_to_architectures").insert(
      archIds.map((id) => ({ agent_id: agentId, architecture_id: id }))
    );
  }
  if (domainIds.length > 0) {
    await supabase.from("agent_to_domains").insert(
      domainIds.map((id) => ({ agent_id: agentId, domain_id: id }))
    );
  }
}

export async function getAgentForEdit(id: string) {
  const { data, error } = await supabase
    .from("agents")
    .select(`
      *,
      agent_to_types(type_id),
      agent_to_architectures(architecture_id),
      agent_to_domains(domain_id),
      github_repos(stars, forks)
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}
