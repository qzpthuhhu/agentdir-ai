import { useQuery } from "@tanstack/react-query";
import { getAllAgents, getAgentBySlug, searchAgents } from "@/services/agent.service";
import { getAllAgentTypes, getAllArchitectures, getAllDomains, getEcosystemCounts } from "@/services/taxonomy.service";
import type { AgentTypeInfo, ArchitectureInfo, DomainInfo, EcosystemInfo } from "@/types/agent";
// Keep mock data as fallback
import {
  agents as mockAgents,
  agentTypes as mockAgentTypes,
  architectures as mockArchitectures,
  domains as mockDomains,
  ecosystems as mockEcosystems,
  categories as mockCategories,
  tags as mockTags,
} from "@/lib/mock-data";

const ecosystemMeta: Record<string, { name: string; description: string }> = {
  open_source: { name: "Open Source", description: "Community-driven projects on GitHub" },
  startups: { name: "Startups", description: "AI products built by startups" },
  big_tech: { name: "Big Tech", description: "Agents from major tech companies" },
  china_ai: { name: "China AI", description: "AI agents from Chinese tech giants" },
};

const ecosystemSlugMap: Record<string, string> = {
  open_source: "open-source",
  startups: "startup",
  big_tech: "big-tech",
  china_ai: "china-ai",
};

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: getAllAgents,
    placeholderData: mockAgents,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAgent(slug: string | undefined) {
  return useQuery({
    queryKey: ["agent", slug],
    queryFn: () => getAgentBySlug(slug!),
    enabled: !!slug,
    placeholderData: () => mockAgents.find((a) => a.slug === slug) ?? undefined,
  });
}

export function useSearchAgents(query: string) {
  return useQuery({
    queryKey: ["agents", "search", query],
    queryFn: () => searchAgents(query),
    enabled: query.length > 0,
    placeholderData: query.length > 0
      ? mockAgents.filter(
          (a) =>
            a.name.toLowerCase().includes(query.toLowerCase()) ||
            a.tagline.toLowerCase().includes(query.toLowerCase())
        )
      : [],
  });
}

export function useAgentTypes() {
  return useQuery({
    queryKey: ["agentTypes"],
    queryFn: async (): Promise<AgentTypeInfo[]> => {
      const data = await getAllAgentTypes();
      return data.map((d) => ({ slug: d.slug as any, name: d.name, description: d.description || "" }));
    },
    placeholderData: mockAgentTypes,
    staleTime: 30 * 60 * 1000,
  });
}

export function useArchitectures() {
  return useQuery({
    queryKey: ["architectures"],
    queryFn: async (): Promise<ArchitectureInfo[]> => {
      const data = await getAllArchitectures();
      return data.map((d) => ({ slug: d.slug as any, name: d.name, description: d.description || "" }));
    },
    placeholderData: mockArchitectures,
    staleTime: 30 * 60 * 1000,
  });
}

export function useDomains() {
  return useQuery({
    queryKey: ["domains"],
    queryFn: async (): Promise<DomainInfo[]> => {
      const data = await getAllDomains();
      return data.map((d) => ({ slug: d.slug as any, name: d.name, description: d.description || "" }));
    },
    placeholderData: mockDomains,
    staleTime: 30 * 60 * 1000,
  });
}

export function useEcosystems() {
  return useQuery({
    queryKey: ["ecosystems"],
    queryFn: async (): Promise<EcosystemInfo[]> => {
      const counts = await getEcosystemCounts();
      return Object.entries(ecosystemMeta).map(([key, meta]) => ({
        slug: ecosystemSlugMap[key] as any,
        name: meta.name,
        description: meta.description,
        agentCount: counts[key] || 0,
      }));
    },
    placeholderData: mockEcosystems,
    staleTime: 5 * 60 * 1000,
  });
}

// Re-export mock data for things that don't have DB tables yet
export { mockCategories as categories, mockTags as tags };
