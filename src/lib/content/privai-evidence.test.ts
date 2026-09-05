import { describe, expect, it } from "vitest";
import type {
  PublishedProjectMedia,
  PublishedProjectSection,
} from "./project-map";
import {
  PRIVAI_COMPACT_BOUNDARY,
  PRIVAI_EARLY_CAPABILITY_CANDIDATES,
  PRIVAI_PAGE_DESCRIPTION,
  PRIVAI_VISUAL_EVIDENCE_HEADING_ID,
  privaiHeroBoundary,
  privaiSectionAnchorId,
  projectScreenshotPresentation,
  selectPrivaiEarlyCapabilities,
  selectPrivaiEarlyPreview,
} from "./privai-evidence";
import { projectCardEvidence } from "./project-card-evidence";

const LIVE_CAPABILITIES_BODY =
  "Current MVP capabilities include Employee Safe Prompt Check, an AI tool registry, deterministic sensitive-data detection and risk scoring, governance review, data-subject impact review, advisory internal-AI routing, remediation ownership and status tracking, governance audit evidence, dashboard-level management visibility, limited read-only BC/DR checkpoint visibility, and role-aware admin governance.";

const LIVE_LIMITS =
  "Northwestern University MSIS capstone MVP. Non-production. Synthetic demonstration data only. Human governance review — not automated legal or regulatory decisioning.";

function section(
  heading: string,
  body: string,
  sortOrder: number,
): PublishedProjectSection {
  return {
    id: `section-${sortOrder}`,
    heading,
    body,
    track: "all",
    sortOrder,
  };
}

function mediaItem(
  id: string,
  caption: string,
  sortOrder: number,
): PublishedProjectMedia {
  return {
    id,
    role: sortOrder === 10 ? "hero" : "workflow",
    caption,
    sortOrder,
    media: {
      id: `asset-${id}`,
      title: caption,
      altText: `PrivAI Guard ${caption}`,
      publicUrl: `https://example.supabase.co/${id}.webp`,
      mimeType: "image/webp",
      byteSize: 30000,
    },
  };
}

describe("privai hero boundary", () => {
  it("uses the compact early boundary when hosted limits still state the core facts", () => {
    expect(privaiHeroBoundary(LIVE_LIMITS)).toBe(PRIVAI_COMPACT_BOUNDARY);
    expect(PRIVAI_COMPACT_BOUNDARY).toMatch(/non-production/i);
    expect(PRIVAI_COMPACT_BOUNDARY).toMatch(/synthetic demonstration data/i);
    expect(PRIVAI_COMPACT_BOUNDARY).toMatch(/human governance review/i);
    expect(PRIVAI_COMPACT_BOUNDARY).not.toMatch(/enterprise/i);
    expect(PRIVAI_COMPACT_BOUNDARY.toLowerCase()).not.toContain("saas");
  });

  it("falls back to hosted limits when the compact sentence would drop a required fact", () => {
    expect(privaiHeroBoundary("Working demonstration with human review.")).toBe(
      "Working demonstration with human review.",
    );
  });
});

describe("privai early capabilities", () => {
  it("surfaces only verified capability labels from published evidence", () => {
    const selected = selectPrivaiEarlyCapabilities(
      [section("Implemented capabilities", LIVE_CAPABILITIES_BODY, 40)],
      [
        mediaItem(
          "1",
          "Employee Safe Prompt Check — evaluates proposed AI use before information is submitted to an AI tool.",
          10,
        ),
      ],
    );

    expect(selected).toEqual([
      "Employee Safe Prompt Check",
      "Deterministic sensitive-data detection and risk scoring",
      "AI tool registry",
      "Governance review",
      "Remediation ownership and status tracking",
      "Governance audit evidence",
    ]);
    expect(selected).toHaveLength(PRIVAI_EARLY_CAPABILITY_CANDIDATES.length);
  });

  it("omits candidates that are not present in published copy or captions", () => {
    const selected = selectPrivaiEarlyCapabilities(
      [section("Problem", "Shadow AI creates operational governance gaps.", 10)],
      [
        mediaItem(
          "1",
          "Employee Safe Prompt Check — evaluates proposed AI use before information is submitted to an AI tool.",
          10,
        ),
      ],
    );

    expect(selected).toEqual(["Employee Safe Prompt Check"]);
  });

  it("does not invent production or autonomous-decision claims", () => {
    for (const candidate of PRIVAI_EARLY_CAPABILITY_CANDIDATES) {
      expect(candidate.label.toLowerCase()).not.toContain("production");
      expect(candidate.label.toLowerCase()).not.toContain("enterprise");
      expect(candidate.label.toLowerCase()).not.toContain("saas");
      expect(candidate.label.toLowerCase()).not.toContain("autonomous");
    }
  });
});

