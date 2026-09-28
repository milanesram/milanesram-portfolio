-- Step 8: consolidate repeated PrivAI Guard status language.
-- One primary non-production boundary remains on the project record.
-- Distinct overclaim fences and the re-engineering section stay in place.

DO $privai_scope$
DECLARE
  n integer;
  profile_headline text;
  home_headline text;
  privacy_sort integer;
  grc_sort integer;
  privacy_resume_sort integer;
  grc_resume_sort integer;
  form_enabled boolean;
  old_limits text := $t$Validated Northwestern MSIS capstone MVP. Production-oriented re-engineering is in progress. Non-production. Synthetic demonstration data only. Human governance review — not automated legal or regulatory decisioning.$t$;
  new_limits text := $t$Northwestern MSIS capstone — cloud-deployed non-production MVP. Synthetic demonstration data only. Human governance review — not automated legal or regulatory decisioning.$t$;
  old_boundary text := $t$Validated Northwestern MSIS capstone MVP. Production-oriented re-engineering is in progress. Public capability claims and screenshots on this page describe the validated capstone MVP unless explicitly identified otherwise. Implemented capstone MVP: working non-production MVP. Synthetic demonstration data only. Human governance review. Advisory internal-AI routing. No automated legal or regulatory decisioning. Not enterprise production software, not a commercial multi-tenant SaaS product, and not Northwestern-owned or Northwestern-endorsed commercial software.$t$;
  new_boundary text := $t$Not enterprise production software, a commercial multi-tenant SaaS product, or Northwestern-owned or Northwestern-endorsed commercial software.$t$;
  old_foundation text := $t$The frozen MVP uses a compact stack so architecture supports the workflow rather than becoming the story: Next.js, React, and TypeScript for role-aware interfaces; Supabase Auth and PostgreSQL with Row Level Security and controlled database functions for persistence and authorization; Vercel for non-production Preview hosting; and GitHub for source control and repository quality gates. GitHub Actions validates the repository; this case study does not claim that GitHub Actions deploys to Vercel.$t$;
  new_foundation text := $t$The frozen MVP uses a compact stack so architecture supports the workflow rather than becoming the story: Next.js, React, and TypeScript for role-aware interfaces; Supabase Auth and PostgreSQL with Row Level Security and controlled database functions for persistence and authorization; Vercel for cloud hosting; and GitHub for source control and repository quality gates. GitHub Actions validates the repository; this case study does not claim that GitHub Actions deploys to Vercel.$t$;
  old_home text := $t$A non-production Shadow AI governance MVP I designed and developed that turns risky employee AI use into structured privacy-risk triage, human review, and auditable remediation. Validated Northwestern MSIS capstone MVP; production-oriented re-engineering in progress.$t$;
  new_home text := $t$A Shadow AI governance MVP I designed and developed that turns risky employee AI use into structured privacy-risk triage, human review, and auditable remediation.$t$;
  reengineering text text := $t$PrivAI Guard is now undergoing production-oriented re-engineering to expand policy and control coverage, operational adoption, human governance workflows, security and authorization controls, remediation, and auditable governance design.

