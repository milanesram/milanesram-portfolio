import { describe, expect, it } from "vitest";
import { mapIndexChrome } from "./index-chrome";

describe("index chrome mapping", () => {
  it("maps published chrome and ignores drafts", () => {
    expect(
      mapIndexChrome(
        {
          status: "published",
          kicker: "Experience",
          headline: "Governance, risk, and privacy work in practice.",
          lede: "Assessment, controls, compliance operations.",
        },
        "Experience",
      ),
    ).toEqual({
      kicker: "Experience",
      headline: "Governance, risk, and privacy work in practice.",
      lede: "Assessment, controls, compliance operations.",
    });

    expect(
      mapIndexChrome(
        {
          status: "draft",
          kicker: "Experience",
          headline: "Headline",
          lede: "Lede",
        },
        "Experience",
      ),
    ).toBeNull();
  });
});
