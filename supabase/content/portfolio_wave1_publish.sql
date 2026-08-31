-- =============================================================================
-- REAL PORTFOLIO CONTENT PUBLICATION
-- EXPLICIT OPT-IN
-- NOT A SCHEMA MIGRATION
-- NOT AUTOMATIC SEED DATA
-- PUBLISHES PUBLICLY QUERYABLE CONTENT
-- REVIEW BEFORE EXECUTION
-- WAVE 1
-- GOOGLE AI EXCLUDED
-- ROUTE CUTOVER IS A SEPARATE OPERATION
-- =============================================================================
--
-- Companion planning document:
--   docs/PUBLICATION_CUTOVER_MANIFEST.md
--
-- This file changes status only on the 55 approved Wave-1 records:
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
--   Google AI Professional Certificate (must remain draft, needs_verification true)
--   Scionetrade (not hosted)
--   site_settings (no publication lifecycle)
--   media_assets, publications, engagements
--   inquiries, inquiry_submission_events, user_roles
--   Auth, RLS, schema, Storage
--
-- Published rows become queryable through the anon/publishable RLS path even
-- if Next.js public routes still read src/content. Do not treat this as cutover.
--
-- Do not add this file to supabase/migrations or any automatic seed path.
-- Do not execute until a later step explicitly authorizes hosted publication.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Preconditions: fail closed. Do not reconcile unexpected state.
-- ---------------------------------------------------------------------------
DO $wave1_publish$
DECLARE
  n integer;
  parent_ids uuid[];
  section_parent uuid;
