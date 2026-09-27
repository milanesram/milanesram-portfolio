import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../../..");

function source(path: string): string {
  return readFileSync(resolve(root, path), "utf8");
}

const MIGRATION = source(
  "supabase/migrations/20260927240000_publish_v43_public_resumes.sql",
);
const RESUME_QUERY = source("src/lib/content/resume.ts");

const PRIVACY_TITLE = "Privacy, Compliance & Assurance";
const GRC_TITLE = "GRC, IT Risk & Security Compliance";

describe("approved v4.3 public resume publication", () => {
  it("orders Privacy first and GRC second through hosted sort order", () => {
    expect(MIGRATION).toContain("slug = 'privacy-ai-governance'");
    expect(MIGRATION).toContain(`title = $t$${PRIVACY_TITLE}$t$`);
    expect(MIGRATION).toContain("SET sort_order = 10");
    expect(MIGRATION).toContain("slug = 'cybersecurity-grc'");
    expect(MIGRATION).toContain(`title = $t$${GRC_TITLE}$t$`);
    expect(MIGRATION).toContain("SET sort_order = 20");
    expect(RESUME_QUERY).toContain('.order("sort_order", { ascending: true })');
    expect(MIGRATION).toContain("unexpected resume track count");
    expect(MIGRATION).toContain("IF n <> 2 THEN");
  });

  it("keeps the existing public paths and records the approved byte sizes", () => {
    expect(MIGRATION).toContain(
      "public_resume/83ad7af1-c62b-4fd8-86d0-58dab7df99fb/rainier-milanes-privacy-compliance-assurance-resume.pdf",
    );
    expect(MIGRATION).toContain(
      "public_resume/ee95ba5e-394c-4af0-b393-1f7b486e8e21/rainier-milanes-grc-it-risk-security-compliance-resume.pdf",
    );
    expect(MIGRATION).toContain("860d65616301149d16f2aa4174ac6244cb18770799c55aa1731b28aea44561c1");
    expect(MIGRATION).toContain("e5b93ef6f68d4fb4c3149154cedf8f5545d3833e5c74a1483784262a0a6dd3d6");
    expect(MIGRATION).toContain("byte_size = 167446");
    expect(MIGRATION).toContain("byte_size = 167120");
    expect(MIGRATION).toContain("does not upload, overwrite, or delete Storage objects");
  });

  it("guards prior steps and does not rewrite unrelated pages", () => {
    expect(MIGRATION).toContain(
      "Global Privacy, Compliance & Information Security Risk Professional",
    );
    expect(MIGRATION).toContain("Legal Consultant");
    expect(MIGRATION).toContain(
      "Communications Chair, Data & Technology Student Leadership Council",
    );
    expect(MIGRATION).toContain("One professional record. Two role-aligned resumes.");
    expect(MIGRATION).not.toMatch(
      /UPDATE public\.(site_profile|home_page|page_seo|about_page|focus_pages|experiences|experience_items|contact_page|projects|resume_page)\b/,
    );
  });
});
