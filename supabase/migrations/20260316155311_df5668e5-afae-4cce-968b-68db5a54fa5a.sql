
-- Profiles table for user info
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  username text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read profiles" ON public.profiles
  FOR SELECT TO public USING (true);

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Agent reviews table
CREATE TABLE public.agent_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL,
  review_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (agent_id, user_id)
);

ALTER TABLE public.agent_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read reviews" ON public.agent_reviews
  FOR SELECT TO public USING (true);

CREATE POLICY "Auth users insert review" ON public.agent_reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own review" ON public.agent_reviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own review" ON public.agent_reviews
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add submission tracking to candidate_agents
ALTER TABLE public.candidate_agents
  ADD COLUMN IF NOT EXISTS submitted_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS submitter_email text,
  ADD COLUMN IF NOT EXISTS submitter_username text,
  ADD COLUMN IF NOT EXISTS submission_source text DEFAULT 'admin';

-- Add updated_at trigger for agent_reviews
CREATE TRIGGER update_agent_reviews_updated_at
  BEFORE UPDATE ON public.agent_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
