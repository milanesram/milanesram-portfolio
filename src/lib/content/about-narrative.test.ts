import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../../..");
const MIGRATION = readFileSync(
  resolve(root, "supabase/migrations/20260927250000_reconcile_about_career_narrative.sql"),
  "utf8",
);

const ORIGIN =
  "Early technical, administrative and operational work exposed me to systems, records, infrastructure and service delivery before corporate law, compliance and operational leadership. In 2017, as designated Data Protection Officer, that work expanded into a privacy manual, policy, management program and staff orientation.";
const REGULATOR =
  "At the National Privacy Commission I served as Information Technology Officer III, designated Chief, Compliance and Monitoring Division. The role combined compliance monitoring, breach handling, privacy and security assessments, regulatory systems and implementation, and included international engagement: presenting Philippine developments and regulatory systems at Global Privacy Assembly meetings and representing the Philippines in APEC Cross-Border Privacy Rules discussions.";
const CURRENT =
  "I later deepened the technical side through Northwestern University's MS in Information Systems, Security Specialization, and PrivAI Guard, a capstone MVP with production-oriented re-engineering. As Principal Consultant of RAM Privacy and Security, an independent privacy, cybersecurity and risk practice, I turn obligations and risk into controls, remediation and auditable evidence.";
const GPA =
  "Participated in the delegation hosting the National Privacy Commission-hosted Global Privacy Assembly Dialogue in the Philippines, 2025.";
const GSMA =
  "Represented the Philippines as a panelist at the GSMA Ministerial Programme in Spain, 2023.";

const PUBLISHED = [ORIGIN, REGULATOR, CURRENT, GPA, GSMA].join("\n");

describe("about career narrative", () => {
  it("corrects the career origin without listing every early job", () => {
    expect(MIGRATION).toContain("My career began in legal and compliance work");
    expect(ORIGIN).toMatch(/Early technical, administrative and operational work/);
    expect(ORIGIN).toMatch(/corporate law, compliance/);
    expect(ORIGIN).toMatch(/2017/);
    expect(ORIGIN).toMatch(/Data Protection Officer/);
    expect(ORIGIN).not.toMatch(/began in legal/i);
    expect(ORIGIN).not.toMatch(/mechanic|construction|real estate|internship/i);
  });

  it("keeps one progression from privacy operations through consulting", () => {
    expect(MIGRATION).toContain(ORIGIN);
    expect(MIGRATION).toContain(REGULATOR);
    expect(MIGRATION).toContain(CURRENT);
    expect(REGULATOR).toMatch(/Information Technology Officer III/);
    expect(REGULATOR).toMatch(/Chief, Compliance and Monitoring Division/);
    expect(REGULATOR).toMatch(/Global Privacy Assembly/);
    expect(REGULATOR).toMatch(/APEC Cross-Border Privacy Rules/);
    expect(CURRENT).toMatch(/Northwestern University's MS in Information Systems/);
    expect(CURRENT).toMatch(/PrivAI Guard/);
    expect(CURRENT).toMatch(/capstone MVP/);
    expect(CURRENT).toMatch(/Principal Consultant/);
    expect(CURRENT).toMatch(/independent privacy, cybersecurity and risk practice/);
    expect(CURRENT).not.toMatch(/AI executive|AI engineer|AI governance specialist/i);
  });

  it("narrows journey captions to the approved roles", () => {
    expect(MIGRATION).toContain("Speaking on global privacy from the lectern Manila, 2025");
    expect(MIGRATION).toContain(GPA);
    expect(GPA).toMatch(/Participated in the delegation/);
    expect(GPA).toMatch(/2025/);
    expect(GPA).not.toMatch(/speaking|lectern|led|chaired/i);
    expect(MIGRATION).toContain(GSMA);
    expect(GSMA).toMatch(/panelist/);
    expect(GSMA).not.toMatch(/^Speaking/);
  });

  it("does not add unsupported authority or rewrite other pages", () => {
    expect(PUBLISHED).not.toMatch(/implemented APEC CBPR/i);
    expect(PUBLISHED).not.toMatch(/led APEC/i);
    expect(PUBLISHED).not.toMatch(/GPA leader|global privacy authority/i);
    expect(PUBLISHED).not.toMatch(/treaty|U\.S\. privacy attorney|U\.S\. privacy lawyer|CCPA|CPRA|HIPAA|GLBA/i);
    expect(MIGRATION).not.toMatch(
      /UPDATE public\.(site_profile|home_page|page_seo|focus_pages|experiences|experience_items|resume_tracks|contact_page|projects)\b/,
    );
    expect(MIGRATION).toContain(
      "Privacy, compliance and information-security risk across operations, regulation and technology.",
    );
  });
});
