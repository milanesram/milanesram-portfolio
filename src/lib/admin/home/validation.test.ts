import { describe, expect, it } from "vitest";
import { parseHomeHref, parseHomePageFormData } from "./validation";

function form(entries: Array<[string, string]>) {
  const data = new FormData();
  for (const [name, value] of entries) {
    data.append(name, value);
  }
  return data;
}

const required = [
  ["headline", "Headline"],
  ["lede", "Lede"],
  ["primary_cta_label", "View experience"],
  ["primary_cta_href", "/experience"],
  ["secondary_cta_label", "Read the PrivAI Guard case study"],
  ["secondary_cta_href", "/projects/privai-guard"],
  ["project_kicker", "Featured work · 2026"],
  ["project_heading", "PrivAI Guard"],
  ["project_problem", "Problem"],
  ["project_body", "Body"],
  ["project_cta_label", "Read"],
  ["project_cta_href", "/projects/privai-guard"],
  ["experience_kicker", "Experience"],
  ["experience_heading", "Selected recent work"],
  ["experience_lede", "Lede"],
  ["experience_cta_label", "View full experience"],
  ["experience_cta_href", "/experience"],
  ["credentials_kicker", "Credentials"],
  ["credentials_heading", "Education"],
  ["credentials_lede", "Lede"],
  ["credentials_cta_label", "View credentials"],
  ["credentials_cta_href", "/credentials"],
  ["focus_kicker", "Two tracks"],
  ["focus_heading", "One record"],
  ["focus_lede", "Lede"],
  ["closing_heading", "Review"],
  ["closing_body", "Body"],
  ["closing_primary_cta_label", "Resume"],
  ["closing_primary_cta_href", "/resume"],
  ["closing_secondary_cta_label", "Contact"],
  ["closing_secondary_cta_href", "/contact"],
  ["seo_title", "Title"],
  ["seo_description", "Description"],
  ["intent", "publish"],
] as Array<[string, string]>;

describe("home href validation", () => {
  it("accepts internal relative paths and https URLs", () => {
    expect(parseHomeHref("/experience", "CTA")).toEqual({
      ok: true,
      value: "/experience",
    });
    expect(parseHomeHref("https://example.com/x", "CTA").ok).toBe(true);
  });

  it("rejects unsafe schemes", () => {
    expect(parseHomeHref("javascript:alert(1)", "CTA").ok).toBe(false);
    expect(parseHomeHref("//evil.example", "CTA").ok).toBe(false);
  });
});

describe("home form validation", () => {
  it("rejects duplicate experience selections", () => {
    const data = form([
      ...required,
      ["experience_item_id", "b74f1a93-4c9c-47a2-9389-2a4590716fea"],
      ["experience_item_id", "b74f1a93-4c9c-47a2-9389-2a4590716fea"],
      ["experience_sort_b74f1a93-4c9c-47a2-9389-2a4590716fea", "10"],
    ]);

    expect(parseHomePageFormData(data)).toEqual({
      ok: false,
      error: "Experience selections must be unique.",
    });
  });

  it("accepts a valid published Home payload", () => {
    const data = form([
      ...required,
      ["chip_label", "Cybersecurity"],
      ["chip_sort", "10"],
      ["experience_item_id", "b74f1a93-4c9c-47a2-9389-2a4590716fea"],
      ["experience_sort_b74f1a93-4c9c-47a2-9389-2a4590716fea", "10"],
      ["credential_id", "bda3ebf4-4601-4a34-bfe5-9bb5b595d599"],
      ["credential_sort_bda3ebf4-4601-4a34-bfe5-9bb5b595d599", "10"],
      ["featured_project_id", "0002fb1b-5c40-41ea-98a9-e62de9dac37e"],
    ]);

    const parsed = parseHomePageFormData(data);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.chips).toEqual([
        { id: null, label: "Cybersecurity", sortOrder: 10 },
      ]);
      expect(parsed.value.experienceLinks[0]?.experienceItemId).toBe(
        "b74f1a93-4c9c-47a2-9389-2a4590716fea",
      );
    }
  });
});
