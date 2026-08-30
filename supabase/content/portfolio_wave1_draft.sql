-- =============================================================================
-- REAL PORTFOLIO CONTENT
-- EXPLICIT OPT-IN
-- NOT A SCHEMA MIGRATION
-- NOT AUTOMATIC SEED DATA
-- REVIEW BEFORE EXECUTION
-- WAVE 1 / DRAFT ONLY
-- =============================================================================
--
-- Authoritative mapping: docs/REAL_CONTENT_MIGRATION_MANIFEST.md (Step 39 freeze)
-- Source: src/content/{site,experiences,projects,credentials,metrics}.ts
--
-- This file supersedes supabase/content/privai_guard_project.sql operationally.
-- Do not run both. Do not execute this file until a later step authorizes it.
-- Do not add this file to supabase/migrations or any automatic seed path.
--
-- Wave-1 inventory (source-verified):
--   site_profile 1
--   site_settings 1
--   projects 3
--   project_sections 7
--   experiences 7
--   experience_items 26
--   credentials 10
--   focus_pages 2
--   total 57
--
-- Excluded: scionetrade + child; publications; engagements; media_assets;
-- user_roles; inquiries; inquiry_submission_events.
--
-- Dates: month/year → first day of month (DQ-01 storage convention only).
-- DTSLC: 2026-01-01 / 2026-12-01 (DQ-03). Public UI must keep month/year labels.
--
-- All status-bearing rows: draft.
-- contact_form_enabled: false.
-- Google AI: needs_verification = true.
-- resume_media_id: NULL.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- site_profile (logical key: singleton_key = 'default')
-- ---------------------------------------------------------------------------
DO $wave1$
DECLARE
  existing public.site_profile%ROWTYPE;
BEGIN
  SELECT * INTO existing
  FROM public.site_profile
  WHERE singleton_key = 'default';

  IF FOUND THEN
    IF existing.display_name IS DISTINCT FROM $t$Rainier (Ram) Milanes$t$
      OR existing.headline IS DISTINCT FROM $t$Cybersecurity, GRC, and privacy governance for regulated environments.$t$
      OR existing.summary IS DISTINCT FROM $t$I help organizations assess technology and privacy risk, implement controls, and make governance visible — drawing on regulator-side leadership, enterprise privacy-program work, and a shipped Shadow AI governance capstone.$t$
      OR existing.work_authorization IS DISTINCT FROM $t$Authorized to work in the U.S. without sponsorship$t$
      OR existing.location_display IS NOT NULL
      OR existing.linkedin_url IS DISTINCT FROM $t$https://www.linkedin.com/in/milanesram/$t$
      OR existing.public_email IS DISTINCT FROM $t$milanesram@gmail.com$t$
      OR existing.hero_cta_primary_label IS NOT NULL
      OR existing.status IS DISTINCT FROM 'draft'::public.content_status
    THEN
      RAISE EXCEPTION 'Wave-1 conflict: site_profile default exists with unexpected values';
    END IF;
  ELSE
    INSERT INTO public.site_profile (
      singleton_key,
      display_name,
      headline,
      summary,
      work_authorization,
      location_display,
      linkedin_url,
      public_email,
      hero_cta_primary_label,
      status
    ) VALUES (
      'default',
      $t$Rainier (Ram) Milanes$t$,
      $t$Cybersecurity, GRC, and privacy governance for regulated environments.$t$,
      $t$I help organizations assess technology and privacy risk, implement controls, and make governance visible — drawing on regulator-side leadership, enterprise privacy-program work, and a shipped Shadow AI governance capstone.$t$,
      $t$Authorized to work in the U.S. without sponsorship$t$,
      NULL,
      $t$https://www.linkedin.com/in/milanesram/$t$,
      $t$milanesram@gmail.com$t$,
      NULL,
      'draft'
    );
  END IF;
END
$wave1$;

-- ---------------------------------------------------------------------------
-- site_settings (logical key: singleton_key = 'default')
-- ---------------------------------------------------------------------------
DO $wave1$
DECLARE
  existing public.site_settings%ROWTYPE;
BEGIN
  SELECT * INTO existing
  FROM public.site_settings
  WHERE singleton_key = 'default';

  IF FOUND THEN
    IF existing.contact_form_enabled IS DISTINCT FROM false
      OR existing.site_indexable IS DISTINCT FROM true
    THEN
      RAISE EXCEPTION 'Wave-1 conflict: site_settings default exists with unexpected values';
    END IF;
  ELSE
    INSERT INTO public.site_settings (
      singleton_key,
      contact_form_enabled,
      site_indexable
    ) VALUES (
      'default',
      false,
      true
    );
  END IF;
END
$wave1$;

