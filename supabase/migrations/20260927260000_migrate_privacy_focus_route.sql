-- Step 7: move the Privacy focus slug to the canonical hiring-lane route.
-- Content, sort order, résumé tracks, and page SEO copy stay in place.
-- The legacy public path is redirected in application config, not by a second record.

DO $privacy_focus_route$
DECLARE
  n integer;
  profile_headline text;
  home_headline text;
  about_headline text;
  privacy_nav text;
  privacy_headline text;
  privacy_sort integer;
  grc_sort integer;
  privacy_resume_sort integer;
  grc_resume_sort integer;
  form_enabled boolean;
BEGIN
  SELECT headline INTO profile_headline
  FROM public.site_profile
  WHERE singleton_key = 'default' AND status = 'published';
  IF profile_headline IS DISTINCT FROM
    $t$Global Privacy, Compliance & Information Security Risk Professional$t$
  THEN
    RAISE EXCEPTION 'Privacy route refused: site profile headline drifted';
  END IF;

  SELECT headline INTO home_headline
  FROM public.home_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF home_headline IS DISTINCT FROM
    $t$Global Privacy, Compliance & Information Security Risk Professional$t$
  THEN
    RAISE EXCEPTION 'Privacy route refused: home headline drifted';
  END IF;

  SELECT headline INTO about_headline
  FROM public.about_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF about_headline IS DISTINCT FROM
    $t$Privacy, compliance and information-security risk across operations, regulation and technology.$t$
  THEN
    RAISE EXCEPTION 'Privacy route refused: about headline drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.about_page_paragraphs
    WHERE id = 'b6d0a9f6-2893-4cde-80d1-8f98233246df'
      AND body LIKE $t$Early technical, administrative and operational work%$t$
  ) THEN
    RAISE EXCEPTION 'Privacy route refused: about origin paragraph drifted';
  END IF;

  SELECT count(*) INTO n
  FROM public.experiences
  WHERE id = 'c52e0001-0000-4000-8000-000000000001'
    AND title = $t$Legal Consultant$t$
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Privacy route refused: Scionetrade title drifted';
  END IF;

  SELECT count(*) INTO n
  FROM public.experiences
  WHERE id = '76cab340-da39-4975-b061-5c65bb0c78ad'
    AND title = $t$Communications Chair, Data & Technology Student Leadership Council$t$
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Privacy route refused: Northwestern title drifted';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.focus_pages
    WHERE slug = 'privacy-compliance-assurance'
  ) THEN
    RAISE EXCEPTION 'Privacy route refused: destination slug already exists';
  END IF;

  SELECT nav_label, headline, sort_order
  INTO privacy_nav, privacy_headline, privacy_sort
  FROM public.focus_pages
  WHERE id = '27236662-e48e-4b6f-a820-75cd321a7322'
    AND slug = 'privacy-ai-governance'
    AND status = 'published';
  IF privacy_nav IS DISTINCT FROM $t$Privacy, Compliance & Assurance$t$
    OR privacy_headline IS DISTINCT FROM $t$Privacy, Compliance & Assurance$t$
    OR privacy_sort IS DISTINCT FROM 10
  THEN
    RAISE EXCEPTION 'Privacy route refused: privacy focus record drifted';
  END IF;

  SELECT sort_order INTO grc_sort
  FROM public.focus_pages
  WHERE id = '40170d44-acc6-4f1c-b6fd-a6fbee19c02a'
    AND slug = 'cybersecurity-grc'
    AND status = 'published';
  IF grc_sort IS DISTINCT FROM 20 THEN
    RAISE EXCEPTION 'Privacy route refused: GRC focus order drifted';
  END IF;

  SELECT sort_order INTO privacy_resume_sort
  FROM public.resume_tracks
  WHERE id = 'c52a0001-0000-4000-8000-000000000012'
    AND slug = 'privacy-ai-governance'
    AND title = $t$Privacy, Compliance & Assurance$t$
    AND status = 'published';
  SELECT sort_order INTO grc_resume_sort
  FROM public.resume_tracks
  WHERE id = 'c52a0001-0000-4000-8000-000000000011'
    AND slug = 'cybersecurity-grc'
    AND title = $t$GRC, IT Risk & Security Compliance$t$
    AND status = 'published';
  IF privacy_resume_sort IS DISTINCT FROM 10 OR grc_resume_sort IS DISTINCT FROM 20 THEN
    RAISE EXCEPTION 'Privacy route refused: resume order drifted';
  END IF;

  SELECT contact_form_enabled INTO form_enabled
  FROM public.site_settings
  WHERE singleton_key = 'default';
  IF form_enabled IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Privacy route refused: structured inquiry flag drifted';
  END IF;

  UPDATE public.focus_pages
  SET slug = 'privacy-compliance-assurance'
  WHERE id = '27236662-e48e-4b6f-a820-75cd321a7322'
    AND slug = 'privacy-ai-governance'
    AND nav_label = $t$Privacy, Compliance & Assurance$t$
    AND headline = $t$Privacy, Compliance & Assurance$t$
    AND sort_order = 10
    AND status = 'published';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Privacy route refused: slug update matched % rows', n;
  END IF;

  SELECT count(*) INTO n FROM public.focus_pages WHERE slug = 'privacy-ai-governance';
  IF n <> 0 THEN
    RAISE EXCEPTION 'Privacy route refused: legacy focus slug remains';
  END IF;

  SELECT count(*) INTO n
  FROM public.focus_pages
  WHERE slug = 'privacy-compliance-assurance'
    AND headline = $t$Privacy, Compliance & Assurance$t$
    AND sort_order = 10
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Privacy route refused: canonical focus record missing';
  END IF;
END
$privacy_focus_route$;
