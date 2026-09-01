import type { FocusPage } from "./types";

/**
 * Stable route/presentation config.
 *
 * Mutable professional identity now lives in hosted `site_profile` and is
 * read through `getPublishedSiteProfile()`. This file no longer exports a
 * public `siteProfile` career-content authority.
 */

export const focusPages: FocusPage[] = [
  {
    id: "cyber",
    slug: "cybersecurity-grc",
    navLabel: "Cybersecurity / GRC",
    headline: "Cybersecurity, GRC, and IT risk",
    summary:
      "Cybersecurity governance, GRC, and IT-risk work emphasizing security governance, controls, audit readiness, and risk remediation, supported by security education and applied governance work.",
    competencies: [
      "GRC",
      "IT risk assessment",
      "Security controls",
      "Audit and compliance readiness",
      "Security governance",
      "Risk remediation",
    ],
    selectedWritingSlug: "egov-ph-architectural-fragility-bcdr",
  },
  {
    id: "privacy",
    slug: "privacy-ai-governance",
    navLabel: "Privacy / AI Governance",
    headline: "Privacy and AI governance",
    summary:
      "Privacy operations, data protection, and AI-governance work emphasizing privacy-risk assessment, privacy by design, and incident process, with current applied evidence through human-reviewed Shadow AI review.",
    competencies: [
      "Privacy operations",
      "Privacy-risk assessment",
      "Privacy by design",
      "Data protection and compliance",
      "Incident and remediation process",
      "AI governance",
      "Human-reviewed responsible-AI controls",
    ],
    selectedWritingSlug: "privacy-preserving-machine-learning-global-healthcare-ai",
  },
];

export const navPrimary = [
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/writing", label: "Writing" },
  { href: "/credentials", label: "Credentials" },
] as const;

export const umbrellaDomains = [
  "Cybersecurity",
  "GRC",
  "IT Risk",
  "Information Security",
  "Data Privacy",
  "AI Governance",
] as const;
