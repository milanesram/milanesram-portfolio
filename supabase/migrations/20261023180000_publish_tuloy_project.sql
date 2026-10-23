-- Publish Tuloy on the projects listing.
--
-- No previous Tuloy row. Public listing at authoring time:
--   privai-guard sort 10 featured, dbnms 20, npcrs 30, milanesram-portfolio 40.
-- This migration inserts one record and does not update other projects.
--
-- Restore by deleting this record only:
--   DELETE FROM public.projects
--   WHERE id = '39b4576a-17a0-431e-b8b4-1d56ddcc0b30'
--     AND slug = 'tuloy';
--
-- year_label 2026 is the public repository creation year (22 October 2026).
-- No earlier public start date was established.
-- Technology labels are limited to Next.js, React, TypeScript, and Node.js,
-- verified from the public repository manifest and runtime requirement.
-- External links stay in the application allowlist, not in this row.

DO $publish_tuloy_project$
DECLARE
  tuloy_id constant uuid := '39b4576a-17a0-431e-b8b4-1d56ddcc0b30';
  published_before integer;
  published_after integer;
  n integer;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = tuloy_id OR slug = 'tuloy'
  ) THEN
    RAISE EXCEPTION 'tuloy project refused: record already exists';
  END IF;

  IF (
    SELECT count(*) FROM public.projects
    WHERE status = 'published' AND is_featured IS TRUE
  ) <> 1 THEN
    RAISE EXCEPTION 'tuloy project refused: featured project count drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.projects
    WHERE slug = 'privai-guard'
      AND status = 'published'
      AND is_featured IS TRUE
      AND sort_order = 10
  ) <> 1 THEN
    RAISE EXCEPTION 'tuloy project refused: PrivAI Guard prominence drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.projects
    WHERE slug = 'dbnms' AND status = 'published' AND sort_order = 20
  ) <> 1 THEN
    RAISE EXCEPTION 'tuloy project refused: DBNMS order drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.projects
    WHERE slug = 'npcrs' AND status = 'published' AND sort_order = 30
  ) <> 1 THEN
    RAISE EXCEPTION 'tuloy project refused: NPCRS order drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.projects
    WHERE slug = 'milanesram-portfolio'
      AND status = 'published'
      AND is_featured IS FALSE
      AND sort_order = 40
  ) <> 1 THEN
    RAISE EXCEPTION 'tuloy project refused: portfolio project order drifted';
  END IF;

  SELECT count(*) INTO published_before
  FROM public.projects
  WHERE status = 'published';

  INSERT INTO public.projects (
    id,
    slug,
    name,
    tagline,
    year_label,
    role,
    summary,
    stack,
    limits,
    is_featured,
    status,
    sort_order
  ) VALUES (
    tuloy_id,
    'tuloy',
    'Tuloy',
    'Local Career Workflow Application',
    '2026',
    $t$This is the setup I use to organize my job search. I'm sharing the application in case it's useful to you too.$t$,
    $t$Developed a local application to organize job discovery, opportunity review, and application tracking. Includes explainable filtering, persistent dismissal and restore, and structured handoffs to ChatGPT, while keeping application submissions under human control.$t$,
    ARRAY['Next.js', 'React', 'TypeScript', 'Node.js']::text[],
    $t$Working local application with public source code. Tuloy grew from Career Ops. Personal search settings, results, CV, and application records are excluded from the public source. The About page introduces the project and is not a hosted version of the working application.$t$,
    false,
    'published',
    50
  );
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'tuloy project refused: insert matched % rows', n;
  END IF;

  SELECT count(*) INTO published_after
  FROM public.projects
  WHERE status = 'published';
  IF published_after <> published_before + 1 THEN
    RAISE EXCEPTION 'tuloy project refused: published count drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.projects
    WHERE id = tuloy_id
      AND slug = 'tuloy'
      AND status = 'published'
      AND is_featured IS FALSE
      AND sort_order = 50
  ) <> 1 THEN
    RAISE EXCEPTION 'tuloy project refused: inserted row drifted';
  END IF;
END
$publish_tuloy_project$;
