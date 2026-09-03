import { describe, expect, it } from "vitest";
import { selectReleaseLabel } from "./settings";

describe("selectReleaseLabel", () => {
  it("returns the hosted version label", () => {
    expect(
      selectReleaseLabel({
        contactFormEnabled: false,
        siteIndexable: false,
        releaseLabel: "Version 1.0",
      }),
    ).toBe("Version 1.0");
  });

  it("omits a blank or missing label instead of inventing one", () => {
    expect(selectReleaseLabel(null)).toBeNull();
    expect(
      selectReleaseLabel({
        contactFormEnabled: false,
        siteIndexable: false,
        releaseLabel: "   ",
      }),
    ).toBeNull();
  });
});
