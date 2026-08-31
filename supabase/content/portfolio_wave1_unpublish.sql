-- =============================================================================
-- EXPLICIT OPT-IN
-- PUBLICATION RECOVERY
-- STATUS REVERSION ONLY
-- DOES NOT DELETE CONTENT
-- GOOGLE AI MUST ALREADY REMAIN DRAFT
-- REVIEW BEFORE EXECUTION
-- WAVE 1
-- =============================================================================
--
-- Companion to supabase/content/portfolio_wave1_publish.sql
-- Planning document: docs/PUBLICATION_CUTOVER_MANIFEST.md
--
-- Returns the EXACT approved 55-record publication set from published -> draft.
-- This is NOT supabase/content/portfolio_wave1_draft_rollback.sql.
-- That rollback DELETES Wave-1 content and must not be used for publication
-- recovery.
--
-- Target set (status only):
--   site_profile 1
--   projects 3
--   project_sections 7
--   experiences 7
--   experience_items 26
--   credentials 9
--   focus_pages 2
--   TOTAL 55
--
-- EXCLUDED from every UPDATE:
--   Google AI Professional Certificate
--   Scionetrade
--   site_settings
--   media_assets, publications, engagements
--   inquiries, inquiry_submission_events, user_roles
--   Auth, RLS, schema, Storage
--
-- Do not add this file to supabase/migrations or any automatic seed path.
-- Do not execute unless recovering an authorized Wave-1 publication.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Preconditions: fail closed. Do not reconcile unexpected state.
-- ---------------------------------------------------------------------------
DO $wave1_unpublish$
DECLARE
  n integer;
  parent_ids uuid[];
  section_parent uuid;
