
-- Ecosystem enum
CREATE TYPE public.ecosystem_type AS ENUM ('open_source', 'startups', 'big_tech', 'china_ai');

-- Pricing model enum
CREATE TYPE public.pricing_model AS ENUM ('free', 'freemium', 'paid', 'enterprise');

-- Taxonomy: Agent Types
CREATE TABLE public.agent_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Taxonomy: Agent Architectures
CREATE TABLE public.agent_architectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Taxonomy: Agent Domains
CREATE TABLE public.agent_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Main Agents table
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  github_url TEXT,
  docs_url TEXT,
  provider TEXT,
  country TEXT,
  ecosystem ecosystem_type NOT NULL DEFAULT 'open_source',
  pricing pricing_model NOT NULL DEFAULT 'free',
  is_open_source BOOLEAN NOT NULL DEFAULT false,
  primary_language TEXT,
  license TEXT,
  tags TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  use_cases TEXT[] DEFAULT '{}',
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Junction: Agent <-> Types (many-to-many)
CREATE TABLE public.agent_to_types (
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  type_id UUID NOT NULL REFERENCES public.agent_types(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  PRIMARY KEY (agent_id, type_id)
);

-- Junction: Agent <-> Architectures (many-to-many)
CREATE TABLE public.agent_to_architectures (
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  architecture_id UUID NOT NULL REFERENCES public.agent_architectures(id) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, architecture_id)
);

-- Junction: Agent <-> Domains (many-to-many)
CREATE TABLE public.agent_to_domains (
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES public.agent_domains(id) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, domain_id)
);

-- GitHub metadata
CREATE TABLE public.github_repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL UNIQUE REFERENCES public.agents(id) ON DELETE CASCADE,
  repo_url TEXT NOT NULL,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  open_issues INTEGER DEFAULT 0,
  language TEXT,
  license TEXT,
  last_commit TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_agents_ecosystem ON public.agents(ecosystem);
CREATE INDEX idx_agents_pricing ON public.agents(pricing);
CREATE INDEX idx_agents_provider ON public.agents(provider);
CREATE INDEX idx_agents_country ON public.agents(country);
CREATE INDEX idx_agents_is_open_source ON public.agents(is_open_source);
CREATE INDEX idx_agents_tags ON public.agents USING GIN(tags);
CREATE INDEX idx_github_repos_stars ON public.github_repos(stars DESC);

-- Enable RLS
ALTER TABLE public.agent_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_architectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_to_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_to_architectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_to_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_repos ENABLE ROW LEVEL SECURITY;

-- Public read access (public directory)
CREATE POLICY "Public read access" ON public.agent_types FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.agent_architectures FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.agent_domains FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.agent_to_types FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.agent_to_architectures FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.agent_to_domains FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.github_repos FOR SELECT USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_github_repos_updated_at BEFORE UPDATE ON public.github_repos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
