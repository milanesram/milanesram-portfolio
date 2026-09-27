-- Step 3: surface approved global privacy evidence on Home, Experience,
-- and the Privacy focus page.
-- Forward-only. Idempotent when the approved values are already stored.
-- Does not rewrite historical migrations or unrelated pages.

DO $global_privacy_evidence$
DECLARE
  n integer;
  current_text text;
  titles_before text;
  titles_after text;
  items_before text;
  items_after text;
  profile_headline text;
  home_headline text;
  home_title text;
  about_headline text;
  grc_summary text;
  privacy_sort integer;
  grc_sort integer;
  privacy_id uuid := '27236662-e48e-4b6f-a820-75cd321a7322';
  grc_id uuid := '40170d44-acc6-4f1c-b6fd-a6fbee19c02a';
  proof_id uuid := 'e5c19a96-564e-4c1b-9fb4-be1c014484b3';
  ito_id uuid := '6c629f63-627b-42db-afdf-78b4ead5901a';
  consultant_id uuid := '99437e38-bd03-40be-af9c-f3a22b4a0261';
  gpa_id uuid := '7c3a1b20-9e14-4a11-9c31-0b6e4f1a1001';
  award_id uuid := '7c3a1b20-9e14-4a11-9c31-0b6e4f1a1002';
  apec_id uuid := '7c3a1b20-9e14-4a11-9c31-0b6e4f1a1003';
  gsma_id uuid := '7c3a1b20-9e14-4a11-9c31-0b6e4f1a1004';
  dialogue_id uuid := '7c3a1b20-9e14-4a11-9c31-0b6e4f1a1005';
  gpa_link_id uuid := '7c3a1b20-9e14-4a11-9c31-0b6e4f1a1101';
  award_link_id uuid := '7c3a1b20-9e14-4a11-9c31-0b6e4f1a1102';
  apec_link_id uuid := '7c3a1b20-9e14-4a11-9c31-0b6e4f1a1103';
  old_proof text := $t$National Privacy Commission of the Philippines$t$;
  new_proof text := $t$Presented Philippine breach and compliance developments and regulatory systems at Global Privacy Assembly meetings and represented the Philippines in APEC Cross-Border Privacy Rules discussions.$t$;
  old_summary text := $t$Hands-on privacy operations, privacy compliance and assurance work spanning data protection, privacy-risk assessment, breach and incident governance, Privacy by Design and by Default, remediation, data governance and cross-functional implementation.$t$;
  new_summary text := $t$Regulator-side privacy experience spanning breach governance, compliance monitoring, regulatory technology, Data Protection Officer program work, and cross-border engagement, including Global Privacy Assembly presentations and APEC Cross-Border Privacy Rules discussions.$t$;
  old_card text := $t$For privacy operations, privacy compliance and assurance, privacy risk, breach and incident governance, and remediation.$t$;
  new_card text := $t$For privacy operations, privacy compliance and assurance, breach governance, regulatory systems, and cross-border privacy engagement.$t$;
  gpa_body text := $t$Presented Philippine data-breach and compliance developments and the Data Breach Notification Management System (DBNMS) and National Privacy Commission Registration System (NPCRS) at Global Privacy Assembly (GPA) meetings from 2021 through 2024.$t$;
  award_body text := $t$Prepared the 2023 DBNMS Innovation and 2024 NPCRS Accountability award entries. DBNMS was a 2023 GPA Global Privacy and Data Protection Awards Innovation finalist.$t$;
  apec_body text := $t$Represented the Philippines in Asia-Pacific Economic Cooperation (APEC) Cross-Border Privacy Rules (CBPR) discussions and reported jurisdictional updates at a 2024 APEC digital-economy meeting in Peru.$t$;
  gsma_body text := $t$Represented the Philippines at the 2023 GSMA Ministerial Programme and served as a panelist in a discussion on the metaverse.$t$;
  dialogue_body text := $t$Participated in the delegation hosting the National Privacy Commission-hosted Global Privacy Assembly Dialogue in the Philippines in 2025.$t$;
  old_competencies text[] := ARRAY[
    'Privacy Operations',
    'Privacy Compliance',
    'Privacy Assurance',
    'Privacy Risk Assessment',
    'Data Protection',
    'Privacy Governance',
    'Breach & Incident Governance',
    'Privacy by Design and by Default',
    'Remediation'
  ];
  new_competencies text[] := old_competencies || ARRAY['Cross-Border Privacy'];
  old_chips text[] := ARRAY[
    'Privacy Operations',
    'Privacy Compliance',
    'Privacy Assurance',
    'Remediation'
  ];
  new_chips text[] := old_chips || ARRAY['Cross-Border Privacy'];
  grc_summary_expected text := $t$Hands-on governance, risk, controls and assurance work spanning GRC, IT and technology risk, security compliance, risk and control assessment, audit readiness, remediation and stakeholder coordination.$t$;