describe("privai screenshot announcement", () => {
  const preview = mediaItem(
    "prompt",
    "Employee Safe Prompt Check — evaluates proposed AI use before information is submitted to an AI tool.",
    10,
  );

  it("keeps the early preview visual while excluding a duplicate accessible screenshot", () => {
    const presentation = projectScreenshotPresentation(
      "decorative-preview",
      preview,
    );

    expect(presentation.figureAriaHidden).toBe(true);
    expect(presentation.imageAlt).toBe("");
    expect(presentation.linkHref).toBeNull();
    expect(presentation.linkAriaLabel).toBeNull();
    expect(presentation.caption).toBe(preview.caption);
  });

  it("keeps the gallery screenshot as the canonical accessible figure", () => {
    const presentation = projectScreenshotPresentation("canonical", preview);

    expect(presentation.figureAriaHidden).toBe(false);
    expect(presentation.imageAlt).toBe(preview.media.altText);
    expect(presentation.imageAlt).toContain("Safe Prompt Check");
    expect(presentation.linkHref).toBe(preview.media.publicUrl);
    expect(presentation.linkAriaLabel).toBe(
      `Open full-size screenshot: ${preview.media.altText}`,
    );
    expect(presentation.caption).toBe(preview.caption);
  });

  it("preserves the unique visual-workflow jump target and five-item gallery order", () => {
    const media = [
      mediaItem(
        "prompt",
        "Employee Safe Prompt Check — evaluates proposed AI use before information is submitted to an AI tool.",
        10,
      ),
      mediaItem(
        "review",
        "Governance review — brings risk, tool context, data-subject impact, and human decision points into one governed record.",
        20,
      ),
      mediaItem(
        "remediation",
        "Accountable remediation — converts identified risk into assigned work, priority, status, and follow-through.",
        30,
      ),
      mediaItem(
        "evidence",
        "Governance evidence — preserves review and workflow activity as an auditable record.",
        40,
      ),
      mediaItem(
        "dashboard",
        "Management visibility — summarizes AI-use checks, risk events, remediation, and governance activity.",
        50,
      ),
    ];

    expect(PRIVAI_VISUAL_EVIDENCE_HEADING_ID).toBe(
      "project-visual-evidence-heading",
    );
    expect(selectPrivaiEarlyPreview(media)?.id).toBe("prompt");
    expect(media.map((item) => item.id)).toEqual([
      "prompt",
      "review",
      "remediation",
      "evidence",
      "dashboard",
    ]);
    expect(media).toHaveLength(5);
    expect(privaiSectionAnchorId(PRIVAI_VISUAL_EVIDENCE_HEADING_ID)).toBe(
      PRIVAI_VISUAL_EVIDENCE_HEADING_ID,
    );
  });
});

describe("privai early visual preview", () => {
  it("uses the first screenshot in published sort order", () => {
    const media = [
      mediaItem(
        "prompt",
        "Employee Safe Prompt Check — evaluates proposed AI use before information is submitted to an AI tool.",
        10,
      ),
      mediaItem(
        "review",
        "Governance review — brings risk, tool context, data-subject impact, and human decision points into one governed record.",
        20,
      ),
    ];

    expect(selectPrivaiEarlyPreview(media)?.id).toBe("prompt");
    expect(selectPrivaiEarlyPreview([])).toBeNull();
  });
});

describe("privai section anchors", () => {
  it("accepts stable presentation ids and rejects heading fallbacks with spaces", () => {
    expect(privaiSectionAnchorId("workflow")).toBe("workflow");
    expect(privaiSectionAnchorId("professional-evidence")).toBe(
      "professional-evidence",
    );
    expect(privaiSectionAnchorId("Implemented capabilities")).toBeUndefined();
  });
});

describe("privai metadata and listing isolation", () => {
  it("keeps the source metadata description bounded as an MVP case study", () => {
    expect(PRIVAI_PAGE_DESCRIPTION.toLowerCase()).toContain("mvp");
    expect(PRIVAI_PAGE_DESCRIPTION.toLowerCase()).toContain("non-production");
    expect(PRIVAI_PAGE_DESCRIPTION.toLowerCase()).toContain("synthetic");
    expect(PRIVAI_PAGE_DESCRIPTION.toLowerCase()).not.toContain("saas");
    expect(PRIVAI_PAGE_DESCRIPTION.toLowerCase()).not.toContain("enterprise");
    expect(PRIVAI_PAGE_DESCRIPTION.toLowerCase()).not.toContain(
      "generally available",
    );
  });

  it("does not change the /projects PrivAI card evidence", () => {
    const evidence = projectCardEvidence({
      slug: "privai-guard",
      role: "Designed and developed",
      stack: [
        "Next.js",
        "React",
        "TypeScript",
        "Supabase/PostgreSQL",
        "Vercel",
        "GitHub",
      ],
    });

    expect(evidence.href).toBe("/projects/privai-guard");
    expect(evidence.caseStudyCta).toBe(true);
    expect(evidence.source).toBeNull();
    expect(evidence.contribution).toBe("Designed and developed");
  });
});
