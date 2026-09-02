import { describe, expect, it } from "vitest";
import { parseResumeTrackFormData } from "./validation";

function form(entries: Array<[string, string]>) {
  const data = new FormData();
  for (const [name, value] of entries) {
    data.append(name, value);
  }
  return data;
}

const required = [
  ["slug", "cybersecurity-grc"],
  ["title", "Cybersecurity / GRC"],
  ["summary", "Controls and IT risk."],
  ["request_cta_label", "View this profile"],
  ["delivery_mode", "request"],
  ["sort_order", "10"],
  ["intent", "publish"],
] as Array<[string, string]>;

describe("resume track validation", () => {
  it("accepts a request track without media", () => {
    const parsed = parseResumeTrackFormData(form(required));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.deliveryMode).toBe("request");
      expect(parsed.value.mediaAssetId).toBeNull();
    }
  });

  it("rejects public_file without media", () => {
    const parsed = parseResumeTrackFormData(
      form(
        required.map(([name, value]) =>
          name === "delivery_mode" ? [name, "public_file"] : [name, value],
        ),
      ),
    );
    expect(parsed.ok).toBe(false);
  });
});
