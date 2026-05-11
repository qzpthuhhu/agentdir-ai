
ALTER TABLE public.source_records
  ADD COLUMN IF NOT EXISTS is_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS source_records_slug_key
  ON public.source_records(slug) WHERE slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.ingestion_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES public.source_records(id) ON DELETE CASCADE,
  source_slug text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  fetched_count integer NOT NULL DEFAULT 0,
  new_count integer NOT NULL DEFAULT 0,
  duplicate_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  error_message text,
  details jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingestion_runs_source ON public.ingestion_runs(source_id, started_at DESC);

ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all ingestion_runs" ON public.ingestion_runs
  FOR ALL USING (true) WITH CHECK (true);

-- Seed 3 fixed feeds
INSERT INTO public.source_records (source_type, url, slug, title, summary, is_enabled, status)
VALUES
  ('fixed_feed',
   'https://raw.githubusercontent.com/e2b-dev/awesome-ai-agents/main/README.md',
   'e2b-awesome-ai-agents',
   'e2b/awesome-ai-agents',
   'Open-source + commercial AI agent catalog (GitHub awesome list).',
   true, 'pending'),
  ('fixed_feed',
   'https://www.producthunt.com/topics/ai-agents',
   'producthunt-ai-agents',
   'Product Hunt — AI Agents',
   'Newest commercial AI agent product launches.',
   true, 'pending'),
  ('fixed_feed',
   'https://www.qbitai.com/category/%e6%99%ba%e8%83%bd%e4%bd%93',
   'qbitai-agents',
   '量子位 — AI Agent 频道',
   'Chinese AI agents and big-tech releases coverage.',
   true, 'pending')
ON CONFLICT (slug) WHERE slug IS NOT NULL DO NOTHING;
