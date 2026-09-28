-- Step 6: correct the About career narrative.
-- The page no longer says the career began in legal and compliance work.
-- Journey captions that overstate the 2025 dialogue and the GSMA role are
-- narrowed to the approved record. Other About sections stay in place.

DO $about_career_narrative$
DECLARE
  n integer;
  profile_headline text;
  home_headline text;
  about_headline text;
  privacy_focus_sort integer;
  grc_focus_sort integer;
  privacy_resume_sort integer;
  grc_resume_sort integer;
  form_enabled boolean;
  old_origin text := $t$My career began in legal and compliance work, expanded into privacy operations and data protection, and then moved into regulatory assurance at the National Privacy Commission, where I worked across compliance monitoring, breach-notification workflows, privacy and security assessments, regulatory systems, remediation and technology modernization.$t$;
  new_origin text := $t$Early technical, administrative and operational work exposed me to systems, records, infrastructure and service delivery before corporate law, compliance and operational leadership. In 2017, as designated Data Protection Officer, that work expanded into a privacy manual, policy, management program and staff orientation.$t$;
  old_technical text := $t$As that work became more technology-intensive, I deliberately deepened my cybersecurity and systems capability through Northwestern University's MS in Information Systems, Security Specialization, professional certifications and applied technical work. That technical development strengthens an established privacy, compliance and risk foundation.$t$;
  new_regulator text := $t$At the National Privacy Commission I served as Information Technology Officer III, designated Chief, Compliance and Monitoring Division. The role combined compliance monitoring, breach handling, privacy and security assessments, regulatory systems and implementation, and included international engagement: presenting Philippine developments and regulatory systems at Global Privacy Assembly meetings and representing the Philippines in APEC Cross-Border Privacy Rules discussions.$t$;
  old_privai text := $t$PrivAI Guard, developed as a Northwestern MSIS capstone MVP, reflects current hands-on work in privacy, governance, controls, and technical implementation.$t$;
  new_current text := $t$I later deepened the technical side through Northwestern University's MS in Information Systems, Security Specialization, and PrivAI Guard, a capstone MVP with production-oriented re-engineering. As Principal Consultant of RAM Privacy and Security, an independent privacy, cybersecurity and risk practice, I turn obligations and risk into controls, remediation and auditable evidence.$t$;
  old_gpa_caption text := $t$Speaking on global privacy from the lectern Manila, 2025$t$;
  new_gpa_caption text := $t$Participated in the delegation hosting the National Privacy Commission-hosted Global Privacy Assembly Dialogue in the Philippines, 2025.$t$;
  old_gsma_caption text := $t$Speaking at the GSMA Ministerial Programme in Spain, 2023.$t$;
  new_gsma_caption text := $t$Represented the Philippines as a panelist at the GSMA Ministerial Programme in Spain, 2023.$t$;
