import { describe, expect, it } from "vitest";
import {
  formatFocusRelevanceLabels,
  selectRelatedPublishedFocuses,
  toRelatedFocuses,
  type PublishedFocusLabel,
} from "./writing-focus";

const CYBER: PublishedFocusLabel = {
  slug: "cybersecurity-grc",
  label: "Cybersecurity / GRC",
  sortOrder: 10,
};

const PRIVACY: PublishedFocusLabel = {
  slug: "privacy-ai-governance",
  label: "Privacy / AI Governance",
  sortOrder: 20,
};

const THIRD: PublishedFocusLabel = {
  slug: "technology-risk",
  label: "Technology / IT Risk",
  sortOrder: 30,
};

describe("selectRelatedPublishedFocuses", () => {
  it("returns the hosted label for a single matching published focus", () => {
    const focuses = selectRelatedPublishedFocuses({
      track: "cybersecurity_grc",
      publishedFocuses: [CYBER, PRIVACY],
    });

    expect(formatFocusRelevanceLabels(focuses)).toBe("Cybersecurity / GRC");
    expect(formatFocusRelevanceLabels(focuses)).not.toMatch(/both tracks/i);
  });

  it("renders actual hosted names when two focuses apply", () => {
    const focuses = selectRelatedPublishedFocuses({
      track: "all",
      publishedFocuses: [PRIVACY, CYBER],
    });

    expect(formatFocusRelevanceLabels(focuses)).toBe(
      "Cybersecurity / GRC · Privacy / AI Governance",
    );
    expect(formatFocusRelevanceLabels(focuses)).not.toBe(
      "Relevant to both tracks",
    );
    expect(formatFocusRelevanceLabels(focuses)).not.toMatch(/both tracks/i);
  });

  it("renders three hosted names without special-casing a count of two", () => {
    const focuses = selectRelatedPublishedFocuses({
      track: "all",
      publishedFocuses: [THIRD, PRIVACY, CYBER],
    });

    expect(formatFocusRelevanceLabels(focuses)).toBe(
      "Cybersecurity / GRC · Privacy / AI Governance · Technology / IT Risk",
    );
  });

  it("does not fabricate a focus when no published relationship exists", () => {
    const focuses = selectRelatedPublishedFocuses({
      track: "cybersecurity_grc",
      publishedFocuses: [PRIVACY],
    });

    expect(focuses).toEqual([]);
    expect(formatFocusRelevanceLabels(focuses)).toBeNull();
  });

  it("does not treat an empty published set as both tracks", () => {
    const focuses = selectRelatedPublishedFocuses({
      track: "all",
      publishedFocuses: [],
    });

    expect(formatFocusRelevanceLabels(focuses)).toBeNull();
  });

  it("includes a featured hosted relationship even when the track tag differs", () => {
    const focuses = selectRelatedPublishedFocuses({
      track: "cybersecurity_grc",
      publishedFocuses: [CYBER, PRIVACY],
      featuredOnSlugs: ["privacy-ai-governance"],
    });

    expect(focuses.map((focus) => focus.slug)).toEqual([
      "cybersecurity-grc",
      "privacy-ai-governance",
    ]);
  });

  it("uses hosted labels rather than hardcoded current names", () => {
    const renamed: PublishedFocusLabel = {
      ...CYBER,
      label: "Security Governance",
    };

    expect(
      formatFocusRelevanceLabels(
        selectRelatedPublishedFocuses({
          track: "cybersecurity_grc",
          publishedFocuses: [renamed],
        }),
      ),
    ).toBe("Security Governance");
  });
});

describe("toRelatedFocuses", () => {
  it("builds focus hrefs from hosted slugs", () => {
    expect(toRelatedFocuses([PRIVACY])).toEqual([
      {
        href: "/focus/privacy-ai-governance",
        label: "Privacy / AI Governance",
      },
    ]);
  });
});
