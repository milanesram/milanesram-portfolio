-- Step 9: align the résumé search description with Privacy-first lane order.
-- Footer order is code-owned in FOCUS_PUBLIC_ROUTES and is not stored here.
-- Updates only page_seo description and og_description for page_key = 'resume'.

DO $seo_reconcile$
DECLARE
  n integer;
  privacy_sort integer;
  grc_sort integer;
  privacy_resume_sort integer;
  grc_resume_sort integer;
  form_enabled boolean;
  resume_title text;
  resume_description text;
  resume_og_title text;
  resume_og_description text;
  other_seo_before text;
  other_seo_after text;
  old_resume_description text := $t$Two role-aligned resumes for one professional record: GRC, IT risk and security compliance, or privacy, compliance and assurance.$t$;
  new_resume_description text := $t$Two role-aligned resumes for one professional record: privacy, compliance and assurance, or GRC, IT risk and security compliance.$t$;
  resume_title_expected text := $t$Resume | Privacy, GRC & IT Risk$t$;
  home_title_expected text := $t$Rainier (Ram) Milanes | Global Privacy, Compliance & Information Security Risk$t$;
  home_description_expected text := $t$Global privacy, compliance and information-security risk professional and former privacy regulator with hands-on work across privacy operations, GRC, IT risk, security compliance, assurance, remediation and technology implementation.$t$;
  contact_description_expected text := $t$Email or LinkedIn for hands-on privacy, GRC, IT risk, security compliance, assurance and related technology-risk work.$t$;
  privai_limits_expected text := $t$Northwestern MSIS capstone — cloud-deployed non-production MVP. Synthetic demonstration data only. Human governance review — not automated legal or regulatory decisioning.$t$;
