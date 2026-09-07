-- Career-content reconciliation to Resume A/B V3.1.
-- UUID-bound UPDATEs plus two insert-if-absent PrivAI sections.
-- No schema, RLS, Storage, grants, or unrelated CMS records.

DO $reconcile_v31$
DECLARE
  ram_id constant uuid := '982e5fae-ec27-49c5-9d7f-b88873bc33ec';
  npc_cito_id constant uuid := '99437e38-bd03-40be-af9c-f3a22b4a0261';
  npc_cmd_id constant uuid := '6c629f63-627b-42db-afdf-78b4ead5901a';
  bankmer_ops_id constant uuid := '65d6925a-0203-4947-b5e8-3f96a37e2705';
  bankmer_counsel_id constant uuid := '58496f76-95f7-42a5-b620-44f7f020bf66';
  bankmer_compliance_id constant uuid := '6808bdfe-782c-4d20-b717-ee49827c3a4e';
  scionetrade_id constant uuid := 'c52e0001-0000-4000-8000-000000000001';
  site_profile_id constant uuid := '7b916af9-2874-44a3-8629-24fb5627b072';
  home_id constant uuid := 'c52b0001-0000-4000-8000-000000000001';
  about_id constant uuid := 'c52c0001-0000-4000-8000-000000000001';
  about_privai_paragraph_id constant uuid := 'c52c0001-0000-4000-8000-000000000013';
  msis_id constant uuid := 'bda3ebf4-4601-4a34-bfe5-9bb5b595d599';
  cyber_focus_id constant uuid := '40170d44-acc6-4f1c-b6fd-a6fbee19c02a';
  privacy_focus_id constant uuid := '27236662-e48e-4b6f-a820-75cd321a7322';
  privacy_track_id constant uuid := 'c52a0001-0000-4000-8000-000000000012';
  privai_id constant uuid := '0002fb1b-5c40-41ea-98a9-e62de9dac37e';
  privai_boundary_id constant uuid := '92a1045c-ce22-4192-8b4c-730aef101112';
  privai_demonstrates_id constant uuid := '3851264c-6ca8-4f3a-9f5a-e5654a037bd2';
  privai_current_dev_id constant uuid := 'c5213101-0000-4000-8000-000000000080';
  privai_planned_id constant uuid := 'c5213101-0000-4000-8000-000000000090';
  updated_count integer;
  n integer;
