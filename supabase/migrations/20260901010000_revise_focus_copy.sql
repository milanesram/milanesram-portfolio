-- Step 51C: revise public Focus headline, summary, competencies,
-- and the Cyber nav label. UUID-bound UPDATEs only.
--
-- No INSERT, DELETE, UPSERT, schema, RLS, Storage, or other tables.

DO $revise_focus$
DECLARE
  cyber_updated integer;
  privacy_updated integer;
  published_count integer;
BEGIN
  UPDATE public.focus_pages
  SET
    nav_label = $t$Cybersecurity / GRC$t$,
    headline = $t$Cybersecurity, GRC, and IT risk$t$,
    summary = $t$This track is for analyst, specialist, and consultant roles in cybersecurity, GRC, and IT risk. It emphasizes security governance, controls, audit readiness, and risk remediation, supported by security education and applied governance work.$t$,
    competencies = ARRAY[
      'GRC',
      'IT risk assessment',
      'Security controls',
      'Audit and compliance readiness',
      'Security governance',
      'Risk remediation'
    ]
  WHERE
    id = '40170d44-acc6-4f1c-b6fd-a6fbee19c02a'
    AND slug = 'cybersecurity-grc'
    AND status = 'published'
    AND nav_label = $t$Cybersecurity / GRC / IT Risk$t$
    AND headline = $t$Cybersecurity, GRC, and IT risk$t$
    AND summary = $t$Security governance, control implementation, audit readiness, and technology-risk translation — the same background, read for cybersecurity and GRC roles.$t$;

  GET DIAGNOSTICS cyber_updated = ROW_COUNT;

  IF cyber_updated <> 1 THEN
    RAISE EXCEPTION
      'Step 51C refused: cybersecurity-grc update matched % rows',
      cyber_updated;
  END IF;

  UPDATE public.focus_pages
  SET
    nav_label = $t$Privacy / AI Governance$t$,
    headline = $t$Privacy and AI governance$t$,
    summary = $t$This track is for privacy analyst, specialist, and consultant roles, including adjacent AI-governance work. It emphasizes privacy operations, privacy-risk assessment, and data protection, with current applied evidence through human-reviewed Shadow AI review.$t$,
    competencies = ARRAY[
      'Privacy operations',
      'Privacy-risk assessment',
      'Privacy by design',
      'Data protection and compliance',
      'Incident and remediation process',
      'AI governance',
      'Human-reviewed responsible-AI controls'
    ]
  WHERE
    id = '27236662-e48e-4b6f-a820-75cd321a7322'
    AND slug = 'privacy-ai-governance'
    AND status = 'published'
    AND nav_label = $t$Privacy / AI Governance$t$
    AND headline = $t$Privacy and AI governance$t$
    AND summary = $t$Privacy operations, privacy by design, incident process, and responsible-AI review — the same background, read for privacy and AI-governance roles.$t$;

  GET DIAGNOSTICS privacy_updated = ROW_COUNT;

  IF privacy_updated <> 1 THEN
    RAISE EXCEPTION
      'Step 51C refused: privacy-ai-governance update matched % rows',
      privacy_updated;
  END IF;

  SELECT count(*) INTO published_count
  FROM public.focus_pages
  WHERE status = 'published';

  IF published_count <> 2 THEN
    RAISE EXCEPTION
      'Step 51C assertion failed: published focus_pages count is %',
      published_count;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.focus_pages
    WHERE
      id = '40170d44-acc6-4f1c-b6fd-a6fbee19c02a'
      AND slug = 'cybersecurity-grc'
      AND status = 'published'
      AND nav_label = $t$Cybersecurity / GRC$t$
      AND headline = $t$Cybersecurity, GRC, and IT risk$t$
      AND summary = $t$This track is for analyst, specialist, and consultant roles in cybersecurity, GRC, and IT risk. It emphasizes security governance, controls, audit readiness, and risk remediation, supported by security education and applied governance work.$t$
      AND competencies = ARRAY[
        'GRC',
        'IT risk assessment',
        'Security controls',
        'Audit and compliance readiness',
        'Security governance',
        'Risk remediation'
      ]
  ) THEN
    RAISE EXCEPTION 'Step 51C assertion failed: cybersecurity-grc copy mismatch';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.focus_pages
    WHERE
      id = '27236662-e48e-4b6f-a820-75cd321a7322'
      AND slug = 'privacy-ai-governance'
      AND status = 'published'
      AND nav_label = $t$Privacy / AI Governance$t$
      AND headline = $t$Privacy and AI governance$t$
      AND summary = $t$This track is for privacy analyst, specialist, and consultant roles, including adjacent AI-governance work. It emphasizes privacy operations, privacy-risk assessment, and data protection, with current applied evidence through human-reviewed Shadow AI review.$t$
      AND competencies = ARRAY[
        'Privacy operations',
        'Privacy-risk assessment',
        'Privacy by design',
        'Data protection and compliance',
        'Incident and remediation process',
        'AI governance',
        'Human-reviewed responsible-AI controls'
      ]
  ) THEN
    RAISE EXCEPTION 'Step 51C assertion failed: privacy-ai-governance copy mismatch';
  END IF;
END
$revise_focus$;
