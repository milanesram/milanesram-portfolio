import { describe, expect, it } from "vitest";
import {
  PUBLIC_PROJECT_SOURCE_LINKS,
  projectCardEvidence,
} from "./project-card-evidence";

describe("projectCardEvidence", () => {
  it("surfaces a contribution line when role text is provided", () => {
    const evidence = projectCardEvidence({
      slug: "dbnms",
      role: "Project sponsor — led planning, development, and implementation",
      stack: ["Privacy operations", "Breach notification"],
    });

    expect(evidence.contribution).toBe(
      "Project sponsor — led planning, development, and implementation",
    );
    expect(evidence.stack).toEqual(["Privacy operations", "Breach notification"]);
    expect(evidence.href).toBe("/projects#dbnms");
    expect(evidence.caseStudyCta).toBe(false);
    expect(evidence.source).toBeNull();
  });

  it("omits the contribution label when role is blank", () => {
    const evidence = projectCardEvidence({
      slug: "npcrs",
      role: "   ",
      stack: [],
    });

    expect(evidence.contribution).toBeNull();
    expect(evidence.stack).toEqual([]);
  });

  it("omits blank stack items and does not invent a source URL", () => {
    const evidence = projectCardEvidence({
      slug: "npcrs",
      role: "Project sponsor — planning, development, and implementation",
      stack: ["", "  DPO registration  ", ""],
    });

    expect(evidence.stack).toEqual(["DPO registration"]);
    expect(evidence.source).toBeNull();
    expect(evidence.href).toBe("/projects#npcrs");
    expect(evidence.caseStudyCta).toBe(false);
  });

  it("keeps PrivAI Guard on the dedicated case-study route", () => {
    const evidence = projectCardEvidence({
      slug: "privai-guard",
      role: "Designed and developed",
      stack: ["Next.js", "TypeScript"],
    });

    expect(evidence.href).toBe("/projects/privai-guard");
    expect(evidence.caseStudyCta).toBe(true);
    expect(evidence.source).toBeNull();
    expect(evidence.contribution).toBe("Designed and developed");
    expect(evidence.stack).toEqual(["Next.js", "TypeScript"]);
  });

  it("does not require a dedicated detail route for the portfolio project", () => {
    const evidence = projectCardEvidence({
      slug: "milanesram-portfolio",
      role: "Designed, implemented, and maintains the production site and owner CMS",
      stack: ["Next.js", "TypeScript", "Supabase/PostgreSQL"],
    });

    expect(evidence.href).toBe("/projects#milanesram-portfolio");
    expect(evidence.caseStudyCta).toBe(false);
    expect(evidence.source).toEqual(
      PUBLIC_PROJECT_SOURCE_LINKS["milanesram-portfolio"],
    );
    expect(evidence.source?.href).toBe(
      "https://github.com/milanesram/milanesram-portfolio",
    );
  });

  it("does not attach a source CTA to an unknown slug", () => {
    const evidence = projectCardEvidence({
      slug: "javascript:alert(1)",
      role: "Contributor",
      stack: ["https://evil.example/payload"],
    });

    expect(evidence.source).toBeNull();
    expect(evidence.caseStudyCta).toBe(false);
    expect(evidence.href).toBe("/projects#javascript:alert(1)");
  });
});
