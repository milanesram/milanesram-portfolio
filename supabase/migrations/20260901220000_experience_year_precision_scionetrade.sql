-- Step 52E: year-only date precision + hosted Scionetrade.
-- Existing seven Experience parents keep their month-level dates.
-- Scionetrade stores 2018–2020 without fabricated month/day values.
-- Home and Focus Experience UUID relationships are not rewritten.

CREATE TYPE public.experience_date_precision AS ENUM ('month', 'year');

ALTER TABLE public.experiences
  ALTER COLUMN start_date DROP NOT NULL,
  ADD COLUMN date_precision public.experience_date_precision NOT NULL DEFAULT 'month',
  ADD COLUMN start_year integer,
  ADD COLUMN end_year integer;

ALTER TABLE public.experiences
  DROP CONSTRAINT experiences_date_range;

ALTER TABLE public.experiences
  ADD CONSTRAINT experiences_date_range CHECK (
    end_date IS NULL OR start_date IS NULL OR end_date >= start_date
  ),
  ADD CONSTRAINT experiences_year_range CHECK (
    end_year IS NULL OR start_year IS NULL OR end_year >= start_year
  ),
  ADD CONSTRAINT experiences_date_precision_shape CHECK (
    (
      date_precision = 'month'
      AND start_date IS NOT NULL
      AND start_year IS NULL
      AND end_year IS NULL
    )
    OR
    (
      date_precision = 'year'
      AND start_year IS NOT NULL
      AND start_year BETWEEN 1900 AND 2100
      AND start_date IS NULL
      AND end_date IS NULL
      AND (
        end_year IS NULL
        OR (end_year BETWEEN 1900 AND 2100 AND end_year >= start_year)
      )
      AND (NOT is_current OR end_year IS NULL)
    )
  );

DO $$
DECLARE
  ram_id constant uuid := '982e5fae-ec27-49c5-9d7f-b88873bc33ec';
  npc_cito_id constant uuid := '99437e38-bd03-40be-af9c-f3a22b4a0261';
  npc_cmd_id constant uuid := '6c629f63-627b-42db-afdf-78b4ead5901a';
  bankmer_dpo_id constant uuid := '65d6925a-0203-4947-b5e8-3f96a37e2705';
  bankmer_counsel_id constant uuid := '58496f76-95f7-42a5-b620-44f7f020bf66';
  bankmer_compliance_id constant uuid := '6808bdfe-782c-4d20-b717-ee49827c3a4e';
  dtslc_id constant uuid := '76cab340-da39-4975-b061-5c65bb0c78ad';
  scionetrade_id constant uuid := 'c52e0001-0000-4000-8000-000000000001';
  scionetrade_item_id constant uuid := 'c52e0001-0000-4000-8000-000000000011';
  cyber_focus_id constant uuid := '40170d44-acc6-4f1c-b6fd-a6fbee19c02a';
  privacy_focus_id constant uuid := '27236662-e48e-4b6f-a820-75cd321a7322';
  n integer;
