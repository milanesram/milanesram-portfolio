import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../../..");

function source(path: string): string {
  return readFileSync(resolve(root, path), "utf8");
}

const HOME = source("src/app/page.tsx");
const ABOUT = source("src/app/about/page.tsx");
const CONTACT = source("src/app/contact/page.tsx");
const RESUME = source("src/app/resume/page.tsx");
const METADATA = source("src/lib/metadata.ts");
const ROUTES = source("src/content/site.ts");
const SCHEMA = source(
  "supabase/migrations/20260925193000_add_home_hero_kicker.sql",
);
const MIGRATION = source(
  "supabase/migrations/20260925193100_align_career_positioning_v40.sql",
);

describe("career positioning 2.0", () => {
  it("renders homepage sections in the approved order", () => {
    const markers = [
      "<HomeHero",
      'aria-label="Current signals"',
      "home.experienceSection.kicker",
      'id="role-focus"',
      'aria-label="Selected work"',
      "home.credentialsSection.kicker",
      "home.closing.heading",
    ];
    let previous = -1;

    for (const marker of markers) {
      const index = HOME.indexOf(marker);
      expect(index, marker).toBeGreaterThan(previous);
      previous = index;
    }

    expect(HOME.indexOf("<HomeFlagshipProject")).toBeGreaterThan(
      HOME.indexOf('id="role-focus"'),
    );
    expect(HOME).toContain("eyebrow={home.heroKicker}");
  });

  it("keeps the schema migration free of career-content cutover", () => {
    expect(SCHEMA).toContain("ADD COLUMN IF NOT EXISTS hero_kicker text");
    expect(SCHEMA).toContain("hero_kicker IS NULL");
    expect(SCHEMA).not.toContain("SET NOT NULL");
    expect(SCHEMA).not.toContain("READY NOW. BUILT TO ADAPT.");
    expect(SCHEMA).not.toContain("UPDATE public.");
    expect(MIGRATION).toContain("READY NOW. BUILT TO ADAPT.");
    expect(MIGRATION).not.toContain("ADD COLUMN");
    expect(MIGRATION).not.toContain("SET NOT NULL");
  });

  it("keeps focus route slugs and updates public labels", () => {
    expect(ROUTES).toContain('slug: "cybersecurity-grc"');
    expect(ROUTES).toContain('href: "/focus/cybersecurity-grc"');
    expect(ROUTES).toContain('slug: "privacy-ai-governance"');
    expect(ROUTES).toContain('href: "/focus/privacy-ai-governance"');
    expect(ROUTES).toContain('navLabel: "GRC, IT Risk & Security Compliance"');
    expect(ROUTES).toContain('navLabel: "Privacy, Compliance & Assurance"');
    expect(ROUTES).not.toContain('navLabel: "Cybersecurity / GRC"');
    expect(ROUTES).not.toContain('navLabel: "Privacy / AI Governance"');
  });

  it("does not hardcode the retired about transition headline", () => {
    expect(ABOUT).not.toContain(
      "From privacy and governance work to cybersecurity and risk",
    );
    expect(MIGRATION).toContain(
      "Privacy, compliance and information-security risk across operations, regulation and technology.",
    );
    expect(MIGRATION).not.toContain(
      "Cybersecurity, GRC, IT risk, data privacy, and AI governance practitioner.",
    );
  });

  it("uses the new identity in root metadata and hosted SEO", () => {
    expect(METADATA).toContain("Privacy, Compliance, GRC & IT Risk");
    expect(METADATA).not.toContain("Cybersecurity, GRC, IT Risk & Privacy");
    expect(MIGRATION).toContain(
      "Rainier (Ram) Milanes | Privacy, Compliance, GRC & IT Risk",
    );
    expect(MIGRATION).toContain("GRC, IT Risk & Security Compliance | Ram Milanes");
    expect(MIGRATION).toContain("Privacy, Compliance & Assurance | Ram Milanes");
    expect(MIGRATION).toContain("Resume | Privacy, GRC & IT Risk");
  });

  it("keeps two resume tracks and does not relabel V3.1 PDFs as V4.0", () => {
    expect(RESUME).toContain("<ResumeTracks");
    expect(RESUME).not.toContain("Resume C");
    expect(MIGRATION).toContain("Resume A — GRC, IT Risk & Security Compliance");
    expect(MIGRATION).toContain("Resume B — Privacy, Compliance & Assurance");
    expect(MIGRATION).toContain("delivery_mode = 'request'");
    expect(MIGRATION).toContain("a V3.1 resume binary was relabeled V4.0");
    expect(MIGRATION).not.toContain("Resume C");
  });

  it("keeps PrivAI Guard's non-production boundary in hosted copy", () => {
    expect(MIGRATION).toContain("Synthetic demonstration data only.");
    expect(MIGRATION).toContain("Human governance review");
    expect(MIGRATION).toContain("No automated legal or regulatory decisioning.");
    expect(MIGRATION).toContain("not a commercial multi-tenant SaaS product");
    expect(MIGRATION).toContain(
      "Public capability claims and screenshots on this page describe the validated capstone MVP unless explicitly identified otherwise.",
    );
  });

  it("does not expose a phone number on the contact page", () => {
    expect(CONTACT).not.toMatch(/tel:/i);
    expect(CONTACT).not.toMatch(/phone/i);
    expect(MIGRATION).toContain("Start a professional conversation");
    expect(MIGRATION).not.toMatch(/phone number/i);
  });

  it("does not relax contact-form or indexability controls", () => {
    expect(MIGRATION).toContain("contact form is not unpublished");
    expect(MIGRATION).toContain("page indexability drifted");
    expect(MIGRATION).not.toMatch(/ENABLE ROW LEVEL SECURITY|CREATE POLICY|GRANT /);
  });
});
