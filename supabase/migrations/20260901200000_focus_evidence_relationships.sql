-- Step 52D: Focus evidence relationships and hosted public authority.
-- Core Focus copy stays on focus_pages. Supporting evidence uses UUIDs.
-- resume_media_id remains unused and reserved for Step 52G.

ALTER TABLE public.focus_pages
  ADD COLUMN featured_project_id uuid REFERENCES public.projects (id) ON DELETE SET NULL,
  ADD COLUMN featured_publication_id uuid REFERENCES public.publications (id) ON DELETE SET NULL,
  ADD COLUMN featured_project_lede text,
  ADD COLUMN card_summary text,
  ADD COLUMN card_chips text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.focus_pages
  ADD CONSTRAINT focus_pages_featured_project_lede_not_blank
    CHECK (featured_project_lede IS NULL OR length(btrim(featured_project_lede)) > 0),
  ADD CONSTRAINT focus_pages_card_summary_not_blank
    CHECK (card_summary IS NULL OR length(btrim(card_summary)) > 0);

CREATE TABLE public.focus_experience_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  focus_page_id uuid NOT NULL REFERENCES public.focus_pages (id) ON DELETE CASCADE,
  experience_item_id uuid NOT NULL REFERENCES public.experience_items (id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT focus_experience_items_unique UNIQUE (focus_page_id, experience_item_id),
  CONSTRAINT focus_experience_items_sort_unique UNIQUE (focus_page_id, sort_order)
);

CREATE TABLE public.focus_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  focus_page_id uuid NOT NULL REFERENCES public.focus_pages (id) ON DELETE CASCADE,
  credential_id uuid NOT NULL REFERENCES public.credentials (id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT focus_credentials_unique UNIQUE (focus_page_id, credential_id),
  CONSTRAINT focus_credentials_sort_unique UNIQUE (focus_page_id, sort_order)
);

CREATE INDEX focus_experience_items_focus_idx
  ON public.focus_experience_items (focus_page_id, sort_order);
CREATE INDEX focus_credentials_focus_idx
  ON public.focus_credentials (focus_page_id, sort_order);

CREATE TRIGGER focus_experience_items_set_updated_at
  BEFORE UPDATE ON public.focus_experience_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER focus_credentials_set_updated_at
  BEFORE UPDATE ON public.focus_credentials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

REVOKE ALL ON TABLE public.focus_experience_items FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.focus_credentials FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.focus_experience_items TO anon, authenticated;
GRANT SELECT ON TABLE public.focus_credentials TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON TABLE public.focus_experience_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.focus_credentials TO authenticated;

ALTER TABLE public.focus_experience_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_experience_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.focus_credentials FORCE ROW LEVEL SECURITY;

CREATE POLICY focus_experience_items_select_published
  ON public.focus_experience_items
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.focus_pages fp
      WHERE fp.id = focus_experience_items.focus_page_id
        AND fp.status = 'published'
    )
  );

CREATE POLICY focus_credentials_select_published
  ON public.focus_credentials
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.focus_pages fp
      WHERE fp.id = focus_credentials.focus_page_id
        AND fp.status = 'published'
    )
  );

CREATE POLICY focus_experience_items_admin_all
  ON public.focus_experience_items
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY focus_credentials_admin_all
  ON public.focus_credentials
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DO $$
DECLARE
  cyber_id constant uuid := '40170d44-acc6-4f1c-b6fd-a6fbee19c02a';
  privacy_id constant uuid := '27236662-e48e-4b6f-a820-75cd321a7322';
  privai_id constant uuid := '0002fb1b-5c40-41ea-98a9-e62de9dac37e';
  egov_id constant uuid := '93bc6513-f2e8-436c-9639-0eb59288aca7';
  ppml_id constant uuid := '6aff00bd-be4c-43cd-9dcf-bc649e919b7f';
  google_ai_id constant uuid := 'ddad349b-5faf-4f92-b12d-005ace591d4c';
  n integer;
