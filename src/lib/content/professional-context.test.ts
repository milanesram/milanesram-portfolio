import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const LAW_DISCLAIMER =
  "Licensed to Practice Law in the Philippines. Not licensed to practice law in the United States.";

const FOOTER_SOURCE = readFileSync(
  resolve(import.meta.dirname, "../../components/layout/SiteFooter.tsx"),
  "utf8",
);
const ABOUT_PAGE_SOURCE = readFileSync(
  resolve(import.meta.dirname, "../../app/about/page.tsx"),
  "utf8",
);
const RESUME_PAGE_SOURCE = readFileSync(
  resolve(import.meta.dirname, "../../app/resume/page.tsx"),
  "utf8",
);

describe("professional law disclaimer placement", () => {
  it("does not render a code-level About fallback when CMS boundaries are absent", () => {
    expect(ABOUT_PAGE_SOURCE).not.toContain("AboutProfessionalContext");
    expect(ABOUT_PAGE_SOURCE).not.toContain("aboutAlreadyIncludesLawDisclaimer");
    expect(ABOUT_PAGE_SOURCE).not.toContain("Professional context");
    expect(ABOUT_PAGE_SOURCE).not.toContain(LAW_DISCLAIMER);
    expect(ABOUT_PAGE_SOURCE).not.toContain(
      "Licensed to Practice Law in the Philippines",
    );
    expect(
      existsSync(
        resolve(
          import.meta.dirname,
          "../../components/about/AboutProfessionalContext.tsx",
        ),
      ),
    ).toBe(false);
    expect(existsSync(resolve(import.meta.dirname, "./professional-context.ts"))).toBe(
      false,
    );
  });

  it("is absent from the global footer", () => {
    expect(FOOTER_SOURCE).not.toContain("Licensed to Practice Law");
    expect(FOOTER_SOURCE).not.toContain(LAW_DISCLAIMER);
  });

  it("is not repeated on Resume", () => {
    expect(RESUME_PAGE_SOURCE).not.toContain("Licensed to Practice Law");
  });
});