-- ---------------------------------------------------------------------------
-- projects (logical key: slug)
-- ---------------------------------------------------------------------------
DO $wave1$
DECLARE
  existing public.projects%ROWTYPE;
BEGIN
  SELECT * INTO existing FROM public.projects WHERE slug = 'privai-guard';
  IF FOUND THEN
    IF existing.name IS DISTINCT FROM $t$PrivAI Guard$t$
      OR existing.tagline IS DISTINCT FROM $t$Shadow AI privacy-risk triage$t$
      OR existing.year_label IS DISTINCT FROM $t$2026$t$
      OR existing.role IS DISTINCT FROM $t$Designed and developed$t$
      OR existing.summary IS DISTINCT FROM $t$A cloud-deployed full-stack Shadow AI governance MVP that converts potentially risky AI use into structured risk assessment, governance review, remediation, audit evidence, and executive visibility.$t$
      OR existing.limits IS DISTINCT FROM $t$Northwestern University MSIS capstone MVP. Non-production. Synthetic demonstration data only. Human governance review — not automated legal or regulatory decisioning.$t$
      OR existing.stack IS DISTINCT FROM ARRAY['Next.js','React','TypeScript','Supabase/PostgreSQL','Vercel','GitHub']::text[]
      OR existing.is_featured IS DISTINCT FROM true
      OR existing.status IS DISTINCT FROM 'draft'::public.content_status
      OR existing.sort_order IS DISTINCT FROM 10
    THEN
      RAISE EXCEPTION 'Wave-1 conflict: project slug privai-guard exists with unexpected values';
    END IF;
  ELSE
    INSERT INTO public.projects (
      slug, name, tagline, year_label, role, summary, limits, stack,
      is_featured, status, sort_order
    ) VALUES (
      'privai-guard',
      $t$PrivAI Guard$t$,
      $t$Shadow AI privacy-risk triage$t$,
      $t$2026$t$,
      $t$Designed and developed$t$,
      $t$A cloud-deployed full-stack Shadow AI governance MVP that converts potentially risky AI use into structured risk assessment, governance review, remediation, audit evidence, and executive visibility.$t$,
      $t$Northwestern University MSIS capstone MVP. Non-production. Synthetic demonstration data only. Human governance review — not automated legal or regulatory decisioning.$t$,
      ARRAY['Next.js','React','TypeScript','Supabase/PostgreSQL','Vercel','GitHub']::text[],
      true,
      'draft',
      10
    );
  END IF;

  SELECT * INTO existing FROM public.projects WHERE slug = 'dbnms';
  IF FOUND THEN
    IF existing.name IS DISTINCT FROM $t$Data Breach Notification Management System$t$
      OR existing.tagline IS DISTINCT FROM $t$National breach-notification portal$t$
      OR existing.year_label IS DISTINCT FROM $t$2022$t$
      OR existing.role IS DISTINCT FROM $t$Project sponsor — planning, development, and implementation$t$
      OR existing.summary IS DISTINCT FROM $t$Public-facing web portal that automates mandatory personal-data-breach notification and annual security-incident reporting, including real-time submission and status checking. Launched 20 April 2022.$t$
      OR existing.limits IS DISTINCT FROM $t$Public-function description only. No internal architecture, credentials, or case files are published.$t$
      OR existing.stack IS DISTINCT FROM '{}'::text[]
      OR existing.is_featured IS DISTINCT FROM false
      OR existing.status IS DISTINCT FROM 'draft'::public.content_status
      OR existing.sort_order IS DISTINCT FROM 20
    THEN
      RAISE EXCEPTION 'Wave-1 conflict: project slug dbnms exists with unexpected values';
    END IF;
  ELSE
    INSERT INTO public.projects (
      slug, name, tagline, year_label, role, summary, limits, stack,
      is_featured, status, sort_order
    ) VALUES (
      'dbnms',
      $t$Data Breach Notification Management System$t$,
      $t$National breach-notification portal$t$,
      $t$2022$t$,
      $t$Project sponsor — planning, development, and implementation$t$,
      $t$Public-facing web portal that automates mandatory personal-data-breach notification and annual security-incident reporting, including real-time submission and status checking. Launched 20 April 2022.$t$,
      $t$Public-function description only. No internal architecture, credentials, or case files are published.$t$,
      '{}'::text[],
      false,
      'draft',
      20
    );
  END IF;

  SELECT * INTO existing FROM public.projects WHERE slug = 'npcrs';
  IF FOUND THEN
    IF existing.name IS DISTINCT FROM $t$National Privacy Commission Registration System$t$
      OR existing.tagline IS DISTINCT FROM $t$DPO and data-processing-system registration$t$
      OR existing.year_label IS DISTINCT FROM $t$2023$t$
      OR existing.role IS DISTINCT FROM $t$Project sponsor — planning, development, and implementation$t$
      OR existing.summary IS DISTINCT FROM $t$Public-facing web portal for registering data-processing systems and Data Protection Officers, and for recording notifications of automated decision-making and profiling. Launched 3 February 2023.$t$
      OR existing.limits IS DISTINCT FROM $t$Public-function description only. No internal architecture, credentials, or registration records are published.$t$
      OR existing.stack IS DISTINCT FROM '{}'::text[]
      OR existing.is_featured IS DISTINCT FROM false
      OR existing.status IS DISTINCT FROM 'draft'::public.content_status
      OR existing.sort_order IS DISTINCT FROM 30
    THEN
      RAISE EXCEPTION 'Wave-1 conflict: project slug npcrs exists with unexpected values';
    END IF;
  ELSE
    INSERT INTO public.projects (
      slug, name, tagline, year_label, role, summary, limits, stack,
      is_featured, status, sort_order
    ) VALUES (
      'npcrs',
      $t$National Privacy Commission Registration System$t$,
      $t$DPO and data-processing-system registration$t$,
      $t$2023$t$,
      $t$Project sponsor — planning, development, and implementation$t$,
      $t$Public-facing web portal for registering data-processing systems and Data Protection Officers, and for recording notifications of automated decision-making and profiling. Launched 3 February 2023.$t$,
      $t$Public-function description only. No internal architecture, credentials, or registration records are published.$t$,
      '{}'::text[],
      false,
      'draft',
      30
    );
  END IF;
