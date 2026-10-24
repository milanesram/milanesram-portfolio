import { describe, expect, it } from "vitest";
import { arrangeProjectsIndex } from "./projects-index";

function project(slug: string, yearLabel: string, sortOrder: number) {
  return { slug, yearLabel, sortOrder };
}

describe("projects index arrangement", () => {
  it("lifts PrivAI Guard out of the grid and keeps every project once", () => {
    const projects = [
      project("dbnms", "2022", 20),
      project("privai-guard", "2026", 10),
      project("milanesram-portfolio", "2026", 40),
      project("tuloy", "2026", 50),
      project("npcrs", "2023", 30),
    ];
    const arranged = arrangeProjectsIndex(projects);
    const slugs = [
      arranged.featured?.slug,
      ...arranged.rest.map((item) => item.slug),
    ];

    expect(arranged.featured?.slug).toBe("privai-guard");
    expect(arranged.rest.map((item) => item.slug)).not.toContain("privai-guard");
    expect(new Set(slugs).size).toBe(projects.length);
    expect(slugs.filter(Boolean)).toHaveLength(projects.length);
  });

  it("orders the remaining projects newest first", () => {
    const arranged = arrangeProjectsIndex([
      project("dbnms", "2022", 20),
      project("privai-guard", "2026", 10),
      project("npcrs", "2023", 30),
      project("newest", "2025", 80),
    ]);

    expect(arranged.rest.map((item) => item.slug)).toEqual([
      "newest",
      "npcrs",
      "dbnms",
    ]);
  });

  it("keeps equal years in editorial order", () => {
    const arranged = arrangeProjectsIndex([
      project("later-editorial", "2026", 40),
      project("earlier-editorial", "2026", 20),
      project("older", "2021", 5),
    ]);

    expect(arranged.rest.map((item) => item.slug)).toEqual([
      "earlier-editorial",
      "later-editorial",
      "older",
    ]);
  });

  it("keeps the incoming order when the year and editorial position match", () => {
    const arranged = arrangeProjectsIndex([
      project("first", "2024", 10),
      project("second", "2024", 10),
    ]);

    expect(arranged.rest.map((item) => item.slug)).toEqual(["first", "second"]);
  });

  it("places undated projects after dated projects in their relative order", () => {
    const arranged = arrangeProjectsIndex([
      project("undated-later", "Forthcoming", 20),
      project("dated", "2021", 90),
      project("undated-earlier", "", 5),
      project("range", "2022–2024", 15),
    ]);

    expect(arranged.featured).toBeNull();
    expect(arranged.rest.map((item) => item.slug)).toEqual([
      "dated",
      "undated-earlier",
      "range",
      "undated-later",
    ]);
  });

  it("keeps the full published list in the grid when PrivAI Guard is absent", () => {
    const projects = [
      project("dbnms", "2022", 20),
      project("npcrs", "2023", 10),
    ];
    const arranged = arrangeProjectsIndex(projects);

    expect(arranged.featured).toBeNull();
    expect(arranged.rest.map((item) => item.slug)).toEqual(["npcrs", "dbnms"]);
    expect(arranged.rest).toHaveLength(projects.length);
  });
});
