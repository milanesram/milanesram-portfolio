-- Step 52C: About CMS singleton + Professional Journey milestones.
-- Seeds the approved public About wording, the five current Journey
-- entries by explicit media UUID, and a draft Northwestern graduation
-- milestone with no media.

CREATE TABLE public.about_page (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key text NOT NULL DEFAULT 'default',
  status public.content_status NOT NULL DEFAULT 'draft',
  kicker text NOT NULL,
  headline text NOT NULL,
  lede text NOT NULL,
  journey_heading text NOT NULL,
  education_heading text NOT NULL,
  speaking_heading text NOT NULL,
  speaking_body text NOT NULL,
  boundaries_heading text NOT NULL,
  seo_title text NOT NULL,
  seo_description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT about_page_singleton CHECK (singleton_key = 'default'),
  CONSTRAINT about_page_singleton_key UNIQUE (singleton_key)
);

CREATE TABLE public.about_page_paragraphs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  about_page_id uuid NOT NULL REFERENCES public.about_page (id) ON DELETE CASCADE,
  body text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT about_page_paragraphs_body_not_blank CHECK (length(btrim(body)) > 0),
  CONSTRAINT about_page_paragraphs_sort_unique UNIQUE (about_page_id, sort_order)
);

CREATE TABLE public.about_page_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  about_page_id uuid NOT NULL REFERENCES public.about_page (id) ON DELETE CASCADE,
  kind text NOT NULL,
  body text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT about_page_list_items_kind_check CHECK (kind IN ('speaking', 'boundary')),
  CONSTRAINT about_page_list_items_body_not_blank CHECK (length(btrim(body)) > 0),
  CONSTRAINT about_page_list_items_sort_unique UNIQUE (about_page_id, kind, sort_order)
);

CREATE TABLE public.journey_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  year integer,
  caption text NOT NULL,
  media_asset_id uuid REFERENCES public.media_assets (id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT journey_milestones_title_not_blank CHECK (length(btrim(title)) > 0),
  CONSTRAINT journey_milestones_caption_not_blank CHECK (length(btrim(caption)) > 0),
  CONSTRAINT journey_milestones_year_range CHECK (
    year IS NULL OR (year >= 1900 AND year <= 2100)
  ),
  CONSTRAINT journey_milestones_sort_unique UNIQUE (sort_order)
);

CREATE TRIGGER about_page_set_updated_at
  BEFORE UPDATE ON public.about_page
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER about_page_paragraphs_set_updated_at
  BEFORE UPDATE ON public.about_page_paragraphs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER about_page_list_items_set_updated_at
  BEFORE UPDATE ON public.about_page_list_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER journey_milestones_set_updated_at
  BEFORE UPDATE ON public.journey_milestones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

REVOKE ALL ON TABLE public.about_page FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.about_page_paragraphs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.about_page_list_items FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.journey_milestones FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.about_page TO anon, authenticated;
GRANT SELECT ON TABLE public.about_page_paragraphs TO anon, authenticated;
GRANT SELECT ON TABLE public.about_page_list_items TO anon, authenticated;
GRANT SELECT ON TABLE public.journey_milestones TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON TABLE public.about_page TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.about_page_paragraphs TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.about_page_list_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.journey_milestones TO authenticated;

ALTER TABLE public.about_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_page_paragraphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_page_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_milestones ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.about_page FORCE ROW LEVEL SECURITY;
ALTER TABLE public.about_page_paragraphs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.about_page_list_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.journey_milestones FORCE ROW LEVEL SECURITY;

CREATE POLICY about_page_select_published
  ON public.about_page
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY about_page_paragraphs_select_published
  ON public.about_page_paragraphs
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.about_page ap
      WHERE ap.id = about_page_paragraphs.about_page_id
        AND ap.status = 'published'
    )
  );

CREATE POLICY about_page_list_items_select_published
  ON public.about_page_list_items
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.about_page ap
      WHERE ap.id = about_page_list_items.about_page_id
        AND ap.status = 'published'
    )
  );

CREATE POLICY journey_milestones_select_published
  ON public.journey_milestones
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY about_page_admin_all
  ON public.about_page
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY about_page_paragraphs_admin_all
  ON public.about_page_paragraphs
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY about_page_list_items_admin_all
  ON public.about_page_list_items
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY journey_milestones_admin_all
  ON public.journey_milestones
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DO $$
DECLARE
  about_id constant uuid := 'c52c0001-0000-4000-8000-000000000001';
  n integer;
