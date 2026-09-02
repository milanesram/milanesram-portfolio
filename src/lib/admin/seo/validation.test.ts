import { describe, expect, it } from "vitest";
import { parsePageSeoFormData } from "./validation";

function form(entries: Array<[string, string]>) {
  const data = new FormData();
  for (const [name, value] of entries) {
    data.append(name, value);
  }
  return data;
}

describe("page SEO validation", () => {
  it("rejects unknown page keys", () => {
    const parsed = parsePageSeoFormData(
      form([
        ["page_key", "mystery"],
        ["title", "Title"],
        ["description", "Description"],
        ["intent", "keep"],
      ]),
    );

    expect(parsed.ok).toBe(false);
  });

  it("allows blank OG fields", () => {
    const parsed = parsePageSeoFormData(
      form([
        ["page_key", "resume"],
        ["title", "Resume"],
        ["description", "Request-based packets."],
        ["intent", "keep"],
        ["indexable", "on"],
      ]),
    );

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.ogTitle).toBeNull();
      expect(parsed.value.indexable).toBe(true);
    }
  });
});
