import { describe, expect, it } from "vitest";
import { parseFocusPageFormData } from "./validation";

function form(entries: Array<[string, string]>) {
  const data = new FormData();
  for (const [name, value] of entries) {
    data.append(name, value);
  }
  return data;
}

const required = [
  ["nav_label", "Cybersecurity / GRC"],
  ["slug", "cybersecurity-grc"],
  ["headline", "Cybersecurity, GRC, and IT risk"],
  ["summary", "Cybersecurity governance summary."],
  ["card_summary", "For cybersecurity, GRC, and IT-risk work."],
  ["sort_order", "10"],
  ["intent", "publish"],
] as Array<[string, string]>;

describe("focus form validation", () => {
  it("rejects duplicate experience selections", () => {
    const data = form([
      ...required,
      ["experience_item_id", "4fcf85b9-f34d-41c5-8ebd-ff37be9534ad"],
      ["experience_item_id", "4fcf85b9-f34d-41c5-8ebd-ff37be9534ad"],
      ["experience_sort_4fcf85b9-f34d-41c5-8ebd-ff37be9534ad", "10"],
    ]);

    expect(parseFocusPageFormData(data)).toEqual({
      ok: false,
      error: "Experience selections must be unique.",
    });
  });

  it("rejects duplicate credential selections", () => {
    const data = form([
      ...required,
      ["credential_id", "bda3ebf4-4601-4a34-bfe5-9bb5b595d599"],
      ["credential_id", "bda3ebf4-4601-4a34-bfe5-9bb5b595d599"],
      ["credential_sort_bda3ebf4-4601-4a34-bfe5-9bb5b595d599", "10"],
    ]);

    expect(parseFocusPageFormData(data)).toEqual({
      ok: false,
      error: "Credential selections must be unique.",
    });
  });

  it("rejects arbitrary foreign IDs", () => {
    const data = form([
      ...required,
      ["featured_project_id", "not-a-uuid"],
    ]);

    expect(parseFocusPageFormData(data)).toEqual({
      ok: false,
      error: "That selection is not valid.",
    });
  });

  it("accepts a valid Focus payload with UUID relationships", () => {
    const data = form([
      ...required,
      ["card_chips", "IT risk\nGRC"],
      ["featured_project_lede", "Control design and audit evidence."],
      ["featured_project_id", "0002fb1b-5c40-41ea-98a9-e62de9dac37e"],
      ["featured_publication_id", "93bc6513-f2e8-436c-9639-0eb59288aca7"],
      ["experience_item_id", "4fcf85b9-f34d-41c5-8ebd-ff37be9534ad"],
      ["experience_sort_4fcf85b9-f34d-41c5-8ebd-ff37be9534ad", "10"],
      ["credential_id", "bda3ebf4-4601-4a34-bfe5-9bb5b595d599"],
      ["credential_sort_bda3ebf4-4601-4a34-bfe5-9bb5b595d599", "10"],
    ]);

    const parsed = parseFocusPageFormData(data);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }

    expect(parsed.value.featuredProjectId).toBe(
      "0002fb1b-5c40-41ea-98a9-e62de9dac37e",
    );
    expect(parsed.value.featuredPublicationId).toBe(
      "93bc6513-f2e8-436c-9639-0eb59288aca7",
    );
    expect(parsed.value.experienceLinks).toEqual([
      {
        experienceItemId: "4fcf85b9-f34d-41c5-8ebd-ff37be9534ad",
        sortOrder: 10,
      },
    ]);
    expect(parsed.value.cardChips).toEqual(["IT risk", "GRC"]);
  });
});