BEGIN
  IF (
    SELECT count(*) FROM public.media_assets
    WHERE id IN (
      '21cc6ca2-a169-4d81-9e9f-c2b28142926f',
      'a9c3d301-8e83-490f-97f2-077b16f98844',
      'd2f89c64-e6de-42bc-b697-952ad6791d36',
      '7e8a240a-d83f-47e5-9986-7882509b5a63',
      'c524fb45-e73e-4a1d-917c-a0287f07fedb'
    )
      AND purpose = 'journey'
      AND status = 'published'
      AND is_public = true
  ) <> 5 THEN
    RAISE EXCEPTION 'Step 52C refused: published Journey media UUIDs missing';
  END IF;

  INSERT INTO public.about_page (
    id,
    singleton_key,
    status,
    kicker,
    headline,
    lede,
    journey_heading,
    education_heading,
    speaking_heading,
    speaking_body,
    boundaries_heading,
    seo_title,
    seo_description
  ) VALUES (
    about_id,
    'default',
    'published',
    'About',
    'From privacy and governance work to cybersecurity and risk.',
    'I work across cybersecurity governance, GRC, technology risk, privacy, and AI governance. An earned Northwestern MSIS (Security Specialization) sits on a foundation of privacy regulation and governance practice.',
    'Professional journey',
    'Education at a glance',
    'Speaking and advisory',
    'I have spoken and advised on data privacy and cybersecurity for public-sector, academic, and private-sector audiences, including selected international briefings.',
    'Professional boundaries',
    'About',
    'Privacy and governance background, an earned Northwestern MSIS (Security Specialization), and current cybersecurity, GRC, privacy, and AI-governance work.'
  );

  INSERT INTO public.about_page_paragraphs (id, about_page_id, body, sort_order) VALUES
    (
      'c52c0001-0000-4000-8000-000000000011',
      about_id,
      'My foundation is privacy regulation, governance, and risk work. I have consulted for regulated organizations and worked with the National Privacy Commission, the Philippines'' national privacy regulator, on assessments, controls, compliance operations, and technology-security implementation.',
      10
    ),
    (
      'c52c0001-0000-4000-8000-000000000012',
      about_id,
      'Before that, I built an organization’s first privacy management program in a commercial setting and translated privacy, security, and compliance requirements into operating practice.',
      20
    ),
    (
      'c52c0001-0000-4000-8000-000000000013',
      about_id,
      'I earned a Northwestern MSIS (Security Specialization) and designed PrivAI Guard, a non-production Shadow AI governance capstone. That combination of security education and applied development is how I keep cybersecurity, GRC, privacy, and AI-governance work technically current.',
      30
    );

  INSERT INTO public.about_page_list_items (id, about_page_id, kind, body, sort_order) VALUES
    ('c52c0001-0000-4000-8000-000000000021', about_id, 'speaking', 'Philippine public-sector and academic audiences', 10),
    ('c52c0001-0000-4000-8000-000000000022', about_id, 'speaking', 'Private-sector privacy and cybersecurity forums', 20),
    ('c52c0001-0000-4000-8000-000000000023', about_id, 'speaking', 'Selected international briefings', 30),
    ('c52c0001-0000-4000-8000-000000000031', about_id, 'boundary', 'Licensed to Practice Law in the Philippines. Not licensed to practice law in the United States.', 10),
    ('c52c0001-0000-4000-8000-000000000032', about_id, 'boundary', 'This site presents selected professional evidence, not a complete CV.', 20),
    ('c52c0001-0000-4000-8000-000000000033', about_id, 'boundary', 'Consulting work is described at the capability level. No client names or consulting outcomes are published here.', 30);

  INSERT INTO public.journey_milestones (
    id, title, year, caption, media_asset_id, sort_order, status
  ) VALUES
    (
      'c52c0001-0000-4000-8000-000000000041',
      'ANU cybersecurity study',
      NULL,
      'Completing cybersecurity study at ANU’s National Security College.',
      '21cc6ca2-a169-4d81-9e9f-c2b28142926f',
      10,
      'published'
    ),
    (
      'c52c0001-0000-4000-8000-000000000042',
      'Decode 2024 media interview',
      2024,
      'Speaking with national media at Decode 2024.',
      'a9c3d301-8e83-490f-97f2-077b16f98844',
      20,
      'published'
    ),
    (
      'c52c0001-0000-4000-8000-000000000043',
      'Global privacy assembly session',
      2025,
      'Speaking on global privacy from the lectern.',
      'd2f89c64-e6de-42bc-b697-952ad6791d36',
      30,
      'published'
    ),
    (
      'c52c0001-0000-4000-8000-000000000044',
      'APEC Peru digital economy meeting',
      2024,
      'At the APEC digital-economy meeting in Peru, 2024.',
      '7e8a240a-d83f-47e5-9986-7882509b5a63',
      40,
      'published'
    ),
    (
      'c52c0001-0000-4000-8000-000000000045',
      'GSMA Ministerial Programme 2023',
      2023,
      'Speaking at the GSMA Ministerial Programme in 2023.',
      'c524fb45-e73e-4a1d-917c-a0287f07fedb',
      50,
      'published'
    ),
    (
      'c52c0001-0000-4000-8000-000000000046',
      'Northwestern University — MSIS Graduation',
      2026,
      'Completed the Master of Science in Information Systems with a Security specialization, strengthening the technical foundation supporting my cybersecurity governance, technology risk, privacy, and AI governance work.',
      NULL,
      60,
      'draft'
    );

  SELECT count(*) INTO n FROM public.about_page WHERE singleton_key = 'default';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Step 52C assertion failed: about_page count is %', n;
  END IF;

  SELECT count(*) INTO n FROM public.about_page_paragraphs WHERE about_page_id = about_id;
  IF n <> 3 THEN
    RAISE EXCEPTION 'Step 52C assertion failed: paragraph count is %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.journey_milestones
  WHERE status = 'published';
  IF n <> 5 THEN
    RAISE EXCEPTION 'Step 52C assertion failed: published Journey count is %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.journey_milestones
  WHERE id = 'c52c0001-0000-4000-8000-000000000046'
    AND status = 'draft'
    AND year = 2026
    AND media_asset_id IS NULL;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Step 52C assertion failed: graduation draft is not isolated';
  END IF;

  SELECT count(*) INTO n
  FROM public.journey_milestones
  WHERE id = 'c52c0001-0000-4000-8000-000000000043'
    AND year = 2025
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Step 52C assertion failed: GPA year is not 2025';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.journey_milestones jm
    LEFT JOIN public.media_assets ma ON ma.id = jm.media_asset_id
    WHERE jm.status = 'published'
      AND (jm.media_asset_id IS NULL OR ma.id IS NULL)
  ) THEN
    RAISE EXCEPTION 'Step 52C assertion failed: published milestone missing media';
  END IF;
END
$$;
