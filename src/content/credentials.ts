import type { Credential } from "./types";

export const credentials: Credential[] = [
  {
    id: "msis",
    kind: "degree",
    name: "Master of Science in Information Systems, Security Specialization",
    issuer: "Northwestern University",
    yearLabel: "2026",
    details:
      "Coursework includes Information Security Management; Information Security Strategy; Cybersecurity Attacks & Countermeasures; Disaster Recovery & Business Continuity; Artificial Intelligence; Machine Learning; Spec-Driven Software Development; and Project Management.",
    highlight: true,
    tracks: ["all"],
  },
  {
    id: "jd",
    kind: "degree",
    name: "Juris Doctor",
    issuer: "San Sebastian College – Recoletos",
    tracks: ["all"],
  },
  {
    id: "bsba",
    kind: "degree",
    name: "Bachelor of Science in Business Administration",
    issuer: "Trinity University of Asia",
    tracks: ["all"],
  },
  {
    id: "cipm",
    kind: "certification",
    name: "Certified Information Privacy Manager (CIPM)",
    issuer: "IAPP",
    highlight: true,
    tracks: ["privacy", "all"],
  },
  {
    id: "cc",
    kind: "certification",
    name: "Certified in Cybersecurity (CC)",
    issuer: "ISC2",
    highlight: true,
    tracks: ["cyber", "all"],
  },
  {
    id: "anu-cyber",
    kind: "training",
    name: "Professional Development Certificate in Cybersecurity",
    issuer: "Australian National University, National Security College",
    details: "Cyber and Critical Tech Cooperation Program – Cybersecurity Bootcamp",
    tracks: ["cyber", "all"],
  },
  {
    id: "cisa-ics",
    kind: "training",
    name: "Industrial Control Systems Cybersecurity Training",
    issuer: "U.S. Department of Homeland Security, CISA",
    tracks: ["cyber", "all"],
  },
  {
    id: "dx-professional",
    kind: "training",
    name: "Certified Digital Transformation Professional",
    issuer: "Asian Institute of Digital Transformation",
    details: "Executive Masterclass in Digital Transformation",
    tracks: ["all"],
  },
  {
    id: "ph-law",
    kind: "license",
    name: "Licensed to Practice Law in the Philippines",
    issuer: "Supreme Court of the Philippines / Integrated Bar of the Philippines",
    details:
      "This is Philippine legal licensure. It does not imply U.S. bar admission or authorization to practice law in the United States.",
    tracks: ["all"],
  },
  {
    id: "google-ai",
    kind: "certification",
    name: "Google AI Professional Certificate",
    issuer: "Google",
    tracks: ["privacy"],
    verification: "pending",
  },
];

export const publicCredentials = credentials.filter(
  (credential) => credential.verification !== "pending",
);

export const highlightCredentials = publicCredentials.filter(
  (credential) => credential.highlight,
);
