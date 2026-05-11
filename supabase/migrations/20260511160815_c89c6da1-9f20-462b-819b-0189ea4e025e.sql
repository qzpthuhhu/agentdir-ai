ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS release_year smallint,
  ADD COLUMN IF NOT EXISTS release_month smallint,
  ADD COLUMN IF NOT EXISTS released_at date;

ALTER TABLE public.agents
  DROP CONSTRAINT IF EXISTS agents_release_month_check;
ALTER TABLE public.agents
  ADD CONSTRAINT agents_release_month_check CHECK (release_month IS NULL OR (release_month BETWEEN 1 AND 12));

CREATE INDEX IF NOT EXISTS idx_agents_released_at ON public.agents(released_at DESC NULLS LAST);

ALTER TABLE public.candidate_agents
  ADD COLUMN IF NOT EXISTS release_year smallint,
  ADD COLUMN IF NOT EXISTS release_month smallint,
  ADD COLUMN IF NOT EXISTS released_at date;