BEGIN
  -- A/E. Exact Wave-1 logical records exist at the approved counts.
  SELECT count(*) INTO n FROM public.site_profile
  WHERE singleton_key = 'default';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Publication refused: site_profile default count is % (expected 1)', n;
  END IF;

  SELECT count(*) INTO n FROM public.projects
  WHERE slug IN ('privai-guard', 'dbnms', 'npcrs');
  IF n <> 3 THEN
    RAISE EXCEPTION 'Publication refused: Wave-1 project count is % (expected 3)', n;
  END IF;

  SELECT id INTO section_parent FROM public.projects WHERE slug = 'privai-guard';
  IF section_parent IS NULL THEN
    RAISE EXCEPTION 'Publication refused: project slug privai-guard is missing';
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
    RAISE EXCEPTION 'Publication refused: PrivAI Guard section count is % (expected 7)', n;
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
    RAISE EXCEPTION 'Publication refused: Wave-1 experience count is % (expected 7)', coalesce(array_length(parent_ids, 1), 0);
  END IF;

  SELECT count(*) INTO n FROM public.experience_items
  WHERE experience_id = ANY (parent_ids)
    AND (experience_id, sort_order) IN (
      SELECT e.id, i.sort_order
      FROM public.experiences e
      JOIN (
        VALUES
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
      ) AS i(organization, title, start_date, sort_order)
        ON e.organization = i.organization
       AND e.title = i.title
       AND e.start_date = i.start_date
    );
  IF n <> 26 THEN
    RAISE EXCEPTION 'Publication refused: Wave-1 experience_item count is % (expected 26)', n;
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
    RAISE EXCEPTION 'Publication refused: approved credential count is % (expected 9)', n;
  END IF;

  SELECT count(*) INTO n FROM public.focus_pages
  WHERE slug IN ('cybersecurity-grc', 'privacy-ai-governance');
  IF n <> 2 THEN
    RAISE EXCEPTION 'Publication refused: Wave-1 focus_pages count is % (expected 2)', n;
  END IF;

  -- B/D. All 55 publication targets are currently draft. None are published.
  SELECT count(*) INTO n FROM public.site_profile
  WHERE singleton_key = 'default'
    AND status = 'draft';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Publication refused: site_profile default is not draft';
  END IF;

  SELECT count(*) INTO n FROM public.projects
  WHERE slug IN ('privai-guard', 'dbnms', 'npcrs')
    AND status = 'draft';
  IF n <> 3 THEN
    RAISE EXCEPTION 'Publication refused: not all 3 Wave-1 projects are draft';
  END IF;

  SELECT count(*) INTO n FROM public.project_sections
  WHERE project_id = section_parent
    AND heading IN (
      'Problem', 'Risk', 'Guardrail', 'Implementation',
      'Governance workflow', 'Business value', 'MVP boundary'
    )
    AND status = 'draft';
  IF n <> 7 THEN
    RAISE EXCEPTION 'Publication refused: not all 7 PrivAI Guard sections are draft';
  END IF;

  SELECT count(*) INTO n FROM public.experiences
  WHERE id = ANY (parent_ids)
    AND status = 'draft';
  IF n <> 7 THEN
    RAISE EXCEPTION 'Publication refused: not all 7 Wave-1 experiences are draft';
  END IF;

  SELECT count(*) INTO n FROM public.experience_items
  WHERE experience_id = ANY (parent_ids)
    AND status = 'draft';
  IF n <> 26 THEN
    RAISE EXCEPTION 'Publication refused: not all 26 Wave-1 experience items are draft';
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
    RAISE EXCEPTION 'Publication refused: not all 9 approved credentials are draft';
  END IF;

  SELECT count(*) INTO n FROM public.focus_pages
  WHERE slug IN ('cybersecurity-grc', 'privacy-ai-governance')
    AND status = 'draft';
  IF n <> 2 THEN
    RAISE EXCEPTION 'Publication refused: not all 2 Wave-1 focus pages are draft';
  END IF;

  SELECT count(*) INTO n FROM (
    SELECT id FROM public.site_profile WHERE singleton_key = 'default' AND status = 'published'
    UNION ALL
    SELECT id FROM public.projects WHERE slug IN ('privai-guard', 'dbnms', 'npcrs') AND status = 'published'
    UNION ALL
    SELECT id FROM public.project_sections ps
      JOIN public.projects p ON p.id = ps.project_id
     WHERE p.slug = 'privai-guard' AND ps.status = 'published'
    UNION ALL
    SELECT id FROM public.experiences
     WHERE (organization, title, start_date) IN (
       ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01'),
       ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01'),
       ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01'),
       ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01'),
       ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01'),
       ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01'),
       ($t$Northwestern University$t$, $t$Communications Head, Data & Technology Student Leadership Council$t$, DATE '2026-01-01')
     ) AND status = 'published'
    UNION ALL
    SELECT ei.id FROM public.experience_items ei
      JOIN public.experiences e ON e.id = ei.experience_id
     WHERE e.id = ANY (parent_ids) AND ei.status = 'published'
    UNION ALL
    SELECT id FROM public.credentials
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
    UNION ALL
    SELECT id FROM public.focus_pages
     WHERE slug IN ('cybersecurity-grc', 'privacy-ai-governance') AND status = 'published'
  ) already_published;
  IF n <> 0 THEN
    RAISE EXCEPTION 'Publication refused: % approved target(s) are already published', n;
  END IF;

  -- C. Google AI hold (assertion only; never an UPDATE target).
  SELECT count(*) INTO n FROM public.credentials
  WHERE kind = 'certification'
    AND name = $t$Google AI Professional Certificate$t$
    AND issuer = $t$Google$t$
    AND status = 'draft'
    AND needs_verification = true;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Publication refused: Google AI hold is not intact (count %)', n;
  END IF;

  -- F. Scionetrade must not exist.
  IF EXISTS (
    SELECT 1 FROM public.experiences
    WHERE organization ILIKE '%scione%'
       OR title ILIKE '%Scionetrade%'
  ) THEN
    RAISE EXCEPTION 'Publication refused: Scionetrade is unexpectedly hosted';
  END IF;

  -- G. No [UAT-41B] residue in Wave-1 text fields.
  IF EXISTS (
    SELECT 1 FROM public.site_profile
    WHERE headline ILIKE '%[UAT-41B]%' OR summary ILIKE '%[UAT-41B]%'
  ) OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE name ILIKE '%[UAT-41B]%' OR summary ILIKE '%[UAT-41B]%' OR slug ILIKE '%uat-41b%'
  ) OR EXISTS (
    SELECT 1 FROM public.project_sections
    WHERE heading ILIKE '%[UAT-41B]%' OR body ILIKE '%[UAT-41B]%'
  ) OR EXISTS (
    SELECT 1 FROM public.experiences
    WHERE organization ILIKE '%[UAT-41B]%'
       OR title ILIKE '%[UAT-41B]%'
       OR coalesce(summary, '') ILIKE '%[UAT-41B]%'
  ) OR EXISTS (
    SELECT 1 FROM public.experience_items
    WHERE body ILIKE '%[UAT-41B]%'
       OR coalesce(metric_context, '') ILIKE '%[UAT-41B]%'
  ) OR EXISTS (
    SELECT 1 FROM public.credentials
    WHERE name ILIKE '%[UAT-41B]%' OR coalesce(details, '') ILIKE '%[UAT-41B]%'
  ) OR EXISTS (
    SELECT 1 FROM public.focus_pages
    WHERE headline ILIKE '%[UAT-41B]%'
       OR summary ILIKE '%[UAT-41B]%'
       OR array_to_string(competencies, ' ') ILIKE '%[UAT-41B]%'
  ) THEN
    RAISE EXCEPTION 'Publication refused: [UAT-41B] residue is present';
  END IF;

  -- H. Inquiry intake remains off. Settings are not updated by this artifact.
  SELECT count(*) INTO n FROM public.site_settings
  WHERE singleton_key = 'default'
    AND contact_form_enabled = false
    AND site_indexable = true;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Publication refused: site_settings default is not the expected fail-closed row';
  END IF;
END
$wave1_publish$;

