-- Step 52F: hosted-only Credential authority, About Education
-- UUID relationships, optional verification URL, optional expiry,
-- and Credentials page framing singleton.
-- Does not insert or rewrite core Credential facts.
-- Does not invent verification URLs or expiration dates.

ALTER TABLE public.credentials
  ADD COLUMN verification_url text,
  ADD COLUMN expires_on date;

ALTER TABLE public.credentials
  ADD CONSTRAINT credentials_verification_url_https CHECK (
    verification_url IS NULL
    OR verification_url ~ '^https://[^[:space:]]+$'
  );

CREATE TABLE public.about_education_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  about_page_id uuid NOT NULL REFERENCES public.about_page (id) ON DELETE CASCADE,
  credential_id uuid NOT NULL REFERENCES public.credentials (id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT about_education_credentials_unique UNIQUE (about_page_id, credential_id),
  CONSTRAINT about_education_credentials_sort_unique UNIQUE (about_page_id, sort_order)
);

CREATE TABLE public.credentials_page (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key text NOT NULL DEFAULT 'default',
  status public.content_status NOT NULL DEFAULT 'draft',
  kicker text NOT NULL,
  headline text NOT NULL,
  lede text NOT NULL,
  seo_title text NOT NULL,
  seo_description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT credentials_page_singleton CHECK (singleton_key = 'default'),
  CONSTRAINT credentials_page_singleton_key UNIQUE (singleton_key)
);

CREATE TRIGGER about_education_credentials_set_updated_at
  BEFORE UPDATE ON public.about_education_credentials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER credentials_page_set_updated_at
  BEFORE UPDATE ON public.credentials_page
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

REVOKE ALL ON TABLE public.about_education_credentials FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.credentials_page FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.about_education_credentials TO anon, authenticated;
GRANT SELECT ON TABLE public.credentials_page TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON TABLE public.about_education_credentials TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.credentials_page TO authenticated;

ALTER TABLE public.about_education_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials_page ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.about_education_credentials FORCE ROW LEVEL SECURITY;
ALTER TABLE public.credentials_page FORCE ROW LEVEL SECURITY;

CREATE POLICY about_education_credentials_select_published
  ON public.about_education_credentials
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.about_page ap
      WHERE ap.id = about_education_credentials.about_page_id
        AND ap.status = 'published'
    )
    AND EXISTS (
      SELECT 1
      FROM public.credentials c
      WHERE c.id = about_education_credentials.credential_id
        AND c.status = 'published'
        AND c.needs_verification = false
    )
  );

CREATE POLICY credentials_page_select_published
  ON public.credentials_page
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY about_education_credentials_admin_all
  ON public.about_education_credentials
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY credentials_page_admin_all
  ON public.credentials_page
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DO $$
DECLARE
  about_id constant uuid := 'c52c0001-0000-4000-8000-000000000001';
  credentials_page_id constant uuid := 'c52f0001-0000-4000-8000-000000000001';
  msis_id constant uuid := 'bda3ebf4-4601-4a34-bfe5-9bb5b595d599';
  cipm_id constant uuid := '489e51fb-4f4a-451a-a8a7-84e1fcda352b';
  cc_id constant uuid := '6fbd0d27-1d04-44ef-9e49-339f14e16abc';
  jd_id constant uuid := '7e8b86b6-b5cd-4824-b72c-94bb585d491e';
  bsba_id constant uuid := 'f4ce861c-1681-460d-8b81-bf91509483a4';
  anu_id constant uuid := '10c12754-6e41-4dfc-b69a-f491a5c0095f';
  cisa_id constant uuid := 'd379a34a-9919-4bc9-9ea7-a064fee79f7e';
  ph_law_id constant uuid := '4e1e053a-1363-45fb-96e9-7534a5989e51';
  google_ai_id constant uuid := 'ddad349b-5faf-4f92-b12d-005ace591d4c';
  cyber_focus_id constant uuid := '40170d44-acc6-4f1c-b6fd-a6fbee19c02a';
  privacy_focus_id constant uuid := '27236662-e48e-4b6f-a820-75cd321a7322';
  home_id uuid;
  n integer;
