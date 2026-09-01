import type { Credential, Experience, ExperienceBullet, Project } from "@/content/types";

/**
 * Home 1.1 presentation helpers and frozen copy.
 *
 * This module does not query Supabase, import admin code, or duplicate
 * Experience facts. Home reads hosted/hybrid data through existing public
 * helpers, then selects a small presentation subset here.
 */

export const homeAbsoluteTitle =
  "Rainier (Ram) Milanes — Cybersecurity, GRC, IT Risk & Privacy";

export const homeDescription =
  "Cybersecurity governance, GRC, technology risk, privacy, and AI governance. Northwestern MSIS graduate. Applied technical evidence through PrivAI Guard.";

export const homeHeroCopy = {
  eyebrow: "Rainier (Ram) Milanes",
  headline: "Cybersecurity, risk, and privacy work grounded in technical practice.",
  summary:
    "Substantial governance and privacy experience, an earned Northwestern MSIS (Security Specialization), and hands-on technical work through PrivAI Guard, a non-production Shadow AI governance capstone.",
  chips: [
    "Cybersecurity",
    "GRC",
    "IT Risk",
    "Data Privacy",
    "AI Governance",
  ] as const,
  primaryCta: {
    href: "/experience",
    label: "View experience",
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
    supporting: "Privacy program management",
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
    "Employee use of public AI tools often outpaces the privacy and governance controls around them.",
  whatIBuilt:
    "A non-production Shadow AI governance MVP I designed and developed that turns risky employee AI use into structured privacy-risk triage, human review, and auditable remediation.",
  proofPoints: [
    "Shows that governance requirements can be translated into a working technical system.",
    "Structured risk review and remediation with a human decision path.",
    "Not automated legal or regulatory decisioning.",
  ] as const,
  ctaLabel: "Read the PrivAI Guard case study",
  ctaHref: "/projects/privai-guard",
} as const;

export const homeTracks = [
  {
    id: "cyber",
    resumeLabel: "Resume A",
    title: "Cybersecurity / GRC",
    summary:
      "For cybersecurity, GRC, and IT-risk work that needs controls, audit readiness, and technology-risk translation.",
    chips: ["IT risk", "GRC", "Controls", "Audit readiness"] as const,
    ctaLabel: "View this track",
    href: "/focus/cybersecurity-grc",
  },
  {
    id: "privacy",
    resumeLabel: "Resume B",
    title: "Privacy / AI Governance",
    summary:
      "For privacy and AI-governance work that needs privacy operations, risk assessment, and responsible human review.",
    chips: [
      "Data privacy",
      "Privacy-risk assessment",
      "AI governance",
      "Human review",
    ] as const,
    ctaLabel: "View this track",
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
