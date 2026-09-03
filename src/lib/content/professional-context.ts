/**
 * Factual professional-background disclaimer.
 *
 * Exact wording is frozen. Render once on About. Do not show in global chrome.
 */
export const PROFESSIONAL_LAW_DISCLAIMER =
  "Licensed to Practice Law in the Philippines. Not licensed to practice law in the United States.";

export const PROFESSIONAL_CONTEXT_KICKER = "Professional context";

export function selectAboutProfessionalContext() {
  return {
    kicker: PROFESSIONAL_CONTEXT_KICKER,
    disclaimer: PROFESSIONAL_LAW_DISCLAIMER,
  };
}

export function aboutAlreadyIncludesLawDisclaimer(args: {
  paragraphs?: Array<{ body: string }>;
  boundaryItems?: Array<{ body: string }>;
}): boolean {
  const surfaces = [
    ...(args.paragraphs ?? []),
    ...(args.boundaryItems ?? []),
  ];

  return surfaces.some((item) =>
    item.body.includes("Licensed to Practice Law in the Philippines"),
  );
}
