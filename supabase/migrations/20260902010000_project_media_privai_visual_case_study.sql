-- Step 52G: generic project-media relationships and PrivAI Guard
-- visual case-study seed. Does not alter DBNMS or NPCRS core rows.
-- Does not rewrite Home, Focus, Resume, Contact, or sitewide SEO.
-- Screenshot binaries are uploaded to public-media separately and must
-- match the byte sizes asserted below.

CREATE TYPE public.project_media_display_role AS ENUM (
  'hero',
  'workflow',
  'gallery'
);

CREATE TABLE public.project_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  media_asset_id uuid NOT NULL REFERENCES public.media_assets (id) ON DELETE RESTRICT,
  display_role public.project_media_display_role NOT NULL DEFAULT 'workflow',
  caption text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT project_media_unique UNIQUE (project_id, media_asset_id),
  CONSTRAINT project_media_sort_unique UNIQUE (project_id, sort_order),
  CONSTRAINT project_media_caption_not_blank CHECK (length(btrim(caption)) > 0),
  CONSTRAINT project_media_caption_length CHECK (char_length(caption) <= 400)
);

CREATE TRIGGER project_media_set_updated_at
  BEFORE UPDATE ON public.project_media
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

REVOKE ALL ON TABLE public.project_media FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.project_media TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.project_media TO authenticated;

ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media FORCE ROW LEVEL SECURITY;

CREATE POLICY project_media_select_published
  ON public.project_media
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = project_media.project_id
        AND p.status = 'published'
    )
    AND EXISTS (
      SELECT 1
      FROM public.media_assets ma
      WHERE ma.id = project_media.media_asset_id
        AND ma.status = 'published'
        AND ma.is_public = true
    )
  );

