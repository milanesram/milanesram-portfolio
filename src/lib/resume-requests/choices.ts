export const RESUME_REQUEST_CHOICES = [
  "grc_it_risk",
  "privacy_compliance",
  "professional_cv",
  "not_sure",
] as const;

export type ResumeRequestChoice = (typeof RESUME_REQUEST_CHOICES)[number];

export const RESUME_REQUEST_LABELS: Record<ResumeRequestChoice, string> = {
  grc_it_risk: "GRC, IT Risk & Security Compliance",
  privacy_compliance: "Privacy, Compliance & Assurance",
  professional_cv: "Comprehensive Professional CV",
  not_sure: "Not sure — please recommend the appropriate document",
};

export const REQUEST_RESUME_CTA_LABEL = "Request a copy";

export const RESUME_REQUEST_HEADING = "Request a resume";

export const RESUME_REQUEST_LEDE =
  "Choose the resume most relevant to the opportunity and provide enough information for me to respond.";

export const RESUME_REQUEST_PRIVACY_NOTE =
  "Your information will be used only to review and respond to this professional resume request. Please do not submit sensitive personal information.";

export const RESUME_REQUEST_SUCCESS =
  "Request received. Thank you — I’ll review the information and respond through the email address you provided.";

const CHOICE_SET = new Set<string>(RESUME_REQUEST_CHOICES);

export function isResumeRequestChoice(
  value: string,
): value is ResumeRequestChoice {
  return CHOICE_SET.has(value);
}

export function parseResumeRequestQuery(
  value: string | string[] | undefined,
): ResumeRequestChoice {
  const raw = Array.isArray(value) ? value[0] : value;

  if (raw && isResumeRequestChoice(raw)) {
    return raw;
  }

  return "not_sure";
}

export function resumeRequestChoiceForSlug(slug: string): ResumeRequestChoice {
  if (slug === "cybersecurity-grc") {
    return "grc_it_risk";
  }

  if (slug === "privacy-ai-governance") {
    return "privacy_compliance";
  }

  return "not_sure";
}

export function resumeRequestHref(slug: string): string {
  return `/contact?request=${resumeRequestChoiceForSlug(slug)}`;
}
