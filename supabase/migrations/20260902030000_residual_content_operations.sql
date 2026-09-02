-- Step 52I: residual page chrome, Home resume kickers, shared CTA
-- copy, media-delete RESTRICT, and leftover schema cleanup.
-- Does not change career facts, publications, media binaries, or
-- contact-form enablement.

-- ---------------------------------------------------------------------------
-- Page chrome singletons
-- ---------------------------------------------------------------------------

CREATE TABLE public.experience_page (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key text NOT NULL DEFAULT 'default',
  status public.content_status NOT NULL DEFAULT 'draft',
  kicker text NOT NULL,
  headline text NOT NULL,
  lede text NOT NULL,
  additional_heading text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT experience_page_singleton CHECK (singleton_key = 'default'),
  CONSTRAINT experience_page_singleton_key UNIQUE (singleton_key),
  CONSTRAINT experience_page_kicker_not_blank CHECK (length(btrim(kicker)) > 0),
  CONSTRAINT experience_page_headline_not_blank CHECK (length(btrim(headline)) > 0),
  CONSTRAINT experience_page_lede_not_blank CHECK (length(btrim(lede)) > 0),
  CONSTRAINT experience_page_additional_not_blank CHECK (length(btrim(additional_heading)) > 0),
  CONSTRAINT experience_page_kicker_length CHECK (char_length(kicker) <= 80),
  CONSTRAINT experience_page_headline_length CHECK (char_length(headline) <= 200),
  CONSTRAINT experience_page_lede_length CHECK (char_length(lede) <= 2000),
  CONSTRAINT experience_page_additional_length CHECK (char_length(additional_heading) <= 120)
);

CREATE TABLE public.projects_page (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key text NOT NULL DEFAULT 'default',
  status public.content_status NOT NULL DEFAULT 'draft',
  kicker text NOT NULL,
  headline text NOT NULL,
  lede text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT projects_page_singleton CHECK (singleton_key = 'default'),
  CONSTRAINT projects_page_singleton_key UNIQUE (singleton_key),
  CONSTRAINT projects_page_kicker_not_blank CHECK (length(btrim(kicker)) > 0),
  CONSTRAINT projects_page_headline_not_blank CHECK (length(btrim(headline)) > 0),
  CONSTRAINT projects_page_lede_not_blank CHECK (length(btrim(lede)) > 0),
  CONSTRAINT projects_page_kicker_length CHECK (char_length(kicker) <= 80),
  CONSTRAINT projects_page_headline_length CHECK (char_length(headline) <= 200),
  CONSTRAINT projects_page_lede_length CHECK (char_length(lede) <= 2000)
);

CREATE TABLE public.writing_page (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key text NOT NULL DEFAULT 'default',
  status public.content_status NOT NULL DEFAULT 'draft',
  kicker text NOT NULL,
  headline text NOT NULL,
  lede text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT writing_page_singleton CHECK (singleton_key = 'default'),
  CONSTRAINT writing_page_singleton_key UNIQUE (singleton_key),
  CONSTRAINT writing_page_kicker_not_blank CHECK (length(btrim(kicker)) > 0),
  CONSTRAINT writing_page_headline_not_blank CHECK (length(btrim(headline)) > 0),
  CONSTRAINT writing_page_lede_not_blank CHECK (length(btrim(lede)) > 0),
  CONSTRAINT writing_page_kicker_length CHECK (char_length(kicker) <= 80),
  CONSTRAINT writing_page_headline_length CHECK (char_length(headline) <= 200),
  CONSTRAINT writing_page_lede_length CHECK (char_length(lede) <= 2000)
);

CREATE TRIGGER experience_page_set_updated_at
  BEFORE UPDATE ON public.experience_page
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER projects_page_set_updated_at
  BEFORE UPDATE ON public.projects_page
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER writing_page_set_updated_at
  BEFORE UPDATE ON public.writing_page
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.resume_tracks
  ADD COLUMN home_kicker text;

ALTER TABLE public.resume_tracks
  ADD CONSTRAINT resume_tracks_home_kicker_length
  CHECK (home_kicker IS NULL OR char_length(home_kicker) <= 40);

ALTER TABLE public.contact_page
  ADD COLUMN cta_heading text NOT NULL DEFAULT 'Start a conversation',
  ADD COLUMN cta_lede text NOT NULL DEFAULT 'Email and LinkedIn are the public contact channels.';

ALTER TABLE public.contact_page
  ADD CONSTRAINT contact_page_cta_heading_not_blank CHECK (length(btrim(cta_heading)) > 0),
  ADD CONSTRAINT contact_page_cta_lede_not_blank CHECK (length(btrim(cta_lede)) > 0),
  ADD CONSTRAINT contact_page_cta_heading_length CHECK (char_length(cta_heading) <= 200),
  ADD CONSTRAINT contact_page_cta_lede_length CHECK (char_length(cta_lede) <= 2000);

ALTER TABLE public.contact_page
  ALTER COLUMN cta_heading DROP DEFAULT,
  ALTER COLUMN cta_lede DROP DEFAULT;

-- Media deletion must not silently detach published relationships.
ALTER TABLE public.publications
  DROP CONSTRAINT publications_media_id_fkey;
ALTER TABLE public.publications
  ADD CONSTRAINT publications_media_id_fkey
  FOREIGN KEY (media_id) REFERENCES public.media_assets (id) ON DELETE RESTRICT;

ALTER TABLE public.resume_tracks
  DROP CONSTRAINT resume_tracks_media_asset_id_fkey;