END
$wave1$;

-- ---------------------------------------------------------------------------
-- project_sections for project:privai-guard (parent resolved by slug)
-- ---------------------------------------------------------------------------
DO $wave1$
DECLARE
  parent_id uuid;
  unexpected integer;
  rec record;
BEGIN
  SELECT id INTO parent_id
  FROM public.projects
  WHERE slug = 'privai-guard';

  IF parent_id IS NULL THEN
    RAISE EXCEPTION 'Wave-1 parent missing: project slug privai-guard';
  END IF;

  SELECT count(*) INTO unexpected
  FROM public.project_sections
  WHERE project_id = parent_id
    AND heading NOT IN (
      'Problem',
      'Risk',
      'Guardrail',
      'Implementation',
      'Governance workflow',
      'Business value',
      'MVP boundary'
    );

  IF unexpected > 0 THEN
    RAISE EXCEPTION 'Wave-1 conflict: unexpected project_sections on privai-guard';
  END IF;

  FOR rec IN
    SELECT * FROM (
      VALUES
        (10, 'Problem', $t$Organizations adopt AI tools faster than they can see where those tools touch sensitive data. Shadow AI use arrives as informal questions, screenshots, and one-off experiments rather than as a governed request.$t$),
        (20, 'Risk', $t$Unstructured AI use can expose personal or confidential data, skip impact review, and leave no audit trail. The gap is not only a model-risk problem — it is a privacy, security, and accountability problem.$t$),
        (30, 'Guardrail', $t$PrivAI Guard turns a potentially risky AI-use report into a structured privacy-risk triage: classification, transparent scoring, data-subject impact review, and a human decision path instead of an automated legal conclusion.$t$),
        (40, 'Implementation', $t$Designed and developed as a cloud-deployed full-stack application using Next.js, React, TypeScript, Supabase/PostgreSQL, Vercel, and GitHub. Security and governance controls include role-based access, PostgreSQL Row-Level Security, risk scoring, remediation workflows, audit logging, and privacy-by-design defaults.$t$),
        (50, 'Governance workflow', $t$A reported use can be classified, scored, routed for human-reviewed internal-AI consideration, assigned remediation, and recorded as audit evidence with executive visibility. Reviewers — not the application — remain accountable for governance outcomes.$t$),
        (60, 'Business value', $t$The MVP shows how a security, privacy, or AI-governance function can replace ad-hoc Shadow AI handling with a repeatable assessment-to-evidence path that hiring managers can inspect.$t$),
        (70, 'MVP boundary', $t$This is a Northwestern University MSIS capstone MVP. It is non-production, uses synthetic demonstration data only, and supports advisory human review rather than automated legal or regulatory decisioning.$t$)
    ) AS s(sort_order, heading, body)
  LOOP
    IF EXISTS (
      SELECT 1
      FROM public.project_sections
      WHERE project_id = parent_id
        AND heading = rec.heading
        AND (
          body IS DISTINCT FROM rec.body
          OR track IS DISTINCT FROM 'all'::public.track_tag
          OR status IS DISTINCT FROM 'draft'::public.content_status
          OR sort_order IS DISTINCT FROM rec.sort_order
        )
    ) THEN
      RAISE EXCEPTION 'Wave-1 conflict: project_section % on privai-guard exists with unexpected values', rec.heading;
    END IF;

    INSERT INTO public.project_sections (
      project_id, heading, body, track, status, sort_order
    )
    SELECT parent_id, rec.heading, rec.body, 'all', 'draft', rec.sort_order
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.project_sections
      WHERE project_id = parent_id
        AND heading = rec.heading
        AND sort_order = rec.sort_order
    );
  END LOOP;
