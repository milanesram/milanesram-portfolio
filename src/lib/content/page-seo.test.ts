import { describe, expect, it } from "vitest";
import {
  buildRobotsRules,
  mapPageSeo,
  publicSitemapIndexPaths,
  resolvePageSeo,
} from "./page-seo";

describe("page SEO mapping", () => {
  it("falls OG fields back to title and description", () => {
    const mapped = mapPageSeo({
      page_key: "resume",
      title: "Resume",
      description: "Request-based packets.",
      og_title: null,
      og_description: "  ",
      indexable: true,
      status: "published",
    });

    expect(mapped?.ogTitle).toBe("Resume");
    expect(mapped?.ogDescription).toBe("Request-based packets.");
  });

  it("omits unpublished records and uses structural fallback", () => {
    expect(
      mapPageSeo({
        page_key: "resume",
        title: "Resume",
        description: "Request-based packets.",
        og_title: null,
        og_description: null,
        indexable: true,
        status: "draft",
      }),
    ).toBeNull();

    const fallback = resolvePageSeo(null, "resume");
    expect(fallback.title).toBe("Resume");
    expect(fallback.description).toContain("professional record");
  });

  it("excludes non-indexable pages from sitemap paths", () => {
    const paths = publicSitemapIndexPaths([
      {
        pageKey: "contact",
        title: "Contact",
        description: "Email",
        ogTitle: "Contact",
        ogDescription: "Email",
        indexable: false,
        path: "/contact",
      },
    ]);

    expect(paths).not.toContain("/contact");
    expect(paths).toContain("/resume");
  });
});

describe("robots rules", () => {
  it("disallows all public indexing when globally off", () => {
    expect(buildRobotsRules(false)).toEqual({
      allow: "",
      disallow: ["/"],
    });
  });

  it("keeps admin excluded when globally on", () => {
    const rules = buildRobotsRules(true);
    expect(rules.allow).toBe("/");
    expect(rules.disallow).toContain("/admin");
  });

  it("does not noindex when indexability is unknown", () => {
    expect(buildRobotsRules(null).allow).toBe("/");
    expect(buildRobotsRules(null).disallow).not.toEqual(["/"]);
  });
});
