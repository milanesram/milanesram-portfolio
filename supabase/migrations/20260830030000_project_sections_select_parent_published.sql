-- Forward-only RLS correction. Does not apply the PrivAI Guard seed.
-- Public/authenticated SELECT of a project section requires both the
-- section and its parent project to be published.
-- Admin CRUD remains project_sections_admin_all + public.is_admin().

DROP POLICY IF EXISTS project_sections_select_published ON public.project_sections;

CREATE POLICY project_sections_select_published
  ON public.project_sections
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1
      FROM public.projects
      WHERE projects.id = project_sections.project_id
        AND projects.status = 'published'
    )
  );
