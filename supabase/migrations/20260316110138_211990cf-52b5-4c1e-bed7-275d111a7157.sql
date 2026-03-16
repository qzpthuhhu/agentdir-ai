
-- Ops workflow tables for AI-powered agent ingestion

-- Source records: ingested URLs, articles, pages
CREATE TABLE public.source_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT,
  source_type TEXT NOT NULL DEFAULT 'website',
  title TEXT,
  summary TEXT,
  raw_content TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ingestion jobs: track extraction tasks
CREATE TABLE public.ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.source_records(id) ON DELETE SET NULL,
  input_type TEXT NOT NULL DEFAULT 'url',
  input_content TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Candidate agents: AI-generated draft records awaiting review
CREATE TABLE public.candidate_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.source_records(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.ingestion_jobs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  confidence_score NUMERIC DEFAULT 0,
  extraction_notes TEXT,
  -- Agent fields (mirror of agents table)
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  provider TEXT,
  country TEXT,
  ecosystem TEXT DEFAULT 'open_source',
  pricing TEXT DEFAULT 'free',
  is_open_source BOOLEAN DEFAULT false,
  website_url TEXT,
  github_url TEXT,
  docs_url TEXT,
  primary_language TEXT,
  license TEXT,
  logo_url TEXT,
  features TEXT[] DEFAULT '{}',
  use_cases TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  -- Extra extraction fields
  target_customer TEXT,
  enterprise_focus TEXT,
  deployment_type TEXT,
  service_model TEXT,
  agent_type_slugs TEXT[] DEFAULT '{}',
  architecture_slugs TEXT[] DEFAULT '{}',
  domain_slugs TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Review actions: audit trail
CREATE TABLE public.review_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidate_agents(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Publish logs: track what was published
CREATE TABLE public.publish_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidate_agents(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  action TEXT NOT NULL DEFAULT 'create',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.source_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publish_logs ENABLE ROW LEVEL SECURITY;

-- Public read/write for admin ops (no auth required for internal tool)
CREATE POLICY "Allow all source_records" ON public.source_records FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all ingestion_jobs" ON public.ingestion_jobs FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all candidate_agents" ON public.candidate_agents FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all review_actions" ON public.review_actions FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all publish_logs" ON public.publish_logs FOR ALL TO public USING (true) WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_source_records_updated_at BEFORE UPDATE ON public.source_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ingestion_jobs_updated_at BEFORE UPDATE ON public.ingestion_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_candidate_agents_updated_at BEFORE UPDATE ON public.candidate_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
