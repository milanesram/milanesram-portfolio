-- Step 52H: Resume tracks, Contact page configuration, and
-- route-keyed page_seo. Does not enable the contact form, publish
-- Resume files, or rewrite Home/About/Focus/Experience/Project facts.
-- focus_pages.resume_media_id remains unused leftover.

CREATE TYPE public.resume_delivery_mode AS ENUM (
  'request',
  'public_file'
);

CREATE TABLE public.resume_page (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key text NOT NULL DEFAULT 'default',
  status public.content_status NOT NULL DEFAULT 'draft',
  kicker text NOT NULL,
  headline text NOT NULL,
  lede text NOT NULL,
  request_intro text NOT NULL,
  request_footnote text NOT NULL,
  closing_heading text NOT NULL,
  closing_lede text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT resume_page_singleton CHECK (singleton_key = 'default'),
  CONSTRAINT resume_page_singleton_key UNIQUE (singleton_key),
  CONSTRAINT resume_page_kicker_not_blank CHECK (length(btrim(kicker)) > 0),
  CONSTRAINT resume_page_headline_not_blank CHECK (length(btrim(headline)) > 0),
  CONSTRAINT resume_page_lede_not_blank CHECK (length(btrim(lede)) > 0),
  CONSTRAINT resume_page_kicker_length CHECK (char_length(kicker) <= 80),
  CONSTRAINT resume_page_headline_length CHECK (char_length(headline) <= 200),
  CONSTRAINT resume_page_lede_length CHECK (char_length(lede) <= 2000),
  CONSTRAINT resume_page_request_intro_length CHECK (char_length(request_intro) <= 400),
  CONSTRAINT resume_page_request_footnote_length CHECK (char_length(request_footnote) <= 400),
  CONSTRAINT resume_page_closing_heading_length CHECK (char_length(closing_heading) <= 200),
  CONSTRAINT resume_page_closing_lede_length CHECK (char_length(closing_lede) <= 2000)
);

CREATE TABLE public.resume_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  focus_page_id uuid REFERENCES public.focus_pages (id) ON DELETE SET NULL,
  title text NOT NULL,
  summary text NOT NULL,
  delivery_mode public.resume_delivery_mode NOT NULL DEFAULT 'request',
  media_asset_id uuid REFERENCES public.media_assets (id) ON DELETE SET NULL,
  request_cta_label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT resume_tracks_slug_unique UNIQUE (slug),
  CONSTRAINT resume_tracks_sort_unique UNIQUE (sort_order),
  CONSTRAINT resume_tracks_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT resume_tracks_slug_length CHECK (char_length(slug) <= 80),
  CONSTRAINT resume_tracks_title_not_blank CHECK (length(btrim(title)) > 0),
  CONSTRAINT resume_tracks_summary_not_blank CHECK (length(btrim(summary)) > 0),
  CONSTRAINT resume_tracks_cta_not_blank CHECK (length(btrim(request_cta_label)) > 0),
  CONSTRAINT resume_tracks_title_length CHECK (char_length(title) <= 160),
  CONSTRAINT resume_tracks_summary_length CHECK (char_length(summary) <= 2000),
  CONSTRAINT resume_tracks_cta_length CHECK (char_length(request_cta_label) <= 80)
);

CREATE TABLE public.contact_page (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key text NOT NULL DEFAULT 'default',
  status public.content_status NOT NULL DEFAULT 'draft',
  kicker text NOT NULL,
  headline text NOT NULL,
  lede text NOT NULL,
  email_enabled boolean NOT NULL DEFAULT true,
  linkedin_enabled boolean NOT NULL DEFAULT true,
  email_label text NOT NULL,
  linkedin_label text NOT NULL,
  form_intro text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contact_page_singleton CHECK (singleton_key = 'default'),
  CONSTRAINT contact_page_singleton_key UNIQUE (singleton_key),
  CONSTRAINT contact_page_kicker_not_blank CHECK (length(btrim(kicker)) > 0),
  CONSTRAINT contact_page_headline_not_blank CHECK (length(btrim(headline)) > 0),
  CONSTRAINT contact_page_lede_not_blank CHECK (length(btrim(lede)) > 0),
  CONSTRAINT contact_page_email_label_not_blank CHECK (length(btrim(email_label)) > 0),
  CONSTRAINT contact_page_linkedin_label_not_blank CHECK (length(btrim(linkedin_label)) > 0),
  CONSTRAINT contact_page_form_intro_not_blank CHECK (length(btrim(form_intro)) > 0),
  CONSTRAINT contact_page_kicker_length CHECK (char_length(kicker) <= 80),
  CONSTRAINT contact_page_headline_length CHECK (char_length(headline) <= 200),
  CONSTRAINT contact_page_lede_length CHECK (char_length(lede) <= 2000),
  CONSTRAINT contact_page_email_label_length CHECK (char_length(email_label) <= 80),
  CONSTRAINT contact_page_linkedin_label_length CHECK (char_length(linkedin_label) <= 80),
  CONSTRAINT contact_page_form_intro_length CHECK (char_length(form_intro) <= 2000)
);

