-- Career Positioning 2.0 content cutover.
-- UUID-, singleton-, slug-, and page-key-bound content updates only.
-- Requires 20260925193000_add_home_hero_kicker.sql.
-- Does not add columns, change nullability, RLS, grants, storage policies,
-- auth, publication enums, focus slugs, or resume binary paths.
-- Does not relabel superseded V3.1 resume PDFs as V4.0.
-- Public resume delivery returns to request until verified V4.0 files exist.
-- hero_kicker stays nullable so the previously deployed app can still write
-- home_page without this column.

DO $positioning_v40$
DECLARE
  home_id constant uuid := 'c52b0001-0000-4000-8000-000000000001';
  about_id constant uuid := 'c52c0001-0000-4000-8000-000000000001';
  site_profile_id constant uuid := '7b916af9-2874-44a3-8629-24fb5627b072';
  cyber_focus_id constant uuid := '40170d44-acc6-4f1c-b6fd-a6fbee19c02a';
  privacy_focus_id constant uuid := '27236662-e48e-4b6f-a820-75cd321a7322';
  cyber_track_id constant uuid := 'c52a0001-0000-4000-8000-000000000011';
  privacy_track_id constant uuid := 'c52a0001-0000-4000-8000-000000000012';
  npc_cmd_id constant uuid := '6c629f63-627b-42db-afdf-78b4ead5901a';
  privai_id constant uuid := '0002fb1b-5c40-41ea-98a9-e62de9dac37e';
  privai_boundary_id constant uuid := '92a1045c-ce22-4192-8b4c-730aef101112';
  msis_id constant uuid := 'bda3ebf4-4601-4a34-bfe5-9bb5b595d599';
  resume_a_id constant uuid := 'bfa474f1-c193-4b29-8d6f-876d3799d164';
  resume_b_id constant uuid := '07f4993f-d385-4842-9909-f35d4f9be662';
  resume_a_path constant text :=
    'resume/bfa474f1-c193-4b29-8d6f-876d3799d164/ramilanes_resume_cybersecurity_grc.pdf';
  resume_b_path constant text :=
    'resume/07f4993f-d385-4842-9909-f35d4f9be662/ramilanes_resume_privacy_ai_governance.pdf';
  updated_count integer;
  n integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'home_page'
      AND column_name = 'hero_kicker'
      AND is_nullable = 'YES'
  ) THEN
    RAISE EXCEPTION
      'Positioning v4.0 refused: nullable home_page.hero_kicker is missing; apply the schema migration first';
  END IF;

  -- ---------------------------------------------------------------------------
  -- Home
  -- ---------------------------------------------------------------------------
  UPDATE public.home_page
  SET
    hero_kicker = $t$READY NOW. BUILT TO ADAPT.$t$,
    headline = $t$Privacy, Compliance & Information Security Risk Professional$t$,
    lede = $t$Former privacy regulator and legally trained, hands-on risk professional with experience across privacy operations, compliance, GRC, IT risk, security assurance, risk and control assessment, remediation, regulatory systems, and cross-functional technology implementation.$t$,
    primary_cta_label = $t$View experience$t$,
    primary_cta_href = $t$/experience$t$,
    secondary_cta_label = $t$Explore role focus$t$,
    secondary_cta_href = $t$/#role-focus$t$,
    project_kicker = $t$Applied implementation$t$,
    experience_kicker = $t$Professional evidence$t$,
    experience_heading = $t$Privacy, compliance and information-security risk in practice$t$,
    experience_lede = $t$Hands-on work across consulting, regulatory and commercial environments, spanning privacy operations, risk and control assessment, compliance monitoring, remediation, security governance and technology implementation.$t$,
    credentials_lede = $t$Formal credentials that support the professional record.$t$,
    focus_kicker = $t$Role focus$t$,
    focus_heading = $t$Two hiring lanes. One professional record.$t$,
    focus_lede = $t$Privacy, compliance and assurance, or GRC, IT risk and security compliance. Employers, dates, and the underlying record stay the same.$t$,
    closing_heading = $t$Ready now. Built to adapt.$t$,
    closing_body = $t$The underlying work is already familiar: privacy and compliance operations, risk and control assessment, remediation, governance, and implementation support.$t$
  WHERE
    id = home_id
    AND singleton_key = 'default'
    AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'Positioning v4.0 refused: home_page update matched % rows',
      updated_count;
  END IF;

  UPDATE public.home_page_chips
  SET label = $t$Privacy Operations$t$
  WHERE id = 'c52b0001-0000-4000-8000-000000000011'
    AND home_page_id = home_id
    AND sort_order = 10;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: Privacy Operations chip matched % rows', updated_count;
  END IF;

  UPDATE public.home_page_chips
  SET label = $t$Security Compliance$t$
  WHERE id = 'c52b0001-0000-4000-8000-000000000014'
    AND home_page_id = home_id
    AND sort_order = 40;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: Security Compliance chip matched % rows', updated_count;
  END IF;

  UPDATE public.home_page_chips
  SET label = $t$Risk & Control Assessment$t$
  WHERE id = 'c52b0001-0000-4000-8000-000000000015'
    AND home_page_id = home_id
    AND sort_order = 50;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: Risk & Control Assessment chip matched % rows', updated_count;
  END IF;

  UPDATE public.home_proof_items
  SET
    label = $t$Former Privacy Regulator$t$,
    supporting = $t$National Privacy Commission of the Philippines$t$,
    href = $t$/experience$t$,
    credential_id = NULL,
    project_id = NULL
  WHERE id = 'c52b0001-0000-4000-8000-000000000021'
    AND home_page_id = home_id
    AND sort_order = 10;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: regulator proof item matched % rows', updated_count;
  END IF;

  UPDATE public.home_proof_items
  SET
    label = $t$Compliance & Assurance Delivery$t$,
    supporting = $t$685 compliance checks completed against a 350 target in 2021$t$,
    href = $t$/experience$t$,
    credential_id = NULL,
    project_id = NULL
  WHERE id = 'c52b0001-0000-4000-8000-000000000022'
    AND home_page_id = home_id
    AND sort_order = 20;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: compliance proof item matched % rows', updated_count;
  END IF;

  UPDATE public.home_proof_items
  SET
    label = $t$Regulatory Systems$t$,
    supporting = $t$Led breach-notification and privacy-registration platform implementation$t$,
    href = $t$/projects$t$,
    credential_id = NULL,
    project_id = (
      SELECT id FROM public.projects
      WHERE slug = 'dbnms' AND status = 'published'
    )
  WHERE id = 'c52b0001-0000-4000-8000-000000000023'
    AND home_page_id = home_id
    AND sort_order = 30;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: regulatory-systems proof item matched % rows', updated_count;
  END IF;

  UPDATE public.home_proof_items
  SET
    label = $t$Technical Deepening$t$,
    supporting = $t$Northwestern MSIS · Security Specialization · CIPM · CC$t$,
    href = $t$/credentials$t$,
    credential_id = msis_id,
    project_id = NULL
  WHERE id = 'c52b0001-0000-4000-8000-000000000024'
    AND home_page_id = home_id
    AND sort_order = 40;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: technical-deepening proof item matched % rows', updated_count;
  END IF;

  UPDATE public.home_experience_items AS link
  SET experience_item_id = metric.id
  FROM public.experience_items AS current_item,
       public.experience_items AS metric
  WHERE
    link.home_page_id = home_id
    AND link.experience_item_id = current_item.id
    AND current_item.experience_id = npc_cmd_id
    AND current_item.status = 'published'
    AND current_item.body = $t$Led compliance monitoring, breach-notification processing, registration, compliance support, and regulatory reporting operations.$t$
    AND metric.experience_id = npc_cmd_id
    AND metric.status = 'published'
    AND metric.body = $t$Raised 2021 compliance-check completions from a target of 350 personal information controllers to 685 PICs.$t$;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION
      'Positioning v4.0 refused: home compliance-delivery bullet swap matched % rows',
      updated_count;
  END IF;

  -- ---------------------------------------------------------------------------
  -- Focus tracks: public labels only. Slugs stay.
  -- ---------------------------------------------------------------------------
  UPDATE public.focus_pages
  SET
    nav_label = $t$GRC, IT Risk & Security Compliance$t$,
    headline = $t$GRC, IT Risk & Security Compliance$t$,
    summary = $t$Hands-on governance, risk, controls and assurance work spanning GRC, IT and technology risk, security compliance, risk and control assessment, audit readiness, remediation and stakeholder coordination.$t$,
    card_summary = $t$For GRC, IT risk, technology risk, security compliance, controls, assurance, audit readiness and remediation.$t$,
    card_chips = ARRAY[
      'GRC',
      'IT Risk',
      'Security Compliance',
      'Risk & Control Assessment'
    ],
    competencies = ARRAY[
      'Governance, Risk & Compliance',
      'IT Risk',
      'Technology Risk',
      'Security Compliance',
      'Risk & Control Assessment',
      'Security Assurance',
      'Audit Readiness',
      'Remediation',
      'Third-Party Risk Management'
    ]
  WHERE
    id = cyber_focus_id
    AND slug = 'cybersecurity-grc'
    AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: GRC focus update matched % rows', updated_count;
  END IF;

  UPDATE public.focus_pages
  SET
    nav_label = $t$Privacy, Compliance & Assurance$t$,
    headline = $t$Privacy, Compliance & Assurance$t$,
    summary = $t$Hands-on privacy operations, privacy compliance and assurance work spanning data protection, privacy-risk assessment, breach and incident governance, Privacy by Design and by Default, remediation, data governance and cross-functional implementation.$t$,
    card_summary = $t$For privacy operations, privacy compliance and assurance, privacy risk, breach and incident governance, and remediation.$t$,
    card_chips = ARRAY[
      'Privacy Operations',
      'Privacy Compliance',
      'Privacy Assurance',
      'Remediation'
    ],
    competencies = ARRAY[
      'Privacy Operations',
      'Privacy Compliance',
      'Privacy Assurance',
      'Privacy Risk Assessment',
      'Data Protection',
      'Privacy Governance',
      'Breach & Incident Governance',
      'Privacy by Design and by Default',
      'Remediation'
    ]
  WHERE
    id = privacy_focus_id
    AND slug = 'privacy-ai-governance'
    AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: privacy focus update matched % rows', updated_count;
  END IF;

  -- ---------------------------------------------------------------------------
  -- About
  -- ---------------------------------------------------------------------------
  UPDATE public.about_page
  SET
    headline = $t$Privacy, compliance and information-security risk across operations, regulation and technology.$t$,
    lede = $t$I am a legally trained privacy, compliance and information-security risk professional and former privacy regulator. My work spans privacy operations, regulatory assurance, risk and control assessment, remediation, information security, technology governance and cross-functional implementation.$t$
  WHERE
    id = about_id
    AND singleton_key = 'default'
    AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: about_page update matched % rows', updated_count;
  END IF;

  UPDATE public.about_page_paragraphs
  SET body = $t$My career began in legal and compliance work, expanded into privacy operations and data protection, and then moved into regulatory assurance at the National Privacy Commission, where I worked across compliance monitoring, breach-notification workflows, privacy and security assessments, regulatory systems, remediation and technology modernization.$t$
  WHERE
    id = 'c52c0001-0000-4000-8000-000000000011'
    AND about_page_id = about_id
    AND sort_order = 10;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: about progression paragraph matched % rows', updated_count;
  END IF;

  UPDATE public.about_page_paragraphs
  SET body = $t$As that work became more technology-intensive, I deliberately deepened my cybersecurity and systems capability through Northwestern University's MS in Information Systems, Security Specialization, professional certifications and applied technical work. That technical development strengthens an established privacy, compliance and risk foundation rather than representing a career reset.$t$
  WHERE
    id = 'c52c0001-0000-4000-8000-000000000012'
    AND about_page_id = about_id
    AND sort_order = 20;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: about deepening paragraph matched % rows', updated_count;
  END IF;

  UPDATE public.about_page_paragraphs
  SET body = $t$Applied technical work includes PrivAI Guard, a validated non-production Northwestern MSIS capstone MVP for privacy-risk triage, governance review, remediation, and audit evidence. Production-oriented re-engineering is in progress and is not represented here as released production software.$t$
  WHERE
    id = 'c52c0001-0000-4000-8000-000000000013'
    AND about_page_id = about_id
    AND sort_order = 30;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: about PrivAI paragraph matched % rows', updated_count;
  END IF;

  -- ---------------------------------------------------------------------------
  -- Experience, projects, writing, credentials, contact chrome
  -- ---------------------------------------------------------------------------
  UPDATE public.experience_page
  SET
    headline = $t$Privacy, compliance and information-security risk in practice.$t$,
    lede = $t$Assessment, controls, privacy and compliance operations, remediation, regulatory systems and technology-risk work across consulting, regulatory and commercial environments. Consulting and National Privacy Commission work overlapped from October 2024.$t$
  WHERE singleton_key = 'default' AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: experience_page update matched % rows', updated_count;
  END IF;

  UPDATE public.projects_page
  SET
    headline = $t$Selected implementation evidence$t$,
    lede = $t$Applied technical and regulatory-system work showing how privacy, risk and governance requirements can become operating workflows, controls, remediation and auditable evidence.$t$
  WHERE singleton_key = 'default' AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: projects_page update matched % rows', updated_count;
  END IF;

  UPDATE public.projects
  SET sort_order = 10
  WHERE slug = 'privai-guard' AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: PrivAI sort update matched % rows', updated_count;
  END IF;

  UPDATE public.projects
  SET sort_order = 20
  WHERE slug = 'dbnms' AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: DBNMS sort update matched % rows', updated_count;
  END IF;

  UPDATE public.projects
  SET sort_order = 30
  WHERE slug = 'npcrs' AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: NPCRS sort update matched % rows', updated_count;
  END IF;

  UPDATE public.projects
  SET sort_order = 40
  WHERE slug = 'milanesram-portfolio' AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count > 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: portfolio project sort matched % rows', updated_count;
  END IF;

  UPDATE public.writing_page
  SET lede = $t$Selected professional writing across privacy, compliance, GRC, IT risk, cybersecurity governance and responsible AI — applied analysis, policy and research already on the record.$t$
  WHERE singleton_key = 'default' AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: writing_page update matched % rows', updated_count;
  END IF;

  UPDATE public.credentials_page
  SET lede = $t$Selected verified credentials supporting an established privacy, compliance, and information-security risk record. Philippine legal licensure is listed separately and is not U.S. bar admission.$t$
  WHERE singleton_key = 'default' AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: credentials_page update matched % rows', updated_count;
  END IF;

  UPDATE public.contact_page
  SET
    headline = $t$Start a professional conversation$t$,
    lede = $t$Recruiters, hiring teams and professional contacts can reach me by email or LinkedIn regarding hands-on privacy, GRC, IT risk, security compliance, assurance and related technology-risk work.$t$
  WHERE singleton_key = 'default' AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: contact_page update matched % rows', updated_count;
  END IF;

  -- ---------------------------------------------------------------------------
  -- Resume chrome. Two tracks only. V3.1 PDFs stay attached but are not
  -- offered as the current public download.
  -- ---------------------------------------------------------------------------
  UPDATE public.resume_page
  SET
    kicker = $t$Resume options$t$,
    headline = $t$One professional record. Two role-aligned resumes.$t$,
    lede = $t$Choose the version aligned with the dominant duties of the opportunity. Both resumes preserve the same factual employment record while emphasizing the evidence most relevant to the role.$t$,
    request_intro = $t$Request the relevant version$t$,
    request_footnote = $t$AI governance is used where it materially overlaps privacy, risk, controls, information security or responsible technology adoption; it is not maintained as a separate resume track. The comprehensive CV is private and is not published here.$t$,
    closing_heading = $t$Request a resume$t$,
    closing_lede = $t$Email or LinkedIn is the request path. Specify GRC, IT Risk & Security Compliance or Privacy, Compliance & Assurance.$t$
  WHERE singleton_key = 'default' AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: resume_page update matched % rows', updated_count;
  END IF;

  UPDATE public.resume_tracks
  SET
    title = $t$Resume A — GRC, IT Risk & Security Compliance$t$,
    summary = $t$For GRC, IT risk, technology risk, security compliance, controls, assurance, TPRM, audit readiness and remediation roles.$t$,
    delivery_mode = 'request',
    request_cta_label = $t$View this profile$t$
  WHERE
    id = cyber_track_id
    AND slug = 'cybersecurity-grc'
    AND focus_page_id = cyber_focus_id
    AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: Resume A track update matched % rows', updated_count;
  END IF;

  UPDATE public.resume_tracks
  SET
    title = $t$Resume B — Privacy, Compliance & Assurance$t$,
    summary = $t$For privacy operations, data protection, privacy compliance and assurance, privacy risk, breach and incident governance, privacy technology and related governance roles.$t$,
    delivery_mode = 'request',
    request_cta_label = $t$View this profile$t$
  WHERE
    id = privacy_track_id
    AND slug = 'privacy-ai-governance'
    AND focus_page_id = privacy_focus_id
    AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: Resume B track update matched % rows', updated_count;
  END IF;

  -- ---------------------------------------------------------------------------
  -- Site profile
  -- ---------------------------------------------------------------------------
  UPDATE public.site_profile
  SET
    headline = $t$Privacy, Compliance & Information Security Risk Professional$t$,
    summary = $t$I help organizations turn regulatory, privacy, cybersecurity, and technology-risk requirements into workable controls, operating processes, remediation, and auditable evidence.$t$
  WHERE
    id = site_profile_id
    AND singleton_key = 'default'
    AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: site_profile update matched % rows', updated_count;
  END IF;

  -- ---------------------------------------------------------------------------
  -- PrivAI Guard public status. Does not describe later production work.
  -- ---------------------------------------------------------------------------
  UPDATE public.projects
  SET limits = $t$Validated Northwestern MSIS capstone MVP. Production-oriented re-engineering is in progress. Non-production. Synthetic demonstration data only. Human governance review — not automated legal or regulatory decisioning.$t$
  WHERE
    id = privai_id
    AND slug = 'privai-guard'
    AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: PrivAI limits update matched % rows', updated_count;
  END IF;

  UPDATE public.project_sections
  SET body = $t$Validated Northwestern MSIS capstone MVP. Production-oriented re-engineering is in progress. Public capability claims and screenshots on this page describe the validated capstone MVP unless explicitly identified otherwise. Implemented capstone MVP: working non-production MVP. Synthetic demonstration data only. Human governance review. Advisory internal-AI routing. No automated legal or regulatory decisioning. Not enterprise production software, not a commercial multi-tenant SaaS product, and not Northwestern-owned or Northwestern-endorsed commercial software.$t$
  WHERE
    id = privai_boundary_id
    AND project_id = privai_id
    AND heading = $t$MVP boundary$t$
    AND status = 'published';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: PrivAI boundary section matched % rows', updated_count;
  END IF;

  -- ---------------------------------------------------------------------------
  -- SEO. Indexability is preserved.
  -- ---------------------------------------------------------------------------
  UPDATE public.page_seo
  SET
    title = $t$Rainier (Ram) Milanes | Privacy, Compliance, GRC & IT Risk$t$,
    description = $t$Experienced privacy, compliance and information-security risk professional and former privacy regulator with hands-on work across privacy operations, GRC, IT risk, security compliance, assurance, remediation and technology implementation.$t$,
    og_title = $t$Rainier (Ram) Milanes | Privacy, Compliance, GRC & IT Risk$t$,
    og_description = $t$Experienced privacy, compliance and information-security risk professional and former privacy regulator with hands-on work across privacy operations, GRC, IT risk, security compliance, assurance, remediation and technology implementation.$t$
  WHERE page_key = 'home' AND status = 'published' AND indexable IS TRUE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: home SEO update matched % rows', updated_count;
  END IF;

  UPDATE public.page_seo
  SET
    title = $t$About | Privacy, Compliance & Information Security Risk$t$,
    description = $t$Legally trained privacy, compliance and information-security risk professional and former privacy regulator, with technical deepening through Northwestern MSIS.$t$,
    og_title = $t$About | Privacy, Compliance & Information Security Risk$t$,
    og_description = $t$Legally trained privacy, compliance and information-security risk professional and former privacy regulator, with technical deepening through Northwestern MSIS.$t$
  WHERE page_key = 'about' AND status = 'published' AND indexable IS TRUE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: about SEO update matched % rows', updated_count;
  END IF;

  UPDATE public.page_seo
  SET
    title = $t$GRC, IT Risk & Security Compliance | Ram Milanes$t$,
    description = $t$Hands-on GRC, IT risk, security compliance, risk and control assessment, audit readiness, remediation and assurance.$t$,
    og_title = $t$GRC, IT Risk & Security Compliance | Ram Milanes$t$,
    og_description = $t$Hands-on GRC, IT risk, security compliance, risk and control assessment, audit readiness, remediation and assurance.$t$
  WHERE page_key = 'focus-cybersecurity-grc' AND status = 'published' AND indexable IS TRUE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: GRC SEO update matched % rows', updated_count;
  END IF;

  UPDATE public.page_seo
  SET
    title = $t$Privacy, Compliance & Assurance | Ram Milanes$t$,
    description = $t$Hands-on privacy operations, privacy compliance and assurance, privacy risk, breach and incident governance, and remediation.$t$,
    og_title = $t$Privacy, Compliance & Assurance | Ram Milanes$t$,
    og_description = $t$Hands-on privacy operations, privacy compliance and assurance, privacy risk, breach and incident governance, and remediation.$t$
  WHERE page_key = 'focus-privacy-ai-governance' AND status = 'published' AND indexable IS TRUE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: privacy SEO update matched % rows', updated_count;
  END IF;

  UPDATE public.page_seo
  SET
    title = $t$Experience | Privacy, Compliance, GRC & IT Risk$t$,
    description = $t$Privacy, compliance and information-security risk work across consulting, regulatory and commercial environments.$t$,
    og_title = $t$Experience | Privacy, Compliance, GRC & IT Risk$t$,
    og_description = $t$Privacy, compliance and information-security risk work across consulting, regulatory and commercial environments.$t$
  WHERE page_key = 'experience' AND status = 'published' AND indexable IS TRUE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: experience SEO update matched % rows', updated_count;
  END IF;

  UPDATE public.page_seo
  SET
    title = $t$Projects | Governance, Risk & Technical Implementation$t$,
    description = $t$Selected implementation evidence across PrivAI Guard, national privacy regulatory systems, and a secure portfolio CMS.$t$,
    og_title = $t$Projects | Governance, Risk & Technical Implementation$t$,
    og_description = $t$Selected implementation evidence across PrivAI Guard, national privacy regulatory systems, and a secure portfolio CMS.$t$
  WHERE page_key = 'projects' AND status = 'published' AND indexable IS TRUE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: projects SEO update matched % rows', updated_count;
  END IF;

  UPDATE public.page_seo
  SET
    title = $t$Writing | Privacy, Compliance, GRC & IT Risk$t$,
    description = $t$Selected professional writing across privacy, compliance, GRC, IT risk, cybersecurity governance and responsible AI.$t$,
    og_title = $t$Writing | Privacy, Compliance, GRC & IT Risk$t$,
    og_description = $t$Selected professional writing across privacy, compliance, GRC, IT risk, cybersecurity governance and responsible AI.$t$
  WHERE page_key = 'writing' AND status = 'published' AND indexable IS TRUE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: writing SEO update matched % rows', updated_count;
  END IF;

  UPDATE public.page_seo
  SET
    title = $t$Credentials | Privacy, Compliance, GRC & IT Risk$t$,
    description = $t$Northwestern MSIS Security Specialization, CIPM, Certified in Cybersecurity, and related training. Philippine legal licensure is not U.S. bar admission.$t$,
    og_title = $t$Credentials | Privacy, Compliance, GRC & IT Risk$t$,
    og_description = $t$Northwestern MSIS Security Specialization, CIPM, Certified in Cybersecurity, and related training. Philippine legal licensure is not U.S. bar admission.$t$
  WHERE page_key = 'credentials' AND status = 'published' AND indexable IS TRUE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: credentials SEO update matched % rows', updated_count;
  END IF;

  UPDATE public.page_seo
  SET
    title = $t$Resume | Privacy, GRC & IT Risk$t$,
    description = $t$Two role-aligned resumes for one professional record: GRC, IT risk and security compliance, or privacy, compliance and assurance.$t$,
    og_title = $t$Resume | Privacy, GRC & IT Risk$t$,
    og_description = $t$Two role-aligned resumes for one professional record: GRC, IT risk and security compliance, or privacy, compliance and assurance.$t$
  WHERE page_key = 'resume' AND status = 'published' AND indexable IS TRUE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: resume SEO update matched % rows', updated_count;
  END IF;

  UPDATE public.page_seo
  SET
    title = $t$Contact | Privacy, Compliance, GRC & IT Risk$t$,
    description = $t$Email or LinkedIn for hands-on privacy, GRC, IT risk, security compliance, assurance and related technology-risk work.$t$,
    og_title = $t$Contact | Privacy, Compliance, GRC & IT Risk$t$,
    og_description = $t$Email or LinkedIn for hands-on privacy, GRC, IT risk, security compliance, assurance and related technology-risk work.$t$
  WHERE page_key = 'contact' AND status = 'published' AND indexable IS TRUE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: contact SEO update matched % rows', updated_count;
  END IF;

  -- ---------------------------------------------------------------------------
  -- Invariants
  -- ---------------------------------------------------------------------------
  IF (
    SELECT count(*) FROM public.home_page_chips WHERE home_page_id = home_id
  ) <> 5 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: home chip count drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.home_proof_items WHERE home_page_id = home_id
  ) <> 4 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: home proof count drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.home_experience_items WHERE home_page_id = home_id
  ) <> 6 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: home experience relationship count drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.focus_pages WHERE status = 'published'
  ) <> 2
  OR EXISTS (
    SELECT 1 FROM public.focus_pages
    WHERE slug NOT IN ('cybersecurity-grc', 'privacy-ai-governance')
  ) THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: focus slugs drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.resume_tracks WHERE status = 'published'
  ) <> 2
  OR EXISTS (
    SELECT 1 FROM public.resume_tracks
    WHERE status = 'published' AND delivery_mode <> 'request'
  ) THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: resume delivery is not request-only';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.media_assets
    WHERE id = resume_a_id
      AND bucket_path = resume_a_path
      AND kind = 'resume_pdf'
      AND status = 'published'
  ) OR NOT EXISTS (
    SELECT 1 FROM public.media_assets
    WHERE id = resume_b_id
      AND bucket_path = resume_b_path
      AND kind = 'resume_pdf'
      AND status = 'published'
  ) THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: existing resume binaries drifted';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.media_assets
    WHERE id IN (resume_a_id, resume_b_id)
      AND (
        title ILIKE '%V4.0%'
        OR title ILIKE '%v4.0%'
        OR bucket_path ILIKE '%v4%'
      )
  ) THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: a V3.1 resume binary was relabeled V4.0';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.resume_tracks
    WHERE id = cyber_track_id AND media_asset_id = resume_a_id
  ) OR NOT EXISTS (
    SELECT 1 FROM public.resume_tracks
    WHERE id = privacy_track_id AND media_asset_id = resume_b_id
  ) THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: resume media relationships drifted';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.site_settings
    WHERE singleton_key = 'default' AND contact_form_enabled IS DISTINCT FROM false
  ) THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: contact form is not unpublished';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.page_seo
    WHERE status = 'published' AND indexable IS DISTINCT FROM true
  ) THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: page indexability drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.credentials
    WHERE id = '4e1e053a-1363-45fb-96e9-7534a5989e51'
      AND status = 'published'
      AND details ILIKE '%does not imply U.S. bar admission%'
  ) THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: legal-license boundary drifted';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.credentials
    WHERE id = 'ddad349b-5faf-4f92-b12d-005ace591d4c'
      AND (status <> 'draft' OR needs_verification IS DISTINCT FROM true)
  ) THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: Google AI hold drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.experiences
    WHERE id = '982e5fae-ec27-49c5-9d7f-b88873bc33ec'
      AND title = $t$Principal Consultant$t$
      AND title_secondary = $t$Independent Consulting Practice$t$
  ) OR NOT EXISTS (
    SELECT 1 FROM public.experiences
    WHERE id = '99437e38-bd03-40be-af9c-f3a22b4a0261'
      AND title = $t$Innovation and Transformation Consultant$t$
      AND title_secondary = $t$Designation: Chief Information Technology Officer$t$
  ) OR NOT EXISTS (
    SELECT 1 FROM public.experiences
    WHERE id = npc_cmd_id
      AND title = $t$Information Technology Officer III$t$
      AND title_secondary = $t$Designation: Chief, Compliance and Monitoring Division$t$
  ) OR NOT EXISTS (
    SELECT 1 FROM public.experiences
    WHERE id = '65d6925a-0203-4947-b5e8-3f96a37e2705'
      AND title = $t$Director of Operations$t$
      AND title_secondary = $t$Additional functions: Head, Legal and Compliance; Designated Data Protection Officer$t$
  ) THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: official titles drifted';
  END IF;

  SELECT count(*) INTO n FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'home_page';
  IF n < 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: home_page policies missing';
  END IF;
END
$positioning_v40$;
