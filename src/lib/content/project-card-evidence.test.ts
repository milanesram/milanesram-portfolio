import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PUBLIC_PROJECT_LINKS,
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
    expect(evidence.sources).toEqual([]);
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
    expect(evidence.sources).toEqual([]);
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
    expect(evidence.sources).toEqual([]);
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
    expect(evidence.sources).toEqual(
      PUBLIC_PROJECT_LINKS["milanesram-portfolio"],
    );
    expect(evidence.sources[0]?.href).toBe(
      "https://github.com/milanesram/milanesram-portfolio",
    );
  });

  it("keeps Tuloy on the listing and allowlists both public links", () => {
    const evidence = projectCardEvidence({
      slug: "tuloy",
      role: "Personal workspace",
      stack: ["Next.js"],
    });

    expect(evidence.href).toBe("/projects#tuloy");
    expect(evidence.caseStudyCta).toBe(false);
    expect(evidence.sources).toEqual(PUBLIC_PROJECT_LINKS.tuloy);
    expect(evidence.sources.map((link) => link.href)).toEqual([
      "https://tuloy-career.creamykite256.chatgpt.site/about/",
      "https://github.com/milanesram/tuloy",
    ]);
    expect(evidence.sources.map((link) => link.label)).toEqual([
      "About Tuloy",
      "View on GitHub",
    ]);
  });

  it("does not attach a source CTA to an unknown slug", () => {
    const evidence = projectCardEvidence({
      slug: "javascript:alert(1)",
      role: "Contributor",
      stack: ["https://evil.example/payload"],
    });

    expect(evidence.sources).toEqual([]);
    expect(evidence.caseStudyCta).toBe(false);
    expect(evidence.href).toBe("/projects#javascript:alert(1)");
  });

  it("does not treat object-prototype keys as project links", () => {
    const evidence = projectCardEvidence({
      slug: "constructor",
      role: "Contributor",
      stack: [],
    });

    expect(evidence.sources).toEqual([]);
  });
});

describe("Tuloy publication migration", () => {
  const migration = readFileSync(
    resolve(
      import.meta.dirname,
      "../../../supabase/migrations/20261023180000_publish_tuloy_project.sql",
    ),
    "utf8",
  );

  it("inserts one listing record and does not store external links", () => {
    expect(migration).toContain("'tuloy'");
    expect(migration).toContain("39b4576a-17a0-431e-b8b4-1d56ddcc0b30");
    expect(migration).toContain("sort_order = 50");
    expect(migration).not.toContain("tuloy-career.creamykite256");
    expect(migration).not.toContain("github.com/milanesram/tuloy");
    expect(migration).not.toContain("localhost");
    expect(migration).not.toContain("127.0.0.1");
    expect(migration).not.toMatch(/UPDATE public\.projects/);
  });
});