END
$wave1$;

-- ---------------------------------------------------------------------------
-- experiences (logical key: organization + title + start_date)
-- scionetrade is intentionally absent
-- ---------------------------------------------------------------------------
DO $wave1$
DECLARE
  rec record;
  existing public.experiences%ROWTYPE;
BEGIN
  FOR rec IN
    SELECT * FROM (
      VALUES
        (
          $t$RAM Privacy & Security$t$,
          $t$Principal Consultant$t$,
          NULL::text,
          $t$Remote$t$,
          'consulting'::public.experience_kind,
          DATE '2024-10-01',
          NULL::date,
          true,
          true,
          10
        ),
        (
          $t$National Privacy Commission$t$,
          $t$Innovation and Transformation Consultant$t$,
          $t$Designated Chief Information Technology Officer$t$,
          $t$Philippines$t$,
          'consulting'::public.experience_kind,
          DATE '2024-10-01',
          DATE '2026-01-01',
          false,
          true,
          20
        ),
        (
          $t$National Privacy Commission$t$,
          $t$Chief, Compliance and Monitoring Division$t$,
          NULL::text,
          $t$Philippines$t$,
          'employment'::public.experience_kind,
          DATE '2021-03-01',
          DATE '2024-09-01',
          false,
          true,
          30
        ),
        (
          $t$Bankmer Realty Corporation$t$,
          $t$Director of Operations & Data Protection Officer$t$,
          NULL::text,
          $t$Philippines$t$,
          'employment'::public.experience_kind,
          DATE '2017-01-01',
          DATE '2020-07-01',
          false,
          false,
          40
        ),
        (
          $t$Bankmer Realty Corporation$t$,
          $t$Corporate Counsel / Facilities Manager$t$,
          NULL::text,
          $t$Philippines$t$,
          'employment'::public.experience_kind,
          DATE '2015-03-01',
          DATE '2016-12-01',
          false,
          false,
          50
        ),
        (
          $t$Bankmer Realty Corporation$t$,
          $t$Compliance Officer$t$,
          NULL::text,
          $t$Philippines$t$,
          'employment'::public.experience_kind,
          DATE '2013-11-01',
          DATE '2015-02-01',
          false,
          false,
          60
        ),
        (
          $t$Northwestern University$t$,
          $t$Communications Head, Data & Technology Student Leadership Council$t$,
          NULL::text,
          $t$United States$t$,
          'leadership'::public.experience_kind,
          DATE '2026-01-01',
          DATE '2026-12-01',
          false,
          false,
          80
        )
    ) AS e(
      organization, title, title_secondary, location_display, kind,
      start_date, end_date, is_current, is_featured, sort_order
    )
  LOOP
    SELECT * INTO existing
    FROM public.experiences
    WHERE organization = rec.organization
      AND title = rec.title
      AND start_date = rec.start_date;

    IF FOUND THEN
      IF existing.title_secondary IS DISTINCT FROM rec.title_secondary
        OR existing.location_display IS DISTINCT FROM rec.location_display
        OR existing.kind IS DISTINCT FROM rec.kind
        OR existing.end_date IS DISTINCT FROM rec.end_date
        OR existing.is_current IS DISTINCT FROM rec.is_current
        OR existing.is_featured IS DISTINCT FROM rec.is_featured
        OR existing.summary IS NOT NULL
        OR existing.status IS DISTINCT FROM 'draft'::public.content_status
        OR existing.sort_order IS DISTINCT FROM rec.sort_order
      THEN
        RAISE EXCEPTION 'Wave-1 conflict: experience % / % exists with unexpected values', rec.organization, rec.title;
      END IF;
    ELSE
      INSERT INTO public.experiences (
        organization, title, title_secondary, location_display, kind,
        start_date, end_date, is_current, is_featured, summary, status, sort_order
      ) VALUES (
        rec.organization, rec.title, rec.title_secondary, rec.location_display, rec.kind,
        rec.start_date, rec.end_date, rec.is_current, rec.is_featured, NULL, 'draft', rec.sort_order
      );
    END IF;
  END LOOP;
END
$wave1$;