ALTER TABLE public.resume_tracks
  ADD CONSTRAINT resume_tracks_media_asset_id_fkey
  FOREIGN KEY (media_asset_id) REFERENCES public.media_assets (id) ON DELETE RESTRICT;

ALTER TABLE public.journey_milestones
  DROP CONSTRAINT journey_milestones_media_asset_id_fkey;
ALTER TABLE public.journey_milestones
  ADD CONSTRAINT journey_milestones_media_asset_id_fkey
  FOREIGN KEY (media_asset_id) REFERENCES public.media_assets (id) ON DELETE RESTRICT;

REVOKE ALL ON TABLE public.experience_page FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.projects_page FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.writing_page FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.experience_page TO anon, authenticated;
GRANT SELECT ON TABLE public.projects_page TO anon, authenticated;
GRANT SELECT ON TABLE public.writing_page TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON TABLE public.experience_page TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.projects_page TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.writing_page TO authenticated;

ALTER TABLE public.experience_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_page FORCE ROW LEVEL SECURITY;
ALTER TABLE public.projects_page FORCE ROW LEVEL SECURITY;
ALTER TABLE public.writing_page FORCE ROW LEVEL SECURITY;

CREATE POLICY experience_page_select_published
  ON public.experience_page FOR SELECT TO anon, authenticated
  USING (status = 'published');
CREATE POLICY projects_page_select_published
  ON public.projects_page FOR SELECT TO anon, authenticated
  USING (status = 'published');
CREATE POLICY writing_page_select_published
  ON public.writing_page FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY experience_page_admin_all
  ON public.experience_page TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY projects_page_admin_all
  ON public.projects_page TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY writing_page_admin_all
  ON public.writing_page TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DO $$
DECLARE
  experience_page_id constant uuid := 'c5210001-0000-4000-8000-000000000001';
  projects_page_id constant uuid := 'c5210002-0000-4000-8000-000000000001';
  writing_page_id constant uuid := 'c5210003-0000-4000-8000-000000000001';
  n integer;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.focus_pages WHERE resume_media_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Step 52I refused: focus_pages.resume_media_id is not null';
  END IF;

  INSERT INTO public.experience_page (
    id, singleton_key, status, kicker, headline, lede, additional_heading
  ) VALUES (
    experience_page_id,
    'default',
    'published',
    'Experience',
    'Governance, risk, and privacy work in practice.',
    'Assessment, controls, compliance operations, and technology-risk work from consulting, regulatory, and commercial settings. Consulting and National Privacy Commission work overlapped from October 2024.',
    'Additional experience'
  );

  INSERT INTO public.projects_page (
    id, singleton_key, status, kicker, headline, lede
  ) VALUES (
    projects_page_id,
    'default',
    'published',
    'Projects',
    'Selected work',
    'Applied technical and regulatory-system evidence. PrivAI Guard is the flagship case study. The national systems are described at public-function level only.'
  );

  INSERT INTO public.writing_page (
    id, singleton_key, status, kicker, headline, lede
  ) VALUES (
    writing_page_id,
    'default',
    'published',
    'Writing',
    'Selected Writing & Professional Publications',
    'Curated professional writing in cybersecurity, privacy, GRC, and AI governance — analysis, policy, and research already on the record. This is a selected library, not a blog or news feed.'
  );

  UPDATE public.resume_tracks
  SET home_kicker = 'Resume A'
  WHERE slug = 'cybersecurity-grc' AND home_kicker IS NULL;

  UPDATE public.resume_tracks
  SET home_kicker = 'Resume B'
  WHERE slug = 'privacy-ai-governance' AND home_kicker IS NULL;

  SELECT count(*) INTO n FROM public.experience_page WHERE singleton_key = 'default';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Step 52I refused: experience_page count is %', n;
  END IF;

  SELECT count(*) INTO n FROM public.projects_page WHERE singleton_key = 'default';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Step 52I refused: projects_page count is %', n;
  END IF;

  SELECT count(*) INTO n FROM public.writing_page WHERE singleton_key = 'default';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Step 52I refused: writing_page count is %', n;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.resume_tracks
    WHERE slug = 'cybersecurity-grc' AND home_kicker = 'Resume A'
  ) OR NOT EXISTS (
    SELECT 1 FROM public.resume_tracks
    WHERE slug = 'privacy-ai-governance' AND home_kicker = 'Resume B'
  ) THEN
    RAISE EXCEPTION 'Step 52I refused: Home resume kickers did not seed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.contact_page
    WHERE singleton_key = 'default'
      AND (
        cta_heading IS DISTINCT FROM 'Start a conversation'
        OR cta_lede IS DISTINCT FROM 'Email and LinkedIn are the public contact channels.'
      )
  ) THEN
    RAISE EXCEPTION 'Step 52I refused: Contact CTA defaults drifted';
  END IF;
END
$$;

DROP INDEX IF EXISTS public.experience_items_status_home_idx;

ALTER TABLE public.home_page DROP COLUMN seo_title;
ALTER TABLE public.home_page DROP COLUMN seo_description;
ALTER TABLE public.about_page DROP COLUMN seo_title;
ALTER TABLE public.about_page DROP COLUMN seo_description;
ALTER TABLE public.credentials_page DROP COLUMN seo_title;
ALTER TABLE public.credentials_page DROP COLUMN seo_description;
ALTER TABLE public.focus_pages DROP COLUMN resume_media_id;
ALTER TABLE public.experience_items DROP COLUMN show_on_home;