This work is in progress. Capabilities under re-engineering are not represented here as released production functionality until they are implemented and validated.$t$;
BEGIN
  SELECT headline INTO profile_headline
  FROM public.site_profile
  WHERE singleton_key = 'default' AND status = 'published';
  IF profile_headline IS DISTINCT FROM
    $t$Global Privacy, Compliance & Information Security Risk Professional$t$
  THEN
    RAISE EXCEPTION 'PrivAI scope refused: site profile headline drifted';
  END IF;

  SELECT headline INTO home_headline
  FROM public.home_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF home_headline IS DISTINCT FROM
    $t$Global Privacy, Compliance & Information Security Risk Professional$t$
  THEN
    RAISE EXCEPTION 'PrivAI scope refused: home headline drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.about_page_paragraphs
    WHERE id = 'b6d0a9f6-2893-4cde-80d1-8f98233246df'
      AND body LIKE $t$Early technical, administrative and operational work%$t$
  ) THEN
    RAISE EXCEPTION 'PrivAI scope refused: about narrative drifted';
  END IF;

  SELECT count(*) INTO n
  FROM public.experiences
  WHERE id = 'c52e0001-0000-4000-8000-000000000001'
    AND title = $t$Legal Consultant$t$
    AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION 'PrivAI scope refused: Scionetrade title drifted';
  END IF;

  SELECT sort_order INTO privacy_sort
  FROM public.focus_pages
  WHERE id = '27236662-e48e-4b6f-a820-75cd321a7322'
    AND slug = 'privacy-compliance-assurance'
    AND status = 'published';
  SELECT sort_order INTO grc_sort
  FROM public.focus_pages
  WHERE id = '40170d44-acc6-4f1c-b6fd-a6fbee19c02a'
    AND slug = 'cybersecurity-grc'
    AND status = 'published';
  IF privacy_sort IS DISTINCT FROM 10 OR grc_sort IS DISTINCT FROM 20 THEN
    RAISE EXCEPTION 'PrivAI scope refused: focus order or privacy slug drifted';
  END IF;

  SELECT sort_order INTO privacy_resume_sort
  FROM public.resume_tracks
  WHERE id = 'c52a0001-0000-4000-8000-000000000012'
    AND slug = 'privacy-ai-governance'
    AND status = 'published';
  SELECT sort_order INTO grc_resume_sort
  FROM public.resume_tracks
  WHERE id = 'c52a0001-0000-4000-8000-000000000011'
    AND slug = 'cybersecurity-grc'
    AND status = 'published';
  IF privacy_resume_sort IS DISTINCT FROM 10 OR grc_resume_sort IS DISTINCT FROM 20 THEN
    RAISE EXCEPTION 'PrivAI scope refused: resume order drifted';
  END IF;

  SELECT contact_form_enabled INTO form_enabled
  FROM public.site_settings
  WHERE singleton_key = 'default';
  IF form_enabled IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'PrivAI scope refused: structured inquiry flag drifted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = '0002fb1b-5c40-41ea-98a9-e62de9dac37e'
      AND slug = 'privai-guard'
      AND status = 'published'
      AND limits = old_limits
  ) OR NOT EXISTS (
    SELECT 1 FROM public.project_sections
    WHERE id = '92a1045c-ce22-4192-8b4c-730aef101112'
      AND project_id = '0002fb1b-5c40-41ea-98a9-e62de9dac37e'
      AND heading = 'MVP boundary'
      AND status = 'published'
      AND body = old_boundary
  ) OR NOT EXISTS (
    SELECT 1 FROM public.project_sections
    WHERE id = 'dd0747e7-1165-459f-af01-af46ffd1284e'
      AND project_id = '0002fb1b-5c40-41ea-98a9-e62de9dac37e'
      AND heading = 'Technical foundation'
      AND status = 'published'
      AND body = old_foundation
  ) OR NOT EXISTS (
    SELECT 1 FROM public.project_sections
    WHERE id = 'c5213101-0000-4000-8000-000000000080'
      AND heading = 'Current Development — Production-Oriented Re-engineering'
      AND status = 'published'
      AND body = reengineering_text
  ) OR NOT EXISTS (
    SELECT 1 FROM public.home_page
    WHERE singleton_key = 'default'
      AND status = 'published'
      AND project_body = old_home
  ) THEN
    RAISE EXCEPTION 'PrivAI scope refused: current PrivAI copy drifted';
  END IF;

  UPDATE public.projects
  SET limits = new_limits
  WHERE id = '0002fb1b-5c40-41ea-98a9-e62de9dac37e'
    AND limits = old_limits;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'PrivAI scope refused: limits update matched % rows', n;
  END IF;

  UPDATE public.project_sections
  SET body = new_boundary
  WHERE id = '92a1045c-ce22-4192-8b4c-730aef101112'
    AND body = old_boundary;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'PrivAI scope refused: boundary section matched % rows', n;
  END IF;

  UPDATE public.project_sections
  SET body = new_foundation
  WHERE id = 'dd0747e7-1165-459f-af01-af46ffd1284e'
    AND body = old_foundation;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'PrivAI scope refused: technical foundation matched % rows', n;
  END IF;

  UPDATE public.home_page
  SET project_body = new_home
  WHERE singleton_key = 'default'
    AND status = 'published'
    AND project_body = old_home;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'PrivAI scope refused: home PrivAI description matched % rows', n;
  END IF;
END
$privai_scope$;
