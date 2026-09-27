-- V4-03D: featured_order for exactly three published works.
-- Does not use focus-page featured_publication_id.
-- Does not rewrite titles, abstracts, years, media, or external URLs.
-- Forward-only. Do not apply from the implementation candidate.

ALTER TABLE public.publications
  ADD COLUMN featured_order smallint;

ALTER TABLE public.publications
  ADD CONSTRAINT publications_featured_order_range
  CHECK (featured_order IS NULL OR featured_order IN (1, 2, 3));

ALTER TABLE public.publications
  ADD CONSTRAINT publications_featured_requires_published
  CHECK (featured_order IS NULL OR status = 'published');

CREATE UNIQUE INDEX publications_featured_order_unique
  ON public.publications (featured_order)
  WHERE featured_order IS NOT NULL;

COMMENT ON COLUMN public.publications.featured_order IS
  'Recruiter Featured Writing order. Null for ordinary publications. Only 1, 2, and 3 are featured slots.';

DO $featured_writing$
DECLARE
  n integer;
  content_before text;
  content_after text;
  focus_before text;
  focus_after text;
BEGIN
  SELECT count(*) INTO n
  FROM public.publications
  WHERE featured_order IS NOT NULL;
  IF n <> 0 THEN
    RAISE EXCEPTION
      'Featured writing refused: featured_order was already set on % rows',
      n;
  END IF;

  SELECT count(*) INTO n FROM public.publications;
  IF n <> 11 THEN
    RAISE EXCEPTION
      'Featured writing refused: publication count was %, expected 11',
      n;
  END IF;

  SELECT count(*) INTO n
  FROM public.publications
  WHERE status = 'published'
    AND featured_order IS NULL
    AND (
      (id = 'ad297187-e3c6-4317-a72f-bc661632e226'
        AND slug = 'orb-to-oversight-world-app-privacy'
        AND year_label = '2025'
        AND title = 'From Orb to Oversight: Why the NPC Paused World App')
      OR (id = '93bc6513-f2e8-436c-9639-0eb59288aca7'
        AND slug = 'egov-ph-architectural-fragility-bcdr'
        AND year_label = '2026'
        AND title = 'Architectural Fragility and the Illusion of Cost-Savings: A Critical Analysis of the eGov PH Super App Outage and the Imperative for Enterprise-Grade BC/DR')
      OR (id = '6aff00bd-be4c-43cd-9dcf-bc649e919b7f'
        AND slug = 'privacy-preserving-machine-learning-global-healthcare-ai'
        AND year_label = '2026'
        AND title = 'Privacy-Preserving Machine Learning in Global Healthcare AI: Breaking the Clinical Validation Bottleneck Without Breaking the Law')
    );
  IF n <> 3 THEN
    RAISE EXCEPTION
      'Featured writing refused: approved publications did not match title, year, slug, and published status (matched %)',
      n;
  END IF;

  SELECT md5(string_agg(
    id::text || '|' || slug || '|' || title || '|' || year_label || '|' || abstract
      || '|' || coalesce(media_id::text, '')
      || '|' || coalesce(external_url, '')
      || '|' || sort_order::text
      || '|' || status::text,
    E'\n' ORDER BY id
  )) INTO content_before
  FROM public.publications;

  SELECT md5(string_agg(
    id::text || '|' || coalesce(featured_publication_id::text, ''),
    E'\n' ORDER BY id
  )) INTO focus_before
  FROM public.focus_pages;

  UPDATE public.publications
  SET featured_order = 1
  WHERE id = 'ad297187-e3c6-4317-a72f-bc661632e226'
    AND slug = 'orb-to-oversight-world-app-privacy'
    AND status = 'published'
    AND featured_order IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Featured writing refused: World App / NPC order was not set';
  END IF;

  UPDATE public.publications
  SET featured_order = 2
  WHERE id = '93bc6513-f2e8-436c-9639-0eb59288aca7'
    AND slug = 'egov-ph-architectural-fragility-bcdr'
    AND status = 'published'
    AND featured_order IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Featured writing refused: eGov PH BC/DR order was not set';
  END IF;

  UPDATE public.publications
  SET featured_order = 3
  WHERE id = '6aff00bd-be4c-43cd-9dcf-bc649e919b7f'
    AND slug = 'privacy-preserving-machine-learning-global-healthcare-ai'
    AND status = 'published'
    AND featured_order IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Featured writing refused: healthcare AI order was not set';
  END IF;

  SELECT count(*) INTO n
  FROM public.publications
  WHERE featured_order IS NOT NULL;
  IF n <> 3 THEN
    RAISE EXCEPTION
      'Featured writing refused: % publications are featured, expected 3',
      n;
  END IF;

  SELECT count(*) INTO n
  FROM public.publications
  WHERE status <> 'published' AND featured_order IS NOT NULL;
  IF n <> 0 THEN
    RAISE EXCEPTION
      'Featured writing refused: an unpublished publication is featured';
  END IF;

  SELECT count(DISTINCT featured_order) INTO n
  FROM public.publications
  WHERE featured_order IS NOT NULL;
  IF n <> 3 THEN
    RAISE EXCEPTION 'Featured writing refused: featured orders are not unique';
  END IF;

  SELECT md5(string_agg(
    id::text || '|' || slug || '|' || title || '|' || year_label || '|' || abstract
      || '|' || coalesce(media_id::text, '')
      || '|' || coalesce(external_url, '')
      || '|' || sort_order::text
      || '|' || status::text,
    E'\n' ORDER BY id
  )) INTO content_after
  FROM public.publications;

  IF content_before IS DISTINCT FROM content_after THEN
    RAISE EXCEPTION
      'Featured writing refused: a publication field other than featured_order changed';
  END IF;

  SELECT md5(string_agg(
    id::text || '|' || coalesce(featured_publication_id::text, ''),
    E'\n' ORDER BY id
  )) INTO focus_after
  FROM public.focus_pages;

  IF focus_before IS DISTINCT FROM focus_after THEN
    RAISE EXCEPTION
      'Featured writing refused: a focus-page featured publication changed';
  END IF;
END
$featured_writing$;