BEGIN
  -- ---------------------------------------------------------------------------
  -- 1. Canonical experience titles / designations
  -- ---------------------------------------------------------------------------
  UPDATE public.experiences
  SET title_secondary = $t$Independent Consulting Practice$t$
  WHERE
    id = ram_id
    AND organization = $t$RAM Privacy & Security$t$
    AND title = $t$Principal Consultant$t$
    AND title_secondary IS NULL
    AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: RAM title_secondary update matched % rows',
      updated_count;
  END IF;

  UPDATE public.experiences
  SET title_secondary = $t$Designation: Chief Information Technology Officer$t$
  WHERE
    id = npc_cito_id
    AND organization = $t$National Privacy Commission$t$
    AND title = $t$Innovation and Transformation Consultant$t$
    AND title_secondary = $t$Designated Chief Information Technology Officer$t$
    AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: NPC 2024–2026 designation update matched % rows',
      updated_count;
  END IF;

  UPDATE public.experiences
  SET
    title = $t$Information Technology Officer III$t$,
    title_secondary = $t$Designation: Chief, Compliance and Monitoring Division$t$
  WHERE
    id = npc_cmd_id
    AND organization = $t$National Privacy Commission$t$
    AND title = $t$Chief, Compliance and Monitoring Division$t$
    AND title_secondary IS NULL
    AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: NPC 2021–2024 title update matched % rows',
      updated_count;
  END IF;

  UPDATE public.experiences
  SET
    title = $t$Director of Operations$t$,
    title_secondary = $t$Additional functions: Head, Legal and Compliance; Designated Data Protection Officer$t$
  WHERE
    id = bankmer_ops_id
    AND organization = $t$Bankmer Realty Corporation$t$
    AND title = $t$Director of Operations & Data Protection Officer$t$
    AND title_secondary IS NULL
    AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: Bankmer 2017–2020 title update matched % rows',
      updated_count;
  END IF;

  UPDATE public.experiences
  SET
    title = $t$Corporate Counsel$t$,
    title_secondary = $t$Additional functions: Facilities Manager; Head, Information Technology$t$
  WHERE
    id = bankmer_counsel_id
    AND organization = $t$Bankmer Realty Corporation$t$
    AND title = $t$Corporate Counsel / Facilities Manager$t$
    AND title_secondary IS NULL
    AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: Bankmer 2015–2016 title update matched % rows',
      updated_count;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.experiences
    WHERE
      id = bankmer_compliance_id
      AND organization = $t$Bankmer Realty Corporation$t$
      AND title = $t$Compliance Officer$t$
      AND title_secondary IS NULL
      AND status = 'published'
  ) THEN
    RAISE EXCEPTION 'V3.1 reconciliation refused: Bankmer 2013–2015 drifted';
  END IF;

  UPDATE public.experiences
  SET
    title = $t$Legal Officer$t$,
    title_secondary = $t$Additional designation: Data Protection Officer · Contract / Project – Part-Time$t$,
    date_precision = 'month',
    start_date = DATE '2018-07-01',
    end_date = DATE '2020-06-01',
    start_year = NULL,
    end_year = NULL
  WHERE
    id = scionetrade_id
    AND organization = $t$Scionetrade Corporation$t$
    AND title = $t$Legal Consultant — Cybersecurity & Data Privacy Advisory$t$
    AND title_secondary IS NULL
    AND date_precision = 'year'
    AND start_year = 2018
    AND end_year = 2020
    AND start_date IS NULL
    AND end_date IS NULL
    AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: Scionetrade title/date update matched % rows',
      updated_count;
  END IF;

  UPDATE public.experience_items
  SET body = $t$Directed pre- and post-production security implementation for the Compliance and Security Monitoring Command Center, including Privacy by Design and by Default requirements.$t$
  WHERE
    experience_id = npc_cito_id
    AND track = 'privacy_ai'
    AND sort_order = 60
    AND status = 'published'
    AND body = $t$Directed pre- and post-production security implementation for the Compliance and Security Monitoring Command Center, including privacy-by-design and privacy-by-default requirements.$t$;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: NPC privacy-by-design bullet update matched % rows',
      updated_count;
  END IF;

  -- ---------------------------------------------------------------------------
  -- 2. Northwestern coursework
  -- ---------------------------------------------------------------------------
  UPDATE public.credentials
  SET details = $t$Coursework includes Information Security Management; Enterprise Security Strategy; Cybersecurity Attacks & Countermeasures; Disaster Recovery & Business Continuity; Python for Data Analytics; Artificial Intelligence; Machine Learning; Spec-Driven Software Development; Project Management.$t$
  WHERE
    id = msis_id
    AND name = $t$Master of Science in Information Systems, Security Specialization$t$
    AND issuer = $t$Northwestern University$t$
    AND year_label = $t$2026$t$
    AND status = 'published'
    AND needs_verification = false
    AND details = $t$Coursework includes Information Security Management; Information Security Strategy; Cybersecurity Attacks & Countermeasures; Disaster Recovery & Business Continuity; Artificial Intelligence; Machine Learning; Spec-Driven Software Development; and Project Management.$t$;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: MSIS coursework update matched % rows',
      updated_count;
  END IF;

  -- ---------------------------------------------------------------------------
  -- 3. PrivAI Guard current-state / planned sections
  -- ---------------------------------------------------------------------------
  UPDATE public.projects
  SET tagline = $t$AI Governance, Privacy-Risk & Control Workflow Platform$t$
  WHERE
    id = privai_id
    AND slug = 'privai-guard'
    AND status = 'published'
    AND tagline = $t$Shadow AI privacy-risk triage$t$;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: PrivAI tagline update matched % rows',
      updated_count;
  END IF;

  UPDATE public.project_sections
  SET body = $body$The work connects cybersecurity governance, Privacy by Design and by Default, AI governance, GRC and control implementation, IT and technology risk, role-aware authorization, system-of-record architecture, remediation workflows, and auditability to a working application. It is evidence of applied implementation — not a claim of enterprise-grade or production-ready platform status.$body$
  WHERE
    id = privai_demonstrates_id
    AND project_id = privai_id
    AND heading = $t$What this project demonstrates$t$
    AND body = $body$The work connects cybersecurity governance, privacy by design, AI governance, GRC and control implementation, IT and technology risk, role-aware authorization, system-of-record architecture, remediation workflows, and auditability to a working application. It is evidence of applied implementation — not a claim of enterprise-grade or production-ready platform status.$body$;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: PrivAI demonstrates-section update matched % rows',
      updated_count;
  END IF;

  UPDATE public.project_sections
  SET body = $body$Implemented Capstone MVP: Northwestern University MSIS capstone. Working non-production MVP. Synthetic demonstration data only. Human governance review. Advisory internal-AI routing. Not enterprise production software, not a commercial multi-tenant SaaS product, and not Northwestern-owned or Northwestern-endorsed commercial software.$body$
  WHERE
    id = privai_boundary_id
    AND project_id = privai_id
    AND heading = $t$MVP boundary$t$
    AND body LIKE $t$%Potential future product direction — not implemented:%$t$;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: PrivAI MVP boundary update matched % rows',
      updated_count;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.project_sections
    WHERE project_id = privai_id
      AND heading = $t$Current Development — Production-Oriented Re-engineering$t$
      AND id <> privai_current_dev_id
  ) THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: unexpected Current Development section exists';
  END IF;

  INSERT INTO public.project_sections (
    id, project_id, heading, body, track, status, sort_order
  )
  SELECT
    privai_current_dev_id,
    privai_id,
    $t$Current Development — Production-Oriented Re-engineering$t$,
    $body$The validated Northwestern MSIS capstone MVP remains the baseline demonstrated implementation described above. PrivAI Guard is now undergoing production-oriented re-engineering to expand policy and control coverage, operational adoption, human governance workflows, security and authorization controls, remediation, and auditable governance design.