-- ---------------------------------------------------------------------------
-- experience_items (parent resolved by organization + title + start_date)
-- ---------------------------------------------------------------------------
DO $wave1$
DECLARE
  rec record;
  parent_id uuid;
  existing public.experience_items%ROWTYPE;
BEGIN
  FOR rec IN
    SELECT * FROM (
      VALUES
        ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 10, $t$Support regulated and high-risk organizations with cybersecurity, privacy, risk-management, and governance initiatives aligned with business and regulatory requirements.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 20, $t$Conduct risk assessments and translate findings into prioritized remediation actions, implementation roadmaps, and measurable controls.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 30, $t$Conduct privacy and security risk assessments and translate findings into prioritized remediation actions, measurable controls, policies, standards, procedures, and implementation guidance.$t$, 'privacy_ai'::public.track_tag, false, NULL::text, false),
        ($t$RAM Privacy & Security$t$, $t$Principal Consultant$t$, DATE '2024-10-01', 40, $t$Develop policies, standards, procedures, incident-readiness materials, and executive reports; support third-party risk, audit readiness, regulatory compliance, and stakeholder coordination.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 10, $t$Advised executive leadership on cybersecurity strategy, technology risk, critical-infrastructure protection, information security, and security-control implementation.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 20, $t$Advised executive leadership on cybersecurity strategy, information security, privacy compliance, technology risk, critical-infrastructure protection, and security-control implementation.$t$, 'privacy_ai'::public.track_tag, false, NULL::text, false),
        ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 30, $t$Supported risk assessments and the development of controls addressing identified cybersecurity and information-security risks.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 40, $t$Supported risk assessments and the development of controls addressing identified cybersecurity, information-security, and privacy risks.$t$, 'privacy_ai'::public.track_tag, false, NULL::text, false),
        ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 50, $t$Directed pre- and post-production security implementation for the Compliance and Security Monitoring Command Center, supporting centralized monitoring and remediation workflows.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 60, $t$Directed pre- and post-production security implementation for the Compliance and Security Monitoring Command Center, including privacy-by-design and privacy-by-default requirements.$t$, 'privacy_ai'::public.track_tag, false, NULL::text, false),
        ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 70, $t$Coordinated technology, privacy, security, and organizational stakeholders on digital systems and technology initiatives.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$National Privacy Commission$t$, $t$Innovation and Transformation Consultant$t$, DATE '2024-10-01', 80, $t$Advised on institutionalizing the Data Protection Officer function in government.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 10, $t$Led compliance monitoring, breach-notification processing, registration, compliance support, and regulatory reporting operations.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 20, $t$Managed multidisciplinary teams and high-volume privacy, security, and compliance workflows; conducted and oversaw privacy, security, technology, and compliance assessments.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 30, $t$Led development and implementation of the Data Breach Notification Management System and the National Privacy Commission Registration System.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 40, $t$Increased new Data Protection Officer registrations from 631 in 2020 to 1,498 in 2021.$t$, 'all'::public.track_tag, true, $t$New Data Protection Officer registrations rose from 631 in 2020 to 1,498 in 2021 at the National Privacy Commission.$t$, true),
        ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 50, $t$Supported more than 10,000 DPS and DPO registered entities by 30 September 2024 after the registration system launched in 2023.$t$, 'all'::public.track_tag, true, $t$More than 10,000 data-processing systems and DPO registered entities were on the national registration system by 30 September 2024.$t$, true),
        ($t$National Privacy Commission$t$, $t$Chief, Compliance and Monitoring Division$t$, DATE '2021-03-01', 60, $t$Raised 2021 compliance-check completions from a target of 350 personal information controllers to 685 PICs.$t$, 'all'::public.track_tag, true, $t$2021 compliance-check completions rose from a target of 350 personal information controllers to 685 PICs.$t$, true),
        ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 10, $t$Established the organization’s first Privacy Management Program, including privacy governance, policies, security procedures, data-handling standards, employee training, and accountability controls.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 20, $t$Conducted privacy and operational risk assessments and translated findings into corrective actions and improved data-governance practices.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$Bankmer Realty Corporation$t$, $t$Director of Operations & Data Protection Officer$t$, DATE '2017-01-01', 30, $t$Led modernization, records digitalization, infrastructure improvements, vendor management, and cross-functional operational initiatives.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01', 10, $t$Directed IT planning, infrastructure modernization, information-security initiatives, and corporate-record digitalization to protect confidential organizational information.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$Bankmer Realty Corporation$t$, $t$Corporate Counsel / Facilities Manager$t$, DATE '2015-03-01', 20, $t$Coordinated technology vendors, contracts, regulatory requirements, and implementation activities involving confidential organizational information.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01', 10, $t$Researched privacy and regulatory requirements and evaluated organizational legal, operational, documentation, and information-management risks.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$Bankmer Realty Corporation$t$, $t$Compliance Officer$t$, DATE '2013-11-01', 20, $t$Developed risk-mitigation recommendations and supported compliance implementation.$t$, 'all'::public.track_tag, false, NULL::text, false),
        ($t$Northwestern University$t$, $t$Communications Head, Data & Technology Student Leadership Council$t$, DATE '2026-01-01', 10, $t$Coordinate technology-focused communications, stakeholder engagement, and responsible management of student information.$t$, 'all'::public.track_tag, false, NULL::text, false)
    ) AS i(
      organization, title, start_date, sort_order, body, track,
      is_metric, metric_context, show_on_home
    )
  LOOP
    SELECT id INTO parent_id
    FROM public.experiences
    WHERE organization = rec.organization
      AND title = rec.title
      AND start_date = rec.start_date;

    IF parent_id IS NULL THEN
      RAISE EXCEPTION 'Wave-1 parent missing: experience % / %', rec.organization, rec.title;
    END IF;

    SELECT * INTO existing
    FROM public.experience_items
    WHERE experience_id = parent_id
      AND sort_order = rec.sort_order;

    IF FOUND THEN
      IF existing.body IS DISTINCT FROM rec.body
        OR existing.track IS DISTINCT FROM rec.track
        OR existing.is_metric IS DISTINCT FROM rec.is_metric
        OR existing.metric_context IS DISTINCT FROM rec.metric_context
        OR existing.show_on_home IS DISTINCT FROM rec.show_on_home
        OR existing.status IS DISTINCT FROM 'draft'::public.content_status
      THEN
        RAISE EXCEPTION 'Wave-1 conflict: experience_item sort % under % exists with unexpected values', rec.sort_order, rec.title;
      END IF;
    ELSE
      INSERT INTO public.experience_items (
        experience_id, body, track, is_metric, metric_context,
        show_on_home, status, sort_order
      ) VALUES (
        parent_id, rec.body, rec.track, rec.is_metric, rec.metric_context,
        rec.show_on_home, 'draft', rec.sort_order
      );
    END IF;
  END LOOP;