CREATE POLICY project_media_admin_all
  ON public.project_media
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DO $$
DECLARE
  privai_id constant uuid := '0002fb1b-5c40-41ea-98a9-e62de9dac37e';
  dbnms_id constant uuid := '5bdc43c9-91b6-44f0-b9f2-39200ab25be5';
  npcrs_id constant uuid := '48ec1f1e-9b66-49cd-a3c3-ba1f90793828';
  prompt_media constant uuid := '7c52e011-0000-4000-8000-000000000001';
  review_media constant uuid := '7c52e012-0000-4000-8000-000000000002';
  remediation_media constant uuid := '7c52e013-0000-4000-8000-000000000003';
  evidence_media constant uuid := '7c52e014-0000-4000-8000-000000000004';
  dashboard_media constant uuid := '7c52e015-0000-4000-8000-000000000005';
  n integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = privai_id
      AND slug = 'privai-guard'
      AND status = 'published'
  ) THEN
    RAISE EXCEPTION 'Step 52G refused: PrivAI Guard project missing';
  END IF;

  IF (
    SELECT count(*) FROM public.projects
    WHERE id IN (privai_id, dbnms_id, npcrs_id)
  ) <> 3 THEN
    RAISE EXCEPTION 'Step 52G refused: published project set drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.project_sections WHERE project_id = privai_id
  ) <> 7 THEN
    RAISE EXCEPTION 'Step 52G refused: PrivAI section count drifted';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.project_sections
    WHERE project_id IN (dbnms_id, npcrs_id)
  ) THEN
    RAISE EXCEPTION 'Step 52G refused: unexpected DBNMS/NPCRS sections';
  END IF;

  INSERT INTO public.media_assets (
    id,
    bucket_path,
    kind,
    purpose,
    title,
    alt_text,
    caption,
    credit,
    year_label,
    mime_type,
    byte_size,
    sort_order,
    is_public,
    status
  ) VALUES
    (
      prompt_media,
      'project/7c52e011-0000-4000-8000-000000000001/privai-guard-employee-safe-prompt.webp',
      'image',
      'project',
      'PrivAI Guard Safe Prompt Check',
      'PrivAI Guard employee Safe Prompt Check screen',
      NULL,
      NULL,
      NULL,
      'image/webp',
      30896,
      10,
      true,
      'published'
    ),
    (
      review_media,
      'project/7c52e012-0000-4000-8000-000000000002/privai-guard-governance-review.webp',
      'image',
      'project',
      'PrivAI Guard governance review',
      'PrivAI Guard governance review detail screen',
      NULL,
      NULL,
      NULL,
      'image/webp',
      32854,
      20,
      true,
      'published'
    ),
    (
      remediation_media,
      'project/7c52e013-0000-4000-8000-000000000003/privai-guard-remediation-tasks.webp',
      'image',
      'project',
      'PrivAI Guard remediation tasks',
      'PrivAI Guard remediation task screen',
      NULL,
      NULL,
      NULL,
      'image/webp',
      29966,
      30,
      true,
      'published'
    ),
    (
      evidence_media,
      'project/7c52e014-0000-4000-8000-000000000004/privai-guard-governance-evidence.webp',
      'image',
      'project',
      'PrivAI Guard governance evidence',
      'PrivAI Guard governance audit evidence screen',
      NULL,
      NULL,
      NULL,
      'image/webp',
      34198,
      40,
      true,
      'published'
    ),
    (
      dashboard_media,
      'project/7c52e015-0000-4000-8000-000000000005/privai-guard-management-dashboard.webp',
      'image',
      'project',
      'PrivAI Guard management dashboard',
      'PrivAI Guard governance dashboard',
      NULL,
      NULL,
      NULL,
      'image/webp',
      37804,
      50,
      true,
      'published'
    );

  INSERT INTO public.project_media (
    id,
    project_id,
    media_asset_id,
    display_role,
    caption,
    sort_order,
    status
  ) VALUES
    (
      '7c52e021-0000-4000-8000-000000000001',
      privai_id,
      prompt_media,
      'hero',
      'Employee Safe Prompt Check — evaluates proposed AI use before information is submitted to an AI tool.',
      10,
      'published'
    ),
    (
      '7c52e021-0000-4000-8000-000000000002',
      privai_id,
      review_media,
      'workflow',
      'Governance review — brings risk, tool context, data-subject impact, and human decision points into one governed record.',
      20,
      'published'
    ),
    (
      '7c52e021-0000-4000-8000-000000000003',
      privai_id,
      remediation_media,
      'workflow',
      'Accountable remediation — converts identified risk into assigned work, priority, status, and follow-through.',
      30,
      'published'
    ),
    (
      '7c52e021-0000-4000-8000-000000000004',
      privai_id,
      evidence_media,
      'workflow',
      'Governance evidence — preserves review and workflow activity as an auditable record.',
      40,
      'published'
    ),
    (
      '7c52e021-0000-4000-8000-000000000005',
      privai_id,
      dashboard_media,
      'workflow',
      'Management visibility — summarizes AI-use checks, risk events, remediation, and governance activity.',
      50,
      'published'
    );

  UPDATE public.project_sections
  SET
    heading = 'Problem',
    body = $body$Shadow AI creates operational governance gaps when organizations cannot consistently determine which AI tool is being used, what information may enter it, who is affected, who owns the decision, what remediation is required, and what evidence remains. Informal AI use often arrives as one-off prompts rather than a governed request.$body$,
    sort_order = 10
  WHERE id = '8f015afe-4602-4901-ad94-b113a7b6d613'
    AND project_id = privai_id;

  UPDATE public.project_sections
  SET
    heading = 'Solution',
    body = $body$PrivAI Guard converts an informal AI-use event into a structured governance workflow with human decision points. A reported use can be classified, scored, reviewed for data-subject impact, recommended toward an approved internal AI path, assigned for remediation, and preserved as evidence. Reviewers — not the application — remain accountable for governance outcomes.$body$,
    sort_order = 20
  WHERE id = '561ea3a0-7959-4b19-9188-0c818cc4ad60'
    AND project_id = privai_id;

  UPDATE public.project_sections
  SET
    heading = 'Workflow',
    body = $body$The implemented model is Check → Assess → Redirect → Act → Prove → See. Check identifies sensitive-data indicators. Assess evaluates risk and potential data-subject impact. Redirect recommends an approved internal AI path where appropriate. Act creates accountable remediation. Prove preserves governance evidence. See provides management visibility. Routing is advisory and human-reviewed; the MVP does not automatically transmit prompt content to another AI service.$body$,
    sort_order = 30
  WHERE id = 'fc19f47d-e157-481d-81a1-fbe4a905511f'
    AND project_id = privai_id;

  UPDATE public.project_sections
  SET
    heading = 'Implemented capabilities',
    body = $body$Current MVP capabilities include Employee Safe Prompt Check, an AI tool registry, deterministic sensitive-data detection and risk scoring, governance review, data-subject impact review, advisory internal-AI routing, remediation ownership and status tracking, governance audit evidence, dashboard-level management visibility, limited read-only BC/DR checkpoint visibility, and role-aware admin governance.$body$,
    sort_order = 40
  WHERE id = 'c775fe1e-a7ab-4d2f-9241-aee206426de1'
    AND project_id = privai_id;

  UPDATE public.project_sections
  SET
    heading = 'Technical foundation',
    body = $body$The frozen MVP uses a compact stack so architecture supports the workflow rather than becoming the story: Next.js, React, and TypeScript for role-aware interfaces; Supabase Auth and PostgreSQL with Row Level Security and controlled database functions for persistence and authorization; Vercel for non-production Preview hosting; and GitHub for source control and repository quality gates. GitHub Actions validates the repository; this case study does not claim that GitHub Actions deploys to Vercel.$body$,
    sort_order = 50
  WHERE id = 'dd0747e7-1165-459f-af01-af46ffd1284e'
    AND project_id = privai_id;

  UPDATE public.project_sections
  SET
    heading = 'What this project demonstrates',
    body = $body$The work connects cybersecurity governance, privacy by design, AI governance, GRC and control implementation, IT and technology risk, role-aware authorization, system-of-record architecture, remediation workflows, and auditability to a working application. It is evidence of applied implementation — not a claim of enterprise-grade or production-ready platform status.$body$,
    sort_order = 60
  WHERE id = '3851264c-6ca8-4f3a-9f5a-e5654a037bd2'
    AND project_id = privai_id;

  UPDATE public.project_sections
  SET
    heading = 'MVP boundary',
    body = $body$Implemented Capstone MVP: Northwestern University MSIS capstone. Working non-production MVP. Synthetic demonstration data only. Human governance review. Advisory internal-AI routing. Not enterprise production software, not a commercial multi-tenant SaaS product, and not Northwestern-owned or Northwestern-endorsed commercial software.