BEGIN
  SELECT count(*) INTO n FROM public.site_profile
  WHERE singleton_key = 'default';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Unpublish refused: site_profile default count is % (expected 1)', n;
  END IF;

  SELECT count(*) INTO n FROM public.projects
  WHERE slug IN ('privai-guard', 'dbnms', 'npcrs');
  IF n <> 3 THEN
    RAISE EXCEPTION 'Unpublish refused: Wave-1 project count is % (expected 3)', n;
  END IF;

  SELECT id INTO section_parent FROM public.projects WHERE slug = 'privai-guard';
  IF section_parent IS NULL THEN
    RAISE EXCEPTION 'Unpublish refused: project slug privai-guard is missing';
  END IF;

  SELECT count(*) INTO n FROM public.project_sections
  WHERE project_id = section_parent
    AND heading IN (
      'Problem',
      'Risk',
      'Guardrail',
      'Implementation',
      'Governance workflow',
      'Business value',
      'MVP boundary'
    );
  IF n <> 7 THEN
    RAISE EXCEPTION 'Unpublish refused: PrivAI Guard section count is % (expected 7)', n;
  END IF;

  SELECT coalesce(array_agg(id), ARRAY[]::uuid[]) INTO parent_ids
  FROM public.experiences
  WHERE (organization, title, start_date) IN (
    ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01'),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01'),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01'),
    ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01'),
    ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01'),
    ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01'),
    ($t$Northwestern University$t$, $t$Communications Head, Data & Technology Student Leadership Council$t$, DATE '2026-01-01')
  );
  IF coalesce(array_length(parent_ids, 1), 0) <> 7 THEN
    RAISE EXCEPTION 'Unpublish refused: Wave-1 experience count is % (expected 7)', coalesce(array_length(parent_ids, 1), 0);
  END IF;

  SELECT count(*) INTO n
  FROM public.experience_items ei
  JOIN public.experiences e ON e.id = ei.experience_id
  WHERE (e.organization, e.title, e.start_date, ei.sort_order) IN (
    ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 10),
    ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 20),
    ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 30),
    ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 40),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 10),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 20),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 30),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 40),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 50),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 60),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 70),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 80),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 10),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 20),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 30),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 40),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 50),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 60),
    ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 10),
    ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 20),
    ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 30),
    ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01', 10),
    ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01', 20),
    ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01', 10),
    ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01', 20),
    ($t$Northwestern University$t$, $t$Communications Head, Data & Technology Student Leadership Council$t$, DATE '2026-01-01', 10)
  );
  IF n <> 26 THEN
    RAISE EXCEPTION 'Unpublish refused: Wave-1 experience_item count is % (expected 26)', n;
  END IF;

  SELECT count(*) INTO n FROM public.credentials
  WHERE (kind, name, issuer) IN (
    ('degree', $t$Master of Science in Information Systems, Security Specialization$t$, $t$Northwestern University$t$),
    ('degree', $t$Juris Doctor$t$, $t$San Sebastian College – Recoletos$t$),
    ('degree', $t$Bachelor of Science in Business Administration$t$, $t$Trinity University of Asia$t$),
    ('certification', $t$Certified Information Privacy Manager (CIPM)$t$, $t$IAPP$t$),
    ('certification', $t$Certified in Cybersecurity (CC)$t$, $t$ISC2$t$),
    ('training', $t$Professional Development Certificate in Cybersecurity$t$, $t$Australian National University, National Security College$t$),
    ('training', $t$Industrial Control Systems Cybersecurity Training$t$, $t$U.S. Department of Homeland Security, CISA$t$),
    ('training', $t$Certified Digital Transformation Professional$t$, $t$Asian Institute of Digital Transformation$t$),
    ('license', $t$Licensed to Practice Law in the Philippines$t$, $t$Supreme Court of the Philippines / Integrated Bar of the Philippines$t$)
  );
  IF n <> 9 THEN
    RAISE EXCEPTION 'Unpublish refused: approved credential count is % (expected 9)', n;
  END IF;

  SELECT count(*) INTO n FROM public.focus_pages
  WHERE slug IN ('cybersecurity-grc', 'privacy-ai-governance');
  IF n <> 2 THEN
    RAISE EXCEPTION 'Unpublish refused: Wave-1 focus_pages count is % (expected 2)', n;
  END IF;

  -- Exact 55 targets are currently published.
  SELECT count(*) INTO n FROM public.site_profile
  WHERE singleton_key = 'default' AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Unpublish refused: site_profile default is not published';
  END IF;

  SELECT count(*) INTO n FROM public.projects
  WHERE slug IN ('privai-guard', 'dbnms', 'npcrs') AND status = 'published';
  IF n <> 3 THEN
    RAISE EXCEPTION 'Unpublish refused: not all 3 Wave-1 projects are published';
  END IF;

  SELECT count(*) INTO n FROM public.project_sections
  WHERE project_id = section_parent
    AND heading IN (
      'Problem', 'Risk', 'Guardrail', 'Implementation',
      'Governance workflow', 'Business value', 'MVP boundary'
    )
    AND status = 'published';
  IF n <> 7 THEN
    RAISE EXCEPTION 'Unpublish refused: not all 7 PrivAI Guard sections are published';
  END IF;

  SELECT count(*) INTO n FROM public.experiences
  WHERE id = ANY (parent_ids) AND status = 'published';
  IF n <> 7 THEN
    RAISE EXCEPTION 'Unpublish refused: not all 7 Wave-1 experiences are published';
  END IF;

  SELECT count(*) INTO n
  FROM public.experience_items ei
  JOIN public.experiences e ON e.id = ei.experience_id
  WHERE (e.organization, e.title, e.start_date, ei.sort_order) IN (
    ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 10),
    ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 20),
    ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 30),
    ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 40),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 10),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 20),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 30),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 40),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 50),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 60),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 70),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 80),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 10),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 20),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 30),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 40),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 50),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 60),
    ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 10),
    ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 20),
    ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 30),
    ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01', 10),
    ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01', 20),
    ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01', 10),
    ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01', 20),
    ($t$Northwestern University$t$, $t$Communications Head, Data & Technology Student Leadership Council$t$, DATE '2026-01-01', 10)
  )
    AND ei.status = 'published';
  IF n <> 26 THEN
    RAISE EXCEPTION 'Unpublish refused: not all 26 Wave-1 experience items are published';
  END IF;

  SELECT count(*) INTO n FROM public.credentials
  WHERE (kind, name, issuer) IN (
    ('degree', $t$Master of Science in Information Systems, Security Specialization$t$, $t$Northwestern University$t$),
    ('degree', $t$Juris Doctor$t$, $t$San Sebastian College – Recoletos$t$),
    ('degree', $t$Bachelor of Science in Business Administration$t$, $t$Trinity University of Asia$t$),
    ('certification', $t$Certified Information Privacy Manager (CIPM)$t$, $t$IAPP$t$),
    ('certification', $t$Certified in Cybersecurity (CC)$t$, $t$ISC2$t$),
    ('training', $t$Professional Development Certificate in Cybersecurity$t$, $t$Australian National University, National Security College$t$),
    ('training', $t$Industrial Control Systems Cybersecurity Training$t$, $t$U.S. Department of Homeland Security, CISA$t$),
    ('training', $t$Certified Digital Transformation Professional$t$, $t$Asian Institute of Digital Transformation$t$),
    ('license', $t$Licensed to Practice Law in the Philippines$t$, $t$Supreme Court of the Philippines / Integrated Bar of the Philippines$t$)
  )
    AND status = 'published';
  IF n <> 9 THEN
    RAISE EXCEPTION 'Unpublish refused: not all 9 approved credentials are published';
  END IF;

  SELECT count(*) INTO n FROM public.focus_pages
  WHERE slug IN ('cybersecurity-grc', 'privacy-ai-governance')
    AND status = 'published';
  IF n <> 2 THEN
    RAISE EXCEPTION 'Unpublish refused: not all 2 Wave-1 focus pages are published';
  END IF;

  SELECT count(*) INTO n FROM public.credentials
  WHERE kind = 'certification'
    AND name = $t$Google AI Professional Certificate$t$
    AND issuer = $t$Google$t$
    AND status = 'draft'
    AND needs_verification = true;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Unpublish refused: Google AI hold is not intact (count %)', n;
  END IF;

  SELECT count(*) INTO n FROM public.site_settings
  WHERE singleton_key = 'default'
    AND contact_form_enabled = false
    AND site_indexable = true;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Unpublish refused: site_settings default is not the expected fail-closed row';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.experiences
    WHERE organization ILIKE '%scione%'
       OR title ILIKE '%Scionetrade%'
  ) THEN
    RAISE EXCEPTION 'Unpublish refused: Scionetrade is unexpectedly hosted';
  END IF;