END
$wave1$;

-- ---------------------------------------------------------------------------
-- credentials (logical key: kind + name + issuer)
-- ---------------------------------------------------------------------------
DO $wave1$
DECLARE
  rec record;
  existing public.credentials%ROWTYPE;
BEGIN
  FOR rec IN
    SELECT * FROM (
      VALUES
        ('degree'::public.credential_kind, $t$Master of Science in Information Systems, Security Specialization$t$, $t$Northwestern University$t$, $t$2026$t$, $t$Coursework includes Information Security Management; Information Security Strategy; Cybersecurity Attacks & Countermeasures; Disaster Recovery & Business Continuity; Artificial Intelligence; Machine Learning; Spec-Driven Software Development; and Project Management.$t$, false, 'all'::public.track_tag, true, 10),
        ('degree'::public.credential_kind, $t$Juris Doctor$t$, $t$San Sebastian College – Recoletos$t$, NULL::text, NULL::text, false, 'all'::public.track_tag, false, 20),
        ('degree'::public.credential_kind, $t$Bachelor of Science in Business Administration$t$, $t$Trinity University of Asia$t$, NULL::text, NULL::text, false, 'all'::public.track_tag, false, 30),
        ('certification'::public.credential_kind, $t$Certified Information Privacy Manager (CIPM)$t$, $t$IAPP$t$, NULL::text, NULL::text, false, 'all'::public.track_tag, true, 10),
        ('certification'::public.credential_kind, $t$Certified in Cybersecurity (CC)$t$, $t$ISC2$t$, NULL::text, NULL::text, false, 'all'::public.track_tag, true, 20),
        ('certification'::public.credential_kind, $t$Google AI Professional Certificate$t$, $t$Google$t$, NULL::text, NULL::text, true, 'privacy_ai'::public.track_tag, false, 30),
        ('training'::public.credential_kind, $t$Professional Development Certificate in Cybersecurity$t$, $t$Australian National University, National Security College$t$, NULL::text, $t$Cyber and Critical Tech Cooperation Program – Cybersecurity Bootcamp$t$, false, 'all'::public.track_tag, false, 10),
        ('training'::public.credential_kind, $t$Industrial Control Systems Cybersecurity Training$t$, $t$U.S. Department of Homeland Security, CISA$t$, NULL::text, NULL::text, false, 'all'::public.track_tag, false, 20),
        ('training'::public.credential_kind, $t$Certified Digital Transformation Professional$t$, $t$Asian Institute of Digital Transformation$t$, NULL::text, $t$Executive Masterclass in Digital Transformation$t$, false, 'all'::public.track_tag, false, 30),
        ('license'::public.credential_kind, $t$Licensed to Practice Law in the Philippines$t$, $t$Supreme Court of the Philippines / Integrated Bar of the Philippines$t$, NULL::text, $t$This is Philippine legal licensure. It does not imply U.S. bar admission or authorization to practice law in the United States.$t$, false, 'all'::public.track_tag, false, 10)
    ) AS c(
      kind, name, issuer, year_label, details, needs_verification, track, highlight, sort_order
    )
  LOOP
    SELECT * INTO existing
    FROM public.credentials
    WHERE kind = rec.kind
      AND name = rec.name
      AND issuer = rec.issuer;

    IF FOUND THEN
      IF existing.year_label IS DISTINCT FROM rec.year_label
        OR existing.details IS DISTINCT FROM rec.details
        OR existing.needs_verification IS DISTINCT FROM rec.needs_verification
        OR existing.track IS DISTINCT FROM rec.track
        OR existing.highlight IS DISTINCT FROM rec.highlight
        OR existing.status IS DISTINCT FROM 'draft'::public.content_status
        OR existing.sort_order IS DISTINCT FROM rec.sort_order
      THEN
        RAISE EXCEPTION 'Wave-1 conflict: credential % / % exists with unexpected values', rec.kind, rec.name;
      END IF;
    ELSE
      INSERT INTO public.credentials (
        kind, name, issuer, year_label, details, needs_verification,
        track, highlight, status, sort_order
      ) VALUES (
        rec.kind, rec.name, rec.issuer, rec.year_label, rec.details, rec.needs_verification,
        rec.track, rec.highlight, 'draft', rec.sort_order
      );
    END IF;
  END LOOP;
