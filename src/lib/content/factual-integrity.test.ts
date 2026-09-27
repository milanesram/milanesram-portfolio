import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../../..");

function source(path: string): string {
  return readFileSync(resolve(root, path), "utf8");
}

const MIGRATION = source(
  "supabase/migrations/20260927220000_reconcile_portfolio_factual_integrity.sql",
);
const METRICS = source("src/content/metrics.ts");
const HISTORICAL = source(
  "supabase/migrations/20260906120000_reconcile_career_content_v31.sql",
);

const CSMCC =
  "Introduced pre- and post-production security implementation for the Compliance and Security Monitoring Command Center, reviewed execution, and provided guidance on privacy and security alignment.";
const REGISTRATIONS =
  "Supported more than 10,000 Data Processing System (DPS) and Data Protection Officer (DPO) registrations by 30 September 2024 after the registration system launched in 2023.";

describe("portfolio factual integrity", () => {
  it("corrects the four hosted facts without broadening the migration", () => {
    expect(MIGRATION).toContain("Legal Consultant");
    expect(MIGRATION).toContain(
      "Communications Chair, Data & Technology Student Leadership Council",
    );
    expect(MIGRATION).toContain(CSMCC);
    expect(MIGRATION).toContain(
      "provided guidance on alignment with Privacy by Design and by Default.",
    );
    expect(MIGRATION).toContain(REGISTRATIONS);
    expect(MIGRATION).toContain(
      "Data Processing System (DPS) and Data Protection Officer (DPO) registrations were on record",
    );
    expect(MIGRATION).toContain(
      "Additional designation: Data Protection Officer",
    );
    expect(MIGRATION).toContain("DPS and DPO registered entities");
    expect(REGISTRATIONS).not.toMatch(/registered entities/i);
    expect(MIGRATION).not.toMatch(
      /UPDATE public\.(site_profile|home_page|page_seo|about_page|focus_pages|projects|resume_tracks|resume_page|contact_page|writing_page|credentials_page)\b/,
    );
    expect(MIGRATION).not.toMatch(/CCPA|CPRA|HIPAA|GLBA/i);
  });

  it("keeps the unused metric copy aligned with the registration count", () => {
    expect(METRICS).toContain("10,000+");
    expect(METRICS).toContain("DPS and DPO registrations");
    expect(METRICS).toContain(
      "Data Processing System (DPS) and Data Protection Officer (DPO) registrations were on record",
    );
    expect(METRICS).not.toMatch(/registered entities/i);
  });

  it("does not rewrite the historical v3.1 migration", () => {
    expect(HISTORICAL).toContain("Legal Officer");
    expect(HISTORICAL).not.toContain(
      "Communications Chair, Data & Technology Student Leadership Council",
    );
  });
});
