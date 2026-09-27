-- Step 2: correct four factual defects in hosted experience records.
-- Scionetrade title, Northwestern SLC title, CSMCC consulting scope,
-- and the September 2024 registration count.
-- Forward-only. Idempotent when the current or approved value is already stored.
-- Does not rewrite historical migrations or unrelated content.

DO $factual_integrity$
DECLARE
  n integer;
  current_text text;
  current_context text;
  other_titles_before text;
  other_titles_after text;
  other_items_before text;
  other_items_after text;
  profile_headline_before text;
  profile_headline_after text;
  home_headline_before text;
  home_headline_after text;
  scione_secondary text;
  scione_start date;
  scione_end date;
  nw_org text;
  nw_start date;
  nw_current boolean;
  old_scione_title text := $t$Legal Officer$t$;
  new_scione_title text := $t$Legal Consultant$t$;
  scione_secondary_expected text := $t$Additional designation: Data Protection Officer · Contract / Project – Part-Time$t$;
  old_nw_title text := $t$Communications Head, Data & Technology Student Leadership Council$t$;
  new_nw_title text := $t$Communications Chair, Data & Technology Student Leadership Council$t$;
  old_csmcc_all text := $t$Directed pre- and post-production security implementation for the Compliance and Security Monitoring Command Center, supporting centralized monitoring and remediation workflows.$t$;
  new_csmcc_all text := $t$Introduced pre- and post-production security implementation for the Compliance and Security Monitoring Command Center, reviewed execution, and provided guidance on privacy and security alignment.$t$;
  old_csmcc_privacy text := $t$Directed pre- and post-production security implementation for the Compliance and Security Monitoring Command Center, including Privacy by Design and by Default requirements.$t$;
  new_csmcc_privacy text := $t$Introduced pre- and post-production security implementation for the Compliance and Security Monitoring Command Center, reviewed execution, and provided guidance on alignment with Privacy by Design and by Default.$t$;
  old_registration text := $t$Supported more than 10,000 DPS and DPO registered entities by 30 September 2024 after the registration system launched in 2023.$t$;
  new_registration text := $t$Supported more than 10,000 Data Processing System (DPS) and Data Protection Officer (DPO) registrations by 30 September 2024 after the registration system launched in 2023.$t$;
  old_registration_context text := $t$More than 10,000 data-processing systems and DPO registered entities were on the national registration system by 30 September 2024.$t$;
  new_registration_context text := $t$More than 10,000 Data Processing System (DPS) and Data Protection Officer (DPO) registrations were on record by 30 September 2024.$t$;
  scione_id uuid := 'c52e0001-0000-4000-8000-000000000001';
  nw_id uuid := '76cab340-da39-4975-b061-5c65bb0c78ad';
  csmcc_all_id uuid := 'df887d59-0bb6-4e5d-84d2-f24662243585';
  csmcc_privacy_id uuid := '08df7c73-86b7-40ab-b4eb-3c97912491ab';
  registration_id uuid := '2d23ab52-c558-4264-be11-8ac750a02a70';
