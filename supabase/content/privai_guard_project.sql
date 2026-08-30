-- Explicit opt-in content script for the approved public PrivAI Guard case study.
-- Source: src/content/projects.ts (already public on the site).
-- Not a schema migration. Not executed by supabase db push, supabase start,
-- or supabase db reset. Do not apply until a later authorized content step.
-- Insert-if-absent only. No DELETE, TRUNCATE, or broad updates.

INSERT INTO public.projects (
  id,
  slug,
  name,
  tagline,
  year_label,
  role,
  summary,
  stack,
  limits,
  is_featured,
  status,
  sort_order
)
VALUES (
  '8f3a1b20-6c4d-4e8f-9a10-000000000001',
  'privai-guard',
  'PrivAI Guard',
  'Shadow AI privacy-risk triage',
  '2026',
  'Designed and developed',
  $privai_summary$A cloud-deployed full-stack Shadow AI governance MVP that converts potentially risky AI use into structured risk assessment, governance review, remediation, audit evidence, and executive visibility.$privai_summary$,
  ARRAY[
    'Next.js',
    'React',
    'TypeScript',
    'Supabase/PostgreSQL',
    'Vercel',
    'GitHub'
  ]::text[],
  $privai_limits$Northwestern University MSIS capstone MVP. Non-production. Synthetic demonstration data only. Human governance review — not automated legal or regulatory decisioning.$privai_limits$,
  true,
  'published',
  0
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.project_sections (
  id,
  project_id,
  heading,
  body,
  track,
  status,
  sort_order
)
SELECT
  section.id,
  project.id,
  section.heading,
  section.body,
  'all'::public.track_tag,
  'published'::public.content_status,
  section.sort_order
FROM public.projects AS project
CROSS JOIN (
  VALUES
    (
      '8f3a1b20-6c4d-4e8f-9a10-000000000011'::uuid,
      0,
      'Problem',
      $s$Organizations adopt AI tools faster than they can see where those tools touch sensitive data. Shadow AI use arrives as informal questions, screenshots, and one-off experiments rather than as a governed request.$s$
    ),
    (
      '8f3a1b20-6c4d-4e8f-9a10-000000000012'::uuid,
      1,
      'Risk',
      $s$Unstructured AI use can expose personal or confidential data, skip impact review, and leave no audit trail. The gap is not only a model-risk problem — it is a privacy, security, and accountability problem.$s$
    ),
    (
      '8f3a1b20-6c4d-4e8f-9a10-000000000013'::uuid,
      2,
      'Guardrail',
      $s$PrivAI Guard turns a potentially risky AI-use report into a structured privacy-risk triage: classification, transparent scoring, data-subject impact review, and a human decision path instead of an automated legal conclusion.$s$
    ),
    (
      '8f3a1b20-6c4d-4e8f-9a10-000000000014'::uuid,
      3,
      'Implementation',
      $s$Designed and developed as a cloud-deployed full-stack application using Next.js, React, TypeScript, Supabase/PostgreSQL, Vercel, and GitHub. Security and governance controls include role-based access, PostgreSQL Row-Level Security, risk scoring, remediation workflows, audit logging, and privacy-by-design defaults.$s$
    ),
    (
      '8f3a1b20-6c4d-4e8f-9a10-000000000015'::uuid,
      4,
      'Governance workflow',
      $s$A reported use can be classified, scored, routed for human-reviewed internal-AI consideration, assigned remediation, and recorded as audit evidence with executive visibility. Reviewers — not the application — remain accountable for governance outcomes.$s$
    ),
    (
      '8f3a1b20-6c4d-4e8f-9a10-000000000016'::uuid,
      5,
      'Business value',
      $s$The MVP shows how a security, privacy, or AI-governance function can replace ad-hoc Shadow AI handling with a repeatable assessment-to-evidence path that hiring managers can inspect.$s$
    ),
    (
      '8f3a1b20-6c4d-4e8f-9a10-000000000017'::uuid,
      6,
      'MVP boundary',
      $s$This is a Northwestern University MSIS capstone MVP. It is non-production, uses synthetic demonstration data only, and supports advisory human review rather than automated legal or regulatory decisioning.$s$
    )
) AS section(id, sort_order, heading, body)
WHERE project.slug = 'privai-guard'
ON CONFLICT (id) DO NOTHING;
