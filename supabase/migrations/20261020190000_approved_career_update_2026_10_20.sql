-- Approved career update, 20 October 2026.
-- Idempotent: each write accepts the previous public value or the approved value.
-- Published rows change as soon as this migration is applied. Resume files,
-- resume-track relationships, and resume-page copy are intentionally unchanged.
--
-- Restore the previous public values by reversing the assignments below.
-- Previous values:
--   site_profile.headline = Global Privacy, Compliance & Information Security Risk Professional
--   home headline/lede/CTAs/focus heading = the pre-update homepage copy
--   RAM title = Principal Consultant
--   Bankmer 2017 title = Director of Operations
--   Bankmer secondary = Additional functions: Head, Legal and Compliance; Designated Data Protection Officer
--   compliance item 307b8220 = Raised 2021 compliance-check completions from a target of 350 personal information controllers to 685 PICs.
--   systems item 701c906f = Led development and implementation of the Data Breach Notification Management System and the National Privacy Commission Registration System.
--   Northwestern title = Communications Chair, Data & Technology Student Leadership Council; is_current true; end_date null
--   Northwestern item f4710a1d = Coordinate technology-focused communications, stakeholder engagement, and responsible management of student information.
-- Delete inserted items a1e0c0de-2026-4a26-8a01-000000000001 through 000000000004
-- if they must be removed. Do not delete historical media.