BEGIN
  SELECT count(*) INTO n
  FROM public.experiences
  WHERE id = scione_id
    AND organization = $t$Scionetrade Corporation$t$
    AND status = 'published'
    AND title_secondary = scione_secondary_expected
    AND start_date = DATE '2018-07-01'
    AND end_date = DATE '2020-06-01';
  IF n <> 1 THEN
    RAISE EXCEPTION
      'Factual integrity refused: Scionetrade record did not match the expected role';
  END IF;

  SELECT count(*) INTO n
  FROM public.experiences
  WHERE id = nw_id
    AND organization = $t$Northwestern University$t$
    AND status = 'published'
    AND kind = 'leadership'
    AND start_date = DATE '2026-01-01'
    AND is_current IS TRUE;
  IF n <> 1 THEN
    RAISE EXCEPTION
      'Factual integrity refused: Northwestern leadership record did not match';
  END IF;

  SELECT headline INTO profile_headline_before
  FROM public.site_profile
  WHERE singleton_key = 'default' AND status = 'published';

  SELECT headline INTO home_headline_before
  FROM public.home_page
  WHERE singleton_key = 'default' AND status = 'published';

  SELECT md5(string_agg(
    id::text || '|' || organization || '|' || title || '|' || coalesce(title_secondary, ''),
    E'\n' ORDER BY sort_order, id
  )) INTO other_titles_before
  FROM public.experiences
  WHERE id NOT IN (scione_id, nw_id);

  SELECT md5(string_agg(
    id::text || '|' || body || '|' || coalesce(metric_context, ''),
    E'\n' ORDER BY sort_order, id
  )) INTO other_items_before
  FROM public.experience_items
  WHERE id NOT IN (csmcc_all_id, csmcc_privacy_id, registration_id);

  SELECT title INTO current_text
  FROM public.experiences
  WHERE id = scione_id;

  IF current_text = old_scione_title THEN
    UPDATE public.experiences
    SET title = new_scione_title
    WHERE id = scione_id
      AND organization = $t$Scionetrade Corporation$t$
      AND title = old_scione_title
      AND title_secondary = scione_secondary_expected;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN
      RAISE EXCEPTION
        'Factual integrity refused: Scionetrade title update matched % rows', n;
    END IF;
  ELSIF current_text IS DISTINCT FROM new_scione_title THEN
    RAISE EXCEPTION 'Factual integrity refused: Scionetrade title drifted';
  END IF;

  SELECT title INTO current_text
  FROM public.experiences
  WHERE id = nw_id;

  IF current_text = old_nw_title THEN
    UPDATE public.experiences
    SET title = new_nw_title
    WHERE id = nw_id
      AND organization = $t$Northwestern University$t$
      AND title = old_nw_title;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN
      RAISE EXCEPTION
        'Factual integrity refused: Northwestern title update matched % rows', n;
    END IF;
  ELSIF current_text IS DISTINCT FROM new_nw_title THEN
    RAISE EXCEPTION 'Factual integrity refused: Northwestern title drifted';
  END IF;

  SELECT body INTO current_text
  FROM public.experience_items
  WHERE id = csmcc_all_id
    AND experience_id = '99437e38-bd03-40be-af9c-f3a22b4a0261'
    AND track = 'all'
    AND status = 'published';

  IF current_text = old_csmcc_all THEN
    UPDATE public.experience_items
    SET body = new_csmcc_all
    WHERE id = csmcc_all_id AND body = old_csmcc_all;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN
      RAISE EXCEPTION
        'Factual integrity refused: CSMCC scope update matched % rows', n;
    END IF;
  ELSIF current_text IS DISTINCT FROM new_csmcc_all THEN
    RAISE EXCEPTION 'Factual integrity refused: CSMCC scope wording drifted';
  END IF;

  SELECT body INTO current_text
  FROM public.experience_items
  WHERE id = csmcc_privacy_id
    AND experience_id = '99437e38-bd03-40be-af9c-f3a22b4a0261'
    AND track = 'privacy_ai'
    AND status = 'published';

  IF current_text = old_csmcc_privacy THEN
    UPDATE public.experience_items
    SET body = new_csmcc_privacy
    WHERE id = csmcc_privacy_id AND body = old_csmcc_privacy;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN
      RAISE EXCEPTION
        'Factual integrity refused: CSMCC privacy-track update matched % rows', n;
    END IF;
  ELSIF current_text IS DISTINCT FROM new_csmcc_privacy THEN
    RAISE EXCEPTION 'Factual integrity refused: CSMCC privacy-track wording drifted';
  END IF;

  SELECT body, metric_context INTO current_text, current_context
  FROM public.experience_items
  WHERE id = registration_id
    AND experience_id = '6c629f63-627b-42db-afdf-78b4ead5901a'
    AND track = 'all'
    AND status = 'published'
    AND is_metric IS TRUE;

  IF current_text = old_registration AND current_context = old_registration_context THEN
    UPDATE public.experience_items
    SET
      body = new_registration,
      metric_context = new_registration_context
    WHERE id = registration_id
      AND body = old_registration
      AND metric_context = old_registration_context;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN
      RAISE EXCEPTION
        'Factual integrity refused: registration metric update matched % rows', n;
    END IF;
  ELSIF NOT (
    current_text = new_registration AND current_context = new_registration_context
  ) THEN
    RAISE EXCEPTION 'Factual integrity refused: registration metric wording drifted';
  END IF;

  SELECT title_secondary, start_date, end_date
  INTO scione_secondary, scione_start, scione_end
  FROM public.experiences
  WHERE id = scione_id;
  IF scione_secondary IS DISTINCT FROM scione_secondary_expected
    OR scione_start IS DISTINCT FROM DATE '2018-07-01'
    OR scione_end IS DISTINCT FROM DATE '2020-06-01'
  THEN
    RAISE EXCEPTION
      'Factual integrity refused: Scionetrade designation or dates changed';
  END IF;

  SELECT organization, start_date, is_current
  INTO nw_org, nw_start, nw_current
  FROM public.experiences
  WHERE id = nw_id;
  IF nw_org IS DISTINCT FROM $t$Northwestern University$t$
    OR nw_start IS DISTINCT FROM DATE '2026-01-01'
    OR nw_current IS DISTINCT FROM TRUE
  THEN
    RAISE EXCEPTION
      'Factual integrity refused: Northwestern organization, dates, or status changed';
  END IF;

  SELECT md5(string_agg(
    id::text || '|' || organization || '|' || title || '|' || coalesce(title_secondary, ''),
    E'\n' ORDER BY sort_order, id
  )) INTO other_titles_after
  FROM public.experiences
  WHERE id NOT IN (scione_id, nw_id);
  IF other_titles_before IS DISTINCT FROM other_titles_after THEN
    RAISE EXCEPTION 'Factual integrity refused: another experience title changed';
  END IF;

  SELECT md5(string_agg(
    id::text || '|' || body || '|' || coalesce(metric_context, ''),
    E'\n' ORDER BY sort_order, id
  )) INTO other_items_after
  FROM public.experience_items
  WHERE id NOT IN (csmcc_all_id, csmcc_privacy_id, registration_id);
  IF other_items_before IS DISTINCT FROM other_items_after THEN
    RAISE EXCEPTION 'Factual integrity refused: another experience item changed';
  END IF;

  SELECT headline INTO profile_headline_after
  FROM public.site_profile
  WHERE singleton_key = 'default' AND status = 'published';
  IF profile_headline_before IS DISTINCT FROM profile_headline_after
    OR profile_headline_after IS DISTINCT FROM
      $t$Global Privacy, Compliance & Information Security Risk Professional$t$
  THEN
    RAISE EXCEPTION 'Factual integrity refused: site profile identity changed';
  END IF;

  SELECT headline INTO home_headline_after
  FROM public.home_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF home_headline_before IS DISTINCT FROM home_headline_after
    OR home_headline_after IS DISTINCT FROM
      $t$Global Privacy, Compliance & Information Security Risk Professional$t$
  THEN
    RAISE EXCEPTION 'Factual integrity refused: home identity changed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.experiences
    WHERE status = 'published' AND title = old_scione_title
  ) OR EXISTS (
    SELECT 1 FROM public.experiences
    WHERE status = 'published' AND title = old_nw_title
  ) OR EXISTS (
    SELECT 1 FROM public.experience_items
    WHERE status = 'published'
      AND (
        body LIKE 'Directed pre- and post-production security implementation%'
        OR body LIKE '%registered entities%'
        OR coalesce(metric_context, '') LIKE '%registered entities%'
      )
  ) THEN
    RAISE EXCEPTION
      'Factual integrity refused: an approved correction was not stored';
  END IF;
END
$factual_integrity$;
