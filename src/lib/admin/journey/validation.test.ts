import { describe, expect, it } from "vitest";
import { parseJourneyMilestoneFormData, parseJourneyYear } from "./validation";
import { canPublishJourneyMilestone } from "@/lib/content/about-page";

function form(entries: Array<[string, string]>) {
  const data = new FormData();
  for (const [name, value] of entries) {
    data.append(name, value);
  }
  return data;
}

describe("journey year validation", () => {
  it("accepts a blank year or 2025", () => {
    expect(parseJourneyYear("")).toEqual({ ok: true, value: null });
    expect(parseJourneyYear("2025")).toEqual({ ok: true, value: 2025 });
  });
});

describe("journey form validation", () => {
  it("requires title and caption", () => {
    expect(
      parseJourneyMilestoneFormData(
        form([
          ["title", ""],
          ["caption", "Caption"],
          ["year", "2026"],
          ["sort_order", "60"],
          ["intent", "draft"],
        ]),
      ).ok,
    ).toBe(false);
  });

  it("accepts a draft graduation without media", () => {
    const parsed = parseJourneyMilestoneFormData(
      form([
        ["title", "Northwestern University — MSIS Graduation"],
        ["caption", "Completed the Master of Science in Information Systems."],
        ["year", "2026"],
        ["sort_order", "60"],
        ["intent", "draft"],
      ]),
    );

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.mediaAssetId).toBeNull();
      expect(parsed.value.year).toBe(2026);
      expect(
        canPublishJourneyMilestone({
          intentStatus: "draft",
          media: null,
        }),
      ).toBe(true);
      expect(
        canPublishJourneyMilestone({
          intentStatus: "published",
          media: null,
        }),
      ).toBe(false);
    }
  });
});
