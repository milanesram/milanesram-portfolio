import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../../..");

function source(path: string): string {
  return readFileSync(resolve(root, path), "utf8");
}

const METADATA = source("src/lib/metadata.ts");
const SOCIAL = source("src/app/opengraph-image.tsx");
const ROUTES = source("src/content/site.ts");
const SITEMAP = source("src/app/sitemap.ts");
const SITE_URL = source("src/lib/site-url.ts");
const MIGRATION = source(
  "supabase/migrations/20260927210000_align_global_professional_identity.sql",
);
const HISTORICAL = source(
  "supabase/migrations/20260925193100_align_career_positioning_v40.sql",
);

const IDENTITY = "Global Privacy, Compliance & Information Security Risk Professional";
const DESCRIPTION =
  "Global privacy, compliance and information-security risk professional and former privacy regulator with hands-on work across privacy operations, GRC, IT risk, security compliance, assurance, remediation and technology implementation.";

describe("global professional identity", () => {
  it("uses one shared identity in default metadata and the social card", () => {
    expect(METADATA).toContain(
      "Global Privacy, Compliance & Information Security Risk",
    );
    expect(METADATA).toContain(DESCRIPTION);
    expect(METADATA).toContain("template: `%s — ${shortName}`");
    expect(METADATA).not.toContain("Privacy, Compliance, GRC & IT Risk");
    expect(SOCIAL).toContain("Global Privacy · Compliance · Information Security Risk");
    expect(SOCIAL).toContain("profile?.headline");
    expect(SOCIAL).not.toContain("Cybersecurity · GRC · IT Risk · Privacy");
  });

  it("reconciles only the shared hosted identity records", () => {
    expect(MIGRATION).toContain(IDENTITY);
    expect(MIGRATION).toContain(DESCRIPTION);
    expect(MIGRATION).toContain(
      "Rainier (Ram) Milanes | Global Privacy, Compliance & Information Security Risk",
    );
    expect(MIGRATION).toContain("UPDATE public.site_profile");
    expect(MIGRATION).toContain("UPDATE public.home_page");
    expect(MIGRATION).toContain("page_key = 'home'");
    expect(MIGRATION).toContain("page_key <> 'home'");
    expect(MIGRATION).toContain("site_profile summary changed");
    expect(MIGRATION).toContain("home_page lede changed");
    expect(MIGRATION).not.toMatch(
      /UPDATE public\.(about_page|experience_page|experiences|focus_pages|projects|resume_tracks|resume_page|contact_page|writing_page|credentials_page)\b/,
    );
    expect(MIGRATION).not.toMatch(
      /CCPA|CPRA|HIPAA|GLBA|CISO|Chief Privacy Officer|executive privacy/i,
    );
  });

  it("keeps the historical positioning migration and public routes unchanged", () => {
    expect(HISTORICAL).toContain(
      "Privacy, Compliance & Information Security Risk Professional",
    );
    expect(HISTORICAL).not.toContain(IDENTITY);
    expect(ROUTES).toContain('href: "/focus/privacy-compliance-assurance"');
    expect(ROUTES).toContain('navLabel: "Privacy, Compliance & Assurance"');
    expect(ROUTES).toContain('navLabel: "GRC, IT Risk & Security Compliance"');
    expect(SITEMAP).toContain('"/focus/privacy-compliance-assurance"');
    expect(SITEMAP).not.toContain('"/focus/privacy-ai-governance"');
    expect(SITE_URL).toContain('export const CANONICAL_SITE_URL = "https://milanesram.com"');
  });
});
