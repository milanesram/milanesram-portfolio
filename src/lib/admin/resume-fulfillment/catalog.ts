import "server-only";

import type { FulfillmentDocumentKey } from "./policy";

export const PRIVATE_RESUME_OBJECTS: Record<
  Exclude<FulfillmentDocumentKey, "professional_cv">,
  { objectPath: string; byteSize: number; sha256: string }
> = {
  grc_it_risk: {
    objectPath: "resume/v4/resume-a/ramilanes_resume_grc_it_risk_v4.pdf",
    byteSize: 123610,
    sha256: "8e3d3cccc789ff770b622750b843d77c83ad4f030d02ad351acf3e8095aca139",
  },
  privacy_compliance: {
    objectPath: "resume/v4/resume-b/ramilanes_resume_privacy_compliance_v4.pdf",
    byteSize: 123872,
    sha256: "ff8e0cfe742c048f92d5c0bdc71966fb080fba190696440090face9285d758fb",
  },
};

export const PUBLIC_RESUME_V4_PATHS = {
  grc_it_risk:
    "resume/f4739fe2-8d6b-4b13-ad5c-f611e3ab97a5/ramilanes_resume_grc_it_risk_v4.pdf",
  privacy_compliance:
    "resume/29a9954b-5169-45dc-9b82-be04e041ba78/ramilanes_resume_privacy_compliance_v4.pdf",
} as const;

export const PUBLIC_RESUME_V31_PATHS = {
  grc_it_risk:
    "resume/bfa474f1-c193-4b29-8d6f-876d3799d164/ramilanes_resume_cybersecurity_grc.pdf",
  privacy_compliance:
    "resume/07f4993f-d385-4842-9909-f35d4f9be662/ramilanes_resume_privacy_ai_governance.pdf",
} as const;

export const PRIVATE_PROFESSIONAL_CV = {
  documentKey: "professional_cv",
  title: "Comprehensive Professional CV",
  versionLabel: "V2",
  bucket: "private-resumes",
  objectPath: "cv/v2/ramilanes_professional_cv_v2.pdf",
  byteSize: 176774,
  sha256: "c80500801a7383019a20ecd666430d6cdc69e2fc8fd8cfe49c55de730e24f331",
} as const;

export const PRIVATE_RESUME_V31_ARCHIVE_PATHS = {
  grc_it_risk:
    "resume/archive/v3.1/cybersecurity-grc/ramilanes_resume_cybersecurity_grc.pdf",
  privacy_compliance:
    "resume/archive/v3.1/privacy-ai-governance/ramilanes_resume_privacy_ai_governance.pdf",
} as const;