CREATE TABLE public.page_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  og_title text,
  og_description text,
  indexable boolean NOT NULL DEFAULT true,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT page_seo_key_unique UNIQUE (page_key),
  CONSTRAINT page_seo_known_key CHECK (
    page_key IN (
      'home',
      'about',
      'focus-cybersecurity-grc',
      'focus-privacy-ai-governance',
      'experience',
      'projects',
      'writing',
      'credentials',
      'resume',
      'contact'
    )
  ),
  CONSTRAINT page_seo_title_not_blank CHECK (length(btrim(title)) > 0),
  CONSTRAINT page_seo_description_not_blank CHECK (length(btrim(description)) > 0),
  CONSTRAINT page_seo_title_length CHECK (char_length(title) <= 200),
  CONSTRAINT page_seo_description_length CHECK (char_length(description) <= 500),
  CONSTRAINT page_seo_og_title_length CHECK (
    og_title IS NULL OR char_length(og_title) <= 200
  ),
  CONSTRAINT page_seo_og_description_length CHECK (
    og_description IS NULL OR char_length(og_description) <= 500
  )
);

COMMENT ON COLUMN public.focus_pages.resume_media_id IS
  'Leftover unused Focus resume-file FK. Resume file ownership is resume_tracks.media_asset_id. Do not activate this column. Candidate for later removal.';

CREATE TRIGGER resume_page_set_updated_at
  BEFORE UPDATE ON public.resume_page
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER resume_tracks_set_updated_at
  BEFORE UPDATE ON public.resume_tracks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER contact_page_set_updated_at
  BEFORE UPDATE ON public.contact_page
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER page_seo_set_updated_at
  BEFORE UPDATE ON public.page_seo
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

REVOKE ALL ON TABLE public.resume_page FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.resume_tracks FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.contact_page FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.page_seo FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.resume_page TO anon, authenticated;
GRANT SELECT ON TABLE public.resume_tracks TO anon, authenticated;
GRANT SELECT ON TABLE public.contact_page TO anon, authenticated;
GRANT SELECT ON TABLE public.page_seo TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON TABLE public.resume_page TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.resume_tracks TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.contact_page TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.page_seo TO authenticated;

ALTER TABLE public.resume_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.resume_page FORCE ROW LEVEL SECURITY;
ALTER TABLE public.resume_tracks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.contact_page FORCE ROW LEVEL SECURITY;
ALTER TABLE public.page_seo FORCE ROW LEVEL SECURITY;

