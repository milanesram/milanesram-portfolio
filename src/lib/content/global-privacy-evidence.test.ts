import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../../..");

function source(path: string): string {
  return readFileSync(resolve(root, path), "utf8");
}

const MIGRATION = source(
  "supabase/migrations/20260927230000_promote_global_privacy_evidence.sql",
);
const ROUTES = source("src/content/site.ts");
const FOCUS = source("src/lib/content/focus.ts");
const PRIVACY_PAGE = source("src/app/focus/privacy-compliance-assurance/page.tsx");
const FOCUS_VIEW = source("src/components/focus/FocusView.tsx");
const PREVIEW = source("src/components/ui/ExperiencePreview.tsx");

const PROOF =
  "Presented Philippine breach and compliance developments and regulatory systems at Global Privacy Assembly meetings and represented the Philippines in APEC Cross-Border Privacy Rules discussions.";
const GPA =
  "Presented Philippine data-breach and compliance developments and the Data Breach Notification Management System (DBNMS) and National Privacy Commission Registration System (NPCRS) at Global Privacy Assembly (GPA) meetings from 2021 through 2024.";
const APEC =
  "Represented the Philippines in Asia-Pacific Economic Cooperation (APEC) Cross-Border Privacy Rules (CBPR) discussions and reported jurisdictional updates at a 2024 APEC digital-economy meeting in Peru.";
const GSMA =
  "Represented the Philippines at the 2023 GSMA Ministerial Programme and served as a panelist in a discussion on the metaverse.";
const DIALOGUE =
  "Participated in the delegation hosting the National Privacy Commission-hosted Global Privacy Assembly Dialogue in the Philippines in 2025.";

describe("global privacy evidence", () => {
  it("puts the privacy lane before GRC and keeps two lanes", () => {
    expect(MIGRATION).toContain("slug = 'privacy-ai-governance'");
    expect(MIGRATION).toContain("SET sort_order = 10");
    expect(MIGRATION).toContain("slug = 'cybersecurity-grc'");
    expect(MIGRATION).toContain("SET sort_order = 20");
    expect(FOCUS).toContain('.order("sort_order", { ascending: true })');
    expect(ROUTES).toContain('href: "/focus/privacy-compliance-assurance"');
    expect(ROUTES).toContain('href: "/focus/cybersecurity-grc"');
    expect(ROUTES.match(/href: "\/focus\//g)).toHaveLength(2);
    expect(PRIVACY_PAGE).toContain('generateRouteMetadata("focus-privacy-ai-governance")');
    expect(PRIVACY_PAGE).toContain('getPublishedFocusPage("privacy-compliance-assurance")');
    expect(PREVIEW).toContain("maxBullets = 2");
    expect(FOCUS_VIEW).toContain(
      'page.slug === "privacy-compliance-assurance" ? 8 : 2',
    );
  });

  it("adds one home proof and the approved international experience", () => {
    expect(MIGRATION).toContain(PROOF);
    expect(MIGRATION).toContain(GPA);
    expect(MIGRATION).toContain(
      "Prepared the 2023 DBNMS Innovation and 2024 NPCRS Accountability award entries.",
    );
    expect(MIGRATION).toContain("2023 GPA Global Privacy and Data Protection Awards Innovation finalist");
    expect(MIGRATION).toContain(APEC);
    expect(MIGRATION).toContain(GSMA);
    expect(MIGRATION).toContain(DIALOGUE);
    expect(MIGRATION).toContain("Cross-Border Privacy");
    expect(MIGRATION).toContain(
      "Global Privacy, Compliance & Information Security Risk Professional",
    );
  });

  it("does not overclaim authority or U.S. legal practice", () => {
    const published = [PROOF, GPA, APEC, GSMA, DIALOGUE].join("\n");
    expect(published).not.toMatch(/implemented APEC CBPR/i);
    expect(published).not.toMatch(/led APEC/i);
    expect(published).not.toMatch(/GPA leader/i);
    expect(published).not.toMatch(/global privacy authority/i);
    expect(published).not.toMatch(/U\.S\. privacy law/i);
    expect(published).not.toMatch(/CCPA|CPRA|HIPAA|GLBA/);
    expect(MIGRATION).toContain("prohibited claim stored");
    expect(APEC).toMatch(/discussions/);
    expect(APEC).not.toMatch(/implement/i);
    expect(GSMA).toMatch(/panelist/);
    expect(GSMA).not.toMatch(/\bled\b|\bchaired\b/i);
    expect(DIALOGUE).toMatch(/Participated in the delegation/);
    expect(DIALOGUE).not.toMatch(/chaired|led the/i);
  });

  it("leaves protected pages and Step 2 facts outside the update", () => {
    expect(MIGRATION).toContain("Legal Consultant");
    expect(MIGRATION).toContain(
      "Communications Chair, Data & Technology Student Leadership Council",
    );
    expect(MIGRATION).toContain(
      "Introduced pre- and post-production security implementation",
    );
    expect(MIGRATION).toContain("Data Processing System (DPS) and Data Protection Officer (DPO) registrations");
    expect(MIGRATION).not.toMatch(
      /UPDATE public\.(site_profile|home_page|page_seo|about_page|projects|resume_tracks|contact_page|publications|credentials)\b/,
    );
    expect(MIGRATION).toContain("GRC summary changed");
  });
});
