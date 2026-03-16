import { supabase } from "@/integrations/supabase/client";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const AUTH_HEADER = { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` };

// ─── Source Records ───

export async function getSources() {
  const { data, error } = await supabase
    .from("source_records")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createSource(record: { url?: string; source_type: string; title?: string; raw_content?: string }) {
  const { data, error } = await supabase.from("source_records").insert(record).select().single();
  if (error) throw error;
  return data;
}

// ─── Ingestion Jobs ───

export async function getJobs() {
  const { data, error } = await supabase
    .from("ingestion_jobs")
    .select("*, source_records(url, title)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createJob(job: { source_id?: string; input_type: string; input_content?: string }) {
  const { data, error } = await supabase.from("ingestion_jobs").insert({ ...job, status: "pending" }).select().single();
  if (error) throw error;
  return data;
}

export async function updateJobStatus(id: string, status: string, errorMessage?: string) {
  const { error } = await supabase.from("ingestion_jobs").update({ status, error_message: errorMessage || null }).eq("id", id);
  if (error) throw error;
}

// ─── Scrape URL ───

export async function scrapeUrl(url: string) {
  const resp = await fetch(`${FUNCTIONS_URL}/scrape-url`, {
    method: "POST",
    headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Scrape failed" }));
    throw new Error(err.error || "Scrape failed");
  }
  return resp.json();
}

// ─── Extract Agent via LLM ───

export async function extractAgent(content: string, sourceUrl?: string, sourceType?: string) {
  const resp = await fetch(`${FUNCTIONS_URL}/extract-agent`, {
    method: "POST",
    headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
    body: JSON.stringify({ content, sourceUrl, sourceType }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Extraction failed" }));
    throw new Error(err.error || "Extraction failed");
  }
  return resp.json();
}

// ─── Candidate Agents ───

export async function getCandidates(statusFilter?: string) {
  let q = supabase
    .from("candidate_agents")
    .select("*, source_records(url, title)")
    .order("created_at", { ascending: false });
  if (statusFilter) q = q.eq("status", statusFilter);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function getCandidate(id: string) {
  const { data, error } = await supabase.from("candidate_agents").select("*, source_records(url, title)").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createCandidate(candidate: Record<string, unknown>) {
  const { data, error } = await supabase.from("candidate_agents").insert(candidate as any).select().single();
  if (error) throw error;
  return data;
}

export async function updateCandidate(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase.from("candidate_agents").update(updates as any).eq("id", id);
  if (error) throw error;
}

// ─── Review Actions ───

export async function addReviewAction(candidateId: string, action: string, notes?: string) {
  const { error } = await supabase.from("review_actions").insert({ candidate_id: candidateId, action, notes });
  if (error) throw error;
}

export async function getReviewActions(candidateId: string) {
  const { data, error } = await supabase
    .from("review_actions")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// ─── Publish to Live ───

export async function publishCandidate(candidateId: string) {
  const candidate = await getCandidate(candidateId);

  // Check for duplicate slug
  const { data: existing } = await supabase.from("agents").select("id").eq("slug", candidate.slug).maybeSingle();

  const agentData = {
    name: candidate.name,
    slug: candidate.slug,
    tagline: candidate.tagline,
    description: candidate.description,
    provider: candidate.provider,
    country: candidate.country,
    ecosystem: candidate.ecosystem as "open_source" | "startups" | "big_tech" | "china_ai",
    pricing: candidate.pricing as "free" | "freemium" | "paid" | "enterprise",
    is_open_source: candidate.is_open_source || false,
    website_url: candidate.website_url,
    github_url: candidate.github_url,
    docs_url: candidate.docs_url,
    primary_language: candidate.primary_language,
    license: candidate.license,
    logo_url: candidate.logo_url,
    features: candidate.features || [],
    use_cases: candidate.use_cases || [],
    tags: candidate.tags || [],
  };

  let agentId: string;
  let action: string;

  if (existing) {
    // Update existing
    const { error } = await supabase.from("agents").update(agentData).eq("id", existing.id);
    if (error) throw error;
    agentId = existing.id;
    action = "update";
  } else {
    // Create new
    const { data: newAgent, error } = await supabase.from("agents").insert(agentData).select("id").single();
    if (error) throw error;
    agentId = newAgent.id;
    action = "create";
  }

  // Sync taxonomy relations by slug
  await syncTaxonomyRelations(agentId, candidate.agent_type_slugs || [], candidate.architecture_slugs || [], candidate.domain_slugs || []);

  // Log publish
  await supabase.from("publish_logs").insert({ candidate_id: candidateId, agent_id: agentId, action });

  // Update candidate status
  await updateCandidate(candidateId, { status: "published" });
  await addReviewAction(candidateId, "publish", `Published as ${action} to agent ${agentId}`);

  return { agentId, action };
}

async function syncTaxonomyRelations(agentId: string, typeSlugs: string[], archSlugs: string[], domainSlugs: string[]) {
  // Clear existing
  await supabase.from("agent_to_types").delete().eq("agent_id", agentId);
  await supabase.from("agent_to_architectures").delete().eq("agent_id", agentId);
  await supabase.from("agent_to_domains").delete().eq("agent_id", agentId);

  if (typeSlugs.length > 0) {
    const { data: types } = await supabase.from("agent_types").select("id").in("slug", typeSlugs);
    if (types?.length) {
      await supabase.from("agent_to_types").insert(types.map((t, i) => ({ agent_id: agentId, type_id: t.id, is_primary: i === 0 })));
    }
  }
  if (archSlugs.length > 0) {
    const { data: archs } = await supabase.from("agent_architectures").select("id").in("slug", archSlugs);
    if (archs?.length) {
      await supabase.from("agent_to_architectures").insert(archs.map((a) => ({ agent_id: agentId, architecture_id: a.id })));
    }
  }
  if (domainSlugs.length > 0) {
    const { data: doms } = await supabase.from("agent_domains").select("id").in("slug", domainSlugs);
    if (doms?.length) {
      await supabase.from("agent_to_domains").insert(doms.map((d) => ({ agent_id: agentId, domain_id: d.id })));
    }
  }
}

// ─── Duplicate Detection ───

export async function findDuplicates(name: string, websiteUrl?: string) {
  const { data, error } = await supabase
    .from("agents")
    .select("id, name, slug, provider, website_url")
    .or(`name.ilike.%${name}%${websiteUrl ? `,website_url.eq.${websiteUrl}` : ""}`);
  if (error) throw error;
  return data || [];
}
