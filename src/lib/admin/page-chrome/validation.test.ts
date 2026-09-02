import { describe, expect, it } from "vitest";
import { parseIndexChromeFormData } from "./validation";

function form(entries: Array<[string, string]>) {
  const data = new FormData();
  for (const [name, value] of entries) {
    data.append(name, value);
  }
  return data;
}

describe("index chrome validation", () => {
  it("requires additional heading only when requested", () => {
    const without = parseIndexChromeFormData(
      form([
        ["kicker", "Projects"],
        ["headline", "Selected work"],
        ["lede", "Applied evidence."],
        ["intent", "publish"],
      ]),
    );
    expect(without.ok).toBe(true);

    const missing = parseIndexChromeFormData(
      form([
        ["kicker", "Experience"],
        ["headline", "Headline"],
        ["lede", "Lede"],
        ["intent", "publish"],
      ]),
      { additionalHeading: true },
    );
    expect(missing.ok).toBe(false);
  });
});
