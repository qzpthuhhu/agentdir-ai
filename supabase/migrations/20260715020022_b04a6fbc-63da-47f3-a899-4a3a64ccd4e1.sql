
ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS news_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS star_delta_weekly integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stars_snapshot integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trending_score numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trending_updated_at timestamptz;

CREATE INDEX IF NOT EXISTS agents_trending_score_idx ON public.agents (trending_score DESC);

-- Weekly cron: every Monday 03:00 UTC (11:00 Beijing)
SELECT cron.unschedule('sync-trending-score-weekly') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'sync-trending-score-weekly'
);

SELECT cron.schedule(
  'sync-trending-score-weekly',
  '0 3 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://hxoznhqwesgscacnffcp.supabase.co/functions/v1/sync-trending-score',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4b3puaHF3ZXNnc2NhY25mZmNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NTU5ODcsImV4cCI6MjA4OTAzMTk4N30.ZPi0ZZtPGG_tpGpbdHkBoAltNjWmAuoeCsz82FbJMgg"}'::jsonb,
    body := jsonb_build_object('trigger_type','scheduled','time', now())
  ) AS request_id;
  $$
);
