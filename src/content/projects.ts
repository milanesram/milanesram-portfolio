import type { CaseStudySection, Project } from "./types";

export const projects: Project[] = [
  {
    id: "privai-guard",
    slug: "privai-guard",
    name: "PrivAI Guard",
    tagline: "Shadow AI privacy-risk triage",
    yearLabel: "2026",
    role: "Designed and developed",
    summary:
      "A cloud-deployed full-stack Shadow AI governance MVP that converts potentially risky AI use into structured risk assessment, governance review, remediation, audit evidence, and executive visibility.",
    limits:
      "Northwestern University MSIS capstone MVP. Non-production. Synthetic demonstration data only. Human governance review — not automated legal or regulatory decisioning.",
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Supabase/PostgreSQL",
      "Vercel",
      "GitHub",
    ],
    featured: true,
    tracks: ["all"],
  },
  {
    id: "dbnms",
    slug: "dbnms",
    name: "Data Breach Notification Management System",
    tagline: "National breach-notification portal",
    yearLabel: "2022",
    role: "Project sponsor — planning, development, and implementation",
    summary:
      "Public-facing web portal that automates mandatory personal-data-breach notification and annual security-incident reporting, including real-time submission and status checking. Launched 20 April 2022.",
    limits:
      "Public-function description only. No internal architecture, credentials, or case files are published.",
    stack: [],
    featured: false,
    tracks: ["all"],
  },
  {
    id: "npcrs",
    slug: "npcrs",
    name: "National Privacy Commission Registration System",
    tagline: "DPO and data-processing-system registration",
    yearLabel: "2023",
    role: "Project sponsor — planning, development, and implementation",
    summary:
      "Public-facing web portal for registering data-processing systems and Data Protection Officers, and for recording notifications of automated decision-making and profiling. Launched 3 February 2023.",
    limits:
      "Public-function description only. No internal architecture, credentials, or registration records are published.",
    stack: [],
    featured: false,
    tracks: ["all"],
  },
];

export const featuredProject = projects.find((project) => project.featured)!;

export const privaiGuardSections: CaseStudySection[] = [
  {
    id: "problem",
    heading: "Problem",
    body: "Organizations adopt AI tools faster than they can see where those tools touch sensitive data. Shadow AI use arrives as informal questions, screenshots, and one-off experiments rather than as a governed request.",
  },
  {
    id: "risk",
    heading: "Risk",
    body: "Unstructured AI use can expose personal or confidential data, skip impact review, and leave no audit trail. The gap is not only a model-risk problem — it is a privacy, security, and accountability problem.",
  },
  {
    id: "guardrail",
    heading: "Guardrail",
    body: "PrivAI Guard turns a potentially risky AI-use report into a structured privacy-risk triage: classification, transparent scoring, data-subject impact review, and a human decision path instead of an automated legal conclusion.",
  },
  {
    id: "implementation",
    heading: "Implementation",
    body: "Designed and developed as a cloud-deployed full-stack application using Next.js, React, TypeScript, Supabase/PostgreSQL, Vercel, and GitHub. Security and governance controls include role-based access, PostgreSQL Row-Level Security, risk scoring, remediation workflows, audit logging, and privacy-by-design defaults.",
  },
  {
    id: "workflow",
    heading: "Governance workflow",
    body: "A reported use can be classified, scored, routed for human-reviewed internal-AI consideration, assigned remediation, and recorded as audit evidence with executive visibility. Reviewers — not the application — remain accountable for governance outcomes.",
  },
  {
    id: "value",
    heading: "Business value",
    body: "The MVP shows how a security, privacy, or AI-governance function can replace ad-hoc Shadow AI handling with a repeatable assessment-to-evidence path that hiring managers can inspect.",
  },
  {
    id: "boundary",
    heading: "MVP boundary",
    body: "This is a Northwestern University MSIS capstone MVP. It is non-production, uses synthetic demonstration data only, and supports advisory human review rather than automated legal or regulatory decisioning.",
  },
];
