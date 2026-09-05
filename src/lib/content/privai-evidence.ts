import type {
  PublishedProjectMedia,
  PublishedProjectSection,
} from "./project-map";

/**
 * Source-only presentation. Candidates must already appear in published
 * PrivAI Guard section copy or screenshot captions. Do not invent features.
 */
export const PRIVAI_EARLY_CAPABILITY_CANDIDATES = [
  {
    match: "employee safe prompt check",
    label: "Employee Safe Prompt Check",
  },
  {
    match: "deterministic sensitive-data detection and risk scoring",
    label: "Deterministic sensitive-data detection and risk scoring",
  },
  {
    match: "ai tool registry",
    label: "AI tool registry",
  },
  {
    match: "governance review",
    label: "Governance review",
  },
  {
    match: "remediation ownership and status tracking",
    label: "Remediation ownership and status tracking",
  },
  {
    match: "governance audit evidence",
    label: "Governance audit evidence",
  },
] as const;

export const PRIVAI_EARLY_CAPABILITY_LIMIT = 6;

export const PRIVAI_COMPACT_BOUNDARY =
  "Non-production MSIS capstone MVP. Synthetic demonstration data only. Human governance review — not automated legal or regulatory decisioning.";

export const PRIVAI_PAGE_DESCRIPTION =
  "Shadow AI privacy-risk triage MVP with structured assessment, human review, remediation, and audit evidence. Non-production capstone; synthetic data only.";

export const PRIVAI_VISUAL_EVIDENCE_HEADING_ID =
  "project-visual-evidence-heading";

export type ProjectScreenshotAnnouncement = "canonical" | "decorative-preview";

export function projectScreenshotPresentation(
  announcement: ProjectScreenshotAnnouncement,
  item: {
    caption: string;
    media: { altText: string; publicUrl: string };
  },
) {
  if (announcement === "decorative-preview") {
    return {
      figureAriaHidden: true,
      imageAlt: "",
      linkHref: null,
      linkAriaLabel: null,
      caption: item.caption,
    };
  }

  return {
    figureAriaHidden: false,
    imageAlt: item.media.altText,
    linkHref: item.media.publicUrl,
    linkAriaLabel: `Open full-size screenshot: ${item.media.altText}`,
    caption: item.caption,
  };
}

const SECTION_ANCHOR_PATTERN = /^[a-z0-9-]+$/;

export function privaiHeroBoundary(limits: string): string {
  const text = limits.toLowerCase();
  const hasCoreBoundary =
    text.includes("non-production") &&
    text.includes("synthetic") &&
    (text.includes("human governance") || text.includes("human review"));

  return hasCoreBoundary ? PRIVAI_COMPACT_BOUNDARY : limits.trim();
}

function evidenceCorpus(
  sections: PublishedProjectSection[],
  media: PublishedProjectMedia[],
): string {
  const sectionText = sections.map((section) => section.body).join("\n");
  const captionText = media.map((item) => item.caption).join("\n");
  return `${sectionText}\n${captionText}`.toLowerCase();
}

export function selectPrivaiEarlyCapabilities(
  sections: PublishedProjectSection[],
  media: PublishedProjectMedia[],
): string[] {
  const corpus = evidenceCorpus(sections, media);

  return PRIVAI_EARLY_CAPABILITY_CANDIDATES.filter((candidate) =>
    corpus.includes(candidate.match),
  )
    .slice(0, PRIVAI_EARLY_CAPABILITY_LIMIT)
    .map((candidate) => candidate.label);
}

export function selectPrivaiEarlyPreview(
  media: PublishedProjectMedia[],
): PublishedProjectMedia | null {
  return media[0] ?? null;
}

export function privaiSectionAnchorId(presentationId: string): string | undefined {
  return SECTION_ANCHOR_PATTERN.test(presentationId)
    ? presentationId
    : undefined;
}
