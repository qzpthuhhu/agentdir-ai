export type AgentType = "coding" | "research" | "browser" | "automation" | "chat" | "productivity" | "data" | "devops" | "security" | "creative" | "customer-support" | "assistant";

export type Architecture = "autonomous" | "multi-agent" | "planning" | "tool-use" | "retrieval" | "memory" | "reasoning" | "workflow" | "simulation" | "embodied";

export type Domain = "finance" | "healthcare" | "education" | "legal" | "marketing" | "sales" | "cybersecurity" | "e-commerce" | "gaming" | "scientific" | "robotics";

export type Ecosystem = "open-source" | "startup" | "big-tech" | "china-ai";

export interface Agent {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  agentType: AgentType;
  architectures: Architecture[];
  domains: Domain[];
  ecosystem: Ecosystem;
  provider: string;
  country: string;
  tags: string[];
  pricing: "free" | "freemium" | "paid" | "enterprise";
  rating: number;
  reviewCount: number;
  imageUrl: string;
  website: string;
  githubUrl?: string;
  features: string[];
  useCases: string[];
  createdAt: string;
  githubStars?: number;
  language?: string;
  license?: string;
  isOpenSource?: boolean;
}

export interface AgentTypeInfo {
  slug: AgentType;
  name: string;
  description: string;
}

export interface ArchitectureInfo {
  slug: Architecture;
  name: string;
  description: string;
}

export interface DomainInfo {
  slug: Domain;
  name: string;
  description: string;
}

export interface EcosystemInfo {
  slug: Ecosystem;
  name: string;
  description: string;
  agentCount: number;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;
  agentCount: number;
}

export interface Tag {
  slug: string;
  name: string;
  agentCount: number;
}
