-- Step 52B: Home CMS singleton + stable UUID relationships.
-- Seeds the approved public Home wording and the current six Experience
-- items, three Credentials, and PrivAI Guard flagship by explicit UUID.

CREATE TABLE public.home_page (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key text NOT NULL DEFAULT 'default',
  status public.content_status NOT NULL DEFAULT 'draft',
  featured_project_id uuid REFERENCES public.projects (id) ON DELETE SET NULL,
  headline text NOT NULL,
  lede text NOT NULL,
  primary_cta_label text NOT NULL,
  primary_cta_href text NOT NULL,
  secondary_cta_label text NOT NULL,
  secondary_cta_href text NOT NULL,
  project_kicker text NOT NULL,
  project_heading text NOT NULL,
  project_problem text NOT NULL,
  project_body text NOT NULL,
  project_cta_label text NOT NULL,
  project_cta_href text NOT NULL,
  project_proof_points text[] NOT NULL DEFAULT '{}',
  experience_kicker text NOT NULL,
  experience_heading text NOT NULL,
  experience_lede text NOT NULL,
  experience_cta_label text NOT NULL,
  experience_cta_href text NOT NULL,
  credentials_kicker text NOT NULL,
  credentials_heading text NOT NULL,
  credentials_lede text NOT NULL,
  credentials_cta_label text NOT NULL,
  credentials_cta_href text NOT NULL,
  focus_kicker text NOT NULL,
  focus_heading text NOT NULL,
  focus_lede text NOT NULL,
  closing_heading text NOT NULL,
  closing_body text NOT NULL,
  closing_primary_cta_label text NOT NULL,
  closing_primary_cta_href text NOT NULL,
  closing_secondary_cta_label text NOT NULL,
  closing_secondary_cta_href text NOT NULL,
  seo_title text NOT NULL,
  seo_description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT home_page_singleton CHECK (singleton_key = 'default'),
  CONSTRAINT home_page_singleton_key UNIQUE (singleton_key)
);

CREATE TABLE public.home_page_chips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_page_id uuid NOT NULL REFERENCES public.home_page (id) ON DELETE CASCADE,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT home_page_chips_label_not_blank CHECK (length(btrim(label)) > 0),
  CONSTRAINT home_page_chips_sort_unique UNIQUE (home_page_id, sort_order),
  CONSTRAINT home_page_chips_label_unique UNIQUE (home_page_id, label)
);

CREATE TABLE public.home_proof_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_page_id uuid NOT NULL REFERENCES public.home_page (id) ON DELETE CASCADE,
  label text NOT NULL,
  supporting text NOT NULL,
  href text,
  credential_id uuid REFERENCES public.credentials (id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects (id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT home_proof_items_label_not_blank CHECK (length(btrim(label)) > 0),
  CONSTRAINT home_proof_items_supporting_not_blank CHECK (length(btrim(supporting)) > 0),
  CONSTRAINT home_proof_items_one_relation CHECK (
    NOT (credential_id IS NOT NULL AND project_id IS NOT NULL)
  ),
  CONSTRAINT home_proof_items_sort_unique UNIQUE (home_page_id, sort_order)
);

CREATE TABLE public.home_experience_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_page_id uuid NOT NULL REFERENCES public.home_page (id) ON DELETE CASCADE,
  experience_item_id uuid NOT NULL REFERENCES public.experience_items (id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT home_experience_items_unique UNIQUE (home_page_id, experience_item_id),
  CONSTRAINT home_experience_items_sort_unique UNIQUE (home_page_id, sort_order)
);

CREATE TABLE public.home_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_page_id uuid NOT NULL REFERENCES public.home_page (id) ON DELETE CASCADE,
  credential_id uuid NOT NULL REFERENCES public.credentials (id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT home_credentials_unique UNIQUE (home_page_id, credential_id),
  CONSTRAINT home_credentials_sort_unique UNIQUE (home_page_id, sort_order)
);

CREATE TRIGGER home_page_set_updated_at
  BEFORE UPDATE ON public.home_page
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER home_page_chips_set_updated_at
  BEFORE UPDATE ON public.home_page_chips
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER home_proof_items_set_updated_at
  BEFORE UPDATE ON public.home_proof_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER home_experience_items_set_updated_at
  BEFORE UPDATE ON public.home_experience_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER home_credentials_set_updated_at
  BEFORE UPDATE ON public.home_credentials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

REVOKE ALL ON TABLE public.home_page FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.home_page_chips FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.home_proof_items FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.home_experience_items FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.home_credentials FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.home_page TO anon, authenticated;
GRANT SELECT ON TABLE public.home_page_chips TO anon, authenticated;
GRANT SELECT ON TABLE public.home_proof_items TO anon, authenticated;
GRANT SELECT ON TABLE public.home_experience_items TO anon, authenticated;
GRANT SELECT ON TABLE public.home_credentials TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON TABLE public.home_page TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.home_page_chips TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.home_proof_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.home_experience_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.home_credentials TO authenticated;

ALTER TABLE public.home_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_page_chips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_proof_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_experience_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_credentials ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.home_page FORCE ROW LEVEL SECURITY;
ALTER TABLE public.home_page_chips FORCE ROW LEVEL SECURITY;
ALTER TABLE public.home_proof_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.home_experience_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.home_credentials FORCE ROW LEVEL SECURITY;

CREATE POLICY home_page_select_published
  ON public.home_page
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY home_page_chips_select_published
  ON public.home_page_chips
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.home_page hp
      WHERE hp.id = home_page_chips.home_page_id
        AND hp.status = 'published'
    )
  );

