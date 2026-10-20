import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WritingIndex } from "@/components/writing/WritingIndex";
import {
  indexPublishedWriting,
  type PublishedPublication,
} from "@/lib/content/publications";

function publication(
  id: string,
  overrides: Partial<PublishedPublication> = {},
): PublishedPublication {
  const base: PublishedPublication = {
    id,
    slug: id,
    title: `Title ${id}`,
    seoTitle: null,
    documentKind: "publication",
    documentKindLabel: "Publication",
    publisher: "Independent",
    yearLabel: "2025",
    publishedOn: null,
    abstract: "Abstract",
    externalUrl: null,
    author: "RA Milanes",
    track: "all",
    trackRelevance: null,
    relatedFocuses: [],
    sortOrder: 10,
    featuredOrder: null,
    availability: "pdf",
    pdfUrl: `https://cdn.test/${id}.pdf`,
  };

  return { ...base, ...overrides, id };
}

describe("publication index", () => {
  it("lists each publication once by id and keeps same titles distinct", () => {
    const first = publication("same-title-a", { title: "Shared title", sortOrder: 10 });
    const second = publication("same-title-b", {
      title: "Shared title",
      sortOrder: 20,
      availability: "external",
      pdfUrl: null,
      externalUrl: "https://publisher.test/paper",
    });
    const duplicate = publication("same-title-a", { title: "Shared title copy" });
    const indexed = indexPublishedWriting([first, duplicate, second]);

    expect(indexed.map((item) => item.id)).toEqual(["same-title-a", "same-title-b"]);
    expect(indexed[0]?.title).toBe("Shared title");
    expect(indexed[1]?.availability).toBe("external");
  });

  it("renders featured highlights and one complete index", () => {
    const publications = [
      publication("featured-1", { featuredOrder: 1, sortOrder: 30, title: "Featured one" }),
      publication("middle", { sortOrder: 20, title: "Middle paper" }),
      publication("featured-2", { featuredOrder: 2, sortOrder: 10, title: "Featured two" }),
      publication("featured-3", {
        featuredOrder: 3,
        sortOrder: 40,
        title: "Featured three",
        availability: "external",
        pdfUrl: null,
        externalUrl: "https://publisher.test/external",
      }),
      publication("featured-1", { title: "Duplicate featured" }),
    ];
    const html = renderToStaticMarkup(
      createElement(WritingIndex, {
        kicker: "Writing",
        title: "Writing",
        lede: "Selected work.",
        publications,
      }),
    );
    const indexAt = html.indexOf("All publications");
    const indexHtml = html.slice(indexAt);
    const occurrences = (source: string, id: string) =>
      source.split(`/writing/${id}`).length - 1;

    expect(html.indexOf("Featured Writing")).toBeGreaterThan(-1);
    expect(indexAt).toBeGreaterThan(html.indexOf("Featured Writing"));
    expect(occurrences(html, "featured-1")).toBe(2);
    expect(occurrences(indexHtml, "featured-1")).toBe(1);
    expect(occurrences(html, "middle")).toBe(1);
    expect(occurrences(indexHtml, "featured-3")).toBe(1);
    expect(indexHtml).toContain("Published elsewhere");
    expect(indexHtml).toContain("PDF available here");
    expect(html).not.toContain("Duplicate featured");
    expect(html).not.toContain('aria-label="Available here"');
    expect(html).not.toContain('aria-label="All Writing"');
  });
});