END
$wave1_unpublish$;

-- ---------------------------------------------------------------------------
-- Status reversions. Logical-key scoped. status is the only column written.
-- ---------------------------------------------------------------------------

UPDATE public.site_profile
SET status = 'draft'
WHERE singleton_key = 'default'
  AND status = 'published';

UPDATE public.projects
SET status = 'draft'
WHERE slug IN ('privai-guard', 'dbnms', 'npcrs')
  AND status = 'published';

UPDATE public.project_sections AS ps
SET status = 'draft'
FROM public.projects AS p
WHERE ps.project_id = p.id
  AND p.slug = 'privai-guard'
  AND ps.heading IN (
    'Problem',
    'Risk',
    'Guardrail',
    'Implementation',
    'Governance workflow',
    'Business value',
    'MVP boundary'
  )
  AND ps.status = 'published';

UPDATE public.experiences
SET status = 'draft'
WHERE (organization, title, start_date) IN (
    ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01'),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01'),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01'),
    ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01'),
    ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01'),
    ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01'),
    ($t$Northwestern University$t$, $t$Communications Head, Data & Technology Student Leadership Council$t$, DATE '2026-01-01')
  )
  AND status = 'published';

UPDATE public.experience_items AS ei
SET status = 'draft'
FROM public.experiences AS e
WHERE ei.experience_id = e.id
  AND (e.organization, e.title, e.start_date, ei.sort_order) IN (
    ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 10),
    ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 20),
    ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 30),
    ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 40),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 10),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 20),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 30),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 40),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 50),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 60),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 70),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 80),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 10),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 20),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 30),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 40),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 50),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 60),
    ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 10),
    ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 20),
    ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 30),
    ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01', 10),
    ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01', 20),
    ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01', 10),
    ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01', 20),
    ($t$Northwestern University$t$, $t$Communications Head, Data & Technology Student Leadership Council$t$, DATE '2026-01-01', 10)
  )
  AND ei.status = 'published';

