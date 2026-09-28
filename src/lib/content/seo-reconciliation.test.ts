import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PAGE_SEO_PATHS } from "@/lib/content/page-seo";
import { PRIVAI_PAGE_DESCRIPTION } from "@/lib/content/privai-evidence";
import { FOCUS_PUBLIC_ROUTES } from "@/content/site";

const root = resolve(import.meta.dirname, "../../..");

function source(path: string): string {
  return readFileSync(resolve(root, path), "utf8");
}

const MIGRATION = source(
  "supabase/migrations/20260927280000_reconcile_page_seo_and_footer_order.sql",
);
const ROUTES = source("src/content/site.ts");
const FOOTER = source("src/components/layout/SiteFooter.tsx");
const CONTACT = source("src/app/contact/page.tsx");
const METADATA = source("src/lib/metadata.ts");

const RESUME_DESCRIPTION =
  "Two role-aligned resumes for one professional record: privacy, compliance and assurance, or GRC, IT risk and security compliance.";

describe("seo reconciliation", () => {
  it("keeps the approved home identity in default metadata", () => {
    expect(METADATA).toContain(
      "Global Privacy, Compliance & Information Security Risk",
    );
    expect(METADATA).toContain(
      "Global privacy, compliance and information-security risk professional and former privacy regulator",
    );
    expect(METADATA).not.toContain("Privacy and AI Governance");
  });

  it("points privacy SEO at the canonical focus route", () => {
    expect(PAGE_SEO_PATHS["focus-privacy-ai-governance"]).toBe(
      "/focus/privacy-compliance-assurance",
    );
    expect(PAGE_SEO_PATHS["focus-cybersecurity-grc"]).toBe(
      "/focus/cybersecurity-grc",
    );
    expect(Object.values(PAGE_SEO_PATHS)).toContain(
      "/focus/privacy-compliance-assurance",
    );
  });

  it("lists privacy before GRC in the footer route order", () => {
    expect(FOCUS_PUBLIC_ROUTES.map((route) => route.slug)).toEqual([
      "privacy-compliance-assurance",
      "cybersecurity-grc",
    ]);
    expect(ROUTES.indexOf('href: "/focus/privacy-compliance-assurance"')).toBeLessThan(
      ROUTES.indexOf('href: "/focus/cybersecurity-grc"'),
    );
    expect(FOOTER).toContain("FOCUS_PUBLIC_ROUTES.map");
    expect(FOOTER).not.toContain("Privacy and AI Governance");
  });

  it("keeps résumé lane order privacy-first in metadata only", () => {
    expect(MIGRATION).toContain(
      `new_resume_description text := $t$${RESUME_DESCRIPTION}$t$`,
    );
    expect(MIGRATION).toContain("page_key = 'resume'");
    expect(MIGRATION).toContain("non-resume page SEO changed");
    expect(MIGRATION).not.toMatch(
      /UPDATE public\.(site_profile|home_page|about_page|focus_pages|projects|resume_tracks|contact_page|writing_page|credentials_page|experiences|experience_items)\b/,
    );
    expect(RESUME_DESCRIPTION.indexOf("privacy, compliance and assurance")).toBeLessThan(
      RESUME_DESCRIPTION.indexOf("GRC, IT risk"),
    );
    expect(RESUME_DESCRIPTION).not.toContain("Privacy and AI Governance");
  });

  it("keeps PrivAI metadata inside the non-production boundary", () => {
    expect(PRIVAI_PAGE_DESCRIPTION).toMatch(/non-production capstone/i);
    expect(PRIVAI_PAGE_DESCRIPTION).toMatch(/synthetic data only/i);
    expect(PRIVAI_PAGE_DESCRIPTION).not.toMatch(/production-ready|enterprise-ready/i);
    expect(PRIVAI_PAGE_DESCRIPTION).not.toMatch(/enterprise deployment/i);
  });

  it("does not advertise a structured inquiry in contact metadata wiring", () => {
    expect(CONTACT).toContain('generateRouteMetadata("contact")');
    expect(CONTACT).not.toContain("Send inquiry");
    expect(CONTACT).not.toContain("submit a request");
    expect(MIGRATION).toContain(
      "Email or LinkedIn for hands-on privacy, GRC, IT risk, security compliance, assurance and related technology-risk work.",
    );
    expect(MIGRATION).not.toMatch(/UPDATE public\.page_seo[\s\S]*page_key = 'contact'/);
  });
});