BEGIN
  IF (
    SELECT count(*) FROM public.focus_pages
    WHERE id IN (cyber_id, privacy_id)
      AND status = 'published'
  ) <> 2 THEN
    RAISE EXCEPTION 'Step 52D refused: published Focus pages missing';
  END IF;

  IF (
    SELECT count(*) FROM public.projects
    WHERE id = privai_id AND slug = 'privai-guard' AND status = 'published'
  ) <> 1 THEN
    RAISE EXCEPTION 'Step 52D refused: PrivAI Guard project UUID missing';
  END IF;

  IF (
    SELECT count(*) FROM public.publications
    WHERE id = egov_id
      AND slug = 'egov-ph-architectural-fragility-bcdr'
      AND status = 'published'
  ) <> 1 THEN
    RAISE EXCEPTION 'Step 52D refused: eGov publication UUID missing';
  END IF;

  IF (
    SELECT count(*) FROM public.publications
    WHERE id = ppml_id
      AND slug = 'privacy-preserving-machine-learning-global-healthcare-ai'
      AND status = 'published'
  ) <> 1 THEN
    RAISE EXCEPTION 'Step 52D refused: PPML publication UUID missing';
  END IF;

  IF (
    SELECT count(*) FROM public.experience_items
    WHERE id IN (
      '4fcf85b9-f34d-41c5-8ebd-ff37be9534ad',
      'b74f1a93-4c9c-47a2-9389-2a4590716fea',
      'de13800d-8099-439b-bb17-61fda528d371',
      'add4e1dc-4794-4fa3-bf29-9df24b0365d6',
      'aaacc0e6-0fa8-4033-a04f-b96effc769f7',
      '1fd3eba2-98d1-4812-97af-6afbb975ea4c',
      '24411fdd-9ebf-4e52-afd8-6d413688ff71',
      '9c69517e-e3db-421d-8937-ad8a72e5f5f7',
      '3af0f535-e1ad-41bb-b4f3-6c011c4fec6b',
      '570cc680-ea24-4c6c-a620-ac8787e26bfc',
      '9f78af2b-055d-4251-96c5-6fd860a03c1d'
    )
      AND status = 'published'
  ) <> 11 THEN
    RAISE EXCEPTION 'Step 52D refused: Focus experience item UUIDs missing';
  END IF;

  IF (
    SELECT count(*) FROM public.credentials
    WHERE id IN (
      'bda3ebf4-4601-4a34-bfe5-9bb5b595d599',
      '489e51fb-4f4a-451a-a8a7-84e1fcda352b',
      '6fbd0d27-1d04-44ef-9e49-339f14e16abc',
      '10c12754-6e41-4dfc-b69a-f491a5c0095f',
      'd379a34a-9919-4bc9-9ea7-a064fee79f7e',
      '4e1e053a-1363-45fb-96e9-7534a5989e51'
    )
      AND status = 'published'
      AND needs_verification = false
  ) <> 6 THEN
    RAISE EXCEPTION 'Step 52D refused: Focus credential UUIDs missing or ineligible';
  END IF;

  UPDATE public.focus_pages
  SET
    featured_project_id = privai_id,
    featured_publication_id = egov_id,
    featured_project_lede = $t$Control design, access boundaries, risk scoring, remediation, and audit evidence.$t$,
    card_summary = $t$For cybersecurity, GRC, and IT-risk work that needs controls, audit readiness, and technology-risk translation.$t$,
    card_chips = ARRAY['IT risk', 'GRC', 'Controls', 'Audit readiness']
  WHERE id = cyber_id;

  UPDATE public.focus_pages
  SET
    featured_project_id = privai_id,
    featured_publication_id = ppml_id,
    featured_project_lede = $t$Privacy-risk triage, data-subject impact review, and human-reviewed routing.$t$,
    card_summary = $t$For privacy and AI-governance work that needs privacy operations, risk assessment, and responsible human review.$t$,
    card_chips = ARRAY[
      'Data privacy',
      'Privacy-risk assessment',
      'AI governance',
      'Human review'
    ]
  WHERE id = privacy_id;

  INSERT INTO public.focus_experience_items (
    id, focus_page_id, experience_item_id, sort_order
  ) VALUES
    ('c52d0001-0000-4000-8000-000000000011', cyber_id, '4fcf85b9-f34d-41c5-8ebd-ff37be9534ad', 10),
    ('c52d0001-0000-4000-8000-000000000012', cyber_id, 'b74f1a93-4c9c-47a2-9389-2a4590716fea', 20),
    ('c52d0001-0000-4000-8000-000000000013', cyber_id, 'de13800d-8099-439b-bb17-61fda528d371', 30),
    ('c52d0001-0000-4000-8000-000000000014', cyber_id, 'add4e1dc-4794-4fa3-bf29-9df24b0365d6', 40),
    ('c52d0001-0000-4000-8000-000000000015', cyber_id, '1fd3eba2-98d1-4812-97af-6afbb975ea4c', 50),
    ('c52d0001-0000-4000-8000-000000000016', cyber_id, '24411fdd-9ebf-4e52-afd8-6d413688ff71', 60),
    ('c52d0001-0000-4000-8000-000000000017', cyber_id, '9c69517e-e3db-421d-8937-ad8a72e5f5f7', 70),
    ('c52d0001-0000-4000-8000-000000000018', cyber_id, '3af0f535-e1ad-41bb-b4f3-6c011c4fec6b', 80),
    ('c52d0001-0000-4000-8000-000000000019', cyber_id, '570cc680-ea24-4c6c-a620-ac8787e26bfc', 90),
    ('c52d0001-0000-4000-8000-00000000001a', cyber_id, '9f78af2b-055d-4251-96c5-6fd860a03c1d', 100),
    ('c52d0001-0000-4000-8000-000000000021', privacy_id, '4fcf85b9-f34d-41c5-8ebd-ff37be9534ad', 10),
    ('c52d0001-0000-4000-8000-000000000022', privacy_id, 'b74f1a93-4c9c-47a2-9389-2a4590716fea', 20),
    ('c52d0001-0000-4000-8000-000000000023', privacy_id, 'de13800d-8099-439b-bb17-61fda528d371', 30),
    ('c52d0001-0000-4000-8000-000000000024', privacy_id, 'aaacc0e6-0fa8-4033-a04f-b96effc769f7', 40),
    ('c52d0001-0000-4000-8000-000000000025', privacy_id, '1fd3eba2-98d1-4812-97af-6afbb975ea4c', 50),
    ('c52d0001-0000-4000-8000-000000000026', privacy_id, '24411fdd-9ebf-4e52-afd8-6d413688ff71', 60),
    ('c52d0001-0000-4000-8000-000000000027', privacy_id, '9c69517e-e3db-421d-8937-ad8a72e5f5f7', 70),
    ('c52d0001-0000-4000-8000-000000000028', privacy_id, '3af0f535-e1ad-41bb-b4f3-6c011c4fec6b', 80),
    ('c52d0001-0000-4000-8000-000000000029', privacy_id, '570cc680-ea24-4c6c-a620-ac8787e26bfc', 90),
    ('c52d0001-0000-4000-8000-00000000002a', privacy_id, '9f78af2b-055d-4251-96c5-6fd860a03c1d', 100);

  INSERT INTO public.focus_credentials (
    id, focus_page_id, credential_id, sort_order
  ) VALUES
    ('c52d0001-0000-4000-8000-000000000031', cyber_id, 'bda3ebf4-4601-4a34-bfe5-9bb5b595d599', 10),
    ('c52d0001-0000-4000-8000-000000000032', cyber_id, '489e51fb-4f4a-451a-a8a7-84e1fcda352b', 20),
    ('c52d0001-0000-4000-8000-000000000033', cyber_id, '6fbd0d27-1d04-44ef-9e49-339f14e16abc', 30),
    ('c52d0001-0000-4000-8000-000000000034', cyber_id, '10c12754-6e41-4dfc-b69a-f491a5c0095f', 40),
    ('c52d0001-0000-4000-8000-000000000035', cyber_id, 'd379a34a-9919-4bc9-9ea7-a064fee79f7e', 50),
    ('c52d0001-0000-4000-8000-000000000036', cyber_id, '4e1e053a-1363-45fb-96e9-7534a5989e51', 60),
    ('c52d0001-0000-4000-8000-000000000041', privacy_id, 'bda3ebf4-4601-4a34-bfe5-9bb5b595d599', 10),
    ('c52d0001-0000-4000-8000-000000000042', privacy_id, '489e51fb-4f4a-451a-a8a7-84e1fcda352b', 20),
    ('c52d0001-0000-4000-8000-000000000043', privacy_id, '6fbd0d27-1d04-44ef-9e49-339f14e16abc', 30),
    ('c52d0001-0000-4000-8000-000000000044', privacy_id, '4e1e053a-1363-45fb-96e9-7534a5989e51', 40);

  SELECT count(*) INTO n FROM public.focus_pages WHERE status = 'published';
  IF n <> 2 THEN
    RAISE EXCEPTION 'Step 52D assertion failed: published focus_pages count is %', n;
  END IF;

  SELECT count(*) INTO n FROM public.focus_experience_items WHERE focus_page_id = cyber_id;
  IF n <> 10 THEN
    RAISE EXCEPTION 'Step 52D assertion failed: cyber experience links = %', n;
  END IF;

  SELECT count(*) INTO n FROM public.focus_experience_items WHERE focus_page_id = privacy_id;
  IF n <> 10 THEN
    RAISE EXCEPTION 'Step 52D assertion failed: privacy experience links = %', n;
  END IF;

  SELECT count(*) INTO n FROM public.focus_credentials WHERE focus_page_id = cyber_id;
  IF n <> 6 THEN
    RAISE EXCEPTION 'Step 52D assertion failed: cyber credential links = %', n;
  END IF;

  SELECT count(*) INTO n FROM public.focus_credentials WHERE focus_page_id = privacy_id;
  IF n <> 4 THEN
    RAISE EXCEPTION 'Step 52D assertion failed: privacy credential links = %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.focus_pages
  WHERE featured_project_id = privai_id;
  IF n <> 2 THEN
    RAISE EXCEPTION 'Step 52D assertion failed: PrivAI featured on % Focus pages', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.focus_pages
  WHERE id = cyber_id AND featured_publication_id = egov_id;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Step 52D assertion failed: cyber eGov publication missing';
  END IF;

  SELECT count(*) INTO n
  FROM public.focus_pages
  WHERE id = privacy_id AND featured_publication_id = ppml_id;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Step 52D assertion failed: privacy PPML publication missing';
  END IF;

  SELECT count(*) INTO n
  FROM public.focus_experience_items fei
  LEFT JOIN public.experience_items ei ON ei.id = fei.experience_item_id
  WHERE ei.id IS NULL;
  IF n <> 0 THEN
    RAISE EXCEPTION 'Step 52D assertion failed: dangling experience links = %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.focus_credentials fc
  LEFT JOIN public.credentials c ON c.id = fc.credential_id
  WHERE c.id IS NULL;
  IF n <> 0 THEN
    RAISE EXCEPTION 'Step 52D assertion failed: dangling credential links = %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.focus_credentials
  WHERE credential_id = google_ai_id;
  IF n <> 0 THEN
    RAISE EXCEPTION 'Step 52D assertion failed: Google AI was selected';
  END IF;

  SELECT count(*) INTO n
  FROM public.focus_credentials fc
  JOIN public.credentials c ON c.id = fc.credential_id
  WHERE c.status <> 'published' OR c.needs_verification = true;
  IF n <> 0 THEN
    RAISE EXCEPTION 'Step 52D assertion failed: ineligible credential selected';
  END IF;

  SELECT count(*) INTO n
  FROM public.focus_pages
  WHERE resume_media_id IS NOT NULL;
  IF n <> 0 THEN
    RAISE EXCEPTION 'Step 52D assertion failed: resume_media_id was activated';
  END IF;
END
$$;
