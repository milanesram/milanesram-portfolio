-- Career Positioning 2.0 content cutover.
-- Resolves records by singleton, slug, page key, parent plus sort order,
-- and the audited pre-V4 text. Does not target mutable CMS child UUIDs.
-- Requires 20260925193000_add_home_hero_kicker.sql.
-- Does not add columns, change nullability, RLS, grants, storage policies,
-- auth, publication enums, focus slugs, or resume binary paths.
-- Does not relabel superseded V3.1 resume PDFs as V4.0.
-- Public resume delivery returns to request until verified V4.0 files exist.
-- hero_kicker stays nullable so an older app can still write home_page.

DO $positioning_v40$
DECLARE
  home_id uuid;
  about_id uuid;
  npc_cmd_id uuid;
  msis_id uuid;
  dbnms_id uuid;
  privai_id uuid;
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

  -- Resolve parents before any content write.
  SELECT count(*) INTO n
  FROM public.home_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: published home singleton matched % rows', n;
  END IF;
  SELECT id INTO STRICT home_id
  FROM public.home_page
  WHERE singleton_key = 'default' AND status = 'published';

  SELECT count(*) INTO n
  FROM public.about_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: published about singleton matched % rows', n;
  END IF;
  SELECT id INTO STRICT about_id
  FROM public.about_page
  WHERE singleton_key = 'default' AND status = 'published';

  SELECT count(*) INTO n
  FROM public.experiences
  WHERE status = 'published'
    AND organization = $t$National Privacy Commission$t$
    AND title = $t$Information Technology Officer III$t$
    AND title_secondary = $t$Designation: Chief, Compliance and Monitoring Division$t$;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: NPC compliance-monitoring role matched % rows', n;
  END IF;
  SELECT id INTO STRICT npc_cmd_id
  FROM public.experiences
  WHERE status = 'published'
    AND organization = $t$National Privacy Commission$t$
    AND title = $t$Information Technology Officer III$t$
    AND title_secondary = $t$Designation: Chief, Compliance and Monitoring Division$t$;

  SELECT count(*) INTO n
  FROM public.credentials
  WHERE status = 'published'
    AND needs_verification IS FALSE
    AND kind = 'degree'
    AND name = $t$Master of Science in Information Systems, Security Specialization$t$
    AND issuer = $t$Northwestern University$t$;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: Northwestern MSIS credential matched % rows', n;
  END IF;
  SELECT id INTO STRICT msis_id
  FROM public.credentials
  WHERE status = 'published'
    AND needs_verification IS FALSE
    AND kind = 'degree'
    AND name = $t$Master of Science in Information Systems, Security Specialization$t$
    AND issuer = $t$Northwestern University$t$;

  SELECT count(*) INTO n
  FROM public.projects
  WHERE slug = 'dbnms' AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: published DBNMS project matched % rows', n;
  END IF;
  SELECT id INTO STRICT dbnms_id
  FROM public.projects
  WHERE slug = 'dbnms' AND status = 'published';

  SELECT count(*) INTO n
  FROM public.projects
  WHERE slug = 'privai-guard' AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: published PrivAI project matched % rows', n;
  END IF;
  SELECT id INTO STRICT privai_id
  FROM public.projects
  WHERE slug = 'privai-guard' AND status = 'published';

  -- Pre-V4 semantic gate. Any mismatch aborts before the first content write.
  IF NOT EXISTS (
    SELECT 1 FROM public.home_page
    WHERE id = home_id
      AND hero_kicker IS NULL
      AND headline = $t$Cybersecurity, risk, and privacy work grounded in technical practice.$t$
  ) THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: home page is not in the audited pre-V4 state';
  END IF;

  IF (
    SELECT count(*) FROM public.home_page_chips WHERE home_page_id = home_id
  ) <> 5
  OR NOT EXISTS (SELECT 1 FROM public.home_page_chips WHERE home_page_id = home_id AND sort_order = 10 AND label = $t$Cybersecurity$t$)
  OR NOT EXISTS (SELECT 1 FROM public.home_page_chips WHERE home_page_id = home_id AND sort_order = 20 AND label = $t$GRC$t$)
  OR NOT EXISTS (SELECT 1 FROM public.home_page_chips WHERE home_page_id = home_id AND sort_order = 30 AND label = $t$IT Risk$t$)
  OR NOT EXISTS (SELECT 1 FROM public.home_page_chips WHERE home_page_id = home_id AND sort_order = 40 AND label = $t$Data Privacy$t$)
  OR NOT EXISTS (SELECT 1 FROM public.home_page_chips WHERE home_page_id = home_id AND sort_order = 50 AND label = $t$AI Governance$t$)
  THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: home chips are not in the audited pre-V4 state';
  END IF;

  IF (
    SELECT count(*) FROM public.home_proof_items WHERE home_page_id = home_id
  ) <> 4
  OR NOT EXISTS (
    SELECT 1 FROM public.home_proof_items
    WHERE home_page_id = home_id AND sort_order = 10
      AND label = $t$Northwestern MSIS$t$
      AND supporting = $t$Security Specialization$t$
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.home_proof_items
    WHERE home_page_id = home_id AND sort_order = 20
      AND label = $t$PrivAI Guard$t$
      AND supporting = $t$Shadow AI governance capstone$t$
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.home_proof_items
    WHERE home_page_id = home_id AND sort_order = 30
      AND label = $t$IAPP CIPM$t$
      AND supporting = $t$Privacy program management$t$
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.home_proof_items
    WHERE home_page_id = home_id AND sort_order = 40
      AND label = $t$ISC2 CC$t$
      AND supporting = $t$Certified in Cybersecurity$t$
  )
  THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: home proof items are not in the audited pre-V4 state';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.about_page
    WHERE id = about_id
      AND headline = $t$From privacy and governance work to cybersecurity and risk.$t$
  )
  OR (
    SELECT count(*) FROM public.about_page_paragraphs WHERE about_page_id = about_id
  ) <> 3
  OR NOT EXISTS (
    SELECT 1 FROM public.about_page_paragraphs
    WHERE about_page_id = about_id AND sort_order = 10 AND body = $t$My foundation is privacy regulation, governance, and risk work. I have consulted for regulated organizations and worked with the National Privacy Commission, the Philippines' national privacy regulator, on assessments, controls, compliance operations, and technology-security implementation.$t$
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.about_page_paragraphs
    WHERE about_page_id = about_id AND sort_order = 20 AND body = $t$Before that, I built an organization’s first privacy management program in a commercial setting and translated privacy, security, and compliance requirements into operating practice.$t$
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.about_page_paragraphs
    WHERE about_page_id = about_id AND sort_order = 30 AND body = $t$I earned a Northwestern MSIS (Security Specialization) and designed and developed PrivAI Guard, a non-production Shadow AI governance capstone MVP that is now being re-engineered toward a production release. That combination of security education and applied development is how I keep cybersecurity, GRC, privacy, and AI-governance work technically current.$t$
  )
  THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: about page is not in the audited pre-V4 state';
  END IF;

  IF (
    SELECT count(*) FROM public.focus_pages WHERE status = 'published'
  ) <> 2
  OR NOT EXISTS (
    SELECT 1 FROM public.focus_pages
    WHERE slug = 'cybersecurity-grc' AND status = 'published'
      AND nav_label = $t$Cybersecurity / GRC$t$
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.focus_pages
    WHERE slug = 'privacy-ai-governance' AND status = 'published'
      AND nav_label = $t$Privacy / AI Governance$t$
  )
  THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: focus pages are not in the audited pre-V4 state';
  END IF;

  IF (
    SELECT count(*) FROM public.resume_tracks WHERE status = 'published'
  ) <> 2
  OR NOT EXISTS (
    SELECT 1
    FROM public.resume_tracks t
    JOIN public.focus_pages f ON f.id = t.focus_page_id
    JOIN public.media_assets m ON m.id = t.media_asset_id
    WHERE t.slug = 'cybersecurity-grc'
      AND f.slug = 'cybersecurity-grc'
      AND t.status = 'published'
      AND t.delivery_mode = 'public_file'
      AND m.kind = 'resume_pdf'
      AND m.status = 'published'
      AND m.bucket_path NOT ILIKE '%v4%'
      AND m.title NOT ILIKE '%v4.0%'
  )
  OR NOT EXISTS (
    SELECT 1
    FROM public.resume_tracks t
    JOIN public.focus_pages f ON f.id = t.focus_page_id
    JOIN public.media_assets m ON m.id = t.media_asset_id
    WHERE t.slug = 'privacy-ai-governance'
      AND f.slug = 'privacy-ai-governance'
      AND t.status = 'published'
      AND t.delivery_mode = 'public_file'
      AND m.kind = 'resume_pdf'
      AND m.status = 'published'
      AND m.bucket_path NOT ILIKE '%v4%'
      AND m.title NOT ILIKE '%v4.0%'
  )
  THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: resume tracks are not in the audited pre-V4 state';
  END IF;

  SELECT count(*) INTO n
  FROM public.experience_items
  WHERE experience_id = npc_cmd_id
    AND status = 'published'
    AND body = $t$Led compliance monitoring, breach-notification processing, registration, compliance support, and regulatory reporting operations.$t$;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: generic NPC home bullet matched % rows', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.experience_items
  WHERE experience_id = npc_cmd_id
    AND status = 'published'
    AND body = $t$Raised 2021 compliance-check completions from a target of 350 personal information controllers to 685 PICs.$t$;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: 685 compliance metric matched % rows', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.home_experience_items AS link
  JOIN public.experience_items AS item ON item.id = link.experience_item_id
  WHERE link.home_page_id = home_id
    AND item.experience_id = npc_cmd_id
    AND item.status = 'published'
    AND item.body = $t$Led compliance monitoring, breach-notification processing, registration, compliance support, and regulatory reporting operations.$t$;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: home link to the generic NPC bullet matched % rows', n;
  END IF;

  IF (
    SELECT count(*) FROM public.home_experience_items WHERE home_page_id = home_id
  ) <> 6 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: home experience relationship count drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = privai_id
      AND limits = $t$Northwestern University MSIS capstone MVP. Non-production. Synthetic demonstration data only. Human governance review — not automated legal or regulatory decisioning.$t$
  ) THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: PrivAI limits are not in the audited pre-V4 state';
  END IF;

  SELECT count(*) INTO n
  FROM public.project_sections
  WHERE project_id = privai_id AND status = 'published';
  IF n <> 9 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: PrivAI published section count matched % rows', n;
  END IF;

  SELECT count(*) INTO n
  FROM public.project_sections
  WHERE project_id = privai_id
    AND status = 'published'
    AND heading = $t$MVP boundary$t$
    AND sort_order = 70
    AND body = $t$Implemented Capstone MVP: Northwestern University MSIS capstone. Working non-production MVP. Synthetic demonstration data only. Human governance review. Advisory internal-AI routing. Not enterprise production software, not a commercial multi-tenant SaaS product, and not Northwestern-owned or Northwestern-endorsed commercial software.$t$;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: PrivAI MVP boundary section matched % rows', n;
  END IF;

  SELECT count(*) INTO n FROM public.projects WHERE slug = 'npcrs' AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: published NPCRS project matched % rows', n;
  END IF;

  SELECT count(*) INTO n FROM public.projects WHERE slug = 'milanesram-portfolio' AND status = 'published';
  IF n > 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: published portfolio project matched % rows', n;
  END IF;

  IF (
    SELECT count(*) FROM public.site_profile WHERE singleton_key = 'default' AND status = 'published'
  ) <> 1
  OR (
    SELECT count(*) FROM public.experience_page WHERE singleton_key = 'default' AND status = 'published'
  ) <> 1
  OR (
    SELECT count(*) FROM public.projects_page WHERE singleton_key = 'default' AND status = 'published'
  ) <> 1
  OR (
    SELECT count(*) FROM public.writing_page WHERE singleton_key = 'default' AND status = 'published'
  ) <> 1
  OR (
    SELECT count(*) FROM public.credentials_page WHERE singleton_key = 'default' AND status = 'published'
  ) <> 1
  OR (
    SELECT count(*) FROM public.contact_page WHERE singleton_key = 'default' AND status = 'published'
  ) <> 1
  OR (
    SELECT count(*) FROM public.resume_page WHERE singleton_key = 'default' AND status = 'published'
  ) <> 1
  THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: a published page singleton is missing or duplicated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.site_profile
    WHERE singleton_key = 'default'
      AND status = 'published'
      AND length(btrim(public_email)) > 0
      AND linkedin_url ILIKE '%linkedin.com/in/milanesram%'
  ) THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: public contact channels are not intact';
  END IF;

  IF (
    SELECT count(*) FROM public.page_seo
    WHERE status = 'published'
      AND indexable IS TRUE
      AND page_key IN (
        'home', 'about', 'focus-cybersecurity-grc', 'focus-privacy-ai-governance',
        'experience', 'projects', 'writing', 'credentials', 'resume', 'contact'
      )
  ) <> 10
  OR EXISTS (
    SELECT 1 FROM public.page_seo
    WHERE status = 'published' AND indexable IS DISTINCT FROM true
  )
  THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: page indexability drifted';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.site_settings
    WHERE singleton_key = 'default' AND contact_form_enabled IS DISTINCT FROM false
  ) THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: contact form is not unpublished';
  END IF;

  IF (
    SELECT count(*) FROM public.credentials
    WHERE status = 'published'
      AND kind = 'license'
      AND name = $t$Licensed to Practice Law in the Philippines$t$
      AND details ILIKE '%does not imply U.S. bar admission%'
  ) <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: legal-license boundary drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.credentials
    WHERE name = $t$Google AI Professional Certificate$t$
      AND issuer = $t$Google$t$
      AND status = 'draft'
      AND needs_verification IS TRUE
  ) <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: Google AI hold drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.experiences
    WHERE status = 'published'
      AND organization = $t$RAM Privacy & Security$t$
      AND title = $t$Principal Consultant$t$
      AND title_secondary = $t$Independent Consulting Practice$t$
  ) <> 1
  OR (
    SELECT count(*) FROM public.experiences
    WHERE status = 'published'
      AND organization = $t$National Privacy Commission$t$
      AND title = $t$Innovation and Transformation Consultant$t$
      AND title_secondary = $t$Designation: Chief Information Technology Officer$t$
  ) <> 1
  OR (
    SELECT count(*) FROM public.experiences
    WHERE status = 'published'
      AND organization = $t$Bankmer Realty Corporation$t$
      AND title = $t$Director of Operations$t$
      AND title_secondary = $t$Additional functions: Head, Legal and Compliance; Designated Data Protection Officer$t$
  ) <> 1
  THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: official titles drifted';
  END IF;

  SELECT count(*) INTO n
  FROM pg_class c
  JOIN pg_namespace ns ON ns.oid = c.relnamespace
  WHERE ns.nspname = 'public'
    AND c.relname = 'home_page'
    AND c.relrowsecurity
    AND c.relforcerowsecurity;
  IF n <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: home_page row security is not forced';
  END IF;

  SELECT count(*) INTO n FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'home_page';
  IF n < 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: home_page policies missing';
  END IF;

  -- Content writes begin only after the pre-V4 gate above.
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
  WHERE id = home_id
    AND singleton_key = 'default'
    AND status = 'published'
    AND hero_kicker IS NULL;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: home_page update matched % rows', updated_count;
  END IF;

  UPDATE public.home_page_chips
  SET label = $t$Privacy Operations$t$
  WHERE home_page_id = home_id AND sort_order = 10 AND label = $t$Cybersecurity$t$;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: Privacy Operations chip matched % rows', updated_count;
  END IF;

  UPDATE public.home_page_chips
  SET label = $t$Security Compliance$t$
  WHERE home_page_id = home_id AND sort_order = 40 AND label = $t$Data Privacy$t$;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: Security Compliance chip matched % rows', updated_count;
  END IF;

  UPDATE public.home_page_chips
  SET label = $t$Risk & Control Assessment$t$
  WHERE home_page_id = home_id AND sort_order = 50 AND label = $t$AI Governance$t$;
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
  WHERE home_page_id = home_id
    AND sort_order = 10
    AND label = $t$Northwestern MSIS$t$;
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
  WHERE home_page_id = home_id
    AND sort_order = 20
    AND label = $t$PrivAI Guard$t$;
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
    project_id = dbnms_id
  WHERE home_page_id = home_id
    AND sort_order = 30
    AND label = $t$IAPP CIPM$t$;
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
  WHERE home_page_id = home_id
    AND sort_order = 40
    AND label = $t$ISC2 CC$t$;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: technical-deepening proof item matched % rows', updated_count;
  END IF;

  UPDATE public.home_experience_items AS link
  SET experience_item_id = metric.id
  FROM public.experience_items AS current_item,
       public.experience_items AS metric
  WHERE link.home_page_id = home_id
    AND link.experience_item_id = current_item.id
    AND current_item.experience_id = npc_cmd_id
    AND current_item.status = 'published'
    AND current_item.body = $t$Led compliance monitoring, breach-notification processing, registration, compliance support, and regulatory reporting operations.$t$
    AND metric.experience_id = npc_cmd_id
    AND metric.status = 'published'
    AND metric.body = $t$Raised 2021 compliance-check completions from a target of 350 personal information controllers to 685 PICs.$t$;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: home compliance-delivery bullet swap matched % rows', updated_count;
  END IF;

  UPDATE public.focus_pages
  SET
    nav_label = $t$GRC, IT Risk & Security Compliance$t$,
    headline = $t$GRC, IT Risk & Security Compliance$t$,
    summary = $t$Hands-on governance, risk, controls and assurance work spanning GRC, IT and technology risk, security compliance, risk and control assessment, audit readiness, remediation and stakeholder coordination.$t$,
    card_summary = $t$For GRC, IT risk, technology risk, security compliance, controls, assurance, audit readiness and remediation.$t$,
    card_chips = ARRAY['GRC', 'IT Risk', 'Security Compliance', 'Risk & Control Assessment'],
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
  WHERE slug = 'cybersecurity-grc'
    AND status = 'published'
    AND nav_label = $t$Cybersecurity / GRC$t$;
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
    card_chips = ARRAY['Privacy Operations', 'Privacy Compliance', 'Privacy Assurance', 'Remediation'],
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
  WHERE slug = 'privacy-ai-governance'
    AND status = 'published'
    AND nav_label = $t$Privacy / AI Governance$t$;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: privacy focus update matched % rows', updated_count;
  END IF;

  UPDATE public.about_page
  SET
    headline = $t$Privacy, compliance and information-security risk across operations, regulation and technology.$t$,
    lede = $t$I am a legally trained privacy, compliance and information-security risk professional and former privacy regulator. My work spans privacy operations, regulatory assurance, risk and control assessment, remediation, information security, technology governance and cross-functional implementation.$t$
  WHERE id = about_id
    AND singleton_key = 'default'
    AND status = 'published';
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: about_page update matched % rows', updated_count;
  END IF;

  UPDATE public.about_page_paragraphs
  SET body = $t$My career began in legal and compliance work, expanded into privacy operations and data protection, and then moved into regulatory assurance at the National Privacy Commission, where I worked across compliance monitoring, breach-notification workflows, privacy and security assessments, regulatory systems, remediation and technology modernization.$t$
  WHERE about_page_id = about_id AND sort_order = 10 AND body = $t$My foundation is privacy regulation, governance, and risk work. I have consulted for regulated organizations and worked with the National Privacy Commission, the Philippines' national privacy regulator, on assessments, controls, compliance operations, and technology-security implementation.$t$;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: about progression paragraph matched % rows', updated_count;
  END IF;

  UPDATE public.about_page_paragraphs
  SET body = $t$As that work became more technology-intensive, I deliberately deepened my cybersecurity and systems capability through Northwestern University's MS in Information Systems, Security Specialization, professional certifications and applied technical work. That technical development strengthens an established privacy, compliance and risk foundation rather than representing a career reset.$t$
  WHERE about_page_id = about_id AND sort_order = 20 AND body = $t$Before that, I built an organization’s first privacy management program in a commercial setting and translated privacy, security, and compliance requirements into operating practice.$t$;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: about deepening paragraph matched % rows', updated_count;
  END IF;

  UPDATE public.about_page_paragraphs
  SET body = $t$Applied technical work includes PrivAI Guard, a validated non-production Northwestern MSIS capstone MVP for privacy-risk triage, governance review, remediation, and audit evidence. Production-oriented re-engineering is in progress and is not represented here as released production software.$t$
  WHERE about_page_id = about_id AND sort_order = 30 AND body = $t$I earned a Northwestern MSIS (Security Specialization) and designed and developed PrivAI Guard, a non-production Shadow AI governance capstone MVP that is now being re-engineered toward a production release. That combination of security education and applied development is how I keep cybersecurity, GRC, privacy, and AI-governance work technically current.$t$;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: about PrivAI paragraph matched % rows', updated_count;
  END IF;

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

  UPDATE public.projects SET sort_order = 10 WHERE slug = 'privai-guard' AND status = 'published';
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: PrivAI sort update matched % rows', updated_count;
  END IF;

  UPDATE public.projects SET sort_order = 20 WHERE slug = 'dbnms' AND status = 'published';
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: DBNMS sort update matched % rows', updated_count;
  END IF;

  UPDATE public.projects SET sort_order = 30 WHERE slug = 'npcrs' AND status = 'published';
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: NPCRS sort update matched % rows', updated_count;
  END IF;

  UPDATE public.projects SET sort_order = 40
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

  UPDATE public.resume_tracks AS track
  SET
    title = $t$Resume A — GRC, IT Risk & Security Compliance$t$,
    summary = $t$For GRC, IT risk, technology risk, security compliance, controls, assurance, TPRM, audit readiness and remediation roles.$t$,
    delivery_mode = 'request',
    request_cta_label = $t$View this profile$t$
  FROM public.focus_pages AS focus
  WHERE track.focus_page_id = focus.id
    AND track.slug = 'cybersecurity-grc'
    AND focus.slug = 'cybersecurity-grc'
    AND track.status = 'published'
    AND track.delivery_mode = 'public_file';
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: Resume A track update matched % rows', updated_count;
  END IF;

  UPDATE public.resume_tracks AS track
  SET
    title = $t$Resume B — Privacy, Compliance & Assurance$t$,
    summary = $t$For privacy operations, data protection, privacy compliance and assurance, privacy risk, breach and incident governance, privacy technology and related governance roles.$t$,
    delivery_mode = 'request',
    request_cta_label = $t$View this profile$t$
  FROM public.focus_pages AS focus
  WHERE track.focus_page_id = focus.id
    AND track.slug = 'privacy-ai-governance'
    AND focus.slug = 'privacy-ai-governance'
    AND track.status = 'published'
    AND track.delivery_mode = 'public_file';
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: Resume B track update matched % rows', updated_count;
  END IF;

  UPDATE public.site_profile
  SET
    headline = $t$Privacy, Compliance & Information Security Risk Professional$t$,
    summary = $t$I help organizations turn regulatory, privacy, cybersecurity, and technology-risk requirements into workable controls, operating processes, remediation, and auditable evidence.$t$
  WHERE singleton_key = 'default' AND status = 'published';
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: site_profile update matched % rows', updated_count;
  END IF;

  UPDATE public.projects
  SET limits = $t$Validated Northwestern MSIS capstone MVP. Production-oriented re-engineering is in progress. Non-production. Synthetic demonstration data only. Human governance review — not automated legal or regulatory decisioning.$t$
  WHERE id = privai_id AND slug = 'privai-guard' AND status = 'published';
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: PrivAI limits update matched % rows', updated_count;
  END IF;

  UPDATE public.project_sections
  SET body = $t$Validated Northwestern MSIS capstone MVP. Production-oriented re-engineering is in progress. Public capability claims and screenshots on this page describe the validated capstone MVP unless explicitly identified otherwise. Implemented capstone MVP: working non-production MVP. Synthetic demonstration data only. Human governance review. Advisory internal-AI routing. No automated legal or regulatory decisioning. Not enterprise production software, not a commercial multi-tenant SaaS product, and not Northwestern-owned or Northwestern-endorsed commercial software.$t$
  WHERE project_id = privai_id
    AND heading = $t$MVP boundary$t$
    AND sort_order = 70
    AND status = 'published';
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count <> 1 THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: PrivAI boundary section matched % rows', updated_count;
  END IF;

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

  -- Final state.
  IF NOT EXISTS (
    SELECT 1 FROM public.home_page_chips WHERE home_page_id = home_id AND sort_order = 10 AND label = $t$Privacy Operations$t$
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.home_page_chips WHERE home_page_id = home_id AND sort_order = 20 AND label = $t$GRC$t$
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.home_page_chips WHERE home_page_id = home_id AND sort_order = 30 AND label = $t$IT Risk$t$
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.home_page_chips WHERE home_page_id = home_id AND sort_order = 40 AND label = $t$Security Compliance$t$
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.home_page_chips WHERE home_page_id = home_id AND sort_order = 50 AND label = $t$Risk & Control Assessment$t$
  )
  THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: final home chips drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.home_proof_items
    WHERE home_page_id = home_id AND sort_order = 10
      AND label = $t$Former Privacy Regulator$t$
      AND credential_id IS NULL AND project_id IS NULL
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.home_proof_items
    WHERE home_page_id = home_id AND sort_order = 20
      AND label = $t$Compliance & Assurance Delivery$t$
      AND credential_id IS NULL AND project_id IS NULL
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.home_proof_items
    WHERE home_page_id = home_id AND sort_order = 30
      AND label = $t$Regulatory Systems$t$
      AND credential_id IS NULL AND project_id = dbnms_id
  )
  OR NOT EXISTS (
    SELECT 1 FROM public.home_proof_items
    WHERE home_page_id = home_id AND sort_order = 40
      AND label = $t$Technical Deepening$t$
      AND credential_id = msis_id AND project_id IS NULL
  )
  THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: final home proof drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.resume_tracks WHERE status = 'published' AND delivery_mode = 'request'
  ) <> 2
  OR EXISTS (
    SELECT 1 FROM public.resume_tracks t
    LEFT JOIN public.media_assets m ON m.id = t.media_asset_id
    WHERE t.status = 'published'
      AND (
        t.delivery_mode <> 'request'
        OR m.id IS NULL
        OR m.bucket_path ILIKE '%v4%'
        OR m.title ILIKE '%v4.0%'
      )
  )
  THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: a V3.1 resume binary was relabeled V4.0 or delivery is not request-only';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.site_settings
    WHERE singleton_key = 'default' AND contact_form_enabled IS DISTINCT FROM false
  ) THEN
    RAISE EXCEPTION 'Positioning v4.0 refused: contact form is not unpublished';
  END IF;
END
$positioning_v40$;
