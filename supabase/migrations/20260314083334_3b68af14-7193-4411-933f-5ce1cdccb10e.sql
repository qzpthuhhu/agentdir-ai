
-- Allow public insert/update/delete on agents
CREATE POLICY "Allow insert agents" ON public.agents FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update agents" ON public.agents FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete agents" ON public.agents FOR DELETE TO public USING (true);

-- Allow public insert/update/delete on junction tables
CREATE POLICY "Allow insert agent_to_types" ON public.agent_to_types FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update agent_to_types" ON public.agent_to_types FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete agent_to_types" ON public.agent_to_types FOR DELETE TO public USING (true);

CREATE POLICY "Allow insert agent_to_architectures" ON public.agent_to_architectures FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update agent_to_architectures" ON public.agent_to_architectures FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete agent_to_architectures" ON public.agent_to_architectures FOR DELETE TO public USING (true);

CREATE POLICY "Allow insert agent_to_domains" ON public.agent_to_domains FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update agent_to_domains" ON public.agent_to_domains FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete agent_to_domains" ON public.agent_to_domains FOR DELETE TO public USING (true);

-- Allow public insert/update/delete on github_repos
CREATE POLICY "Allow insert github_repos" ON public.github_repos FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update github_repos" ON public.github_repos FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete github_repos" ON public.github_repos FOR DELETE TO public USING (true);
