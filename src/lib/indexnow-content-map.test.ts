import { describe, expect, it } from "vitest";
import {
  SITE_WIDE_PUBLIC_PATHS,
  credentialPaths,
  experienceItemPaths,
  experiencePaths,
  focusPagePath,
  focusPagePaths,
  journeyPaths,
  mediaPaths,
  profilePaths,
  projectChildPaths,
  projectDetailPath,
  projectPaths,
  publicationPaths,
  resumeTrackPaths,
  seoPagePaths,
  settingsPaths,
  singletonPagePaths,
} from "./indexnow-content-map";

describe("publication path mapping", () => {
  it("returns nothing for draft create and draft update", () => {
    expect(
      publicationPaths({
        wasPublished: false,
        isPublished: false,
        newSlug: "example",
      }),
    ).toEqual([]);
  });

  it("notifies listing and detail for published create", () => {
    expect(
      publicationPaths({
        wasPublished: false,
        isPublished: true,
        newSlug: "example",
      }),
    ).toEqual(["/writing", "/writing/example"]);
  });

  it("notifies listing and detail for published update", () => {
    expect(
      publicationPaths({
        wasPublished: true,
        isPublished: true,
        oldSlug: "example",
        newSlug: "example",
      }),
    ).toEqual(["/writing", "/writing/example"]);
  });

  it("notifies listing and detail when draft becomes published", () => {
    expect(
      publicationPaths({
        wasPublished: false,
        isPublished: true,
        newSlug: "example",
      }),
    ).toEqual(["/writing", "/writing/example"]);
  });

  it("notifies listing and old detail when published becomes draft", () => {
    expect(
      publicationPaths({
        wasPublished: true,
        isPublished: false,
        oldSlug: "example",
      }),
    ).toEqual(["/writing", "/writing/example"]);
  });

  it("notifies listing and old detail for published delete", () => {
    expect(
      publicationPaths({
        wasPublished: true,
        isPublished: false,
        oldSlug: "example",
      }),
    ).toEqual(["/writing", "/writing/example"]);
  });

  it("returns nothing for draft delete", () => {
    expect(
      publicationPaths({
        wasPublished: false,
        isPublished: false,
        oldSlug: "draft-only",
      }),
    ).toEqual([]);
  });

  it("includes old and new slugs for a published slug change", () => {
    expect(
      publicationPaths({
        wasPublished: true,
        isPublished: true,
        oldSlug: "old-slug",
        newSlug: "new-slug",
      }),
    ).toEqual(["/writing", "/writing/old-slug", "/writing/new-slug"]);
  });

  it("notifies the detail URL for a published SEO-title update", () => {
    expect(
      publicationPaths({
        wasPublished: true,
        isPublished: true,
        oldSlug: "example",
        newSlug: "example",
      }),
    ).toContain("/writing/example");
  });

  it("includes validated featured focus routes and ignores arbitrary slugs", () => {
    expect(
      publicationPaths({
        wasPublished: true,
        isPublished: true,
        newSlug: "example",
        featuredFocusSlugs: ["privacy-ai-governance", "not-a-public-focus"],
        track: "cybersecurity_grc",
      }),
    ).toEqual([
      "/writing",
      "/writing/example",
      "/focus/privacy-ai-governance",
      "/focus/cybersecurity-grc",
    ]);
  });
});

describe("project path mapping", () => {
  it("notifies listing and related surfaces for a published project", () => {
    expect(
      projectPaths({
        wasPublished: false,
        isPublished: true,
        slug: "internal-lab",
      }),
    ).toEqual([
      "/projects",
      "/",
      "/focus/cybersecurity-grc",
      "/focus/privacy-ai-governance",
    ]);
  });

  it("adds the only public project detail route for privai-guard", () => {
    expect(
      projectPaths({
        wasPublished: true,
        isPublished: true,
        slug: "privai-guard",
      }),
    ).toContain("/projects/privai-guard");
    expect(projectDetailPath("other")).toBeNull();
  });

  it("notifies listing and old detail when privai-guard is unpublished", () => {
    expect(
      projectPaths({
        wasPublished: true,
        isPublished: false,
        oldSlug: "privai-guard",
      }),
    ).toEqual([
      "/projects",
      "/",
      "/focus/cybersecurity-grc",
      "/focus/privacy-ai-governance",
      "/projects/privai-guard",
    ]);
  });

  it("notifies parent public surfaces for a published section change", () => {
    expect(
      projectChildPaths({
        parentPublished: true,
        wasChildPublished: false,
        isChildPublished: true,
        projectSlug: "privai-guard",
      }),
    ).toContain("/projects/privai-guard");
  });

  it("skips child changes under a draft project", () => {
    expect(
      projectChildPaths({
        parentPublished: false,
        wasChildPublished: true,
        isChildPublished: true,
        projectSlug: "privai-guard",
      }),
    ).toEqual([]);
  });
});

