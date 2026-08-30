-- =============================================================================
-- REAL PORTFOLIO CONTENT ROLLBACK
-- EXPLICIT OPT-IN
-- NOT A SCHEMA MIGRATION
-- NOT AUTOMATIC
-- REVIEW BEFORE EXECUTION
-- WAVE 1 / DRAFT LOGICAL KEYS ONLY
-- =============================================================================
--
-- Companion to supabase/content/portfolio_wave1_draft.sql
-- Deletes only Wave-1 logical keys created by that artifact.
--
-- FK delete actions (verified in 20260830010000_initial_portfolio_schema.sql):
--   project_sections.project_id → projects.id ON DELETE CASCADE
--   experience_items.experience_id → experiences.id ON DELETE CASCADE
-- Children are still deleted first, scoped by parent logical keys.
--
-- Does not touch: user_roles, inquiries, inquiry_submission_events,
-- media_assets, publications, engagements, Auth, RLS, grants, Storage.
-- Does not DELETE FROM any table without a Wave-1 logical-key predicate.
-- =============================================================================

BEGIN;

DO $wave1$
DECLARE
  n integer;
  parent_ids uuid[];
  section_parent uuid;
BEGIN
  -- Identity checks: fail rather than delete a conflicting record set.
  SELECT count(*) INTO n FROM public.site_profile
  WHERE singleton_key = 'default'
    AND display_name = $t$Rainier (Ram) Milanes$t$
    AND public_email = $t$milanesram@gmail.com$t$;
  IF n NOT IN (0, 1) THEN
    RAISE EXCEPTION 'Wave-1 rollback conflict: unexpected site_profile default set (count %)', n;
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.site_profile
    WHERE singleton_key = 'default'
      AND display_name IS DISTINCT FROM $t$Rainier (Ram) Milanes$t$
  ) THEN
    RAISE EXCEPTION 'Wave-1 rollback refused: site_profile default exists but is not the Wave-1 identity';
  END IF;

  SELECT count(*) INTO n FROM public.site_settings
  WHERE singleton_key = 'default'
    AND contact_form_enabled = false
    AND site_indexable = true;
  IF n NOT IN (0, 1) THEN
    RAISE EXCEPTION 'Wave-1 rollback conflict: unexpected site_settings default set (count %)', n;
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.site_settings
    WHERE singleton_key = 'default'
      AND (
        contact_form_enabled IS DISTINCT FROM false
        OR site_indexable IS DISTINCT FROM true
      )
  ) THEN
    RAISE EXCEPTION 'Wave-1 rollback refused: site_settings default exists but is not the Wave-1 fail-closed row';
  END IF;

  SELECT count(*) INTO n FROM public.projects
  WHERE slug IN ('privai-guard', 'dbnms', 'npcrs');
  IF n NOT IN (0, 3) THEN
    RAISE EXCEPTION 'Wave-1 rollback conflict: partial or unexpected Wave-1 project slug set (count %)', n;
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.projects
    WHERE slug = 'privai-guard' AND name IS DISTINCT FROM $t$PrivAI Guard$t$
  ) OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE slug = 'dbnms' AND name IS DISTINCT FROM $t$Data Breach Notification Management System$t$
  ) OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE slug = 'npcrs' AND name IS DISTINCT FROM $t$National Privacy Commission Registration System$t$
  ) THEN
    RAISE EXCEPTION 'Wave-1 rollback refused: a Wave-1 project slug exists with a non-Wave-1 name';
  END IF;

  SELECT id INTO section_parent FROM public.projects WHERE slug = 'privai-guard';
  IF section_parent IS NOT NULL THEN
    SELECT count(*) INTO n FROM public.project_sections WHERE project_id = section_parent;
    IF n NOT IN (0, 7) THEN
      RAISE EXCEPTION 'Wave-1 rollback refused: privai-guard has an unexpected section count (%)', n;
    END IF;
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
  IF coalesce(array_length(parent_ids, 1), 0) NOT IN (0, 7) THEN
    RAISE EXCEPTION 'Wave-1 rollback conflict: partial or unexpected Wave-1 experience set (count %)', coalesce(array_length(parent_ids, 1), 0);
  END IF;

  IF coalesce(array_length(parent_ids, 1), 0) = 7 THEN
    SELECT count(*) INTO n
    FROM public.experience_items
    WHERE experience_id = ANY (parent_ids);
    IF n NOT IN (0, 26) THEN
      RAISE EXCEPTION 'Wave-1 rollback refused: Wave-1 experience_items count is unexpected (%)', n;
    END IF;
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
  IF n NOT IN (0, 10) THEN
    RAISE EXCEPTION 'Wave-1 rollback conflict: partial or unexpected Wave-1 credential set (count %)', n;
  END IF;

  SELECT count(*) INTO n FROM public.focus_pages
  WHERE slug IN ('cybersecurity-grc', 'privacy-ai-governance');
  IF n NOT IN (0, 2) THEN
    RAISE EXCEPTION 'Wave-1 rollback conflict: partial or unexpected Wave-1 focus_pages set (count %)', n;
  END IF;

  -- Children before parents (CASCADE also exists; explicit scoping is intentional).
  IF section_parent IS NOT NULL THEN
    DELETE FROM public.project_sections
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
  END IF;

  IF coalesce(array_length(parent_ids, 1), 0) > 0 THEN
    DELETE FROM public.experience_items
    WHERE experience_id = ANY (parent_ids);
  END IF;

  DELETE FROM public.experiences
  WHERE (organization, title, start_date) IN (
    ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01'),
    ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01'),
    ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01'),
    ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01'),
    ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01'),
    ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01'),
    ($t$Northwestern University$t$, $t$Communications Head, Data & Technology Student Leadership Council$t$, DATE '2026-01-01')
  );

  DELETE FROM public.projects
  WHERE slug IN ('privai-guard', 'dbnms', 'npcrs')
    AND name IN (
      $t$PrivAI Guard$t$,
      $t$Data Breach Notification Management System$t$,
      $t$National Privacy Commission Registration System$t$
    );

  DELETE FROM public.credentials
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

  DELETE FROM public.focus_pages
  WHERE slug IN ('cybersecurity-grc', 'privacy-ai-governance');

  DELETE FROM public.site_profile
  WHERE singleton_key = 'default'
    AND display_name = $t$Rainier (Ram) Milanes$t$
    AND public_email = $t$milanesram@gmail.com$t$;

  DELETE FROM public.site_settings
  WHERE singleton_key = 'default'
    AND contact_form_enabled = false
    AND site_indexable = true;

  -- Post-delete assertions: Wave-1 keys are gone.
  SELECT count(*) INTO n FROM public.site_profile
  WHERE singleton_key = 'default'
    AND display_name = $t$Rainier (Ram) Milanes$t$;
  IF n <> 0 THEN
    RAISE EXCEPTION 'Wave-1 rollback assertion failed: site_profile default remains';
  END IF;

  SELECT count(*) INTO n FROM public.projects
  WHERE slug IN ('privai-guard', 'dbnms', 'npcrs');
  IF n <> 0 THEN
    RAISE EXCEPTION 'Wave-1 rollback assertion failed: Wave-1 project slugs remain';
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
  IF n <> 0 THEN
    RAISE EXCEPTION 'Wave-1 rollback assertion failed: Wave-1 experiences remain';
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
  IF n <> 0 THEN
    RAISE EXCEPTION 'Wave-1 rollback assertion failed: Wave-1 credentials remain';
  END IF;

  SELECT count(*) INTO n FROM public.focus_pages
  WHERE slug IN ('cybersecurity-grc', 'privacy-ai-governance');
  IF n <> 0 THEN
    RAISE EXCEPTION 'Wave-1 rollback assertion failed: Wave-1 focus_pages remain';
  END IF;
END
$wave1$;

COMMIT;
