-- Step 51D: revise selected Experience bullets and PrivAI project
-- copy for employer-facing IC positioning.
-- UUID-bound UPDATEs only.
--
-- No INSERT, DELETE, UPSERT, schema, RLS, Storage, or other tables.
-- Home-selected Experience bullet strings are not modified.

DO $revise_exp_proj$
DECLARE
  item_updated integer;
  project_updated integer;
  section_updated integer;
  experience_item_count integer;
  project_count integer;
  section_count integer;
BEGIN
  UPDATE public.experience_items
  SET body = $t$Assess cybersecurity, privacy, and technology-risk issues for regulated and high-risk organizations and translate findings into governance, control, and remediation work.$t$
  WHERE
    id = '4fcf85b9-f34d-41c5-8ebd-ff37be9534ad'
    AND experience_id = '982e5fae-ec27-49c5-9d7f-b88873bc33ec'
    AND body = $t$Support regulated and high-risk organizations with cybersecurity, privacy, risk-management, and governance initiatives aligned with business and regulatory requirements.$t$;

  GET DIAGNOSTICS item_updated = ROW_COUNT;
  IF item_updated <> 1 THEN
    RAISE EXCEPTION
      'Step 51D refused: RAM first bullet update matched % rows',
      item_updated;
  END IF;

  UPDATE public.experience_items
  SET body = $t$Assessed cybersecurity, technology-risk, and information-security issues and advised on control implementation and critical-infrastructure protection.$t$
  WHERE
    id = 'de13800d-8099-439b-bb17-61fda528d371'
    AND experience_id = '99437e38-bd03-40be-af9c-f3a22b4a0261'
    AND body = $t$Advised executive leadership on cybersecurity strategy, technology risk, critical-infrastructure protection, information security, and security-control implementation.$t$;

  GET DIAGNOSTICS item_updated = ROW_COUNT;
  IF item_updated <> 1 THEN
    RAISE EXCEPTION
      'Step 51D refused: NPC consultant all-track bullet update matched % rows',
      item_updated;
  END IF;

  UPDATE public.experience_items
  SET body = $t$Assessed cybersecurity, privacy-compliance, and technology-risk issues and advised on control implementation and critical-infrastructure protection.$t$
  WHERE
    id = 'aaacc0e6-0fa8-4033-a04f-b96effc769f7'
    AND experience_id = '99437e38-bd03-40be-af9c-f3a22b4a0261'
    AND body = $t$Advised executive leadership on cybersecurity strategy, information security, privacy compliance, technology risk, critical-infrastructure protection, and security-control implementation.$t$;

  GET DIAGNOSTICS item_updated = ROW_COUNT;
  IF item_updated <> 1 THEN
    RAISE EXCEPTION
      'Step 51D refused: NPC consultant privacy bullet update matched % rows',
      item_updated;
  END IF;

  UPDATE public.experience_items
  SET body = $t$Conducted and oversaw privacy, security, technology, and compliance assessments across high-volume operational workflows.$t$
  WHERE
    id = '24411fdd-9ebf-4e52-afd8-6d413688ff71'
    AND experience_id = '6c629f63-627b-42db-afdf-78b4ead5901a'
    AND body = $t$Managed multidisciplinary teams and high-volume privacy, security, and compliance workflows; conducted and oversaw privacy, security, technology, and compliance assessments.$t$;

  GET DIAGNOSTICS item_updated = ROW_COUNT;
  IF item_updated <> 1 THEN
    RAISE EXCEPTION
      'Step 51D refused: NPC Chief assessment bullet update matched % rows',
      item_updated;
  END IF;

  UPDATE public.experience_items
  SET body = $t$Modernized records handling, infrastructure, and vendor oversight in support of operational and information-security practice.$t$
  WHERE
    id = '49363109-fb8d-4ee5-899c-19e286de7588'
    AND experience_id = '65d6925a-0203-4947-b5e8-3f96a37e2705'
    AND body = $t$Led modernization, records digitalization, infrastructure improvements, vendor management, and cross-functional operational initiatives.$t$;

  GET DIAGNOSTICS item_updated = ROW_COUNT;
  IF item_updated <> 1 THEN
    RAISE EXCEPTION
      'Step 51D refused: Bankmer DPO operations bullet update matched % rows',
      item_updated;
  END IF;

  UPDATE public.experience_items
  SET body = $t$Planned IT and information-security improvements and digitalized corporate records to protect confidential organizational information.$t$
  WHERE
    id = '570cc680-ea24-4c6c-a620-ac8787e26bfc'
    AND experience_id = '58496f76-95f7-42a5-b620-44f7f020bf66'
    AND body = $t$Directed IT planning, infrastructure modernization, information-security initiatives, and corporate-record digitalization to protect confidential organizational information.$t$;

  GET DIAGNOSTICS item_updated = ROW_COUNT;
  IF item_updated <> 1 THEN
    RAISE EXCEPTION
      'Step 51D refused: Bankmer counsel IT bullet update matched % rows',
      item_updated;
  END IF;

  UPDATE public.projects
  SET summary = $t$A cloud-deployed full-stack Shadow AI governance MVP that converts potentially risky AI use into structured risk assessment, governance review, remediation, and audit evidence.$t$
  WHERE
    id = '0002fb1b-5c40-41ea-98a9-e62de9dac37e'
    AND slug = 'privai-guard'
    AND status = 'published'
    AND summary = $t$A cloud-deployed full-stack Shadow AI governance MVP that converts potentially risky AI use into structured risk assessment, governance review, remediation, audit evidence, and executive visibility.$t$;

  GET DIAGNOSTICS project_updated = ROW_COUNT;
  IF project_updated <> 1 THEN
    RAISE EXCEPTION
      'Step 51D refused: PrivAI summary update matched % rows',
      project_updated;
  END IF;

  UPDATE public.project_sections
  SET body = $t$A reported use can be classified, scored, routed for human-reviewed internal-AI consideration, assigned remediation, and recorded as audit evidence. Reviewers — not the application — remain accountable for governance outcomes.$t$
  WHERE
    id = 'fc19f47d-e157-481d-81a1-fbe4a905511f'
    AND heading = 'Governance workflow'
    AND body = $t$A reported use can be classified, scored, routed for human-reviewed internal-AI consideration, assigned remediation, and recorded as audit evidence with executive visibility. Reviewers — not the application — remain accountable for governance outcomes.$t$;

  GET DIAGNOSTICS section_updated = ROW_COUNT;
  IF section_updated <> 1 THEN
    RAISE EXCEPTION
      'Step 51D refused: PrivAI workflow section update matched % rows',
      section_updated;
  END IF;

  SELECT count(*) INTO experience_item_count FROM public.experience_items;
  IF experience_item_count <> 26 THEN
    RAISE EXCEPTION
      'Step 51D assertion failed: experience_items count is %',
      experience_item_count;
  END IF;

  SELECT count(*) INTO project_count FROM public.projects;
  IF project_count <> 3 THEN
    RAISE EXCEPTION
      'Step 51D assertion failed: projects count is %',
      project_count;
  END IF;

  SELECT count(*) INTO section_count FROM public.project_sections;
  IF section_count <> 7 THEN
    RAISE EXCEPTION
      'Step 51D assertion failed: project_sections count is %',
      section_count;
  END IF;
END
$revise_exp_proj$;
