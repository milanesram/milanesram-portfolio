import type { Experience } from "./types";

export const experiences: Experience[] = [
  {
    id: "ram-privacy-security",
    organization: "RAM Privacy & Security",
    title: "Principal Consultant",
    location: "Remote",
    kind: "consulting",
    startLabel: "October 2024",
    endLabel: "Present",
    isCurrent: true,
    featuredOnHome: true,
    tracks: ["all"],
    bullets: [
      {
        body: "Assess cybersecurity, privacy, and technology-risk issues for regulated and high-risk organizations and translate findings into governance, control, and remediation work.",
        tracks: ["all"],
      },
      {
        body: "Conduct risk assessments and translate findings into prioritized remediation actions, implementation roadmaps, and measurable controls.",
        tracks: ["cyber", "all"],
      },
      {
        body: "Conduct privacy and security risk assessments and translate findings into prioritized remediation actions, measurable controls, policies, standards, procedures, and implementation guidance.",
        tracks: ["privacy"],
      },
      {
        body: "Develop policies, standards, procedures, incident-readiness materials, and executive reports; support third-party risk, audit readiness, regulatory compliance, and stakeholder coordination.",
        tracks: ["all"],
      },
    ],
  },
  {
    id: "npc-consultant-cito",
    organization: "National Privacy Commission",
    title: "Innovation and Transformation Consultant",
    titleSecondary: "Designated Chief Information Technology Officer",
    location: "Philippines",
    kind: "consulting",
    startLabel: "October 2024",
    endLabel: "January 2026",
    featuredOnHome: true,
    tracks: ["all"],
    bullets: [
      {
        body: "Assessed cybersecurity, technology-risk, and information-security issues and advised on control implementation and critical-infrastructure protection.",
        tracks: ["cyber", "all"],
      },
      {
        body: "Assessed cybersecurity, privacy-compliance, and technology-risk issues and advised on control implementation and critical-infrastructure protection.",
        tracks: ["privacy"],
      },
      {
        body: "Supported risk assessments and the development of controls addressing identified cybersecurity and information-security risks.",
        tracks: ["cyber", "all"],
      },
      {
        body: "Supported risk assessments and the development of controls addressing identified cybersecurity, information-security, and privacy risks.",
        tracks: ["privacy"],
      },
      {
        body: "Directed pre- and post-production security implementation for the Compliance and Security Monitoring Command Center, supporting centralized monitoring and remediation workflows.",
        tracks: ["cyber", "all"],
      },
      {
        body: "Directed pre- and post-production security implementation for the Compliance and Security Monitoring Command Center, including privacy-by-design and privacy-by-default requirements.",
        tracks: ["privacy"],
      },
      {
        body: "Coordinated technology, privacy, security, and organizational stakeholders on digital systems and technology initiatives.",
        tracks: ["all"],
      },
      {
        body: "Advised on institutionalizing the Data Protection Officer function in government.",
        tracks: ["privacy", "all"],
      },
    ],
  },
  {
    id: "npc-cmd-chief",
    organization: "National Privacy Commission",
    title: "Chief, Compliance and Monitoring Division",
    location: "Philippines",
    kind: "employment",
    startLabel: "March 2021",
    endLabel: "September 2024",
    featuredOnHome: true,
    tracks: ["all"],
    bullets: [
      {
        body: "Led compliance monitoring, breach-notification processing, registration, compliance support, and regulatory reporting operations.",
        tracks: ["all"],
      },
      {
        body: "Conducted and oversaw privacy, security, technology, and compliance assessments across high-volume operational workflows.",
        tracks: ["all"],
      },
      {
        body: "Led development and implementation of the Data Breach Notification Management System and the National Privacy Commission Registration System.",
        tracks: ["all"],
      },
      {
        body: "Increased new Data Protection Officer registrations from 631 in 2020 to 1,498 in 2021.",
        tracks: ["privacy", "all"],
      },
      {
        body: "Supported more than 10,000 DPS and DPO registered entities by 30 September 2024 after the registration system launched in 2023.",
        tracks: ["privacy", "all"],
      },
      {
        body: "Raised 2021 compliance-check completions from a target of 350 personal information controllers to 685 PICs.",
        tracks: ["cyber", "all"],
      },
    ],
  },
  {
    id: "bankmer-ops-dpo",
    organization: "Bankmer Realty Corporation",
    title: "Director of Operations & Data Protection Officer",
    location: "Philippines",
    kind: "employment",
    startLabel: "January 2017",
    endLabel: "July 2020",
    tracks: ["all"],
    bullets: [
      {
        body: "Established the organization’s first Privacy Management Program, including privacy governance, policies, security procedures, data-handling standards, employee training, and accountability controls.",
        tracks: ["privacy", "all"],
      },
      {
        body: "Conducted privacy and operational risk assessments and translated findings into corrective actions and improved data-governance practices.",
        tracks: ["all"],
      },
      {
        body: "Modernized records handling, infrastructure, and vendor oversight in support of operational and information-security practice.",
        tracks: ["cyber", "all"],
      },
    ],
  },
  {
    id: "bankmer-counsel",
    organization: "Bankmer Realty Corporation",
    title: "Corporate Counsel / Facilities Manager",
    location: "Philippines",
    kind: "employment",
    startLabel: "March 2015",
    endLabel: "December 2016",
    tracks: ["all"],
    bullets: [
      {
        body: "Planned IT and information-security improvements and digitalized corporate records to protect confidential organizational information.",
        tracks: ["cyber", "all"],
      },
      {
        body: "Coordinated technology vendors, contracts, regulatory requirements, and implementation activities involving confidential organizational information.",
        tracks: ["all"],
      },
    ],
  },
  {
    id: "bankmer-compliance",
    organization: "Bankmer Realty Corporation",
    title: "Compliance Officer",
    location: "Philippines",
    kind: "employment",
    startLabel: "November 2013",
    endLabel: "February 2015",
    tracks: ["privacy", "all"],
    bullets: [
      {
        body: "Researched privacy and regulatory requirements and evaluated organizational legal, operational, documentation, and information-management risks.",
        tracks: ["privacy", "all"],
      },
      {
        body: "Developed risk-mitigation recommendations and supported compliance implementation.",
        tracks: ["all"],
      },
    ],
  },
  {
    id: "scionetrade",
    organization: "Scionetrade Corporation",
    title: "Legal Consultant — Cybersecurity & Data Privacy Advisory",
    location: "Philippines",
    kind: "additional",
    startLabel: "2018",
    endLabel: "2020",
    tracks: ["all"],
    bullets: [
      {
        body: "Advised a security and technology solutions provider on cybersecurity, data privacy, and vendor-facing technology engagements.",
        tracks: ["all"],
      },
    ],
  },
  {
    id: "dtslc",
    organization: "Northwestern University",
    title: "Communications Head, Data & Technology Student Leadership Council",
    location: "United States",
    kind: "leadership",
    startLabel: "2026",
    endLabel: "2026",
    tracks: ["all"],
    bullets: [
      {
        body: "Coordinate technology-focused communications, stakeholder engagement, and responsible management of student information.",
        tracks: ["all"],
      },
    ],
  },
];

export const homeExperiences = experiences.filter((item) => item.featuredOnHome);

export function experiencesForTrack(track: "cyber" | "privacy") {
  return experiences.filter(
    (item) =>
      item.tracks.includes("all") ||
      item.tracks.includes(track) ||
      item.bullets.some((bullet) => bullet.tracks.includes(track) || bullet.tracks.includes("all")),
  );
}

export function bulletsForTrack(
  experience: Experience,
  track?: "cyber" | "privacy",
) {
  if (!track) {
    return experience.bullets.filter((bullet) => bullet.tracks.includes("all"));
  }

  return experience.bullets.filter(
    (bullet) => bullet.tracks.includes(track) || bullet.tracks.includes("all"),
  );
}