BEGIN
  IF (
    SELECT count(*) FROM public.experiences
    WHERE id IN (
      ram_id, npc_cito_id, npc_cmd_id, bankmer_dpo_id,
      bankmer_counsel_id, bankmer_compliance_id, dtslc_id
    )
      AND status = 'published'
      AND date_precision = 'month'
      AND start_date IS NOT NULL
      AND start_year IS NULL
      AND end_year IS NULL
  ) <> 7 THEN
    RAISE EXCEPTION 'Step 52E refused: existing Experience parents missing or dates drifted';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.experiences WHERE organization = 'Scionetrade Corporation'
  ) THEN
    RAISE EXCEPTION 'Step 52E refused: Scionetrade already exists';
  END IF;

  IF (
    SELECT count(*) FROM public.experience_items
  ) <> 26 THEN
    RAISE EXCEPTION 'Step 52E refused: unexpected pre-migration experience_items count';
  END IF;

  IF (
    SELECT count(*) FROM public.home_experience_items
  ) <> 6 THEN
    RAISE EXCEPTION 'Step 52E refused: Home Experience relationships drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.focus_experience_items
    WHERE focus_page_id = cyber_focus_id
  ) <> 10 THEN
    RAISE EXCEPTION 'Step 52E refused: Cyber Focus Experience relationships drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.focus_experience_items
    WHERE focus_page_id = privacy_focus_id
  ) <> 10 THEN
    RAISE EXCEPTION 'Step 52E refused: Privacy Focus Experience relationships drifted';
  END IF;

  INSERT INTO public.experiences (
    id,
    organization,
    title,
    title_secondary,
    location_display,
    kind,
    start_date,
    end_date,
    date_precision,
    start_year,
    end_year,
    is_current,
    is_featured,
    summary,
    status,
    sort_order
  ) VALUES (
    scionetrade_id,
    'Scionetrade Corporation',
    'Legal Consultant — Cybersecurity & Data Privacy Advisory',
    NULL,
    'Philippines',
    'additional',
    NULL,
    NULL,
    'year',
    2018,
    2020,
    false,
    false,
    NULL,
    'published',
    70
  );

  INSERT INTO public.experience_items (
    id,
    experience_id,
    body,
    track,
    is_metric,
    metric_context,
    show_on_home,
    status,
    sort_order
  ) VALUES (
    scionetrade_item_id,
    scionetrade_id,
    'Advised a security and technology solutions provider on cybersecurity, data privacy, and vendor-facing technology engagements.',
    'all',
    false,
    NULL,
    false,
    'published',
    10
  );

  SELECT count(*) INTO n FROM public.experiences WHERE status = 'published';
  IF n <> 8 THEN
    RAISE EXCEPTION 'Step 52E refused: expected 8 published Experience parents, found %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.experiences
  WHERE id = scionetrade_id
    AND organization = 'Scionetrade Corporation'
    AND title = 'Legal Consultant — Cybersecurity & Data Privacy Advisory'
    AND date_precision = 'year'
    AND start_year = 2018
    AND end_year = 2020
    AND start_date IS NULL
    AND end_date IS NULL
    AND kind = 'additional'
    AND status = 'published'
    AND sort_order = 70;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Step 52E refused: Scionetrade parent did not persist as year-only 2018–2020';
  END IF;

  SELECT count(*) INTO n
  FROM public.experience_items
  WHERE id = scionetrade_item_id
    AND experience_id = scionetrade_id
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Step 52E refused: Scionetrade item missing';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.experiences
    WHERE id = scionetrade_id
      AND (start_date IS NOT NULL OR end_date IS NOT NULL)
  ) THEN
    RAISE EXCEPTION 'Step 52E refused: Scionetrade stored a fabricated month/day';
  END IF;

  SELECT count(*) INTO n FROM public.experience_items ei
  WHERE NOT EXISTS (
    SELECT 1 FROM public.experiences e WHERE e.id = ei.experience_id
  );
  IF n <> 0 THEN
    RAISE EXCEPTION 'Step 52E refused: dangling experience items';
  END IF;

  SELECT count(*) INTO n
  FROM public.home_experience_items hei
  WHERE NOT EXISTS (
    SELECT 1 FROM public.experience_items ei WHERE ei.id = hei.experience_item_id
  );
  IF n <> 0 THEN
    RAISE EXCEPTION 'Step 52E refused: dangling Home Experience relationships';
  END IF;

  SELECT count(*) INTO n
  FROM public.focus_experience_items fei
  WHERE NOT EXISTS (
    SELECT 1 FROM public.experience_items ei WHERE ei.id = fei.experience_item_id
  );
  IF n <> 0 THEN
    RAISE EXCEPTION 'Step 52E refused: dangling Focus Experience relationships';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.home_experience_items
    WHERE experience_item_id = scionetrade_item_id
  ) OR EXISTS (
    SELECT 1 FROM public.focus_experience_items
    WHERE experience_item_id = scionetrade_item_id
  ) THEN
    RAISE EXCEPTION 'Step 52E refused: Scionetrade was featured on Home or Focus';
  END IF;

  IF (
    SELECT count(*) FROM public.experiences
    WHERE id IN (
      ram_id, npc_cito_id, npc_cmd_id, bankmer_dpo_id,
      bankmer_counsel_id, bankmer_compliance_id, dtslc_id
    )
  ) <> 7 THEN
    RAISE EXCEPTION 'Step 52E refused: existing Experience UUIDs changed';
  END IF;

  IF (
    SELECT count(*) FROM public.home_experience_items
  ) <> 6 THEN
    RAISE EXCEPTION 'Step 52E refused: Home relationship count changed';
  END IF;

  IF (
    SELECT count(*) FROM public.focus_experience_items
    WHERE focus_page_id = cyber_focus_id
  ) <> 10
  OR (
    SELECT count(*) FROM public.focus_experience_items
    WHERE focus_page_id = privacy_focus_id
  ) <> 10 THEN
    RAISE EXCEPTION 'Step 52E refused: Focus relationship counts changed';
  END IF;
END
$$;
