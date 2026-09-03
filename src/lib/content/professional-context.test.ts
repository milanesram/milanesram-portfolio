import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  aboutAlreadyIncludesLawDisclaimer,
  PROFESSIONAL_LAW_DISCLAIMER,
  selectAboutProfessionalContext,
} from "./professional-context";

const FOOTER_SOURCE = readFileSync(
  resolve(import.meta.dirname, "../../components/layout/SiteFooter.tsx"),
  "utf8",
);
const ABOUT_PAGE_SOURCE = readFileSync(
  resolve(import.meta.dirname, "../../app/about/page.tsx"),
  "utf8",
);
const ABOUT_CONTEXT_SOURCE = readFileSync(
  resolve(
    import.meta.dirname,
    "../../components/about/AboutProfessionalContext.tsx",
  ),
  "utf8",
);
const RESUME_PAGE_SOURCE = readFileSync(
  resolve(import.meta.dirname, "../../app/resume/page.tsx"),
  "utf8",
);

describe("professional law disclaimer placement", () => {
  it("keeps the exact factual wording", () => {
    expect(PROFESSIONAL_LAW_DISCLAIMER).toBe(
      "Licensed to Practice Law in the Philippines. Not licensed to practice law in the United States.",
    );
    expect(selectAboutProfessionalContext().disclaimer).toBe(
      PROFESSIONAL_LAW_DISCLAIMER,
    );
  });

  it("is absent from the global footer", () => {
    expect(FOOTER_SOURCE).not.toContain("Licensed to Practice Law");
    expect(FOOTER_SOURCE).not.toContain(PROFESSIONAL_LAW_DISCLAIMER);
  });

  it("is present in About professional context when hosted copy does not already include it", () => {
    expect(ABOUT_PAGE_SOURCE).toContain("AboutProfessionalContext");
    expect(ABOUT_PAGE_SOURCE).toContain("aboutAlreadyIncludesLawDisclaimer");
    expect(ABOUT_CONTEXT_SOURCE).toContain("selectAboutProfessionalContext");
  });

  it("is not repeated on Resume", () => {
    expect(RESUME_PAGE_SOURCE).not.toContain("Licensed to Practice Law");
  });

  it("does not add a second About copy when hosted professional boundaries already include it", () => {
    expect(
      aboutAlreadyIncludesLawDisclaimer({
        boundaryItems: [{ body: PROFESSIONAL_LAW_DISCLAIMER }],
      }),
    ).toBe(true);
    expect(
      aboutAlreadyIncludesLawDisclaimer({
        paragraphs: [{ body: "An earned Northwestern MSIS." }],
        boundaryItems: [{ body: "This site presents selected professional evidence." }],
      }),
    ).toBe(false);
  });
});