-- Google AI is intentionally absent from this predicate.
UPDATE public.credentials
SET status = 'draft'
WHERE (kind, name, issuer) IN (
    ('degree', $t$Master of Science in Information Systems, Security Specialization$t$, $t$Northwestern University$t$),
    ('degree', $t$Juris Doctor$t$, $t$San Sebastian College – Recoletos$t$),
    ('degree', $t$Bachelor of Science in Business Administration$t$, $t$Trinity University of Asia$t$),
    ('certification', $t$Certified Information Privacy Manager (CIPM)$t$, $t$IAPP$t$),
    ('certification', $t$Certified in Cybersecurity (CC)$t$, $t$ISC2$t$),
    ('training', $t$Professional Development Certificate in Cybersecurity$t$, $t$Australian National University, National Security College$t$),
    ('training', $t$Industrial Control Systems Cybersecurity Training$t$, $t$U.S. Department of Homeland Security, CISA$t$),
    ('training', $t$Certified Digital Transformation Professional$t$, $t$Asian Institute of Digital Transformation$t$),
    ('license', $t$Licensed to Practice Law in the Philippines$t$, $t$Supreme Court of the Philippines / Integrated Bar of the Philippines$t$)
  )
  AND status = 'published';

UPDATE public.focus_pages
SET status = 'draft'
WHERE slug IN ('cybersecurity-grc', 'privacy-ai-governance')
  AND status = 'published';

-- ---------------------------------------------------------------------------
-- Post-recovery assertions. Abort before COMMIT on any mismatch.
-- ---------------------------------------------------------------------------
DO $wave1_unpublish_assert$
DECLARE
  n integer;
  published_total integer;