BEGIN
  SELECT headline INTO profile_headline
  FROM public.site_profile
  WHERE singleton_key = 'default' AND status = 'published';
  IF profile_headline IS DISTINCT FROM
    $t$Global Privacy, Compliance & Information Security Risk Professional$t$
  THEN
    RAISE EXCEPTION 'About narrative refused: site profile headline drifted';
  END IF;

  SELECT headline INTO home_headline
  FROM public.home_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF home_headline IS DISTINCT FROM
    $t$Global Privacy, Compliance & Information Security Risk Professional$t$
  THEN
    RAISE EXCEPTION 'About narrative refused: home headline drifted';
  END IF;

  SELECT headline INTO about_headline
  FROM public.about_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF about_headline IS DISTINCT FROM
    $t$Privacy, compliance and information-security risk across operations, regulation and technology.$t$
  THEN
    RAISE EXCEPTION 'About narrative refused: about headline drifted';
  END IF;

  SELECT count(*) INTO n
  FROM public.experiences
  WHERE id = 'c52e0001-0000-4000-8000-000000000001'
    AND title = $t$Legal Consultant$t$
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'About narrative refused: Scionetrade title drifted';
  END IF;

  SELECT count(*) INTO n
  FROM public.experiences
  WHERE id = '76cab340-da39-4975-b061-5c65bb0c78ad'
    AND title = $t$Communications Chair, Data & Technology Student Leadership Council$t$
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'About narrative refused: Northwestern title drifted';
  END IF;

  SELECT sort_order INTO privacy_focus_sort
  FROM public.focus_pages
  WHERE id = '27236662-e48e-4b6f-a820-75cd321a7322'
    AND slug = 'privacy-ai-governance'
    AND status = 'published';
  SELECT sort_order INTO grc_focus_sort
  FROM public.focus_pages
  WHERE id = '40170d44-acc6-4f1c-b6fd-a6fbee19c02a'
    AND slug = 'cybersecurity-grc'
    AND status = 'published';
  IF privacy_focus_sort IS DISTINCT FROM 10 OR grc_focus_sort IS DISTINCT FROM 20 THEN
    RAISE EXCEPTION 'About narrative refused: home lane order drifted';
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
    RAISE EXCEPTION 'About narrative refused: resume order drifted';
  END IF;

  SELECT contact_form_enabled INTO form_enabled
  FROM public.site_settings
  WHERE singleton_key = 'default';
  IF form_enabled IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'About narrative refused: structured inquiry flag drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.about_page_paragraphs
    WHERE id = 'b6d0a9f6-2893-4cde-80d1-8f98233246df'
      AND sort_order = 10
      AND body = old_origin
  ) OR NOT EXISTS (
    SELECT 1 FROM public.about_page_paragraphs
    WHERE id = 'ea292368-6ed3-4a53-9014-c65c66288314'
      AND sort_order = 20
      AND body = old_technical
  ) OR NOT EXISTS (
    SELECT 1 FROM public.about_page_paragraphs
    WHERE id = '147f3d60-ceea-4178-8b45-e56ea9ecdfc8'
      AND sort_order = 30
      AND body = old_privai
  ) THEN
    RAISE EXCEPTION 'About narrative refused: current narrative paragraphs drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.journey_milestones
    WHERE id = 'c52c0001-0000-4000-8000-000000000043'
      AND status = 'published'
      AND caption = old_gpa_caption
  ) OR NOT EXISTS (
    SELECT 1 FROM public.journey_milestones
    WHERE id = 'c52c0001-0000-4000-8000-000000000045'
      AND status = 'published'
      AND caption = old_gsma_caption
  ) OR NOT EXISTS (
    SELECT 1 FROM public.journey_milestones
    WHERE id = 'c52c0001-0000-4000-8000-000000000044'
      AND status = 'published'
      AND caption = $t$At the APEC digital-economy meeting in Peru, 2024.$t$
  ) OR NOT EXISTS (
    SELECT 1 FROM public.journey_milestones
    WHERE id = 'c52c0001-0000-4000-8000-000000000042'
      AND status = 'published'
      AND caption = $t$Speaking with PH national media at Decode 2024.$t$
  ) OR NOT EXISTS (
    SELECT 1 FROM public.journey_milestones
    WHERE id = '6e40c635-6a81-4e33-9657-85d4226479f3'
      AND status = 'published'
      AND caption = $t$Northwestern University 26' - Master of Science in Information Systems, Security Specialization$t$
  ) THEN
    RAISE EXCEPTION 'About narrative refused: journey captions drifted';
  END IF;

  UPDATE public.about_page_paragraphs
  SET body = new_origin
  WHERE id = 'b6d0a9f6-2893-4cde-80d1-8f98233246df'
    AND body = old_origin;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'About narrative refused: origin paragraph matched % rows', n;
  END IF;

  UPDATE public.about_page_paragraphs
  SET body = new_regulator
  WHERE id = 'ea292368-6ed3-4a53-9014-c65c66288314'
    AND body = old_technical;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'About narrative refused: regulator paragraph matched % rows', n;
  END IF;

  UPDATE public.about_page_paragraphs
  SET body = new_current
  WHERE id = '147f3d60-ceea-4178-8b45-e56ea9ecdfc8'
    AND body = old_privai;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'About narrative refused: current paragraph matched % rows', n;
  END IF;

  UPDATE public.journey_milestones
  SET caption = new_gpa_caption
  WHERE id = 'c52c0001-0000-4000-8000-000000000043'
    AND caption = old_gpa_caption;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'About narrative refused: 2025 caption matched % rows', n;
  END IF;

  UPDATE public.journey_milestones
  SET caption = new_gsma_caption
  WHERE id = 'c52c0001-0000-4000-8000-000000000045'
    AND caption = old_gsma_caption;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'About narrative refused: GSMA caption matched % rows', n;
  END IF;
END
$about_career_narrative$;