Potential future product direction — not implemented: enterprise SSO, richer workflow and security integrations, commercial multi-tenancy, production operations, and cost-aware model routing. These remain future direction, not current capabilities.$body$,
    sort_order = 70
  WHERE id = '92a1045c-ce22-4192-8b4c-730aef101112'
    AND project_id = privai_id;

  IF EXISTS (
    SELECT 1 FROM public.project_sections
    WHERE project_id = privai_id
      AND id NOT IN (
        '8f015afe-4602-4901-ad94-b113a7b6d613',
        'c775fe1e-a7ab-4d2f-9241-aee206426de1',
        '561ea3a0-7959-4b19-9188-0c818cc4ad60',
        'dd0747e7-1165-459f-af01-af46ffd1284e',
        'fc19f47d-e157-481d-81a1-fbe4a905511f',
        '3851264c-6ca8-4f3a-9f5a-e5654a037bd2',
        '92a1045c-ce22-4192-8b4c-730aef101112'
      )
  ) THEN
    RAISE EXCEPTION 'Step 52G refused: unexpected PrivAI section UUID';
  END IF;

  IF (
    SELECT count(*) FROM public.project_sections
    WHERE project_id = privai_id
      AND status = 'published'
      AND heading IN (
        'Problem',
        'Solution',
        'Workflow',
        'Implemented capabilities',
        'Technical foundation',
        'What this project demonstrates',
        'MVP boundary'
      )
  ) <> 7 THEN
    RAISE EXCEPTION 'Step 52G refused: PrivAI section headings did not update';
  END IF;

  SELECT count(*) INTO n
  FROM public.media_assets
  WHERE id IN (
    prompt_media, review_media, remediation_media, evidence_media, dashboard_media
  )
    AND kind = 'image'
    AND purpose = 'project'
    AND mime_type = 'image/webp'
    AND status = 'published'
    AND is_public = true
    AND year_label IS NULL
    AND caption IS NULL;

  IF n <> 5 THEN
    RAISE EXCEPTION 'Step 52G refused: PrivAI media asset seed drifted';
  END IF;

  IF (
    SELECT count(*) FROM public.project_media WHERE project_id = privai_id
  ) <> 5 THEN
    RAISE EXCEPTION 'Step 52G refused: PrivAI project_media count drifted';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.project_media
    WHERE project_id IN (dbnms_id, npcrs_id)
  ) THEN
    RAISE EXCEPTION 'Step 52G refused: DBNMS or NPCRS media relationship exists';
  END IF;

  IF (
    SELECT name FROM public.projects WHERE id = dbnms_id
  ) <> 'Data Breach Notification Management System'
    OR (
      SELECT name FROM public.projects WHERE id = npcrs_id
    ) <> 'National Privacy Commission Registration System'
  THEN
    RAISE EXCEPTION 'Step 52G refused: DBNMS/NPCRS core facts drifted';
  END IF;

  IF (
    SELECT id FROM public.projects WHERE slug = 'privai-guard'
  ) <> privai_id THEN
    RAISE EXCEPTION 'Step 52G refused: PrivAI core UUID changed';
  END IF;
END
$$;
