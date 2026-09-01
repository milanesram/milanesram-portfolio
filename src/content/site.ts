import type { FocusPage, SiteProfile } from "./types";

export const siteProfile: SiteProfile = {
  displayName: "Rainier (Ram) Milanes",
  shortName: "Ram Milanes",
  initials: "RM",
  headline: "Cybersecurity, GRC, IT risk, and privacy professional.",
  summary:
    "Cybersecurity, GRC, IT-risk, and privacy professional. I earned a Northwestern MSIS (Security Specialization) and combine governance and privacy experience with hands-on technical development through PrivAI Guard, a non-production Shadow AI governance capstone.",
  workAuthorization: "",
  linkedinUrl: "https://www.linkedin.com/in/milanesram/",
  linkedinLabel: "linkedin.com/in/milanesram",
  email: "milanesram@gmail.com",
};

export const focusPages: FocusPage[] = [
  {
    id: "cyber",
    slug: "cybersecurity-grc",
    navLabel: "Cybersecurity / GRC",
    headline: "Cybersecurity, GRC, and IT risk",
    summary:
      "This track is for analyst, specialist, and consultant roles in cybersecurity, GRC, and IT risk. It emphasizes security governance, controls, audit readiness, and risk remediation, supported by security education and applied governance work.",
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
      "This track is for privacy analyst, specialist, and consultant roles, including adjacent AI-governance work. It emphasizes privacy operations, privacy-risk assessment, and data protection, with current applied evidence through human-reviewed Shadow AI review.",
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