BEGIN
  SELECT count(*) INTO n FROM public.site_profile
  WHERE singleton_key = 'default' AND status = 'draft';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Unpublish assertion failed: draft site_profile count is %', n;
  END IF;

  SELECT count(*) INTO n FROM public.projects
  WHERE slug IN ('privai-guard', 'dbnms', 'npcrs') AND status = 'draft';
  IF n <> 3 THEN
    RAISE EXCEPTION 'Unpublish assertion failed: draft project count is %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.project_sections ps
  JOIN public.projects p ON p.id = ps.project_id
  WHERE p.slug = 'privai-guard'
    AND ps.heading IN (
      'Problem', 'Risk', 'Guardrail', 'Implementation',
      'Governance workflow', 'Business value', 'MVP boundary'
    )
    AND ps.status = 'draft';
  IF n <> 7 THEN
    RAISE EXCEPTION 'Unpublish assertion failed: draft PrivAI Guard section count is %', n;
  END IF;

  SELECT count(*) INTO n FROM public.experiences
  WHERE (organization, title, start_date) IN (
      ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01'),
      ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01'),
      ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01'),
      ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01'),
      ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01'),
      ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01'),
      ($t$Northwestern University$t$, $t$Communications Head, Data & Technology Student Leadership Council$t$, DATE '2026-01-01')
    )
    AND status = 'draft';
  IF n <> 7 THEN
    RAISE EXCEPTION 'Unpublish assertion failed: draft experience count is %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.experience_items ei
  JOIN public.experiences e ON e.id = ei.experience_id
  WHERE (e.organization, e.title, e.start_date, ei.sort_order) IN (
      ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 10),
      ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 20),
      ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 30),
      ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 40),
      ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 10),
      ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 20),
      ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 30),
      ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 40),
      ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 50),
      ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 60),
      ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 70),
      ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 80),
      ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 10),
      ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 20),
      ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 30),
      ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 40),
      ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 50),
      ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 60),
      ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 10),
      ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 20),
      ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 30),
      ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01', 10),
      ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01', 20),
      ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01', 10),
      ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01', 20),
      ($t$Northwestern University$t$, $t$Communications Head, Data & Technology Student Leadership Council$t$, DATE '2026-01-01', 10)
    )
    AND ei.status = 'draft';
  IF n <> 26 THEN
    RAISE EXCEPTION 'Unpublish assertion failed: draft experience_item count is %', n;
  END IF;

  SELECT count(*) INTO n FROM public.credentials
  WHERE (kind, name, issuer) IN (
      ('degree', $t$Master of Science in Information Systems, Security Specialization$t$, $t$Northwestern University$t$),
      ('degree', $t$Juris Doctor$t$, $t$San Sebastian College – Recoletos$t$),
      ('degree', $t$Bachelor of Science in Business Administration$t$, $t$Trinity University of Asia$t$),
      ('certification', $t$Certified Information Privacy Manager (CIPM)$t$, $t$IAPP$t$),
      ('certification', $t$Certified in Cybersecurity (CC)$t$, $t$ISC2$t$),
      ('training', $t$Professional Development Certificate in Cybersecurity$t$, $t$Australian National University, National Security College$t$),
      ('training', $t$Industrial Control Systems Cybersecurity Training$t$, $t$U.S. Department of Homeland Security, CISA$t$),
      ('training', $t$Certified Digital Transformation Professional$t$, $t$Asian Institute of Digital Transformation$t$),
      ('license', $t$Licensed to Practice Law in the Philippines$t$, $t$Supreme Court of the Philippines / Integrated Bar of the Philippines$t$)
    )
    AND status = 'draft';
  IF n <> 9 THEN
    RAISE EXCEPTION 'Unpublish assertion failed: draft approved credential count is %', n;
  END IF;

  SELECT count(*) INTO n FROM public.focus_pages
  WHERE slug IN ('cybersecurity-grc', 'privacy-ai-governance')
    AND status = 'draft';
  IF n <> 2 THEN
    RAISE EXCEPTION 'Unpublish assertion failed: draft focus_pages count is %', n;
  END IF;

  SELECT (
    (SELECT count(*) FROM public.site_profile WHERE singleton_key = 'default' AND status = 'published')
    + (SELECT count(*) FROM public.projects WHERE slug IN ('privai-guard', 'dbnms', 'npcrs') AND status = 'published')
    + (
      SELECT count(*)
      FROM public.project_sections ps
      JOIN public.projects p ON p.id = ps.project_id
      WHERE p.slug = 'privai-guard'
        AND ps.heading IN (
          'Problem', 'Risk', 'Guardrail', 'Implementation',
          'Governance workflow', 'Business value', 'MVP boundary'
        )
        AND ps.status = 'published'
    )
    + (
      SELECT count(*) FROM public.experiences
      WHERE (organization, title, start_date) IN (
        ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01'),
        ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01'),
        ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01'),
        ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01'),
        ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01'),
        ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01'),
        ($t$Northwestern University$t$, $t$Communications Head, Data & Technology Student Leadership Council$t$, DATE '2026-01-01')
      ) AND status = 'published'
    )
    + (
      SELECT count(*)
      FROM public.experience_items ei
      JOIN public.experiences e ON e.id = ei.experience_id
      WHERE (e.organization, e.title, e.start_date, ei.sort_order) IN (
        ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 10),
        ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 20),
        ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 30),
        ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 40),
        ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 10),
        ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 20),
        ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 30),
        ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 40),
        ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 50),
        ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 60),
        ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 70),
        ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 80),
        ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 10),
        ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 20),
        ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 30),
        ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 40),
        ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 50),
        ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 60),
        ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 10),
        ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 20),
        ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 30),
        ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01', 10),
        ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01', 20),
        ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01', 10),
        ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01', 20),
        ($t$Northwestern University$t$, $t$Communications Head, Data & Technology Student Leadership Council$t$, DATE '2026-01-01', 10)
      ) AND ei.status = 'published'
    )
    + (
      SELECT count(*) FROM public.credentials
      WHERE (kind, name, issuer) IN (
        ('degree', $t$Master of Science in Information Systems, Security Specialization$t$, $t$Northwestern University$t$),
        ('degree', $t$Juris Doctor$t$, $t$San Sebastian College – Recoletos$t$),
        ('degree', $t$Bachelor of Science in Business Administration$t$, $t$Trinity University of Asia$t$),
        ('certification', $t$Certified Information Privacy Manager (CIPM)$t$, $t$IAPP$t$),
        ('certification', $t$Certified in Cybersecurity (CC)$t$, $t$ISC2$t$),
        ('training', $t$Professional Development Certificate in Cybersecurity$t$, $t$Australian National University, National Security College$t$),
        ('training', $t$Industrial Control Systems Cybersecurity Training$t$, $t$U.S. Department of Homeland Security, CISA$t$),
        ('training', $t$Certified Digital Transformation Professional$t$, $t$Asian Institute of Digital Transformation$t$),
        ('license', $t$Licensed to Practice Law in the Philippines$t$, $t$Supreme Court of the Philippines / Integrated Bar of the Philippines$t$)
      ) AND status = 'published'
    )
    + (
      SELECT count(*) FROM public.focus_pages
      WHERE slug IN ('cybersecurity-grc', 'privacy-ai-governance')
        AND status = 'published'
    )
  ) INTO published_total;
  IF published_total <> 0 THEN
    RAISE EXCEPTION 'Unpublish assertion failed: published approved total is % (expected 0)', published_total;
  END IF;

  SELECT count(*) INTO n FROM public.credentials
  WHERE kind = 'certification'
    AND name = $t$Google AI Professional Certificate$t$
    AND issuer = $t$Google$t$
    AND status = 'draft'
    AND needs_verification = true;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Unpublish assertion failed: Google AI hold was not preserved';
  END IF;

  -- Inventory still present (status reversion is not deletion).
  SELECT count(*) INTO n FROM public.site_profile WHERE singleton_key = 'default';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Unpublish assertion failed: site_profile row was removed';
  END IF;
  SELECT count(*) INTO n FROM public.projects WHERE slug IN ('privai-guard', 'dbnms', 'npcrs');
  IF n <> 3 THEN
    RAISE EXCEPTION 'Unpublish assertion failed: a Wave-1 project was removed';
  END IF;
  SELECT count(*) INTO n FROM public.experiences
  WHERE (organization, title, start_date) IN (
    ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01'),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01'),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01'),
    ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01'),
    ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01'),
    ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01'),
    ($t$Northwestern University$t$, $t$Communications Head, Data & Technology Student Leadership Council$t$, DATE '2026-01-01')
  );
  IF n <> 7 THEN
    RAISE EXCEPTION 'Unpublish assertion failed: a Wave-1 experience was removed';
  END IF;
  SELECT count(*) INTO n FROM public.credentials
  WHERE (kind, name, issuer) IN (
    ('degree', $t$Master of Science in Information Systems, Security Specialization$t$, $t$Northwestern University$t$),
    ('degree', $t$Juris Doctor$t$, $t$San Sebastian College – Recoletos$t$),
    ('degree', $t$Bachelor of Science in Business Administration$t$, $t$Trinity University of Asia$t$),
    ('certification', $t$Certified Information Privacy Manager (CIPM)$t$, $t$IAPP$t$),
    ('certification', $t$Certified in Cybersecurity (CC)$t$, $t$ISC2$t$),
    ('certification', $t$Google AI Professional Certificate$t$, $t$Google$t$),
    ('training', $t$Professional Development Certificate in Cybersecurity$t$, $t$Australian National University, National Security College$t$),
    ('training', $t$Industrial Control Systems Cybersecurity Training$t$, $t$U.S. Department of Homeland Security, CISA$t$),
    ('training', $t$Certified Digital Transformation Professional$t$, $t$Asian Institute of Digital Transformation$t$),
    ('license', $t$Licensed to Practice Law in the Philippines$t$, $t$Supreme Court of the Philippines / Integrated Bar of the Philippines$t$)
  );
  IF n <> 10 THEN
    RAISE EXCEPTION 'Unpublish assertion failed: Wave-1 credential inventory changed (count %)', n;
  END IF;

  SELECT count(*) INTO n FROM public.site_settings
  WHERE singleton_key = 'default'
    AND contact_form_enabled = false
    AND site_indexable = true;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Unpublish assertion failed: site_settings changed';
  END IF;
END
$wave1_unpublish_assert$;

COMMIT;