BEGIN
  SELECT count(*) INTO n
  FROM public.page_seo
  WHERE status = 'published' AND indexable IS TRUE;
  IF n <> 10 THEN
    RAISE EXCEPTION 'SEO reconcile refused: expected 10 published indexable page_seo rows, found %', n;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.page_seo
    WHERE status = 'published'
      AND title ILIKE '%Privacy and AI Governance%'
  ) THEN
    RAISE EXCEPTION 'SEO reconcile refused: stale Privacy and AI Governance title is published';
  END IF;

  SELECT headline INTO resume_title
  FROM public.site_profile
  WHERE singleton_key = 'default' AND status = 'published';
  IF resume_title IS DISTINCT FROM
    $t$Global Privacy, Compliance & Information Security Risk Professional$t$
  THEN
    RAISE EXCEPTION 'SEO reconcile refused: site profile headline drifted';
  END IF;

  SELECT headline INTO resume_title
  FROM public.home_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF resume_title IS DISTINCT FROM
    $t$Global Privacy, Compliance & Information Security Risk Professional$t$
  THEN
    RAISE EXCEPTION 'SEO reconcile refused: home headline drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.about_page_paragraphs
    WHERE id = 'b6d0a9f6-2893-4cde-80d1-8f98233246df'
      AND body LIKE $t$Early technical, administrative and operational work%$t$
  ) THEN
    RAISE EXCEPTION 'SEO reconcile refused: about narrative drifted';
  END IF;

  SELECT count(*) INTO n
  FROM public.experiences
  WHERE id = 'c52e0001-0000-4000-8000-000000000001'
    AND title = $t$Legal Consultant$t$
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'SEO reconcile refused: Scionetrade title drifted';
  END IF;

  SELECT count(*) INTO n
  FROM public.experiences
  WHERE id = '76cab340-da39-4975-b061-5c65bb0c78ad'
    AND title = $t$Communications Chair, Data & Technology Student Leadership Council$t$
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'SEO reconcile refused: Northwestern title drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.experience_items
    WHERE status = 'published'
      AND body = $t$Introduced pre- and post-production security implementation for the Compliance and Security Monitoring Command Center, reviewed execution, and provided guidance on privacy and security alignment.$t$
  ) THEN
    RAISE EXCEPTION 'SEO reconcile refused: CSMCC scope drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.experience_items
    WHERE status = 'published'
      AND body = $t$Supported more than 10,000 Data Processing System (DPS) and Data Protection Officer (DPO) registrations by 30 September 2024 after the registration system launched in 2023.$t$
  ) THEN
    RAISE EXCEPTION 'SEO reconcile refused: registration wording drifted';
  END IF;

  SELECT sort_order INTO privacy_sort
  FROM public.focus_pages
  WHERE id = '27236662-e48e-4b6f-a820-75cd321a7322'
    AND slug = 'privacy-compliance-assurance'
    AND status = 'published';
  SELECT sort_order INTO grc_sort
  FROM public.focus_pages
  WHERE id = '40170d44-acc6-4f1c-b6fd-a6fbee19c02a'
    AND slug = 'cybersecurity-grc'
    AND status = 'published';
  IF privacy_sort IS DISTINCT FROM 10 OR grc_sort IS DISTINCT FROM 20 THEN
    RAISE EXCEPTION 'SEO reconcile refused: focus order or privacy slug drifted';
  END IF;

  SELECT sort_order INTO privacy_resume_sort
  FROM public.resume_tracks
  WHERE id = 'c52a0001-0000-4000-8000-000000000012'
    AND slug = 'privacy-ai-governance'
    AND status = 'published';
  SELECT sort_order INTO grc_resume_sort
  FROM public.resume_tracks
  WHERE id = 'c52a0001-0000-4000-8000-000000000011'
    AND slug = 'cybersecurity-grc'
    AND status = 'published';
  IF privacy_resume_sort IS DISTINCT FROM 10 OR grc_resume_sort IS DISTINCT FROM 20 THEN
    RAISE EXCEPTION 'SEO reconcile refused: resume order drifted';
  END IF;

  SELECT contact_form_enabled INTO form_enabled
  FROM public.site_settings
  WHERE singleton_key = 'default';
  IF form_enabled IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'SEO reconcile refused: structured inquiry flag drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = '0002fb1b-5c40-41ea-98a9-e62de9dac37e'
      AND slug = 'privai-guard'
      AND status = 'published'
      AND limits = privai_limits_expected
  ) THEN
    RAISE EXCEPTION 'SEO reconcile refused: PrivAI scope language drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.page_seo
    WHERE page_key = 'home'
      AND status = 'published'
      AND indexable IS TRUE
      AND title = home_title_expected
      AND description = home_description_expected
      AND og_title = home_title_expected
      AND og_description = home_description_expected
  ) THEN
    RAISE EXCEPTION 'SEO reconcile refused: home SEO drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.page_seo
    WHERE page_key = 'contact'
      AND status = 'published'
      AND indexable IS TRUE
      AND description = contact_description_expected
      AND og_description = contact_description_expected
  ) THEN
    RAISE EXCEPTION 'SEO reconcile refused: contact SEO drifted';
  END IF;

  SELECT md5(string_agg(
    page_key || '|' || title || '|' || description || '|' ||
    coalesce(og_title, '') || '|' || coalesce(og_description, '') || '|' ||
    indexable::text,
    E'\n' ORDER BY page_key
  )) INTO other_seo_before
  FROM public.page_seo
  WHERE page_key <> 'resume';

  SELECT title, description, og_title, og_description
  INTO resume_title, resume_description, resume_og_title, resume_og_description
  FROM public.page_seo
  WHERE page_key = 'resume' AND status = 'published' AND indexable IS TRUE;

  IF resume_title IS DISTINCT FROM resume_title_expected
    OR resume_og_title IS DISTINCT FROM resume_title_expected
  THEN
    RAISE EXCEPTION 'SEO reconcile refused: resume title drifted';
  END IF;

  IF resume_description = old_resume_description
    AND resume_og_description = old_resume_description
  THEN
    UPDATE public.page_seo
    SET
      description = new_resume_description,
      og_description = new_resume_description
    WHERE page_key = 'resume'
      AND status = 'published'
      AND indexable IS TRUE
      AND title = resume_title_expected
      AND og_title = resume_title_expected
      AND description = old_resume_description
      AND og_description = old_resume_description;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN
      RAISE EXCEPTION 'SEO reconcile refused: resume SEO update matched % rows', n;
    END IF;
  ELSIF NOT (
    resume_description = new_resume_description
    AND resume_og_description = new_resume_description
  ) THEN
    RAISE EXCEPTION 'SEO reconcile refused: resume description drifted';
  END IF;

  SELECT md5(string_agg(
    page_key || '|' || title || '|' || description || '|' ||
    coalesce(og_title, '') || '|' || coalesce(og_description, '') || '|' ||
    indexable::text,
    E'\n' ORDER BY page_key
  )) INTO other_seo_after
  FROM public.page_seo
  WHERE page_key <> 'resume';

  IF other_seo_before IS DISTINCT FROM other_seo_after THEN
    RAISE EXCEPTION 'SEO reconcile refused: non-resume page SEO changed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.page_seo
    WHERE page_key = 'resume'
      AND status = 'published'
      AND title = resume_title_expected
      AND og_title = resume_title_expected
      AND description = new_resume_description
      AND og_description = new_resume_description
  ) THEN
    RAISE EXCEPTION 'SEO reconcile refused: resume description was not reconciled';
  END IF;
END
$seo_reconcile$;
