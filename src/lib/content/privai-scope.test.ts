import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PRIVAI_COMPACT_BOUNDARY } from "./privai-evidence";

const root = resolve(import.meta.dirname, "../../..");
const MIGRATION = readFileSync(
  resolve(root, "supabase/migrations/20260927270000_consolidate_privai_guard_scope_language.sql"),
  "utf8",
);

const LIMITS =
  "Northwestern MSIS capstone — cloud-deployed non-production MVP. Synthetic demonstration data only. Human governance review — not automated legal or regulatory decisioning.";
const BOUNDARY =
  "Not enterprise production software, a commercial multi-tenant SaaS product, or Northwestern-owned or Northwestern-endorsed commercial software.";
const HOME =
  "A Shadow AI governance MVP I designed and developed that turns risky employee AI use into structured privacy-risk triage, human review, and auditable remediation.";
const PUBLISHED = [LIMITS, BOUNDARY, HOME, PRIVAI_COMPACT_BOUNDARY].join("\n");

describe("PrivAI Guard scope language", () => {
  it("keeps one non-production capstone boundary", () => {
    expect(MIGRATION).toContain(LIMITS);
    expect(LIMITS).toMatch(/Northwestern MSIS capstone/i);
    expect(LIMITS).toMatch(/cloud-deployed non-production MVP/i);
    expect(LIMITS).toMatch(/Synthetic demonstration data only/);
    expect(LIMITS).toMatch(/Human governance review/);
    expect(PRIVAI_COMPACT_BOUNDARY).toBe(LIMITS);
  });

  it("keeps the demonstrated capabilities and the qualified re-engineering note", () => {
    expect(MIGRATION).toContain("Row Level Security");
    expect(MIGRATION).toContain("Next.js, React, and TypeScript");
    expect(MIGRATION).toContain("production-oriented re-engineering");
    expect(MIGRATION).toContain(
      "not represented here as released production functionality",
    );
    expect(HOME).toMatch(/privacy-risk triage/);
    expect(HOME).toMatch(/human review/);
    expect(HOME).toMatch(/auditable remediation/);
  });

  it("does not claim production or enterprise readiness", () => {
    expect(PUBLISHED).not.toMatch(/production-ready|enterprise-ready|enterprise production deployment/i);
    expect(PUBLISHED).not.toMatch(/guarantees compliance|ensures compliance/i);
    expect(PUBLISHED).not.toMatch(/automated legal determination/i);
    expect(BOUNDARY).toMatch(/Not enterprise production software/);
    expect(LIMITS).not.toContain("Public capability claims and screenshots");
    expect(MIGRATION).toContain("Vercel for cloud hosting");
  });

  it("does not create a focus lane or rewrite unrelated records", () => {
    expect(MIGRATION).not.toMatch(
      /UPDATE public\.(site_profile|about_page|experiences|experience_items|focus_pages|resume_tracks|contact_page|page_seo)\b/,
    );
    expect(MIGRATION).toContain("slug = 'privacy-compliance-assurance'");
    expect(MIGRATION).not.toContain("/focus/ai-governance");
  });
});
