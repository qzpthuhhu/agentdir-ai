
CREATE TABLE public.github_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  total_repos integer DEFAULT 0,
  updated_repos integer DEFAULT 0,
  failed_repos integer DEFAULT 0,
  error_message text,
  trigger_type text NOT NULL DEFAULT 'manual',
  details jsonb DEFAULT '[]'::jsonb
);

ALTER TABLE public.github_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all github_sync_logs" ON public.github_sync_logs FOR ALL USING (true) WITH CHECK (true);
