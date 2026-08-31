import type { FocusPage, SiteProfile } from "./types";

export const siteProfile: SiteProfile = {
  displayName: "Rainier (Ram) Milanes",
  shortName: "Ram Milanes",
  initials: "RM",
  headline:
    "Cybersecurity, GRC, and privacy governance for regulated environments.",
  summary:
    "I help organizations assess technology and privacy risk, implement controls, and make governance visible — drawing on regulator-side leadership, enterprise privacy-program work, and a shipped Shadow AI governance capstone.",
  workAuthorization: "Authorized to work in the U.S. without sponsorship",
  linkedinUrl: "https://www.linkedin.com/in/milanesram/",
  linkedinLabel: "linkedin.com/in/milanesram",
  email: "milanesram@gmail.com",
};

export const focusPages: FocusPage[] = [
  {
    id: "cyber",
    slug: "cybersecurity-grc",
    navLabel: "Cybersecurity / GRC / IT Risk",
    headline: "Cybersecurity, GRC, and IT risk",
    summary:
      "Security governance, control implementation, audit readiness, and technology-risk translation — the same background, read for cybersecurity and GRC roles.",
    competencies: [
      "IT risk",
      "Technology risk",
      "GRC",
      "Information security",
      "Security controls",
      "Control assessment",
      "Audit readiness",
      "Incident readiness",
      "Third-party risk",
      "Security governance",
    ],
    selectedWritingSlug: "egov-ph-architectural-fragility-bcdr",
  },
  {
    id: "privacy",
    slug: "privacy-ai-governance",
    navLabel: "Privacy / AI Governance",
    headline: "Privacy and AI governance",
    summary:
      "Privacy operations, privacy by design, incident process, and responsible-AI review — the same background, read for privacy and AI-governance roles.",
    competencies: [
      "Data privacy",
      "Privacy governance",
      "Privacy risk",
      "Privacy by design / default",
      "Breach and incident management",
      "Data governance",
      "AI governance",
      "Responsible AI",
      "Audit evidence",
      "Remediation",
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
