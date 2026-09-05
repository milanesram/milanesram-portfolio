import { describe, expect, it } from "vitest";
import {
  HOME_ALL_PROJECTS_CTA,
  HOME_SUPPORTING_PROJECT_SPECS,
  mapHomeSupportingProject,
  mapHomeSupportingProjects,
  selectPreferredTags,
} from "./home-supporting-projects";

const PORTFOLIO = {
  slug: "milanesram-portfolio",
  name: "milanesram.com — Secure Portfolio & Content Management Platform",
  tagline: "Production portfolio and owner-managed CMS",
  role: "Designed, implemented, and currently maintains the production site and owner CMS.",
  stack: [
    "Next.js",
    "TypeScript",
    "Supabase/PostgreSQL",
    "Supabase Auth",
    "Row-Level Security",
    "Vercel",
    "GitHub",
    "Vitest",
    "React",
  ],
};

const DBNMS = {
  slug: "dbnms",
  name: "Data Breach Notification Management System",
  tagline: "National breach-notification portal",
  role: "Led planning, development, and implementation as project sponsor.",
  stack: [
    "Privacy operations",
    "Breach notification",
    "Incident reporting",
    "Regulatory implementation",
  ],
};

const NPCRS = {
  slug: "npcrs",
  name: "National Privacy Commission Registration System",
  tagline: "DPO and data-processing-system registration",
  role: "Led planning, development, and implementation as project sponsor.",
  stack: [
    "Privacy operations",
    "DPO registration",
    "Data-processing-system registration",
    "Regulatory implementation",
  ],
};

const PRIVAI = {
  slug: "privai-guard",
  name: "PrivAI Guard",
  tagline: "Shadow AI privacy-risk triage",
  role: "Designed and developed",
  stack: ["Next.js", "React", "TypeScript"],
};

describe("home supporting project selection", () => {
  it("keeps allowlisted Home proof in flagship-complement order", () => {
    const selected = mapHomeSupportingProjects([
      NPCRS,
      DBNMS,
      PRIVAI,
      PORTFOLIO,
    ]);

    expect(selected.map((project) => project.slug)).toEqual([
      "milanesram-portfolio",
      "dbnms",
    ]);
    expect(HOME_SUPPORTING_PROJECT_SPECS.map((spec) => spec.slug)).toEqual([
      "milanesram-portfolio",
      "dbnms",
    ]);
  });

  it("does not select NPCRS or PrivAI as supporting Home proof", () => {
    expect(mapHomeSupportingProject(NPCRS)).toBeNull();
    expect(mapHomeSupportingProject(PRIVAI)).toBeNull();
    expect(mapHomeSupportingProjects([NPCRS, PRIVAI])).toEqual([]);
  });

  it("omits a missing supporting project without failing the set", () => {
    expect(mapHomeSupportingProjects([DBNMS]).map((project) => project.slug)).toEqual(
      ["dbnms"],
    );
    expect(mapHomeSupportingProjects([])).toEqual([]);
  });
});

describe("home supporting project presentation", () => {
  it("reuses published name, tagline, and role without Home-only claims", () => {
    const card = mapHomeSupportingProject(PORTFOLIO);

    expect(card).toEqual({
      slug: "milanesram-portfolio",
      name: PORTFOLIO.name,
      tagline: PORTFOLIO.tagline,
      contribution: PORTFOLIO.role,
      tags: [
        "Supabase Auth",
        "Row-Level Security",
        "Supabase/PostgreSQL",
        "Vercel",
      ],
      href: "/projects#milanesram-portfolio",
      ctaLabel: "View the production CMS on Projects",
    });
  });

  it("uses a compact DBNMS tag subset from published stack values", () => {
    const card = mapHomeSupportingProject(DBNMS);

    expect(card?.tags).toEqual([
      "Breach notification",
      "Incident reporting",
      "Privacy operations",
      "Regulatory implementation",
    ]);
    expect(card?.href).toBe("/projects#dbnms");
    expect(card?.ctaLabel).toBe(
      "View the breach-notification system on Projects",
    );
  });

  it("does not invent tags that are absent from the published stack", () => {
    expect(
      selectPreferredTags(["Vercel"], [
        "Supabase Auth",
        "Row-Level Security",
        "Supabase/PostgreSQL",
        "Vercel",
      ]),
    ).toEqual(["Vercel"]);
  });

  it("does not create generic project detail routes", () => {
    const selected = mapHomeSupportingProjects([PORTFOLIO, DBNMS, NPCRS, PRIVAI]);

    expect(selected.every((project) => project.href.startsWith("/projects#"))).toBe(
      true,
    );
    expect(selected.some((project) => project.href.includes("/projects/"))).toBe(
      false,
    );
  });

  it("keeps the catalog CTA on the existing Projects index", () => {
    expect(HOME_ALL_PROJECTS_CTA).toEqual({
      label: "View all projects",
      href: "/projects",
    });
  });
});
