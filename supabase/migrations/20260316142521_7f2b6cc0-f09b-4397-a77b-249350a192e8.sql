
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published announcements" ON public.announcements
  FOR SELECT TO public USING (is_published = true);

CREATE POLICY "Allow all announcements admin" ON public.announcements
  FOR ALL TO public USING (true) WITH CHECK (true);
