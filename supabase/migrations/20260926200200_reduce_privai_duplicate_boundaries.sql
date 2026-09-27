-- V4-03D: shorten two repeated PrivAI boundary passages.
-- About no longer repeats the full project disclaimer.
-- The project limits field and the MVP boundary section stay intact.
-- Forward-only. Do not apply from the implementation candidate.

DO $privai_duplicate_copy$
DECLARE
  about_id uuid;
  n integer;
  limits_text text := $limits$Validated Northwestern MSIS capstone MVP. Production-oriented re-engineering is in progress. Non-production. Synthetic demonstration data only. Human governance review — not automated legal or regulatory decisioning.$limits$;
  about_before text := $about_before$Applied technical work includes PrivAI Guard, a validated non-production Northwestern MSIS capstone MVP for privacy-risk triage, governance review, remediation, and audit evidence. Production-oriented re-engineering is in progress and is not represented here as released production software.$about_before$;
  about_after text := $about_after$PrivAI Guard, developed as a Northwestern MSIS capstone MVP, reflects current hands-on work in privacy, governance, controls, and technical implementation.$about_after$;
  career_text text := $career$As that work became more technology-intensive, I deliberately deepened my cybersecurity and systems capability through Northwestern University's MS in Information Systems, Security Specialization, professional certifications and applied technical work. That technical development strengthens an established privacy, compliance and risk foundation.$career$;
  demonstrates_before text := $demonstrates_before$The work connects cybersecurity governance, Privacy by Design and by Default, AI governance, GRC and control implementation, IT and technology risk, role-aware authorization, system-of-record architecture, remediation workflows, and auditability to a working application. It is evidence of applied implementation — not a claim of enterprise-grade or production-ready platform status.$demonstrates_before$;
  demonstrates_after text := $demonstrates_after$The work connects cybersecurity governance, Privacy by Design and by Default, AI governance, GRC and control implementation, IT and technology risk, role-aware authorization, system-of-record architecture, remediation workflows, and auditability to a working application.$demonstrates_after$;
  mvp_boundary text := $mvp$Validated Northwestern MSIS capstone MVP. Production-oriented re-engineering is in progress. Public capability claims and screenshots on this page describe the validated capstone MVP unless explicitly identified otherwise. Implemented capstone MVP: working non-production MVP. Synthetic demonstration data only. Human governance review. Advisory internal-AI routing. No automated legal or regulatory decisioning. Not enterprise production software, not a commercial multi-tenant SaaS product, and not Northwestern-owned or Northwestern-endorsed commercial software.$mvp$;
  reengineering_before text := $re_before$The validated Northwestern MSIS capstone MVP remains the baseline demonstrated implementation described above. PrivAI Guard is now undergoing production-oriented re-engineering to expand policy and control coverage, operational adoption, human governance workflows, security and authorization controls, remediation, and auditable governance design.

This work is in progress. Capabilities under re-engineering are not represented here as released production functionality until they are implemented and validated.$re_before$;
  reengineering_after text := $re_after$PrivAI Guard is now undergoing production-oriented re-engineering to expand policy and control coverage, operational adoption, human governance workflows, security and authorization controls, remediation, and auditable governance design.

This work is in progress. Capabilities under re-engineering are not represented here as released production functionality until they are implemented and validated.$re_after$;
BEGIN
  SELECT count(*) INTO n
  FROM public.about_page
  WHERE singleton_key = 'default' AND status = 'published';
  IF n <> 1 THEN
    RAISE EXCEPTION
      'PrivAI copy refused: published About page matched % rows',
      n;
  END IF;

  SELECT id INTO STRICT about_id
  FROM public.about_page
  WHERE singleton_key = 'default' AND status = 'published';

  SELECT count(*) INTO n
  FROM public.about_page_paragraphs
  WHERE id = 'ea292368-6ed3-4a53-9014-c65c66288314'
    AND about_page_id = about_id
    AND sort_order = 20
    AND body = career_text;
  IF n <> 1 THEN
    RAISE EXCEPTION
      'PrivAI copy refused: continuous-career About paragraph drifted';
  END IF;

  UPDATE public.about_page_paragraphs
  SET body = about_after
  WHERE id = '147f3d60-ceea-4178-8b45-e56ea9ecdfc8'
    AND about_page_id = about_id
    AND sort_order = 30
    AND body = about_before;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION
      'PrivAI copy refused: About PrivAI paragraph did not match the expected duplicate';
  END IF;

  SELECT count(*) INTO n
  FROM public.projects
  WHERE id = '0002fb1b-5c40-41ea-98a9-e62de9dac37e'
    AND slug = 'privai-guard'
    AND limits = limits_text;
  IF n <> 1 THEN
    RAISE EXCEPTION
      'PrivAI copy refused: authoritative project limits drifted';
  END IF;

  SELECT count(*) INTO n
  FROM public.project_sections
  WHERE id = '92a1045c-ce22-4192-8b4c-730aef101112'
    AND project_id = '0002fb1b-5c40-41ea-98a9-e62de9dac37e'
    AND heading = 'MVP boundary'
    AND sort_order = 70
    AND status = 'published'
    AND body = mvp_boundary;
  IF n <> 1 THEN
    RAISE EXCEPTION
      'PrivAI copy refused: MVP boundary section drifted';
  END IF;

  UPDATE public.project_sections
  SET body = demonstrates_after
  WHERE id = '3851264c-6ca8-4f3a-9f5a-e5654a037bd2'
    AND project_id = '0002fb1b-5c40-41ea-98a9-e62de9dac37e'
    AND heading = 'What this project demonstrates'
    AND sort_order = 60
    AND body = demonstrates_before;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION
      'PrivAI copy refused: demonstration section did not match the expected duplicate';
  END IF;

  UPDATE public.project_sections
  SET body = reengineering_after
  WHERE id = 'c5213101-0000-4000-8000-000000000080'
    AND project_id = '0002fb1b-5c40-41ea-98a9-e62de9dac37e'
    AND heading = 'Current Development — Production-Oriented Re-engineering'
    AND sort_order = 80
    AND body = reengineering_before;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION
      'PrivAI copy refused: re-engineering section did not match the expected duplicate';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = '0002fb1b-5c40-41ea-98a9-e62de9dac37e'
      AND limits IS DISTINCT FROM limits_text
  ) OR EXISTS (
    SELECT 1 FROM public.project_sections
    WHERE id = '92a1045c-ce22-4192-8b4c-730aef101112'
      AND body IS DISTINCT FROM mvp_boundary
  ) OR EXISTS (
    SELECT 1 FROM public.about_page_paragraphs
    WHERE id = 'ea292368-6ed3-4a53-9014-c65c66288314'
      AND body IS DISTINCT FROM career_text
  ) THEN
    RAISE EXCEPTION
      'PrivAI copy refused: an authoritative boundary or career paragraph changed';
  END IF;
END
$privai_duplicate_copy$;