DO $approved_career_update$
DECLARE
  n integer;
  current_text text;
  current_context text;
  ram_id uuid := '982e5fae-ec27-49c5-9d7f-b88873bc33ec';
  bankmer_id uuid := '65d6925a-0203-4947-b5e8-3f96a37e2705';
  npc_ito_id uuid := '6c629f63-627b-42db-afdf-78b4ead5901a';
  npc_consultant_id uuid := '99437e38-bd03-40be-af9c-f3a22b4a0261';
  counsel_id uuid := '58496f76-95f7-42a5-b620-44f7f020bf66';
  compliance_officer_id uuid := '6808bdfe-782c-4d20-b717-ee49827c3a4e';
  northwestern_id uuid := '76cab340-da39-4975-b061-5c65bb0c78ad';
  checks_id uuid := '307b8220-7b3d-4c7d-babc-2cb369e7b8e5';
  systems_id uuid := '701c906f-98a3-4992-b383-3a09bfe24785';
  nw_item_id uuid := 'f4710a1d-b8af-440a-b8cb-21d0889eb9f8';
  npc_assessment_id uuid := '24411fdd-9ebf-4e52-afd8-6d413688ff71';
  ai_item_id uuid := 'a1e0c0de-2026-4a26-8a01-000000000001';
  nw_staff_id uuid := 'a1e0c0de-2026-4a26-8a01-000000000002';
  nw_events_id uuid := 'a1e0c0de-2026-4a26-8a01-000000000003';
  iso_item_id uuid := 'a1e0c0de-2026-4a26-8a01-000000000004';
  origin_id uuid := 'b6d0a9f6-2893-4cde-80d1-8f98233246df';
  current_paragraph_id uuid := '147f3d60-ceea-4178-8b45-e56ea9ecdfc8';
  boundary_id uuid := 'bf971669-055b-4ebc-ba0c-e9ff04b5c168';
  proof_checks_id uuid := 'f176d6b0-9126-4f99-a515-5adcc1341035';
  proof_systems_id uuid := 'cc0f84ee-ea06-4840-b8f0-cb8f80c216b5';
  approved_headline text := $t$Privacy, Governance & Information Systems$t$;
  introduction text := $t$I’m Rainier (Ram) Milanes, a privacy professional, former Philippine privacy regulator, and Northwestern MSIS graduate. My career spans corporate legal and operational work, privacy programs, regulatory leadership, consulting, and technical implementation.$t$;
  career_scope text := $t$Corporate legal and operational work, privacy programs, regulatory leadership, consulting, technical implementation, and university service.$t$;
  cv_sentence text := $t$This site provides a concise career overview and selected supporting evidence. A detailed CV is available by request.$t$;
  checks_body text := $t$The division completed 641 compliance checks against a 2021 target of 350, approximately 83% above target.$t$;
  old_checks_body text := $t$Raised 2021 compliance-check completions from a target of 350 personal information controllers to 685 PICs.$t$;
  old_checks_context text := $t$2021 compliance-check completions rose from a target of 350 personal information controllers to 685 PICs.$t$;
  new_checks_context text := $t$2021 division result: 641 compliance checks completed against a target of 350, approximately 83% above target.$t$;
  systems_body text := $t$Sponsored the Data Breach Notification Management System and the NPC Registration System, coordinating planning and implementation.$t$;
  old_systems_body text := $t$Led development and implementation of the Data Breach Notification Management System and the National Privacy Commission Registration System.$t$;
  project_role text := $t$Sponsored the system, coordinating planning and implementation.$t$;
  old_project_role text := $t$Led planning, development, and implementation as project sponsor.$t$;
  privai_summary text := $t$Built a cloud-deployed privacy-risk triage application using Next.js, React, TypeScript and Supabase/PostgreSQL. Implemented role-based access control, PostgreSQL row-level security and audit logging, with risk scoring, human review and remediation evidence workflows.$t$;
  old_privai_summary text := $t$A cloud-deployed full-stack Shadow AI governance MVP that converts potentially risky AI use into structured risk assessment, governance review, remediation, and audit evidence.$t$;
  old_home_project_body text := $t$A Shadow AI governance MVP I designed and developed that turns risky employee AI use into structured privacy-risk triage, human review, and auditable remediation.$t$;
  ai_body text := $t$Completed an AI-governance engagement from February–August 2026, including client adoption and handover.$t$;
  nw_communications text := $t$Coordinate student and alumni communications, distribute event information through CRM workflows, and maintain student-database accuracy.$t$;
  old_nw_communications text := $t$Coordinate technology-focused communications, stakeholder engagement, and responsible management of student information.$t$;
  nw_staff text := $t$Collaborate with university staff and alumni advisors; provide on-site support for quarterly projects.$t$;
  nw_events text := $t$Represent the council at university events.$t$;
  iso_body text := $t$Internally designated ISO 9001 Internal Auditor. Applied internal-audit methods to compliance reviews and Commission quality-management work. This is an internal designation, not an external certification.$t$;
  old_origin text := $t$Early technical, administrative and operational work exposed me to systems, records, infrastructure and service delivery before corporate law, compliance and operational leadership. In 2017, as designated Data Protection Officer, that work expanded into a privacy manual, policy, management program and staff orientation.$t$;
  new_origin text := $t$Early technical, administrative and operational work exposed me to systems, records, infrastructure and service delivery before corporate law, compliance and operational leadership. In 2017, as Head of Legal, with an additional function as Data Protection Officer, that work expanded into a privacy manual, policy, management program and staff orientation.$t$;
  old_current text := $t$I later deepened the technical side through Northwestern University's MS in Information Systems, Security Specialization, and PrivAI Guard, a capstone MVP with production-oriented re-engineering. As Principal Consultant of RAM Privacy and Security, an independent privacy, cybersecurity and risk practice, I turn obligations and risk into controls, remediation and auditable evidence.$t$;
  new_current text := $t$I later deepened the technical side through Northwestern University's MS in Information Systems, Security Specialization, and PrivAI Guard, a capstone MVP with production-oriented re-engineering. As Independent Consultant of RAM Privacy and Security, an independent privacy, cybersecurity and risk practice, I turn obligations and risk into controls, remediation and auditable evidence.$t$;
  old_boundary text := $t$This site presents selected professional evidence, not a complete CV.$t$;
  credentials_lede text := $t$Selected verified credentials supporting the career record. Philippine legal licensure is listed separately and is not U.S. bar admission. Training includes ISO/IEC 27001 and ISO/IEC 27701 Lead Auditor training; the approved record does not name an issuing body or completion date. An NPC internal designation as ISO 9001 Internal Auditor is recorded with that Commission experience and is not an external certification.$t$;
  old_credentials_lede text := $t$Selected verified credentials supporting an established privacy, compliance, and information-security risk record. Philippine legal licensure is listed separately and is not U.S. bar admission.$t$;
