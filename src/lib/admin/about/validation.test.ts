import { describe, expect, it } from "vitest";
import { parseAboutPageFormData } from "./validation";

function form(entries: Array<[string, string]>) {
  const data = new FormData();
  for (const [name, value] of entries) {
    data.append(name, value);
  }
  return data;
}

const required = [
  ["kicker", "About"],
  ["headline", "Headline"],
  ["lede", "Lede"],
  ["journey_heading", "Professional journey"],
  ["education_heading", "Education at a glance"],
  ["speaking_heading", "Speaking"],
  ["speaking_body", "Body"],
  ["boundaries_heading", "Professional boundaries"],
  ["seo_title", "About"],
  ["seo_description", "Description"],
  ["paragraph_body", "First paragraph."],
  ["paragraph_sort", "10"],
  ["speaking_item", "Academic audiences"],
  ["speaking_sort", "10"],
  ["boundary_item", "Licensed in the Philippines."],
  ["boundary_sort", "10"],
  ["intent", "publish"],
] as Array<[string, string]>;

describe("about form validation", () => {
  it("requires a headline and at least one paragraph", () => {
    expect(parseAboutPageFormData(form(required.slice(1))).ok).toBe(false);
    expect(
      parseAboutPageFormData(
        form(required.filter(([name]) => name !== "paragraph_body")),
      ).ok,
    ).toBe(false);
  });

  it("accepts the hosted About payload shape", () => {
    const parsed = parseAboutPageFormData(form(required));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.paragraphs).toHaveLength(1);
      expect(parsed.value.boundaryItems[0]?.body).toContain("Philippines");
    }
  });
});