This work is in progress. Capabilities under re-engineering are not represented here as released production functionality until they are implemented and validated.$body$,
    'all',
    'published',
    80
  WHERE NOT EXISTS (
    SELECT 1 FROM public.project_sections
    WHERE id = privai_current_dev_id
       OR (
         project_id = privai_id
         AND heading = $t$Current Development — Production-Oriented Re-engineering$t$
       )
  );

  IF NOT EXISTS (
    SELECT 1 FROM public.project_sections
    WHERE
      id = privai_current_dev_id
      AND project_id = privai_id
      AND heading = $t$Current Development — Production-Oriented Re-engineering$t$
      AND status = 'published'
      AND sort_order = 80
  ) THEN
    RAISE EXCEPTION 'V3.1 reconciliation refused: Current Development section missing';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.project_sections
    WHERE project_id = privai_id
      AND heading = $t$Planned / developing capabilities — not yet released$t$
      AND id <> privai_planned_id
  ) THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: unexpected planned-capabilities section exists';
  END IF;

  INSERT INTO public.project_sections (
    id, project_id, heading, body, track, status, sort_order
  )
  SELECT
    privai_planned_id,
    privai_id,
    $t$Planned / developing capabilities — not yet released$t$,
    $body$Enterprise SSO, richer workflow and security integrations, commercial multi-tenancy, production operations, and cost-aware model routing remain planned or developing capabilities. They are not implemented and validated in the demonstrated MVP and are not represented here as released production functionality.$body$,
    'all',
    'published',
    90
  WHERE NOT EXISTS (
    SELECT 1 FROM public.project_sections
    WHERE id = privai_planned_id
       OR (
         project_id = privai_id
         AND heading = $t$Planned / developing capabilities — not yet released$t$
       )
  );

  IF NOT EXISTS (
    SELECT 1 FROM public.project_sections
    WHERE
      id = privai_planned_id
      AND project_id = privai_id
      AND heading = $t$Planned / developing capabilities — not yet released$t$
      AND status = 'published'
      AND sort_order = 90
  ) THEN
    RAISE EXCEPTION 'V3.1 reconciliation refused: planned-capabilities section missing';
  END IF;

  SELECT count(*) INTO n
  FROM public.project_sections
  WHERE project_id = privai_id AND status = 'published';
  IF n <> 9 THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: PrivAI published section count is %',
      n;
  END IF;

  UPDATE public.home_page
  SET project_body = $t$A non-production Shadow AI governance MVP I designed and developed that turns risky employee AI use into structured privacy-risk triage, human review, and auditable remediation. Validated Northwestern MSIS capstone MVP; production-oriented re-engineering in progress.$t$
  WHERE
    id = home_id
    AND singleton_key = 'default'
    AND status = 'published'
    AND project_body = $t$A non-production Shadow AI governance MVP I designed and developed that turns risky employee AI use into structured privacy-risk triage, human review, and auditable remediation.$t$;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: Home PrivAI current-state update matched % rows',
      updated_count;
  END IF;

  UPDATE public.about_page_paragraphs
  SET body = $t$I earned a Northwestern MSIS (Security Specialization) and designed and developed PrivAI Guard, a non-production Shadow AI governance capstone MVP that is now being re-engineered toward a production release. That combination of security education and applied development is how I keep cybersecurity, GRC, privacy, and AI-governance work technically current.$t$
  WHERE
    id = about_privai_paragraph_id
    AND about_page_id = about_id
    AND body = $t$I earned a Northwestern MSIS (Security Specialization) and designed PrivAI Guard, a non-production Shadow AI governance capstone. That combination of security education and applied development is how I keep cybersecurity, GRC, privacy, and AI-governance work technically current.$t$;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: About PrivAI paragraph update matched % rows',
      updated_count;
  END IF;

  -- ---------------------------------------------------------------------------
  -- 4. Privacy terminology on live Focus / Resume-track copy
  -- ---------------------------------------------------------------------------
  UPDATE public.focus_pages
  SET
    summary = $t$Privacy operations, data protection, and AI-governance work emphasizing privacy-risk assessment, Privacy by Design and by Default, and incident process, with current applied evidence through human-reviewed Shadow AI review.$t$,
    competencies = ARRAY[
      'Privacy operations',
      'Privacy-risk assessment',
      'Privacy by Design and by Default',
      'Data protection and compliance',
      'Incident and remediation process',
      'AI governance',
      'Human-reviewed responsible-AI controls'
    ]
  WHERE
    id = privacy_focus_id
    AND slug = 'privacy-ai-governance'
    AND status = 'published'
    AND summary = $t$Privacy operations, data protection, and AI-governance work emphasizing privacy-risk assessment, privacy by design, and incident process, with current applied evidence through human-reviewed Shadow AI review.$t$;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: privacy Focus terminology update matched % rows',
      updated_count;
  END IF;

  UPDATE public.resume_tracks
  SET summary = $t$Privacy operations, data protection, and AI-governance work emphasizing privacy-risk assessment, Privacy by Design and by Default, and incident process, with current applied evidence through human-reviewed Shadow AI review.$t$
  WHERE
    id = privacy_track_id
    AND slug = 'privacy-ai-governance'
    AND status = 'published'
    AND summary = $t$Privacy operations, data protection, and AI-governance work emphasizing privacy-risk assessment, privacy by design, and incident process, with current applied evidence through human-reviewed Shadow AI review.$t$;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: privacy resume-track terminology update matched % rows',
      updated_count;
  END IF;

  -- ---------------------------------------------------------------------------
  -- 5. Footer / site_profile headline
  -- ---------------------------------------------------------------------------
  UPDATE public.site_profile
  SET headline = $t$Cybersecurity, GRC, IT risk, data privacy, and AI governance practitioner.$t$
  WHERE
    id = site_profile_id
    AND singleton_key = 'default'
    AND status = 'published'
    AND headline = $t$Cybersecurity, GRC, IT risk, and privacy professional.$t$;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'V3.1 reconciliation refused: site_profile headline update matched % rows',
      updated_count;
  END IF;

  -- ---------------------------------------------------------------------------
  -- Assertions: IDs, publication, relationships, and invariants preserved
  -- ---------------------------------------------------------------------------
  IF (
    SELECT count(*) FROM public.experiences
    WHERE id IN (
      ram_id, npc_cito_id, npc_cmd_id, bankmer_ops_id,
      bankmer_counsel_id, bankmer_compliance_id, scionetrade_id
    )
      AND status = 'published'
  ) <> 7 THEN
    RAISE EXCEPTION 'V3.1 reconciliation refused: canonical experience IDs drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.experiences
    WHERE id = ram_id
      AND title = $t$Principal Consultant$t$
      AND title_secondary = $t$Independent Consulting Practice$t$
  ) OR NOT EXISTS (
    SELECT 1 FROM public.experiences
    WHERE id = npc_cito_id
      AND title = $t$Innovation and Transformation Consultant$t$
      AND title_secondary = $t$Designation: Chief Information Technology Officer$t$
  ) OR NOT EXISTS (
    SELECT 1 FROM public.experiences
    WHERE id = npc_cmd_id
      AND title = $t$Information Technology Officer III$t$
      AND title_secondary = $t$Designation: Chief, Compliance and Monitoring Division$t$
  ) OR NOT EXISTS (
    SELECT 1 FROM public.experiences
    WHERE id = bankmer_ops_id
      AND title = $t$Director of Operations$t$
      AND title_secondary = $t$Additional functions: Head, Legal and Compliance; Designated Data Protection Officer$t$
  ) OR NOT EXISTS (
    SELECT 1 FROM public.experiences
    WHERE id = bankmer_counsel_id
      AND title = $t$Corporate Counsel$t$
      AND title_secondary = $t$Additional functions: Facilities Manager; Head, Information Technology$t$
  ) OR NOT EXISTS (
    SELECT 1 FROM public.experiences
    WHERE id = scionetrade_id
      AND title = $t$Legal Officer$t$
      AND title_secondary = $t$Additional designation: Data Protection Officer · Contract / Project – Part-Time$t$
      AND date_precision = 'month'
      AND start_date = DATE '2018-07-01'
      AND end_date = DATE '2020-06-01'
  ) THEN
    RAISE EXCEPTION 'V3.1 reconciliation refused: canonical titles did not persist';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.experiences
    WHERE title IN (
      $t$Chief, Compliance and Monitoring Division$t$,
      $t$Director of Operations & Data Protection Officer$t$,
      $t$Corporate Counsel / Facilities Manager$t$,
      $t$Legal Consultant — Cybersecurity & Data Privacy Advisory$t$,
      $t$Chief Information Technology Officer & Innovation Consultant$t$
    )
  ) THEN
    RAISE EXCEPTION 'V3.1 reconciliation refused: obsolete primary titles remain';
  END IF;

  IF (
    SELECT count(*) FROM public.home_experience_items WHERE home_page_id = home_id
  ) <> 6 THEN
    RAISE EXCEPTION 'V3.1 reconciliation refused: Home experience relationships changed';
  END IF;

  IF (
    SELECT count(*) FROM public.focus_experience_items WHERE focus_page_id = cyber_focus_id
  ) <> 10
  OR (
    SELECT count(*) FROM public.focus_experience_items WHERE focus_page_id = privacy_focus_id
  ) <> 10 THEN
    RAISE EXCEPTION 'V3.1 reconciliation refused: Focus experience relationships changed';
  END IF;

  IF (
    SELECT count(*) FROM public.credentials
    WHERE status = 'published' AND needs_verification = false
  ) <> 9 THEN
    RAISE EXCEPTION 'V3.1 reconciliation refused: public credential eligibility drifted';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.credentials
    WHERE id = 'ddad349b-5faf-4f92-b12d-005ace591d4c'
      AND (status <> 'draft' OR needs_verification IS DISTINCT FROM true)
  ) THEN
    RAISE EXCEPTION 'V3.1 reconciliation refused: Google AI hold drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.credentials
    WHERE id = '4e1e053a-1363-45fb-96e9-7534a5989e51'
      AND status = 'published'
      AND details ILIKE '%does not imply U.S. bar admission%'
  ) THEN
    RAISE EXCEPTION 'V3.1 reconciliation refused: legal-license boundary drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.resume_page
    WHERE singleton_key = 'default'
      AND headline = $t$One professional record. Focused recruiter packets.$t$
  ) THEN
    RAISE EXCEPTION 'V3.1 reconciliation refused: Resume chrome drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.resume_tracks WHERE status = 'published'
  ) <> 2 THEN
    RAISE EXCEPTION 'V3.1 reconciliation refused: resume track count drifted';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.site_settings
    WHERE singleton_key = 'default' AND contact_form_enabled IS DISTINCT FROM false
  ) THEN
    RAISE EXCEPTION 'V3.1 reconciliation refused: contact form is not unpublished';
  END IF;

  IF (
    SELECT count(*) FROM public.project_media WHERE project_id = privai_id
  ) <> 5 THEN
    RAISE EXCEPTION 'V3.1 reconciliation refused: PrivAI media relationships changed';
  END IF;

  IF (
    SELECT count(*) FROM public.focus_pages WHERE status = 'published'
  ) <> 2
  OR EXISTS (
    SELECT 1 FROM public.focus_pages
    WHERE slug NOT IN ('cybersecurity-grc', 'privacy-ai-governance')
  ) THEN
    RAISE EXCEPTION 'V3.1 reconciliation refused: Focus tracks drifted';
  END IF;
END
$reconcile_v31$;