BEGIN
  IF (SELECT count(*) FROM public.credentials) <> 10 THEN
    RAISE EXCEPTION 'Step 52F refused: credential count drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.credentials
    WHERE status = 'published' AND needs_verification = false
  ) <> 9 THEN
    RAISE EXCEPTION 'Step 52F refused: public eligible credential count drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.credentials
    WHERE id = google_ai_id
      AND status = 'draft'
      AND needs_verification = true
      AND name = 'Google AI Professional Certificate'
  ) THEN
    RAISE EXCEPTION 'Step 52F refused: Google AI hold drifted';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.credentials
    WHERE verification_url IS NOT NULL OR expires_on IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Step 52F refused: unexpected verification or expiry values';
  END IF;

  SELECT id INTO home_id FROM public.home_page WHERE singleton_key = 'default';

  IF home_id IS NULL THEN
    RAISE EXCEPTION 'Step 52F refused: Home singleton missing';
  END IF;

  IF (
    SELECT count(*) FROM public.home_credentials WHERE home_page_id = home_id
  ) <> 3 THEN
    RAISE EXCEPTION 'Step 52F refused: Home credential relationships drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.home_credentials
    WHERE home_page_id = home_id
      AND credential_id IN (msis_id, cipm_id, cc_id)
  ) <> 3 THEN
    RAISE EXCEPTION 'Step 52F refused: Home credential UUID set drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.focus_credentials WHERE focus_page_id = cyber_focus_id
  ) <> 6 THEN
    RAISE EXCEPTION 'Step 52F refused: Cyber Focus credential relationships drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.focus_credentials
    WHERE focus_page_id = cyber_focus_id
      AND credential_id IN (msis_id, cipm_id, cc_id, anu_id, cisa_id, ph_law_id)
  ) <> 6 THEN
    RAISE EXCEPTION 'Step 52F refused: Cyber Focus credential UUID set drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.focus_credentials WHERE focus_page_id = privacy_focus_id
  ) <> 4 THEN
    RAISE EXCEPTION 'Step 52F refused: Privacy Focus credential relationships drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.focus_credentials
    WHERE focus_page_id = privacy_focus_id
      AND credential_id IN (msis_id, cipm_id, cc_id, ph_law_id)
  ) <> 4 THEN
    RAISE EXCEPTION 'Step 52F refused: Privacy Focus credential UUID set drifted';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.home_credentials WHERE credential_id = google_ai_id
  ) OR EXISTS (
    SELECT 1 FROM public.focus_credentials WHERE credential_id = google_ai_id
  ) THEN
    RAISE EXCEPTION 'Step 52F refused: Google AI relationship exists';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.about_page WHERE id = about_id AND singleton_key = 'default'
  ) THEN
    RAISE EXCEPTION 'Step 52F refused: About singleton missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.credentials
    WHERE id = msis_id
      AND status = 'published'
      AND needs_verification = false
      AND name = 'Master of Science in Information Systems, Security Specialization'
      AND issuer = 'Northwestern University'
      AND year_label = '2026'
  ) THEN
    RAISE EXCEPTION 'Step 52F refused: MSIS credential drifted';
  END IF;

  INSERT INTO public.about_education_credentials (
    id, about_page_id, credential_id, sort_order
  ) VALUES
    ('c52f0001-0000-4000-8000-000000000011', about_id, msis_id, 10),
    ('c52f0001-0000-4000-8000-000000000012', about_id, jd_id, 20),
    ('c52f0001-0000-4000-8000-000000000013', about_id, bsba_id, 30);

  INSERT INTO public.credentials_page (
    id,
    singleton_key,
    status,
    kicker,
    headline,
    lede,
    seo_title,
    seo_description
  ) VALUES (
    credentials_page_id,
    'default',
    'published',
    'Credentials',
    'Education, certifications, and licensure',
    'Selected verified credentials that support cybersecurity governance, GRC, privacy, and AI-governance work. Philippine legal licensure is listed separately and is not U.S. bar admission.',
    'Credentials',
    'Earned Northwestern MSIS (Security Specialization), CIPM, ISC2 Certified in Cybersecurity, specialized cybersecurity training, and Philippine legal licensure.'
  );

  SELECT count(*) INTO n
  FROM public.about_education_credentials
  WHERE about_page_id = about_id;

  IF n <> 3 THEN
    RAISE EXCEPTION 'Step 52F refused: About Education relationship count is %', n;
  END IF;

  IF (
    SELECT count(*) FROM public.about_education_credentials aec
    JOIN public.credentials c ON c.id = aec.credential_id
    WHERE aec.about_page_id = about_id
      AND c.status = 'published'
      AND c.needs_verification = false
  ) <> 3 THEN
    RAISE EXCEPTION 'Step 52F refused: About Education targets are not publicly eligible';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.about_education_credentials WHERE credential_id = google_ai_id
  ) THEN
    RAISE EXCEPTION 'Step 52F refused: Google AI About Education relationship exists';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.about_education_credentials aec
    LEFT JOIN public.credentials c ON c.id = aec.credential_id
    WHERE c.id IS NULL
  ) OR EXISTS (
    SELECT 1
    FROM public.home_credentials hc
    LEFT JOIN public.credentials c ON c.id = hc.credential_id
    WHERE c.id IS NULL
  ) OR EXISTS (
    SELECT 1
    FROM public.focus_credentials fc
    LEFT JOIN public.credentials c ON c.id = fc.credential_id
    WHERE c.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Step 52F refused: dangling credential relationship';
  END IF;

  IF (SELECT count(*) FROM public.credentials) <> 10 THEN
    RAISE EXCEPTION 'Step 52F refused: credential insert occurred';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.credentials
    WHERE verification_url IS NOT NULL OR expires_on IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Step 52F refused: fabricated verification or expiry values';
  END IF;
END
$$;