END
$wave1$;

-- ---------------------------------------------------------------------------
-- focus_pages (logical key: slug). resume_media_id remains NULL.
-- ---------------------------------------------------------------------------
DO $wave1$
DECLARE
  existing public.focus_pages%ROWTYPE;
  cyber_comp text[] := ARRAY[
    'IT risk',
    'Technology risk',
    'GRC',
    'Information security',
    'Security controls',
    'Control assessment',
    'Audit readiness',
    'Incident readiness',
    'Third-party risk',
    'Security governance'
  ];
  privacy_comp text[] := ARRAY[
    'Data privacy',
    'Privacy governance',
    'Privacy risk',
    'Privacy by design / default',
    'Breach and incident management',
    'Data governance',
    'AI governance',
    'Responsible AI',
    'Audit evidence',
    'Remediation'
  ];
BEGIN
  SELECT * INTO existing FROM public.focus_pages WHERE slug = 'cybersecurity-grc';
  IF FOUND THEN
    IF existing.nav_label IS DISTINCT FROM $t$Cybersecurity / GRC / IT Risk$t$
      OR existing.headline IS DISTINCT FROM $t$Cybersecurity, GRC, and IT risk$t$
      OR existing.summary IS DISTINCT FROM $t$Security governance, control implementation, audit readiness, and technology-risk translation — the same background, read for cybersecurity and GRC roles.$t$
      OR existing.competencies IS DISTINCT FROM cyber_comp
      OR existing.resume_media_id IS NOT NULL
      OR existing.status IS DISTINCT FROM 'draft'::public.content_status
      OR existing.sort_order IS DISTINCT FROM 10
    THEN
      RAISE EXCEPTION 'Wave-1 conflict: focus_pages slug cybersecurity-grc exists with unexpected values';
    END IF;
  ELSE
    INSERT INTO public.focus_pages (
      slug, nav_label, headline, summary, competencies,
      resume_media_id, status, sort_order
    ) VALUES (
      'cybersecurity-grc',
      $t$Cybersecurity / GRC / IT Risk$t$,
      $t$Cybersecurity, GRC, and IT risk$t$,
      $t$Security governance, control implementation, audit readiness, and technology-risk translation — the same background, read for cybersecurity and GRC roles.$t$,
      cyber_comp,
      NULL,
      'draft',
      10
    );
  END IF;

  SELECT * INTO existing FROM public.focus_pages WHERE slug = 'privacy-ai-governance';
  IF FOUND THEN
    IF existing.nav_label IS DISTINCT FROM $t$Privacy / AI Governance$t$
      OR existing.headline IS DISTINCT FROM $t$Privacy and AI governance$t$
      OR existing.summary IS DISTINCT FROM $t$Privacy operations, privacy by design, incident process, and responsible-AI review — the same background, read for privacy and AI-governance roles.$t$
      OR existing.competencies IS DISTINCT FROM privacy_comp
      OR existing.resume_media_id IS NOT NULL
      OR existing.status IS DISTINCT FROM 'draft'::public.content_status
      OR existing.sort_order IS DISTINCT FROM 20
    THEN
      RAISE EXCEPTION 'Wave-1 conflict: focus_pages slug privacy-ai-governance exists with unexpected values';
    END IF;
  ELSE
    INSERT INTO public.focus_pages (
      slug, nav_label, headline, summary, competencies,
      resume_media_id, status, sort_order
    ) VALUES (
      'privacy-ai-governance',
      $t$Privacy / AI Governance$t$,
      $t$Privacy and AI governance$t$,
      $t$Privacy operations, privacy by design, incident process, and responsible-AI review — the same background, read for privacy and AI-governance roles.$t$,
      privacy_comp,
      NULL,
      'draft',
      20
    );
  END IF;
