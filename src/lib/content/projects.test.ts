import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  mapPublishedProjectMedia,
  toPresentationSection,
  type ProjectMediaRow,
} from "./project-map";

const PRIVAI_ID = "0002fb1b-5c40-41ea-98a9-e62de9dac37e";
const OTHER_ID = "5bdc43c9-91b6-44f0-b9f2-39200ab25be5";
const MEDIA_ID = "7c52e011-0000-4000-8000-000000000001";

const ELIGIBLE_ASSET = {
  id: MEDIA_ID,
  bucket_path: `project/${MEDIA_ID}/privai-guard-employee-safe-prompt.webp`,
  kind: "image",
  purpose: "project",
  title: "PrivAI Guard Safe Prompt Check",
  alt_text: "PrivAI Guard employee Safe Prompt Check screen",
  mime_type: "image/webp",
  byte_size: 30896,
  status: "published" as const,
  is_public: true,
};

function row(overrides: Partial<ProjectMediaRow> = {}): ProjectMediaRow {
  return {
    id: "7c52e021-0000-4000-8000-000000000001",
    project_id: PRIVAI_ID,
    display_role: "hero",
    caption:
      "Employee Safe Prompt Check — evaluates proposed AI use before information is submitted to an AI tool.",
    sort_order: 10,
    status: "published",
    media_assets: ELIGIBLE_ASSET,
    ...overrides,
  };
}

describe("project media mapping", () => {
  const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
  });
  it("maps published project screenshots in sort order", () => {
    const mapped = mapPublishedProjectMedia(
      [
        row({
          id: "7c52e021-0000-4000-8000-000000000002",
          sort_order: 20,
          display_role: "workflow",
          caption: "Governance review — later in the walkthrough.",
          media_assets: {
            ...ELIGIBLE_ASSET,
            id: "7c52e012-0000-4000-8000-000000000002",
            bucket_path:
              "project/7c52e012-0000-4000-8000-000000000002/privai-guard-governance-review.webp",
          },
        }),
        row(),
      ],
      PRIVAI_ID,
    );

    expect(mapped.map((item) => item.sortOrder)).toEqual([10, 20]);
    expect(mapped[0]?.role).toBe("hero");
    expect(mapped[0]?.media.altText).toContain("Safe Prompt Check");
    expect(mapped[0]?.media.publicUrl).toBe(
      "https://example.supabase.co/storage/v1/object/public/public-media/project/7c52e011-0000-4000-8000-000000000001/privai-guard-employee-safe-prompt.webp",
    );
  });

  it("omits unpublished relationships and ineligible media without fallback", () => {
    const mapped = mapPublishedProjectMedia(
      [
        row({ status: "draft" }),
        row({
          id: "7c52e021-0000-4000-8000-000000000003",
          media_assets: { ...ELIGIBLE_ASSET, is_public: false },
        }),
        row({
          id: "7c52e021-0000-4000-8000-000000000004",
          project_id: OTHER_ID,
        }),
      ],
      PRIVAI_ID,
    );

    expect(mapped).toEqual([]);
  });
});

describe("project section presentation ids", () => {
  it("maps the case-study headings to stable ids", () => {
    expect(
      toPresentationSection({
        id: "section-1",
        heading: "Workflow",
        body: "Check → Assess → Redirect → Act → Prove → See.",
        track: "all",
        sortOrder: 30,
      }).id,
    ).toBe("workflow");
    expect(
      toPresentationSection({
        id: "section-2",
        heading: "What this project demonstrates",
        body: "Evidence of applied implementation.",
        track: "all",
        sortOrder: 60,
      }).id,
    ).toBe("professional-evidence");
  });
});