describe("experience path mapping", () => {
  it("notifies experience, home, and focus for a public parent change", () => {
    expect(
      experiencePaths({ wasPublished: true, isPublished: true }),
    ).toEqual([
      "/experience",
      "/",
      "/focus/cybersecurity-grc",
      "/focus/privacy-ai-governance",
    ]);
  });

  it("notifies the same surfaces for a public child change", () => {
    expect(
      experienceItemPaths({
        parentPublished: true,
        wasPublished: false,
        isPublished: true,
      }),
    ).toEqual([
      "/experience",
      "/",
      "/focus/cybersecurity-grc",
      "/focus/privacy-ai-governance",
    ]);
  });

  it("skips non-public experience changes", () => {
    expect(
      experiencePaths({ wasPublished: false, isPublished: false }),
    ).toEqual([]);
    expect(
      experienceItemPaths({
        parentPublished: false,
        wasPublished: true,
        isPublished: true,
      }),
    ).toEqual([]);
  });
});

describe("credential path mapping", () => {
  it("notifies credentials and consumers for a public change", () => {
    expect(
      credentialPaths({ wasPublic: false, isPublic: true }),
    ).toEqual([
      "/credentials",
      "/",
      "/focus/cybersecurity-grc",
      "/focus/privacy-ai-governance",
    ]);
  });

  it("adds About for public education changes", () => {
    expect(
      credentialPaths({
        wasPublic: true,
        isPublic: true,
        affectsAbout: true,
      }),
    ).toContain("/about");
  });

  it("skips verification-held and draft credentials", () => {
    expect(
      credentialPaths({ wasPublic: false, isPublic: false }),
    ).toEqual([]);
  });

  it("notifies listing after public removal", () => {
    expect(
      credentialPaths({ wasPublic: true, isPublic: false }),
    ).toContain("/credentials");
  });
});

describe("focus path mapping", () => {
  it("maps only the two public focus routes", () => {
    expect(focusPagePath("cybersecurity-grc")).toBe("/focus/cybersecurity-grc");
    expect(focusPagePath("privacy-ai-governance")).toBe(
      "/focus/privacy-ai-governance",
    );
    expect(focusPagePath("anything-else")).toBeNull();
  });

  it("notifies the affected focus page plus home and resume", () => {
    expect(
      focusPagePaths({
        wasPublished: true,
        isPublished: true,
        slug: "cybersecurity-grc",
      }),
    ).toEqual(["/", "/resume", "/focus/cybersecurity-grc"]);
  });
});

describe("profile, settings, page, and media mapping", () => {
  it("notifies static public routes for a published profile change", () => {
    expect(
      profilePaths({ wasPublished: true, isPublished: true }),
    ).toEqual([...SITE_WIDE_PUBLIC_PATHS]);
  });

  it("skips draft-only profile edits", () => {
    expect(
      profilePaths({ wasPublished: false, isPublished: false }),
    ).toEqual([]);
  });

  it("maps settings to static public routes including /contact", () => {
    expect(settingsPaths()).toContain("/contact");
    expect(settingsPaths()).toEqual([...SITE_WIDE_PUBLIC_PATHS]);
  });

  it("maps SEO records to the matching public page", () => {
    expect(
      seoPagePaths({
        pageKey: "writing",
        wasPublished: true,
        isPublished: true,
      }),
    ).toEqual(["/writing"]);
    expect(
      seoPagePaths({
        pageKey: "home",
        wasPublished: false,
        isPublished: false,
      }),
    ).toEqual([]);
  });

  it("maps listing chrome, resume tracks, and journey milestones", () => {
    expect(
      singletonPagePaths({
        wasPublished: true,
        isPublished: true,
        path: "/writing",
      }),
    ).toEqual(["/writing"]);
    expect(
      resumeTrackPaths({ wasPublished: true, isPublished: false }),
    ).toEqual(["/resume", "/"]);
    expect(
      journeyPaths({ wasPublished: false, isPublished: true }),
    ).toEqual(["/about"]);
  });

  it("maps referenced media to consuming public pages and skips unused assets", () => {
    expect(
      mediaPaths({
        wasPublic: true,
        isPublic: true,
        purpose: "portrait",
        usage: {
          journey: 0,
          projects: 0,
          resume: 0,
          publications: 0,
          portrait: true,
        },
      }),
    ).toEqual(["/", "/about"]);

    expect(
      mediaPaths({
        wasPublic: true,
        isPublic: false,
        purpose: "publication",
        usage: {
          journey: 0,
          projects: 0,
          resume: 0,
          publications: 1,
          portrait: false,
        },
      }),
    ).toEqual(["/writing"]);

    expect(
      mediaPaths({
        wasPublic: true,
        isPublic: true,
        purpose: "project",
        usage: {
          journey: 0,
          projects: 0,
          resume: 0,
          publications: 0,
          portrait: false,
        },
      }),
    ).toEqual([]);
  });
});