BEGIN
  IF (SELECT contact_form_enabled FROM public.site_settings WHERE singleton_key = 'default') IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'career update refused: contact form enablement is not false';
  END IF;

  IF (SELECT site_indexable FROM public.site_settings WHERE singleton_key = 'default') IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'career update refused: production indexability changed';
  END IF;

  SELECT title INTO current_text
  FROM public.experiences
  WHERE id = ram_id
    AND organization = $t$RAM Privacy & Security$t$
    AND status = 'published';
  IF current_text IS NULL OR current_text NOT IN ($t$Principal Consultant$t$, $t$Independent Consultant$t$) THEN
    RAISE EXCEPTION 'career update refused: RAM title is %', coalesce(current_text, 'missing');
  END IF;

  UPDATE public.experiences
  SET title = $t$Independent Consultant$t$,
      title_secondary = NULL,
      summary = $t$Independent consulting on privacy, cybersecurity, and technology-risk assessments, controls, and implementation support.$t$,
      updated_at = now()
  WHERE id = ram_id
    AND (
      title IS DISTINCT FROM $t$Independent Consultant$t$
      OR title_secondary IS NOT NULL
      OR summary IS DISTINCT FROM $t$Independent consulting on privacy, cybersecurity, and technology-risk assessments, controls, and implementation support.$t$
    );

  SELECT title, title_secondary INTO current_text, current_context
  FROM public.experiences
  WHERE id = bankmer_id
    AND organization = $t$Bankmer Realty Corporation$t$
    AND status = 'published'
    AND start_date = DATE '2017-01-01';
  IF current_text IS NULL OR current_text NOT IN (
    $t$Director of Operations$t$,
    $t$Head of Legal$t$
  ) THEN
    RAISE EXCEPTION 'career update refused: Bankmer title is %', coalesce(current_text, 'missing');
  END IF;
  IF current_context IS NOT NULL AND current_context NOT IN (
    $t$Additional functions: Head, Legal and Compliance; Designated Data Protection Officer$t$,
    $t$Additional function: Data Protection Officer; also served as Director of Operations$t$
  ) THEN
    RAISE EXCEPTION 'career update refused: Bankmer secondary drifted';
  END IF;

  UPDATE public.experiences
  SET title = $t$Head of Legal$t$,
      title_secondary = $t$Additional function: Data Protection Officer; also served as Director of Operations$t$,
      summary = $t$Led legal and privacy-program work, including operational responsibility as Director of Operations and an additional function as Data Protection Officer.$t$,
      updated_at = now()
  WHERE id = bankmer_id;

  UPDATE public.experiences
  SET summary = $t$Reviewed Commission programs and translated privacy, security, and organizational risks into control requirements and implementation guidance.$t$,
      updated_at = now()
  WHERE id = npc_consultant_id
    AND organization = $t$National Privacy Commission$t$
    AND title = $t$Innovation and Transformation Consultant$t$
    AND status = 'published';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 AND (
    SELECT summary FROM public.experiences WHERE id = npc_consultant_id
  ) IS DISTINCT FROM $t$Reviewed Commission programs and translated privacy, security, and organizational risks into control requirements and implementation guidance.$t$ THEN
    RAISE EXCEPTION 'career update refused: NPC consulting role did not match';
  END IF;

  UPDATE public.experiences
  SET summary = $t$Led Compliance and Monitoring Division operations for compliance checks, breach-notification evaluation, registration, and regulatory reporting.$t$,
      updated_at = now()
  WHERE id = npc_ito_id
    AND organization = $t$National Privacy Commission$t$
    AND title = $t$Information Technology Officer III$t$
    AND title_secondary = $t$Designation: Chief, Compliance and Monitoring Division$t$
    AND status = 'published';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 AND (
    SELECT summary FROM public.experiences WHERE id = npc_ito_id
  ) IS DISTINCT FROM $t$Led Compliance and Monitoring Division operations for compliance checks, breach-notification evaluation, registration, and regulatory reporting.$t$ THEN
    RAISE EXCEPTION 'career update refused: NPC division role did not match';
  END IF;

  UPDATE public.experiences
  SET summary = $t$Counseled the company and coordinated facilities, information technology, records, and vendor work.$t$,
      updated_at = now()
  WHERE id = counsel_id
    AND title = $t$Corporate Counsel$t$
    AND title_secondary = $t$Additional functions: Facilities Manager; Head, Information Technology$t$
    AND status = 'published';

  UPDATE public.experiences
  SET summary = $t$Supported privacy and regulatory research, risk evaluation, and compliance implementation.$t$,
      updated_at = now()
  WHERE id = compliance_officer_id
    AND title = $t$Compliance Officer$t$
    AND status = 'published';

  SELECT title, is_current::text INTO current_text, current_context
  FROM public.experiences
  WHERE id = northwestern_id
    AND organization = $t$Northwestern University$t$
    AND status = 'published'
    AND kind = 'leadership'
    AND start_date = DATE '2026-01-01';
  IF current_text IS NULL OR current_text NOT IN (
    $t$Communications Chair, Data & Technology Student Leadership Council$t$,
    $t$Communications Chair$t$
  ) THEN
    RAISE EXCEPTION 'career update refused: Northwestern title is %', coalesce(current_text, 'missing');
  END IF;

  UPDATE public.experiences
  SET title = $t$Communications Chair$t$,
      title_secondary = $t$Volunteer, Data and Technology Student Leadership Council (two-year term)$t$,
      summary = $t$Appointed volunteer term through December 2027.$t$,
      end_date = DATE '2027-12-01',
      is_current = false,
      updated_at = now()
  WHERE id = northwestern_id;

  SELECT body, metric_context INTO current_text, current_context
  FROM public.experience_items
  WHERE id = checks_id
    AND experience_id = npc_ito_id
    AND is_metric IS TRUE
    AND status = 'published';
  IF current_text IS NULL OR current_text NOT IN (old_checks_body, checks_body) THEN
    RAISE EXCEPTION 'career update refused: compliance-check item drifted';
  END IF;
  IF current_context IS NOT NULL AND current_context NOT IN (old_checks_context, new_checks_context) THEN
    RAISE EXCEPTION 'career update refused: compliance-check context drifted';
  END IF;

  UPDATE public.experience_items
  SET body = checks_body,
      metric_context = new_checks_context,
      sort_order = 20,
      updated_at = now()
  WHERE id = checks_id;

  SELECT body INTO current_text
  FROM public.experience_items
  WHERE id = systems_id
    AND experience_id = npc_ito_id
    AND status = 'published';
  IF current_text IS NULL OR current_text NOT IN (old_systems_body, systems_body) THEN
    RAISE EXCEPTION 'career update refused: systems contribution drifted';
  END IF;

  UPDATE public.experience_items
  SET body = systems_body,
      sort_order = 15,
      updated_at = now()
  WHERE id = systems_id;

  UPDATE public.experience_items
  SET sort_order = 35,
      updated_at = now()
  WHERE id = npc_assessment_id
    AND experience_id = npc_ito_id
    AND body = $t$Conducted and oversaw privacy, security, technology, and compliance assessments across high-volume operational workflows.$t$
    AND sort_order IN (20, 35);
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'career update refused: NPC assessment item was not found for reordering';
  END IF;

  SELECT body INTO current_text
  FROM public.experience_items
  WHERE id = nw_item_id AND experience_id = northwestern_id AND status = 'published';
  IF current_text IS NULL OR current_text NOT IN (old_nw_communications, nw_communications) THEN
    RAISE EXCEPTION 'career update refused: Northwestern communications item drifted';
  END IF;
  UPDATE public.experience_items
  SET body = nw_communications, updated_at = now()
  WHERE id = nw_item_id AND body IS DISTINCT FROM nw_communications;

  IF NOT EXISTS (SELECT 1 FROM public.experience_items WHERE id = ai_item_id) THEN
    IF EXISTS (
      SELECT 1 FROM public.experience_items
      WHERE experience_id = ram_id AND body = ai_body
    ) THEN
      RAISE EXCEPTION 'career update refused: AI-governance item exists under another id';
    END IF;
    INSERT INTO public.experience_items (
      id, experience_id, body, track, is_metric, metric_context, status, sort_order
    ) VALUES (
      ai_item_id, ram_id, ai_body, 'all', false, NULL, 'published', 25
    );
  ELSIF EXISTS (
    SELECT 1 FROM public.experience_items
    WHERE id = ai_item_id AND (experience_id <> ram_id OR body <> ai_body)
  ) THEN
    RAISE EXCEPTION 'career update refused: AI-governance item id is already used';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.experience_items WHERE id = nw_staff_id) THEN
    IF EXISTS (SELECT 1 FROM public.experience_items WHERE experience_id = northwestern_id AND body = nw_staff) THEN
      RAISE EXCEPTION 'career update refused: Northwestern staff item exists under another id';
    END IF;
    INSERT INTO public.experience_items (
      id, experience_id, body, track, is_metric, metric_context, status, sort_order
    ) VALUES (
      nw_staff_id, northwestern_id, nw_staff, 'all', false, NULL, 'published', 20
    );
  ELSIF EXISTS (
    SELECT 1 FROM public.experience_items
    WHERE id = nw_staff_id AND (experience_id <> northwestern_id OR body <> nw_staff)
  ) THEN
    RAISE EXCEPTION 'career update refused: Northwestern staff item id is already used';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.experience_items WHERE id = nw_events_id) THEN
    IF EXISTS (SELECT 1 FROM public.experience_items WHERE experience_id = northwestern_id AND body = nw_events) THEN
      RAISE EXCEPTION 'career update refused: Northwestern events item exists under another id';
    END IF;
    INSERT INTO public.experience_items (
      id, experience_id, body, track, is_metric, metric_context, status, sort_order
    ) VALUES (
      nw_events_id, northwestern_id, nw_events, 'all', false, NULL, 'published', 30
    );
  ELSIF EXISTS (
    SELECT 1 FROM public.experience_items
    WHERE id = nw_events_id AND (experience_id <> northwestern_id OR body <> nw_events)
  ) THEN
    RAISE EXCEPTION 'career update refused: Northwestern events item id is already used';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.experience_items WHERE id = iso_item_id) THEN
    IF EXISTS (SELECT 1 FROM public.experience_items WHERE experience_id = npc_ito_id AND body = iso_body) THEN
      RAISE EXCEPTION 'career update refused: ISO 9001 item exists under another id';
    END IF;
    INSERT INTO public.experience_items (
      id, experience_id, body, track, is_metric, metric_context, status, sort_order
    ) VALUES (
      iso_item_id, npc_ito_id, iso_body, 'all', false, NULL, 'published', 110
    );
  ELSIF EXISTS (
    SELECT 1 FROM public.experience_items
    WHERE id = iso_item_id AND (experience_id <> npc_ito_id OR body <> iso_body)
  ) THEN
    RAISE EXCEPTION 'career update refused: ISO 9001 item id is already used';
  END IF;

  SELECT body INTO current_text FROM public.about_page_paragraphs WHERE id = origin_id;
  IF current_text IS NULL OR current_text NOT IN (old_origin, new_origin) THEN
    RAISE EXCEPTION 'career update refused: about origin paragraph drifted';
  END IF;
  UPDATE public.about_page_paragraphs SET body = new_origin, updated_at = now() WHERE id = origin_id;

  SELECT body INTO current_text FROM public.about_page_paragraphs WHERE id = current_paragraph_id;
  IF current_text IS NULL OR current_text NOT IN (old_current, new_current) THEN
    RAISE EXCEPTION 'career update refused: about consulting paragraph drifted';
  END IF;
  UPDATE public.about_page_paragraphs SET body = new_current, updated_at = now() WHERE id = current_paragraph_id;

  SELECT body INTO current_text
  FROM public.about_page_list_items
  WHERE id = boundary_id AND kind = 'boundary';
  IF current_text IS NULL OR current_text NOT IN (old_boundary, cv_sentence) THEN
    RAISE EXCEPTION 'career update refused: about boundary drifted';
  END IF;
  UPDATE public.about_page_list_items SET body = cv_sentence, updated_at = now() WHERE id = boundary_id;

  UPDATE public.about_page
  SET headline = $t$A record across legal work, privacy, regulation, consulting, and information systems.$t$,
      lede = cv_sentence,
      updated_at = now()
  WHERE singleton_key = 'default' AND status = 'published';

  UPDATE public.experience_page
  SET headline = $t$The career record$t$,
      lede = career_scope,
      additional_heading = $t$University service$t$,
      updated_at = now()
  WHERE singleton_key = 'default' AND status = 'published';

  UPDATE public.site_profile
  SET headline = approved_headline,
      updated_at = now()
  WHERE singleton_key = 'default' AND status = 'published';

  SELECT headline, project_body INTO current_text, current_context
  FROM public.home_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF current_text IS NULL OR current_text NOT IN (
    $t$Global Privacy, Compliance & Information Security Risk Professional$t$,
    approved_headline
  ) THEN
    RAISE EXCEPTION 'career update refused: home headline drifted';
  END IF;
  IF current_context IS NULL OR current_context NOT IN (old_home_project_body, privai_summary) THEN
    RAISE EXCEPTION 'career update refused: home project summary drifted';
  END IF;

  UPDATE public.home_page
  SET headline = approved_headline,
      lede = introduction,
      primary_cta_label = $t$Explore my career$t$,
      primary_cta_href = $t$/experience$t$,
      secondary_cta_label = $t$View projects$t$,
      secondary_cta_href = $t$/projects$t$,
      focus_heading = $t$Explore areas of my work.$t$,
      focus_lede = $t$These pages are optional ways to explore the same career record.$t$,
      experience_heading = $t$Selected experience$t$,
      experience_lede = $t$Roles across corporate legal and operational work, privacy programs, regulatory leadership, consulting, technical implementation, and university service.$t$,
      project_heading = $t$PrivAI Guard | Northwestern MSIS Capstone | 2026$t$,
      project_body = privai_summary,
      updated_at = now()
  WHERE singleton_key = 'default' AND status = 'published';

  SELECT supporting INTO current_text FROM public.home_proof_items WHERE id = proof_checks_id;
  IF current_text IS NULL OR current_text NOT IN (
    $t$685 compliance checks completed against a 350 target in 2021$t$,
    checks_body
  ) THEN
    RAISE EXCEPTION 'career update refused: proof-strip metric drifted';
  END IF;
  UPDATE public.home_proof_items
  SET supporting = checks_body
  WHERE id = proof_checks_id;

  SELECT supporting INTO current_text FROM public.home_proof_items WHERE id = proof_systems_id;
  IF current_text IS NULL OR current_text NOT IN (
    $t$Led breach-notification and privacy-registration platform implementation$t$,
    $t$Sponsored the breach-notification and registration systems, coordinating planning and implementation.$t$
  ) THEN
    RAISE EXCEPTION 'career update refused: proof-strip systems line drifted';
  END IF;
  UPDATE public.home_proof_items
  SET supporting = $t$Sponsored the breach-notification and registration systems, coordinating planning and implementation.$t$
  WHERE id = proof_systems_id;

  SELECT summary, tagline INTO current_text, current_context
  FROM public.projects
  WHERE slug = 'privai-guard' AND status = 'published';
  IF current_text IS NULL OR current_text NOT IN (old_privai_summary, privai_summary) THEN
    RAISE EXCEPTION 'career update refused: PrivAI Guard summary drifted';
  END IF;
  IF current_context IS NULL OR current_context NOT IN (
    $t$AI Governance, Privacy-Risk & Control Workflow Platform$t$,
    $t$Northwestern MSIS Capstone$t$
  ) THEN
    RAISE EXCEPTION 'career update refused: PrivAI Guard tagline drifted';
  END IF;

  UPDATE public.projects
  SET summary = privai_summary,
      tagline = $t$Northwestern MSIS Capstone$t$,
      updated_at = now()
  WHERE slug = 'privai-guard' AND status = 'published';

  UPDATE public.projects
  SET role = project_role, updated_at = now()
  WHERE slug IN ('dbnms', 'npcrs')
    AND status = 'published'
    AND role IN (old_project_role, project_role);
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 2 AND (
    SELECT count(*) FROM public.projects
    WHERE slug IN ('dbnms', 'npcrs') AND role = project_role AND status = 'published'
  ) <> 2 THEN
    RAISE EXCEPTION 'career update refused: DBNMS or NPCRS role drifted';
  END IF;

  SELECT lede INTO current_text FROM public.credentials_page WHERE singleton_key = 'default';
  IF current_text IS NULL OR current_text NOT IN (old_credentials_lede, credentials_lede) THEN
    RAISE EXCEPTION 'career update refused: credentials lede drifted';
  END IF;
  UPDATE public.credentials_page
  SET lede = credentials_lede, updated_at = now()
  WHERE singleton_key = 'default';

  UPDATE public.page_seo
  SET title = $t$Rainier (Ram) Milanes | Privacy, Governance & Information Systems$t$,
      description = introduction,
      og_title = $t$Rainier (Ram) Milanes | Privacy, Governance & Information Systems$t$,
      og_description = introduction,
      updated_at = now()
  WHERE page_key = 'home' AND status = 'published' AND indexable IS TRUE;

  UPDATE public.page_seo
  SET title = $t$About | Career Overview$t$,
      description = cv_sentence,
      og_title = $t$About | Career Overview$t$,
      og_description = cv_sentence,
      updated_at = now()
  WHERE page_key = 'about' AND status = 'published' AND indexable IS TRUE;

  UPDATE public.page_seo
  SET title = $t$Experience | Career Record$t$,
      description = career_scope,
      og_title = $t$Experience | Career Record$t$,
      og_description = career_scope,
      updated_at = now()
  WHERE page_key = 'experience' AND status = 'published' AND indexable IS TRUE;

  UPDATE public.page_seo
  SET title = $t$Credentials | Education, Training & Licensure$t$,
      description = $t$Northwestern MSIS, CIPM, Certified in Cybersecurity, and ISO/IEC 27001 and ISO/IEC 27701 Lead Auditor training. Philippine legal licensure is not U.S. bar admission. The NPC ISO 9001 Internal Auditor designation is internal experience, not an external certification.$t$,
      og_title = $t$Credentials | Education, Training & Licensure$t$,
      og_description = $t$Northwestern MSIS, CIPM, Certified in Cybersecurity, and ISO/IEC 27001 and ISO/IEC 27701 Lead Auditor training. Philippine legal licensure is not U.S. bar admission. The NPC ISO 9001 Internal Auditor designation is internal experience, not an external certification.$t$,
      updated_at = now()
  WHERE page_key = 'credentials' AND status = 'published' AND indexable IS TRUE;

  UPDATE public.page_seo
  SET title = $t$Projects | Governance, Systems & Technical Implementation$t$,
      description = $t$Selected evidence across PrivAI Guard, a Northwestern MSIS capstone, sponsored national privacy systems, and the portfolio CMS.$t$,
      og_title = $t$Projects | Governance, Systems & Technical Implementation$t$,
      og_description = $t$Selected evidence across PrivAI Guard, a Northwestern MSIS capstone, sponsored national privacy systems, and the portfolio CMS.$t$,
      updated_at = now()
  WHERE page_key = 'projects' AND status = 'published' AND indexable IS TRUE;

  IF EXISTS (
    SELECT 1 FROM public.experience_items
    WHERE body LIKE '%685%' OR coalesce(metric_context, '') LIKE '%685%'
  ) OR EXISTS (
    SELECT 1 FROM public.home_proof_items
    WHERE label LIKE '%685%' OR supporting LIKE '%685%'
  ) OR EXISTS (
    SELECT 1 FROM public.home_page
    WHERE headline LIKE '%685%' OR lede LIKE '%685%' OR project_body LIKE '%685%'
       OR focus_heading LIKE '%Two hiring lanes%'
  ) OR EXISTS (
    SELECT 1 FROM public.experiences
    WHERE title IN ($t$Principal Consultant$t$, $t$Director of Operations$t$)
      AND status = 'published'
  ) OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE slug IN ('dbnms', 'npcrs') AND role = old_project_role
  ) THEN
    RAISE EXCEPTION 'career update refused: an approved correction did not land';
  END IF;

  IF (SELECT contact_form_enabled FROM public.site_settings WHERE singleton_key = 'default') IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'career update refused: contact form changed during the update';
  END IF;
END
$approved_career_update$;
