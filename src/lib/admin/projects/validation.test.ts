import { describe, expect, it } from "vitest";
import {
  parseProjectFormData,
  parseProjectMediaFormData,
} from "./validation";

function form(entries: Array<[string, string]>) {
  const data = new FormData();
  for (const [name, value] of entries) {
    data.append(name, value);
  }
  return data;
}

const PROJECT_ID = "0002fb1b-5c40-41ea-98a9-e62de9dac37e";
const MEDIA_ID = "7c52e011-0000-4000-8000-000000000001";

describe("project media validation", () => {
  it("accepts a complete hosted screenshot relationship", () => {
    const parsed = parseProjectMediaFormData(
      form([
        ["project_id", PROJECT_ID],
        ["media_asset_id", MEDIA_ID],
        [
          "caption",
          "Employee Safe Prompt Check — evaluates proposed AI use before information is submitted to an AI tool.",
        ],
        ["display_role", "hero"],
        ["status", "published"],
        ["sort_order", "10"],
      ]),
    );

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }

    expect(parsed.value.projectId).toBe(PROJECT_ID);
    expect(parsed.value.mediaAssetId).toBe(MEDIA_ID);
    expect(parsed.value.displayRole).toBe("hero");
    expect(parsed.value.sortOrder).toBe(10);
  });

  it("rejects an invalid media UUID", () => {
    const parsed = parseProjectMediaFormData(
      form([
        ["project_id", PROJECT_ID],
        ["media_asset_id", "not-a-uuid"],
        ["caption", "A caption"],
        ["display_role", "workflow"],
        ["status", "published"],
        ["sort_order", "10"],
      ]),
    );

    expect(parsed).toEqual({
      ok: false,
      error: "Choose a screenshot media file.",
    });
  });

  it("rejects an unknown display role", () => {
    const parsed = parseProjectMediaFormData(
      form([
        ["project_id", PROJECT_ID],
        ["media_asset_id", MEDIA_ID],
        ["caption", "A caption"],
        ["display_role", "banner"],
        ["status", "published"],
        ["sort_order", "10"],
      ]),
    );

    expect(parsed).toEqual({
      ok: false,
      error: "Choose a valid display role.",
    });
  });

  it("rejects a blank caption", () => {
    const parsed = parseProjectMediaFormData(
      form([
        ["project_id", PROJECT_ID],
        ["media_asset_id", MEDIA_ID],
        ["caption", "   "],
        ["display_role", "workflow"],
        ["status", "published"],
        ["sort_order", "10"],
      ]),
    );

    expect(parsed.ok).toBe(false);
  });
});

describe("project form validation", () => {
  it("still accepts a complete hosted project payload", () => {
    const parsed = parseProjectFormData(
      form([
        ["slug", "privai-guard"],
        ["name", "PrivAI Guard"],
        ["tagline", "Shadow AI privacy-risk triage"],
        ["year_label", "2026"],
        ["role", "Designed and developed"],
        ["summary", "A Shadow AI governance MVP."],
        ["limits", "Non-production. Synthetic demonstration data only."],
        ["stack", "Next.js\nReact"],
        ["sort_order", "10"],
        ["intent", "keep"],
      ]),
    );

    expect(parsed.ok).toBe(true);
  });
});