END
$wave1$;

-- ---------------------------------------------------------------------------
-- Wave-1 logical-key assertions (not whole-table counts)
-- ---------------------------------------------------------------------------
DO $wave1$
DECLARE
  n integer;
  parent_ids uuid[];
BEGIN
  SELECT count(*) INTO n FROM public.site_profile
  WHERE singleton_key = 'default' AND status = 'draft' AND location_display IS NULL
    AND hero_cta_primary_label IS NULL;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Wave-1 assertion failed: site_profile default draft count = %', n;
  END IF;

  SELECT count(*) INTO n FROM public.site_settings
  WHERE singleton_key = 'default' AND contact_form_enabled = false AND site_indexable = true;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Wave-1 assertion failed: site_settings default fail-closed count = %', n;
  END IF;

  SELECT count(*) INTO n FROM public.projects
  WHERE slug IN ('privai-guard', 'dbnms', 'npcrs') AND status = 'draft';
  IF n <> 3 THEN
    RAISE EXCEPTION 'Wave-1 assertion failed: draft projects = %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.project_sections s
  JOIN public.projects p ON p.id = s.project_id
  WHERE p.slug = 'privai-guard'
    AND s.status = 'draft'
    AND s.track = 'all'
    AND s.heading IN (
      'Problem', 'Risk', 'Guardrail', 'Implementation',
      'Governance workflow', 'Business value', 'MVP boundary'
    );
  IF n <> 7 THEN
    RAISE EXCEPTION 'Wave-1 assertion failed: privai-guard draft sections = %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.project_sections s
  JOIN public.projects p ON p.id = s.project_id
  WHERE p.slug = 'privai-guard';
  IF n <> 7 THEN
    RAISE EXCEPTION 'Wave-1 assertion failed: unexpected extra sections on privai-guard (count %)', n;
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
  )
  AND status = 'draft';
  IF coalesce(array_length(parent_ids, 1), 0) <> 7 THEN
    RAISE EXCEPTION 'Wave-1 assertion failed: draft Wave-1 experiences = %', coalesce(array_length(parent_ids, 1), 0);
  END IF;

  SELECT count(*) INTO n
  FROM public.experiences
  WHERE organization = $t$Northwestern University$t$
    AND title = $t$Communications Head, Data & Technology Student Leadership Council$t$
    AND start_date = DATE '2026-01-01'
    AND end_date = DATE '2026-12-01'
    AND status = 'draft';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Wave-1 assertion failed: DTSLC date normalization mismatch (count %)', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.experience_items
  WHERE experience_id = ANY (parent_ids)
    AND status = 'draft';
  IF n <> 26 THEN
    RAISE EXCEPTION 'Wave-1 assertion failed: draft Wave-1 experience_items = %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.experience_items
  WHERE experience_id = ANY (parent_ids)
    AND is_metric = true
    AND show_on_home = true
    AND metric_context IS NOT NULL;
  IF n <> 3 THEN
    RAISE EXCEPTION 'Wave-1 assertion failed: home metric items = %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.credentials
  WHERE status = 'draft'
    AND (kind, name, issuer) IN (
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
    RAISE EXCEPTION 'Wave-1 assertion failed: draft Wave-1 credentials = %', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.credentials
  WHERE name = $t$Google AI Professional Certificate$t$
    AND issuer = $t$Google$t$
    AND needs_verification = true
    AND status = 'draft'
    AND track = 'privacy_ai';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Wave-1 assertion failed: Google AI verification hold missing';
  END IF;

  SELECT count(*) INTO n
  FROM public.focus_pages
  WHERE slug IN ('cybersecurity-grc', 'privacy-ai-governance')
    AND status = 'draft'
    AND resume_media_id IS NULL
    AND cardinality(competencies) = 10;
  IF n <> 2 THEN
    RAISE EXCEPTION 'Wave-1 assertion failed: draft focus_pages = %', n;
  END IF;
END
$wave1$;

COMMIT;