-- ---------------------------------------------------------------------------
-- Status updates. Logical-key scoped. status is the only column written.
-- ---------------------------------------------------------------------------

UPDATE public.site_profile
SET status = 'published'
WHERE singleton_key = 'default'
  AND status = 'draft';

UPDATE public.projects
SET status = 'published'
WHERE slug IN ('privai-guard', 'dbnms', 'npcrs')
  AND status = 'draft';

UPDATE public.project_sections AS ps
SET status = 'published'
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
  AND ps.status = 'draft';

UPDATE public.experiences
SET status = 'published'
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

UPDATE public.experience_items AS ei
SET status = 'published'
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
  AND ei.status = 'draft';

-- Google AI is intentionally absent from this predicate.
UPDATE public.credentials
SET status = 'published'
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
  AND status = 'draft'
  AND needs_verification = false;

UPDATE public.focus_pages
SET status = 'published'
WHERE slug IN ('cybersecurity-grc', 'privacy-ai-governance')
  AND status = 'draft';

-- ---------------------------------------------------------------------------
-- Post-publication assertions. Abort before COMMIT on any mismatch.
-- ---------------------------------------------------------------------------
DO $wave1_publish_assert$
DECLARE
  n integer;
  published_total integer;
BEGIN
  SELECT count(*) INTO n FROM public.site_profile
  WHERE singleton_key = 'default' AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Publication assertion failed: published site_profile count is %', n;
  END IF;

  SELECT count(*) INTO n FROM public.projects
  WHERE slug IN ('privai-guard', 'dbnms', 'npcrs') AND status = 'published';
  IF n <> 3 THEN
    RAISE EXCEPTION 'Publication assertion failed: published project count is %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.project_sections ps
  JOIN public.projects p ON p.id = ps.project_id
  WHERE p.slug = 'privai-guard'
    AND ps.heading IN (
      'Problem', 'Risk', 'Guardrail', 'Implementation',
      'Governance workflow', 'Business value', 'MVP boundary'
    )
    AND ps.status = 'published';
  IF n <> 7 THEN
    RAISE EXCEPTION 'Publication assertion failed: published PrivAI Guard section count is %', n;
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
    AND status = 'published';
  IF n <> 7 THEN
    RAISE EXCEPTION 'Publication assertion failed: published experience count is %', n;
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
    RAISE EXCEPTION 'Publication assertion failed: published experience_item count is %', n;
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
    RAISE EXCEPTION 'Publication assertion failed: published approved credential count is %', n;
  END IF;

  SELECT count(*) INTO n FROM public.focus_pages
  WHERE slug IN ('cybersecurity-grc', 'privacy-ai-governance')
    AND status = 'published';
  IF n <> 2 THEN
    RAISE EXCEPTION 'Publication assertion failed: published focus_pages count is %', n;
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
  IF published_total <> 55 THEN
    RAISE EXCEPTION 'Publication assertion failed: published approved total is % (expected 55)', published_total;
  END IF;

  -- No approved target remains draft.
  SELECT (
    (SELECT count(*) FROM public.site_profile WHERE singleton_key = 'default' AND status = 'draft')
    + (SELECT count(*) FROM public.projects WHERE slug IN ('privai-guard', 'dbnms', 'npcrs') AND status = 'draft')
    + (
      SELECT count(*)
      FROM public.project_sections ps
      JOIN public.projects p ON p.id = ps.project_id
      WHERE p.slug = 'privai-guard'
        AND ps.heading IN (
          'Problem', 'Risk', 'Guardrail', 'Implementation',
          'Governance workflow', 'Business value', 'MVP boundary'
        )
        AND ps.status = 'draft'
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
      ) AND status = 'draft'
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
      ) AND ei.status = 'draft'
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
      ) AND status = 'draft'
    )
    + (
      SELECT count(*) FROM public.focus_pages
      WHERE slug IN ('cybersecurity-grc', 'privacy-ai-governance')
        AND status = 'draft'
    )
  ) INTO n;
  IF n <> 0 THEN
    RAISE EXCEPTION 'Publication assertion failed: % approved target(s) remain draft', n;
  END IF;

  SELECT count(*) INTO n FROM public.credentials
  WHERE kind = 'certification'
    AND name = $t$Google AI Professional Certificate$t$
    AND issuer = $t$Google$t$
    AND status = 'draft'
    AND needs_verification = true;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Publication assertion failed: Google AI hold was not preserved';
  END IF;

  SELECT count(*) INTO n FROM public.site_settings
  WHERE singleton_key = 'default'
    AND contact_form_enabled = false
    AND site_indexable = true;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Publication assertion failed: site_settings changed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.experiences
    WHERE organization ILIKE '%scione%'
       OR title ILIKE '%Scionetrade%'
  ) THEN
    RAISE EXCEPTION 'Publication assertion failed: Scionetrade is hosted';
  END IF;
END
$wave1_publish_assert$;

COMMIT;