CREATE POLICY resume_page_select_published
  ON public.resume_page
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY resume_tracks_select_published
  ON public.resume_tracks
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY contact_page_select_published
  ON public.contact_page
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY page_seo_select_published
  ON public.page_seo
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY resume_page_admin_all
  ON public.resume_page
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY resume_tracks_admin_all
  ON public.resume_tracks
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY contact_page_admin_all
  ON public.contact_page
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY page_seo_admin_all
  ON public.page_seo
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DO $$
DECLARE
  resume_page_id constant uuid := 'c52a0001-0000-4000-8000-000000000001';
  cyber_track_id constant uuid := 'c52a0001-0000-4000-8000-000000000011';
  privacy_track_id constant uuid := 'c52a0001-0000-4000-8000-000000000012';
  contact_page_id constant uuid := 'c52a0002-0000-4000-8000-000000000001';
  cyber_focus_id constant uuid := '40170d44-acc6-4f1c-b6fd-a6fbee19c02a';
  privacy_focus_id constant uuid := '27236662-e48e-4b6f-a820-75cd321a7322';
  home_title text;
  home_description text;
  about_title text;
  about_description text;
  credentials_title text;
  credentials_description text;
  form_enabled boolean;
  n integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.focus_pages
    WHERE id = cyber_focus_id AND slug = 'cybersecurity-grc' AND status = 'published'
  ) OR NOT EXISTS (
    SELECT 1 FROM public.focus_pages
    WHERE id = privacy_focus_id AND slug = 'privacy-ai-governance' AND status = 'published'
  ) THEN
    RAISE EXCEPTION 'Step 52H refused: Focus pages missing';
  END IF;

  SELECT seo_title, seo_description
    INTO home_title, home_description
  FROM public.home_page
  WHERE singleton_key = 'default' AND status = 'published';

  SELECT seo_title, seo_description
    INTO about_title, about_description
  FROM public.about_page
  WHERE singleton_key = 'default' AND status = 'published';

  SELECT seo_title, seo_description
    INTO credentials_title, credentials_description
  FROM public.credentials_page
  WHERE singleton_key = 'default' AND status = 'published';

  IF home_title IS NULL OR about_title IS NULL OR credentials_title IS NULL THEN
    RAISE EXCEPTION 'Step 52H refused: existing page-local SEO missing';
  END IF;

  SELECT contact_form_enabled INTO form_enabled
  FROM public.site_settings
  WHERE singleton_key = 'default';

  IF form_enabled IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Step 52H refused: contact form is not unpublished';
  END IF;

  INSERT INTO public.resume_page (
    id, singleton_key, status, kicker, headline, lede,
    request_intro, request_footnote, closing_heading, closing_lede
  ) VALUES (
    resume_page_id,
    'default',
    'published',
    'Resume',
    'One professional record. Two focus lenses.',
    'The same career record, presented through two professional emphases: cybersecurity, GRC, and IT risk; and privacy and AI governance. Resumes are provided on request rather than as public downloads.',
    'Request the relevant packet',
    'The comprehensive CV is private and is not published here.',
    'Request a resume',
    'Email or LinkedIn is the request path. Specify Cybersecurity / GRC or Privacy / AI Governance.'
  );

  INSERT INTO public.resume_tracks (
    id, slug, focus_page_id, title, summary, delivery_mode, media_asset_id,
    request_cta_label, sort_order, status
  )
  SELECT
    cyber_track_id,
    'cybersecurity-grc',
    cyber_focus_id,
    nav_label,
    summary,
    'request',
    NULL,
    'View this profile',
    10,
    'published'
  FROM public.focus_pages
  WHERE id = cyber_focus_id;

  INSERT INTO public.resume_tracks (
    id, slug, focus_page_id, title, summary, delivery_mode, media_asset_id,
    request_cta_label, sort_order, status
  )
  SELECT
    privacy_track_id,
    'privacy-ai-governance',
    privacy_focus_id,
    nav_label,
    summary,
    'request',
    NULL,
    'View this profile',
    20,
    'published'
  FROM public.focus_pages
  WHERE id = privacy_focus_id;

  INSERT INTO public.contact_page (
    id, singleton_key, status, kicker, headline, lede,
    email_enabled, linkedin_enabled, email_label, linkedin_label, form_intro
  ) VALUES (
    contact_page_id,
    'default',
    'published',
    'Contact',
    'Start a conversation',
    'Email and LinkedIn are the public channels for conversations about cybersecurity governance, GRC, technology risk, privacy, and AI governance. A phone number is not published on this site.',
    true,
    true,
    'Email',
    'LinkedIn',
    'Email and LinkedIn are the production contact channels. A web form is not published on this site.'
  );

  INSERT INTO public.page_seo (
    id, page_key, title, description, og_title, og_description, indexable, status
  ) VALUES
    (
      'c52a0003-0000-4000-8000-000000000001',
      'home',
      home_title,
      home_description,
      home_title,
      home_description,
      true,
      'published'
    ),
    (
      'c52a0003-0000-4000-8000-000000000002',
      'about',
      about_title,
      about_description,
      about_title,
      about_description,
      true,
      'published'
    ),
    (
      'c52a0003-0000-4000-8000-000000000003',
      'focus-cybersecurity-grc',
      'Cybersecurity, GRC, and IT Risk',
      'Cybersecurity governance, GRC, and IT risk — controls, audit readiness, security governance, and risk remediation.',
      'Cybersecurity, GRC, and IT Risk',
      'Cybersecurity governance, GRC, and IT risk — controls, audit readiness, security governance, and risk remediation.',
      true,
      'published'
    ),
    (
      'c52a0003-0000-4000-8000-000000000004',
      'focus-privacy-ai-governance',
      'Privacy and AI Governance',
      'Privacy operations, data protection, and AI governance — privacy-risk assessment, compliance, and human-reviewed Shadow AI work.',
      'Privacy and AI Governance',
      'Privacy operations, data protection, and AI governance — privacy-risk assessment, compliance, and human-reviewed Shadow AI work.',
      true,
      'published'
    ),
    (
      'c52a0003-0000-4000-8000-000000000005',
      'experience',
      'Experience',
      'Cybersecurity, GRC, privacy, and technology-risk experience spanning consulting, regulatory operations, and commercial privacy-program work.',
      'Experience',
      'Cybersecurity, GRC, privacy, and technology-risk experience spanning consulting, regulatory operations, and commercial privacy-program work.',
      true,
      'published'
    ),
    (
      'c52a0003-0000-4000-8000-000000000006',
      'projects',
      'Projects',
      'Selected work including PrivAI Guard, a non-production Shadow AI governance capstone, and national privacy-regulatory systems.',
      'Projects',
      'Selected work including PrivAI Guard, a non-production Shadow AI governance capstone, and national privacy-regulatory systems.',
      true,
      'published'
    ),
    (
      'c52a0003-0000-4000-8000-000000000007',
      'writing',
      'Selected Writing & Professional Publications',
      'Selected professional writing by Rainier (Ram) Milanes across cybersecurity, GRC, IT risk, data privacy, AI governance, resilience, and technology policy.',
      'Selected Writing & Professional Publications',
      'Selected professional writing by Rainier (Ram) Milanes across cybersecurity, GRC, IT risk, data privacy, AI governance, resilience, and technology policy.',
      true,
      'published'
    ),
    (
      'c52a0003-0000-4000-8000-000000000008',
      'credentials',
      credentials_title,
      credentials_description,
      credentials_title,
      credentials_description,
      true,
      'published'
    ),
    (
      'c52a0003-0000-4000-8000-000000000009',
      'resume',
      'Resume',
      'Two professional focus packets for the same career record: cybersecurity, GRC, and IT risk; or privacy and AI governance. Resumes are provided on request.',
      'Resume',
      'Two professional focus packets for the same career record: cybersecurity, GRC, and IT risk; or privacy and AI governance. Resumes are provided on request.',
      true,
      'published'
    ),
    (
      'c52a0003-0000-4000-8000-000000000010',
      'contact',
      'Contact',
      'Contact Rainier (Ram) Milanes by email or LinkedIn about cybersecurity governance, GRC, technology risk, privacy, or AI governance.',
      'Contact',
      'Contact Rainier (Ram) Milanes by email or LinkedIn about cybersecurity governance, GRC, technology risk, privacy, or AI governance.',
      true,
      'published'
    );

  SELECT count(*) INTO n FROM public.resume_page WHERE singleton_key = 'default';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Step 52H refused: resume_page count is %', n;
  END IF;

  SELECT count(*) INTO n FROM public.resume_tracks;
  IF n <> 2 THEN
    RAISE EXCEPTION 'Step 52H refused: resume_tracks count is %', n;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.resume_tracks
    WHERE delivery_mode <> 'request' OR media_asset_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Step 52H refused: Resume tracks are not request-only';
  END IF;

  IF (
    SELECT focus_page_id FROM public.resume_tracks WHERE id = cyber_track_id
  ) IS DISTINCT FROM cyber_focus_id
    OR (
      SELECT focus_page_id FROM public.resume_tracks WHERE id = privacy_track_id
    ) IS DISTINCT FROM privacy_focus_id
  THEN
    RAISE EXCEPTION 'Step 52H refused: Resume Focus FKs drifted';
  END IF;

  SELECT count(*) INTO n FROM public.contact_page WHERE singleton_key = 'default';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Step 52H refused: contact_page count is %', n;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.contact_page
    WHERE singleton_key = 'default'
      AND email_enabled = true
      AND linkedin_enabled = true
  ) THEN
    RAISE EXCEPTION 'Step 52H refused: Contact channels are not enabled';
  END IF;

  SELECT contact_form_enabled INTO form_enabled
  FROM public.site_settings
  WHERE singleton_key = 'default';

  IF form_enabled IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Step 52H refused: contact form enabled after seed';
  END IF;

  SELECT count(*) INTO n FROM public.page_seo;
  IF n <> 10 THEN
    RAISE EXCEPTION 'Step 52H refused: page_seo count is %', n;
  END IF;

  SELECT count(DISTINCT page_key) INTO n FROM public.page_seo;
  IF n <> 10 THEN
    RAISE EXCEPTION 'Step 52H refused: page_seo keys are not unique';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.focus_pages WHERE resume_media_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Step 52H refused: focus_pages.resume_media_id was activated';
  END IF;
END
$$;
