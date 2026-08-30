-- Forward-only RLS correction. Does not load professional-experience content.
-- Public/authenticated SELECT of an experience item requires both the item
-- and its parent experience to be published.
-- Admin CRUD remains experience_items_admin_all + public.is_admin().

DROP POLICY IF EXISTS experience_items_select_published ON public.experience_items;

CREATE POLICY experience_items_select_published
  ON public.experience_items
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1
      FROM public.experiences
      WHERE experiences.id = experience_items.experience_id
        AND experiences.status = 'published'
    )
  );
