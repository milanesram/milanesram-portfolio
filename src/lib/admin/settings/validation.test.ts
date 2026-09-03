import { describe, expect, it } from "vitest";
import { parseSiteSettingsFormData } from "./validation";

function form(entries: Array<[string, string]>) {
  const data = new FormData();
  for (const [name, value] of entries) {
    data.append(name, value);
  }
  return data;
}

describe("site settings validation", () => {
  it("requires a hosted release label", () => {
    const parsed = parseSiteSettingsFormData(
      form([
        ["contact_form_enabled", "on"],
        ["site_indexable", "on"],
      ]),
    );

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error).toMatch(/Release label/i);
    }
  });

  it("accepts Version 1.0 without inventing identity copy", () => {
    const parsed = parseSiteSettingsFormData(
      form([["release_label", "Version 1.0"]]),
    );

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.releaseLabel).toBe("Version 1.0");
      expect(parsed.value.contactFormEnabled).toBe(false);
      expect(parsed.value.siteIndexable).toBe(false);
    }
  });
});