CREATE POLICY home_proof_items_select_published
  ON public.home_proof_items
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.home_page hp
      WHERE hp.id = home_proof_items.home_page_id
        AND hp.status = 'published'
    )
  );

CREATE POLICY home_experience_items_select_published
  ON public.home_experience_items
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.home_page hp
      WHERE hp.id = home_experience_items.home_page_id
        AND hp.status = 'published'
    )
  );

CREATE POLICY home_credentials_select_published
  ON public.home_credentials
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.home_page hp
      WHERE hp.id = home_credentials.home_page_id
        AND hp.status = 'published'
    )
  );

CREATE POLICY home_page_admin_all
  ON public.home_page
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY home_page_chips_admin_all
  ON public.home_page_chips
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY home_proof_items_admin_all
  ON public.home_proof_items
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY home_experience_items_admin_all
  ON public.home_experience_items
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY home_credentials_admin_all
  ON public.home_credentials
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DO $$
DECLARE
  home_id constant uuid := 'c52b0001-0000-4000-8000-000000000001';
  n integer;
BEGIN
  IF (
    SELECT count(*) FROM public.projects
    WHERE id = '0002fb1b-5c40-41ea-98a9-e62de9dac37e'
      AND slug = 'privai-guard'
      AND status = 'published'
  ) <> 1 THEN
    RAISE EXCEPTION 'Step 52B refused: PrivAI Guard project UUID missing';
  END IF;

  IF (
    SELECT count(*) FROM public.experience_items
    WHERE id IN (
      'b74f1a93-4c9c-47a2-9389-2a4590716fea',
      'a6685287-de72-4919-8840-94255d5fd6c2',
      'add4e1dc-4794-4fa3-bf29-9df24b0365d6',
      'df887d59-0bb6-4e5d-84d2-f24662243585',
      '1fd3eba2-98d1-4812-97af-6afbb975ea4c',
      '701c906f-98a3-4992-b383-3a09bfe24785'
    )
  ) <> 6 THEN
    RAISE EXCEPTION 'Step 52B refused: Home experience item UUIDs missing';
  END IF;

  IF (
    SELECT count(*) FROM public.credentials
    WHERE id IN (
      'bda3ebf4-4601-4a34-bfe5-9bb5b595d599',
      '489e51fb-4f4a-451a-a8a7-84e1fcda352b',
      '6fbd0d27-1d04-44ef-9e49-339f14e16abc'
    )
      AND status = 'published'
      AND needs_verification = false
  ) <> 3 THEN
    RAISE EXCEPTION 'Step 52B refused: Home credential UUIDs missing';
  END IF;

  INSERT INTO public.home_page (
    id,
    singleton_key,
    status,
    featured_project_id,
    headline,
    lede,
    primary_cta_label,
    primary_cta_href,
    secondary_cta_label,
    secondary_cta_href,
    project_kicker,
    project_heading,
    project_problem,
    project_body,
    project_cta_label,
    project_cta_href,
    project_proof_points,
    experience_kicker,
    experience_heading,
    experience_lede,
    experience_cta_label,
    experience_cta_href,
    credentials_kicker,
    credentials_heading,
    credentials_lede,
    credentials_cta_label,
    credentials_cta_href,
    focus_kicker,
    focus_heading,
    focus_lede,
    closing_heading,
    closing_body,
    closing_primary_cta_label,
    closing_primary_cta_href,
    closing_secondary_cta_label,
    closing_secondary_cta_href,
    seo_title,
    seo_description
  ) VALUES (
    home_id,
    'default',
    'published',
    '0002fb1b-5c40-41ea-98a9-e62de9dac37e',
    'Cybersecurity, risk, and privacy work grounded in technical practice.',
    'Substantial governance and privacy experience, an earned Northwestern MSIS (Security Specialization), and hands-on technical work through PrivAI Guard, a non-production Shadow AI governance capstone.',
    'View experience',
    '/experience',
    'Read the PrivAI Guard case study',
    '/projects/privai-guard',
    'Featured work · 2026',
    'PrivAI Guard',
    'Employee use of public AI tools often outpaces the privacy and governance controls around them.',
    'A non-production Shadow AI governance MVP I designed and developed that turns risky employee AI use into structured privacy-risk triage, human review, and auditable remediation.',
    'Read the PrivAI Guard case study',
    '/projects/privai-guard',
    ARRAY[
      'Shows that governance requirements can be translated into a working technical system.',
      'Structured risk review and remediation with a human decision path.',
      'Not automated legal or regulatory decisioning.'
    ],
    'Experience',
    'Selected recent work',
    'Selected examples of transferable risk, controls, and privacy work.',
    'View full experience',
    '/experience',
    'Credentials',
    'Education and certifications',
    'Formal credentials that support both tracks.',
    'View credentials',
    '/credentials',
    'Two tracks',
    'One record. Two recruiter packets.',
    'Choose the track that matches the role. The employers, dates, and evidence are the same.',
    'Review the work or start a conversation',
    'Explore experience, projects, and credentials, or reach me by email or LinkedIn.',
    'View resume options',
    '/resume',
    'Contact',
    '/contact',
    'Rainier (Ram) Milanes — Cybersecurity, GRC, IT Risk & Privacy',
    'Cybersecurity governance, GRC, technology risk, privacy, and AI governance. Northwestern MSIS graduate. Applied technical evidence through PrivAI Guard.'
  );

  INSERT INTO public.home_page_chips (id, home_page_id, label, sort_order) VALUES
    ('c52b0001-0000-4000-8000-000000000011', home_id, 'Cybersecurity', 10),
    ('c52b0001-0000-4000-8000-000000000012', home_id, 'GRC', 20),
    ('c52b0001-0000-4000-8000-000000000013', home_id, 'IT Risk', 30),
    ('c52b0001-0000-4000-8000-000000000014', home_id, 'Data Privacy', 40),
    ('c52b0001-0000-4000-8000-000000000015', home_id, 'AI Governance', 50);

  INSERT INTO public.home_proof_items (
    id, home_page_id, label, supporting, href, credential_id, project_id, sort_order
  ) VALUES
    (
      'c52b0001-0000-4000-8000-000000000021',
      home_id,
      'Northwestern MSIS',
      'Security Specialization',
      NULL,
      'bda3ebf4-4601-4a34-bfe5-9bb5b595d599',
      NULL,
      10
    ),
    (
      'c52b0001-0000-4000-8000-000000000022',
      home_id,
      'PrivAI Guard',
      'Shadow AI governance capstone',
      '/projects/privai-guard',
      NULL,
      '0002fb1b-5c40-41ea-98a9-e62de9dac37e',
      20
    ),
    (
      'c52b0001-0000-4000-8000-000000000023',
      home_id,
      'IAPP CIPM',
      'Privacy program management',
      NULL,
      '489e51fb-4f4a-451a-a8a7-84e1fcda352b',
      NULL,
      30
    ),
    (
      'c52b0001-0000-4000-8000-000000000024',
      home_id,
      'ISC2 CC',
      'Certified in Cybersecurity',
      NULL,
      '6fbd0d27-1d04-44ef-9e49-339f14e16abc',
      NULL,
      40
    );

  INSERT INTO public.home_experience_items (
    id, home_page_id, experience_item_id, sort_order
  ) VALUES
    ('c52b0001-0000-4000-8000-000000000031', home_id, 'b74f1a93-4c9c-47a2-9389-2a4590716fea', 10),
    ('c52b0001-0000-4000-8000-000000000032', home_id, 'a6685287-de72-4919-8840-94255d5fd6c2', 20),
    ('c52b0001-0000-4000-8000-000000000033', home_id, 'add4e1dc-4794-4fa3-bf29-9df24b0365d6', 30),
    ('c52b0001-0000-4000-8000-000000000034', home_id, 'df887d59-0bb6-4e5d-84d2-f24662243585', 40),
    ('c52b0001-0000-4000-8000-000000000035', home_id, '1fd3eba2-98d1-4812-97af-6afbb975ea4c', 50),
    ('c52b0001-0000-4000-8000-000000000036', home_id, '701c906f-98a3-4992-b383-3a09bfe24785', 60);

  INSERT INTO public.home_credentials (
    id, home_page_id, credential_id, sort_order
  ) VALUES
    ('c52b0001-0000-4000-8000-000000000041', home_id, 'bda3ebf4-4601-4a34-bfe5-9bb5b595d599', 10),
    ('c52b0001-0000-4000-8000-000000000042', home_id, '489e51fb-4f4a-451a-a8a7-84e1fcda352b', 20),
    ('c52b0001-0000-4000-8000-000000000043', home_id, '6fbd0d27-1d04-44ef-9e49-339f14e16abc', 30);

  SELECT count(*) INTO n FROM public.home_page WHERE singleton_key = 'default';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Step 52B assertion failed: home_page count is %', n;
  END IF;

  SELECT count(*) INTO n FROM public.home_page_chips WHERE home_page_id = home_id;
  IF n <> 5 THEN
    RAISE EXCEPTION 'Step 52B assertion failed: chip count is %', n;
  END IF;

  SELECT count(*) INTO n FROM public.home_proof_items WHERE home_page_id = home_id;
  IF n <> 4 THEN
    RAISE EXCEPTION 'Step 52B assertion failed: proof item count is %', n;
  END IF;

  SELECT count(*) INTO n FROM public.home_experience_items WHERE home_page_id = home_id;
  IF n <> 6 THEN
    RAISE EXCEPTION 'Step 52B assertion failed: experience relationship count is %', n;
  END IF;

  SELECT count(*) INTO n FROM public.home_credentials WHERE home_page_id = home_id;
  IF n <> 3 THEN
    RAISE EXCEPTION 'Step 52B assertion failed: credential relationship count is %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.home_page
  WHERE id = home_id
    AND featured_project_id = '0002fb1b-5c40-41ea-98a9-e62de9dac37e';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Step 52B assertion failed: featured project does not resolve once';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.home_experience_items hei
    LEFT JOIN public.experience_items ei ON ei.id = hei.experience_item_id
    WHERE hei.home_page_id = home_id
      AND ei.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Step 52B assertion failed: experience relationship points to missing item';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.home_credentials hc
    LEFT JOIN public.credentials c ON c.id = hc.credential_id
    WHERE hc.home_page_id = home_id
      AND c.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Step 52B assertion failed: credential relationship points to missing record';
  END IF;
END
$$;
