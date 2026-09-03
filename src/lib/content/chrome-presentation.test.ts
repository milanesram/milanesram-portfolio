import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { HEADER_HOME_HREF } from "./site-profile";

const HEADER_SOURCE = readFileSync(
  resolve(import.meta.dirname, "../../components/layout/SiteHeader.tsx"),
  "utf8",
);
const FOOTER_SOURCE = readFileSync(
  resolve(import.meta.dirname, "../../components/layout/SiteFooter.tsx"),
  "utf8",
);
const PUBLICATIONS_SOURCE = readFileSync(
  resolve(import.meta.dirname, "./publications.ts"),
  "utf8",
);
const HOME_PAGE_SOURCE = readFileSync(
  resolve(import.meta.dirname, "../../app/page.tsx"),
  "utf8",
);
const HOME_MIGRATION_SOURCE = readFileSync(
  resolve(
    import.meta.dirname,
    "../../../supabase/migrations/20260903010000_release_label_resume_chrome.sql",
  ),
  "utf8",
);

describe("header brand chrome", () => {
  it("links the hosted display name to Home", () => {
    expect(HEADER_HOME_HREF).toBe("/");
    expect(HEADER_SOURCE).toContain("selectHeaderIdentity");
    expect(HEADER_SOURCE).toContain("displayName");
    expect(HEADER_SOURCE).toContain("href={href}");
    expect(HEADER_SOURCE).not.toContain("Ram Milanes");
    expect(HEADER_SOURCE).not.toContain("shortName");
  });
});

describe("footer chrome", () => {
  it("renders hosted identity and version without a law disclaimer", () => {
    expect(FOOTER_SOURCE).toContain("selectFooterIdentity");
    expect(FOOTER_SOURCE).toContain("identity.displayName");
    expect(FOOTER_SOURCE).toContain("identity.headline");
    expect(FOOTER_SOURCE).toContain("releaseLabel");
    expect(FOOTER_SOURCE).not.toContain("Licensed to Practice Law");
    expect(FOOTER_SOURCE).not.toContain("Rainier (Ram) Milanes");
    expect(FOOTER_SOURCE).not.toContain(
      "Cybersecurity, GRC, IT risk, and privacy professional.",
    );
  });
});

describe("writing relevance copy", () => {
  it("does not keep a both-tracks fallback in publication mapping", () => {
    expect(PUBLICATIONS_SOURCE).not.toContain("Relevant to both tracks");
    expect(PUBLICATIONS_SOURCE).toContain("formatFocusRelevanceLabels");
  });
});

describe("home resume-count copy", () => {
  it("renders hosted Focus chrome instead of hardcoded two-track copy", () => {
    expect(HOME_PAGE_SOURCE).toContain("home.focusSection.kicker");
    expect(HOME_PAGE_SOURCE).toContain("home.focusSection.title");
    expect(HOME_PAGE_SOURCE).toContain("home.focusSection.lede");
    expect(HOME_PAGE_SOURCE).not.toMatch(/Two tracks|Two recruiter packets|both tracks/i);
  });

  it("updates hosted Home Focus chrome in the unapplied 52J-A.1 migration", () => {
    expect(HOME_MIGRATION_SOURCE).toContain("UPDATE public.home_page");
    expect(HOME_MIGRATION_SOURCE).toContain("Resume options");
    expect(HOME_MIGRATION_SOURCE).toContain(
      "One professional record. Focused recruiter packets.",
    );
    expect(HOME_MIGRATION_SOURCE).not.toMatch(/Two tracks|Two recruiter packets|both tracks/i);
  });
});
