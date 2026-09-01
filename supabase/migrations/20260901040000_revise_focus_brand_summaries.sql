-- Step 51E: remove target-title identity language from hosted
-- focus_pages summaries so they match the static professional-domain
-- copy. UUID-bound UPDATE only. Competencies, slugs, evidence, and
-- other tables are unchanged.
--
-- No INSERT, DELETE, schema, RLS, or Storage changes.

DO $revise_focus_brand$
DECLARE
  cyber_updated integer;
  privacy_updated integer;
  published_count integer;
BEGIN
  UPDATE public.focus_pages
  SET
    summary = $t$Cybersecurity governance, GRC, and IT-risk work emphasizing security governance, controls, audit readiness, and risk remediation, supported by security education and applied governance work.$t$
  WHERE
    id = '40170d44-acc6-4f1c-b6fd-a6fbee19c02a'
    AND slug = 'cybersecurity-grc'
    AND status = 'published'
    AND summary = $t$This track is for analyst, specialist, and consultant roles in cybersecurity, GRC, and IT risk. It emphasizes security governance, controls, audit readiness, and risk remediation, supported by security education and applied governance work.$t$;

  GET DIAGNOSTICS cyber_updated = ROW_COUNT;

  IF cyber_updated <> 1 THEN
    RAISE EXCEPTION
      'Step 51E refused: cybersecurity-grc summary update matched % rows',
      cyber_updated;
  END IF;

  UPDATE public.focus_pages
  SET
    summary = $t$Privacy operations, data protection, and AI-governance work emphasizing privacy-risk assessment, privacy by design, and incident process, with current applied evidence through human-reviewed Shadow AI review.$t$
  WHERE
    id = '27236662-e48e-4b6f-a820-75cd321a7322'
    AND slug = 'privacy-ai-governance'
    AND status = 'published'
    AND summary = $t$This track is for privacy analyst, specialist, and consultant roles, including adjacent AI-governance work. It emphasizes privacy operations, privacy-risk assessment, and data protection, with current applied evidence through human-reviewed Shadow AI review.$t$;

  GET DIAGNOSTICS privacy_updated = ROW_COUNT;

  IF privacy_updated <> 1 THEN
    RAISE EXCEPTION
      'Step 51E refused: privacy-ai-governance summary update matched % rows',
      privacy_updated;
  END IF;

  SELECT count(*) INTO published_count
  FROM public.focus_pages
  WHERE status = 'published';

  IF published_count <> 2 THEN
    RAISE EXCEPTION
      'Step 51E assertion failed: published focus_pages count is %',
      published_count;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.focus_pages
    WHERE
      id = '40170d44-acc6-4f1c-b6fd-a6fbee19c02a'
      AND slug = 'cybersecurity-grc'
      AND status = 'published'
      AND headline = $t$Cybersecurity, GRC, and IT risk$t$
      AND summary = $t$Cybersecurity governance, GRC, and IT-risk work emphasizing security governance, controls, audit readiness, and risk remediation, supported by security education and applied governance work.$t$
  ) THEN
    RAISE EXCEPTION 'Step 51E assertion failed: cybersecurity-grc summary mismatch';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.focus_pages
    WHERE
      id = '27236662-e48e-4b6f-a820-75cd321a7322'
      AND slug = 'privacy-ai-governance'
      AND status = 'published'
      AND headline = $t$Privacy and AI governance$t$
      AND summary = $t$Privacy operations, data protection, and AI-governance work emphasizing privacy-risk assessment, privacy by design, and incident process, with current applied evidence through human-reviewed Shadow AI review.$t$
  ) THEN
    RAISE EXCEPTION 'Step 51E assertion failed: privacy-ai-governance summary mismatch';
  END IF;
END
$revise_focus_brand$;
