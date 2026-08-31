import type { Credential, Experience, ExperienceBullet, Project } from "@/content/types";

/**
 * Home 1.1 presentation helpers and frozen copy.
 *
 * This module does not query Supabase, import admin code, or duplicate
 * Experience facts. Home reads hosted/hybrid data through existing public
 * helpers, then selects a small presentation subset here.
 */

export const homeAbsoluteTitle =
  "Rainier (Ram) Milanes — Cybersecurity, GRC, Privacy, and AI Governance";

export const homeDescription =
  "Cybersecurity, GRC, IT-risk, data-privacy, and AI-governance professional targeting analyst, specialist, and consultant roles. Northwestern MSIS Security Specialization, CIPM, ISC2 CC, and PrivAI Guard. Authorized to work in the U.S. without sponsorship.";

export const homeHeroCopy = {
  eyebrow: "Rainier (Ram) Milanes",
  headline: "Cybersecurity, GRC, IT risk, and privacy professional.",
  summary:
    "Targeting analyst, specialist, and consultant roles across cybersecurity, GRC, IT risk, data privacy, and AI governance. Current signals include a Northwestern MSIS (Security Specialization), CIPM, ISC2 CC, and PrivAI Guard — a Shadow AI governance capstone.",
  chips: [
    "Cybersecurity",
    "GRC",
    "IT Risk",
    "Data Privacy",
    "AI Governance",
  ] as const,
  primaryCta: {
    href: "/resume",
    label: "View resume packets",
  },
  secondaryCta: {
    href: "/projects/privai-guard",
    label: "Read the PrivAI Guard case study",
  },
} as const;

export const homeProofStrip = [
  {
    label: "Northwestern MSIS",
    supporting: "Security Specialization",
  },
  {
    label: "PrivAI Guard",
    supporting: "Shadow AI governance capstone",
    href: "/projects/privai-guard",
  },
  {
    label: "IAPP CIPM",
    supporting: "Certified Information Privacy Manager",
  },
  {
    label: "ISC2 CC",
    supporting: "Certified in Cybersecurity",
  },
] as const;

export const homeFlagshipCopy = {
  kicker: "Featured work · 2026",
  heading: "PrivAI Guard",
  problem:
    "Organizations adopt AI tools faster than they can govern where those tools touch sensitive data.",
  whatIBuilt:
    "A Northwestern MSIS capstone I designed and developed that turns reported Shadow AI use into structured privacy-risk triage, human review, remediation, and audit evidence.",
  proofPoints: [
    "Risk scoring and sensitive-data classification for reported AI use.",
    "Role-based access, PostgreSQL Row-Level Security, and audit logging.",
    "Remediation workflow with human governance review — not automated legal or regulatory decisioning.",
  ] as const,
  ctaLabel: "Read the PrivAI Guard case study",
  ctaHref: "/projects/privai-guard",
} as const;

export const homeTracks = [
  {
    id: "cyber",
    resumeLabel: "Resume A",
    title: "Cybersecurity / GRC / IT Risk",
    summary:
      "For cybersecurity, GRC, and IT-risk requisitions — controls, audit readiness, incident readiness, and technology-risk work.",
    chips: [
      "IT risk",
      "GRC",
      "Security controls",
      "Audit readiness",
      "Incident readiness",
    ] as const,
    ctaLabel: "Open this track",
    href: "/focus/cybersecurity-grc",
  },
  {
    id: "privacy",
    resumeLabel: "Resume B",
    title: "Data Privacy / AI Governance",
    summary:
      "For privacy and AI-governance requisitions — privacy operations, privacy by design, and Shadow AI risk review.",
    chips: [
      "Data privacy",
      "Privacy by design / default",
      "AI governance",
      "Audit evidence",
      "Remediation",
    ] as const,
    ctaLabel: "Open this track",
    href: "/focus/privacy-ai-governance",
  },
] as const;

export const HOME_FLAGSHIP_SLUG = "privai-guard";

export const HOME_CREDENTIAL_NAMES = [
  "Master of Science in Information Systems, Security Specialization",
  "Certified Information Privacy Manager (CIPM)",
  "Certified in Cybersecurity (CC)",
] as const;

export const HOME_EXPERIENCE_SELECTION = [
  {
    id: "ram-privacy-security",
    bulletBodies: [
      "Conduct risk assessments and translate findings into prioritized remediation actions, implementation roadmaps, and measurable controls.",
      "Develop policies, standards, procedures, incident-readiness materials, and executive reports; support third-party risk, audit readiness, regulatory compliance, and stakeholder coordination.",
    ],
  },
  {
    id: "npc-consultant-cito",
    bulletBodies: [
      "Supported risk assessments and the development of controls addressing identified cybersecurity and information-security risks.",
      "Directed pre- and post-production security implementation for the Compliance and Security Monitoring Command Center, supporting centralized monitoring and remediation workflows.",
    ],
  },
  {
    id: "npc-cmd-chief",
    bulletBodies: [
      "Led compliance monitoring, breach-notification processing, registration, compliance support, and regulatory reporting operations.",
      "Led development and implementation of the Data Breach Notification Management System and the National Privacy Commission Registration System.",
    ],
  },
] as const;

export function selectHomeFlagshipProject(projects: Project[]): Project | null {
  return (
    projects.find(
      (project) => project.featured && project.slug === HOME_FLAGSHIP_SLUG,
    ) ?? null
  );
}

export function selectHomeCredentials(credentials: Credential[]): Credential[] {
  const selected: Credential[] = [];

  for (const name of HOME_CREDENTIAL_NAMES) {
    const match = credentials.find((credential) => credential.name === name);
    if (match) {
      selected.push(match);
    }
  }

  return selected;
}

export function selectHomeExperiences(experiences: Experience[]): Experience[] {
  const byId = new Map(experiences.map((experience) => [experience.id, experience]));
  const selected: Experience[] = [];

  for (const spec of HOME_EXPERIENCE_SELECTION) {
    const parent = byId.get(spec.id);

    if (!parent) {
      continue;
    }

    const bullets: ExperienceBullet[] = [];

    for (const body of spec.bulletBodies) {
      if (bullets.length >= 2) {
        break;
      }

      const match = parent.bullets.find((bullet) => bullet.body === body);

      if (match) {
        bullets.push(match);
      }
    }

    selected.push({
      ...parent,
      bullets,
    });
  }

  return selected;
}