BEGIN
  SELECT headline INTO profile_headline
  FROM public.site_profile
  WHERE singleton_key = 'default' AND status = 'published';
  IF profile_headline IS DISTINCT FROM
    $t$Global Privacy, Compliance & Information Security Risk Professional$t$
  THEN
    RAISE EXCEPTION 'Global privacy evidence refused: site profile headline drifted';
  END IF;

  SELECT headline INTO home_headline
  FROM public.home_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF home_headline IS DISTINCT FROM
    $t$Global Privacy, Compliance & Information Security Risk Professional$t$
  THEN
    RAISE EXCEPTION 'Global privacy evidence refused: home headline drifted';
  END IF;

  SELECT title INTO home_title
  FROM public.page_seo
  WHERE page_key = 'home' AND status = 'published';
  IF home_title IS DISTINCT FROM
    $t$Rainier (Ram) Milanes | Global Privacy, Compliance & Information Security Risk$t$
  THEN
    RAISE EXCEPTION 'Global privacy evidence refused: home SEO title drifted';
  END IF;

  SELECT headline INTO about_headline
  FROM public.about_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF about_headline IS DISTINCT FROM
    $t$Privacy, compliance and information-security risk across operations, regulation and technology.$t$
  THEN
    RAISE EXCEPTION 'Global privacy evidence refused: about headline drifted';
  END IF;

  SELECT count(*) INTO n
  FROM public.experiences
  WHERE id = 'c52e0001-0000-4000-8000-000000000001'
    AND organization = $t$Scionetrade Corporation$t$
    AND title = $t$Legal Consultant$t$
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Global privacy evidence refused: Scionetrade title is not Legal Consultant';
  END IF;

  SELECT count(*) INTO n
  FROM public.experiences
  WHERE id = '76cab340-da39-4975-b061-5c65bb0c78ad'
    AND title = $t$Communications Chair, Data & Technology Student Leadership Council$t$
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Global privacy evidence refused: Northwestern title is not Communications Chair';
  END IF;

  SELECT count(*) INTO n
  FROM public.experience_items
  WHERE id = 'df887d59-0bb6-4e5d-84d2-f24662243585'
    AND body = $t$Introduced pre- and post-production security implementation for the Compliance and Security Monitoring Command Center, reviewed execution, and provided guidance on privacy and security alignment.$t$
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Global privacy evidence refused: CSMCC wording drifted';
  END IF;

  SELECT count(*) INTO n
  FROM public.experience_items
  WHERE id = '2d23ab52-c558-4264-be11-8ac750a02a70'
    AND body = $t$Supported more than 10,000 Data Processing System (DPS) and Data Protection Officer (DPO) registrations by 30 September 2024 after the registration system launched in 2023.$t$
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Global privacy evidence refused: registration metric drifted';
  END IF;

  SELECT summary INTO grc_summary
  FROM public.focus_pages
  WHERE id = grc_id
    AND slug = 'cybersecurity-grc'
    AND headline = $t$GRC, IT Risk & Security Compliance$t$
    AND status = 'published';
  IF grc_summary IS DISTINCT FROM grc_summary_expected THEN
    RAISE EXCEPTION 'Global privacy evidence refused: GRC focus summary drifted';
  END IF;

  SELECT sort_order INTO privacy_sort
  FROM public.focus_pages
  WHERE id = privacy_id
    AND slug = 'privacy-ai-governance'
    AND headline = $t$Privacy, Compliance & Assurance$t$
    AND status = 'published';
  SELECT sort_order INTO grc_sort
  FROM public.focus_pages
  WHERE id = grc_id AND slug = 'cybersecurity-grc' AND status = 'published';

  IF privacy_sort = 20 AND grc_sort = 10 THEN
    UPDATE public.focus_pages
    SET sort_order = 10
    WHERE id = privacy_id AND sort_order = 20;
    UPDATE public.focus_pages
    SET sort_order = 20
    WHERE id = grc_id AND sort_order = 10;
  ELSIF privacy_sort IS DISTINCT FROM 10 OR grc_sort IS DISTINCT FROM 20 THEN
    RAISE EXCEPTION
      'Global privacy evidence refused: focus lane order drifted (privacy %, grc %)',
      privacy_sort, grc_sort;
  END IF;

  SELECT supporting INTO current_text
  FROM public.home_proof_items
  WHERE id = proof_id AND label = $t$Former Privacy Regulator$t$ AND sort_order = 10;
  IF current_text = old_proof THEN
    UPDATE public.home_proof_items
    SET supporting = new_proof
    WHERE id = proof_id AND supporting = old_proof AND label = $t$Former Privacy Regulator$t$;
  ELSIF current_text IS DISTINCT FROM new_proof THEN
    RAISE EXCEPTION 'Global privacy evidence refused: home proof drifted';
  END IF;

  SELECT summary INTO current_text
  FROM public.focus_pages
  WHERE id = privacy_id;
  IF current_text = old_summary THEN
    UPDATE public.focus_pages
    SET
      summary = new_summary,
      card_summary = new_card,
      competencies = new_competencies,
      card_chips = new_chips
    WHERE id = privacy_id
      AND summary = old_summary
      AND card_summary = old_card
      AND competencies = old_competencies
      AND card_chips = old_chips
      AND headline = $t$Privacy, Compliance & Assurance$t$;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN
      RAISE EXCEPTION 'Global privacy evidence refused: privacy focus update matched % rows', n;
    END IF;
  ELSIF current_text IS DISTINCT FROM new_summary THEN
    RAISE EXCEPTION 'Global privacy evidence refused: privacy focus summary drifted';
  END IF;

  SELECT md5(string_agg(id::text || '|' || title, ',' ORDER BY id))
  INTO titles_before
  FROM public.experiences;

  SELECT md5(string_agg(id::text || '|' || body, ',' ORDER BY id))
  INTO items_before
  FROM public.experience_items
  WHERE id NOT IN (gpa_id, award_id, apec_id, gsma_id, dialogue_id);

  IF NOT EXISTS (SELECT 1 FROM public.experience_items WHERE id = gpa_id) THEN
    INSERT INTO public.experience_items (
      id, experience_id, body, track, is_metric, status, sort_order
    ) VALUES
      (gpa_id, ito_id, gpa_body, 'all', false, 'published', 70),
      (award_id, ito_id, award_body, 'all', false, 'published', 80),
      (apec_id, ito_id, apec_body, 'all', false, 'published', 90),
      (gsma_id, ito_id, gsma_body, 'all', false, 'published', 100),
      (dialogue_id, consultant_id, dialogue_body, 'all', false, 'published', 90);
  ELSE
    IF (SELECT body FROM public.experience_items WHERE id = gpa_id) IS DISTINCT FROM gpa_body
      OR (SELECT body FROM public.experience_items WHERE id = award_id) IS DISTINCT FROM award_body
      OR (SELECT body FROM public.experience_items WHERE id = apec_id) IS DISTINCT FROM apec_body
      OR (SELECT body FROM public.experience_items WHERE id = gsma_id) IS DISTINCT FROM gsma_body
      OR (SELECT body FROM public.experience_items WHERE id = dialogue_id) IS DISTINCT FROM dialogue_body
    THEN
      RAISE EXCEPTION 'Global privacy evidence refused: international bullets drifted';
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.focus_experience_items WHERE id = gpa_link_id
  ) THEN
    INSERT INTO public.focus_experience_items (
      id, focus_page_id, experience_item_id, sort_order
    ) VALUES
      (gpa_link_id, privacy_id, gpa_id, 110),
      (award_link_id, privacy_id, award_id, 120),
      (apec_link_id, privacy_id, apec_id, 130);
  ELSIF EXISTS (
    SELECT 1
    FROM public.focus_experience_items
    WHERE id IN (gpa_link_id, award_link_id, apec_link_id)
      AND focus_page_id IS DISTINCT FROM privacy_id
  ) THEN
    RAISE EXCEPTION 'Global privacy evidence refused: privacy evidence links drifted';
  END IF;

  SELECT md5(string_agg(id::text || '|' || title, ',' ORDER BY id))
  INTO titles_after
  FROM public.experiences;
  IF titles_before IS DISTINCT FROM titles_after THEN
    RAISE EXCEPTION 'Global privacy evidence refused: experience titles changed';
  END IF;

  SELECT md5(string_agg(id::text || '|' || body, ',' ORDER BY id))
  INTO items_after
  FROM public.experience_items
  WHERE id NOT IN (gpa_id, award_id, apec_id, gsma_id, dialogue_id);
  IF items_before IS DISTINCT FROM items_after THEN
    RAISE EXCEPTION 'Global privacy evidence refused: existing experience bullets changed';
  END IF;

  SELECT summary INTO grc_summary FROM public.focus_pages WHERE id = grc_id;
  IF grc_summary IS DISTINCT FROM grc_summary_expected THEN
    RAISE EXCEPTION 'Global privacy evidence refused: GRC summary changed';
  END IF;

  SELECT sort_order INTO privacy_sort FROM public.focus_pages WHERE id = privacy_id;
  SELECT sort_order INTO grc_sort FROM public.focus_pages WHERE id = grc_id;
  IF privacy_sort <> 10 OR grc_sort <> 20 THEN
    RAISE EXCEPTION 'Global privacy evidence refused: lane order did not settle';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.experience_items
    WHERE id IN (gpa_id, award_id, apec_id, gsma_id, dialogue_id)
      AND (
        body ILIKE '%implemented APEC CBPR%'
        OR body ILIKE '%led APEC%'
        OR body ILIKE '%GPA leader%'
        OR body ILIKE '%global privacy authority%'
        OR body ILIKE '%CCPA%'
        OR body ILIKE '%CPRA%'
        OR body ILIKE '%HIPAA%'
        OR body ILIKE '%GLBA%'
      )
  ) THEN
    RAISE EXCEPTION 'Global privacy evidence refused: prohibited claim stored';
  END IF;

  SELECT count(*) INTO n
  FROM public.experience_items
  WHERE id IN (gpa_id, award_id, apec_id, gsma_id, dialogue_id)
    AND status = 'published'
    AND track = 'all';
  IF n <> 5 THEN
    RAISE EXCEPTION 'Global privacy evidence refused: expected 5 international bullets, found %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.focus_experience_items
  WHERE focus_page_id = grc_id
    AND experience_item_id IN (gpa_id, award_id, apec_id, gsma_id, dialogue_id);
  IF n <> 0 THEN
    RAISE EXCEPTION 'Global privacy evidence refused: international bullets linked to GRC';
  END IF;
END
$global_privacy_evidence$;
