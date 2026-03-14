export interface Agent {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  pricing: "free" | "freemium" | "paid" | "enterprise";
  rating: number;
  reviewCount: number;
  imageUrl: string;
  website: string;
  features: string[];
  useCases: string[];
  createdAt: string;
  githubStars?: number;
  language?: string;
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
