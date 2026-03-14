import { supabase } from "@/integrations/supabase/client";

export async function getAllAgentTypes() {
  const { data, error } = await supabase
    .from("agent_types")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

export async function getAllArchitectures() {
  const { data, error } = await supabase
    .from("agent_architectures")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

export async function getAllDomains() {
  const { data, error } = await supabase
    .from("agent_domains")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

export async function getEcosystemCounts() {
  const { data, error } = await supabase
    .from("agents")
    .select("ecosystem");
  if (error) throw error;

  const counts: Record<string, number> = {};
  data.forEach((a) => {
    counts[a.ecosystem] = (counts[a.ecosystem] || 0) + 1;
  });
  return counts;
}
