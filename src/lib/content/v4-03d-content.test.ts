import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WritingIndex } from "@/components/writing/WritingIndex";
import {
  groupPublishedWriting,
  selectFeaturedWriting,
  type PublishedPublication,
} from "@/lib/content/publications";

const ROOT = resolve(import.meta.dirname, "../../..");

function readMigration(name: string): string {
  return readFileSync(resolve(ROOT, "supabase/migrations", name), "utf8");
}

const CONSULTING = readMigration("20260926200000_ram_consulting_sector_scope.sql");
const FEATURED = readMigration("20260926200100_featured_writing_order.sql");
const DEFENSIVE = readMigration(
  "20260926200200_reduce_privai_duplicate_boundaries.sql",
);
const HOMEPAGE = readMigration(
  "20260926200300_home_technical_deepening_drop_cc.sql",
);
const INQUIRY = readMigration(
  "20260926190200_hold_public_inquiry_intake_disabled.sql",
);
const WRITING_INDEX = readFileSync(
  resolve(ROOT, "src/components/writing/WritingIndex.tsx"),
  "utf8",
);
const PUBLICATIONS = readFileSync(
  resolve(ROOT, "src/lib/content/publications.ts"),
  "utf8",
);
const CREDENTIAL_CARD = readFileSync(
  resolve(ROOT, "src/components/ui/CredentialCard.tsx"),
  "utf8",
);

const SECTOR_SCOPE = [
  "Government (policy, digital transformation, BC/DR)",
  "manufacturing (AI governance, ICS cybersecurity)",
  "insurance (digital transformation)",
  "financial institutions (privacy operations)",
  "business process outsourcing (HR privacy)",
  "retail (compliance)",
  "energy (ICS cybersecurity)",
  "hospitals and clinics (patient privacy)",
] as const;

const CONSULTING_SENTENCE =
  "Selected consulting work: Government (policy, digital transformation, BC/DR); manufacturing (AI governance, ICS cybersecurity); insurance (digital transformation); financial institutions (privacy operations); business process outsourcing (HR privacy); retail (compliance); energy (ICS cybersecurity); and hospitals and clinics (patient privacy).";

const FEATURED_WORKS = [
  {
    order: 1,
    slug: "orb-to-oversight-world-app-privacy",
    title: "From Orb to Oversight: Why the NPC Paused World App",
    year: "2025",
  },
  {
    order: 2,
    slug: "egov-ph-architectural-fragility-bcdr",
    title:
      "Architectural Fragility and the Illusion of Cost-Savings: A Critical Analysis of the eGov PH Super App Outage and the Imperative for Enterprise-Grade BC/DR",
    year: "2026",
  },
  {
    order: 3,
    slug: "privacy-preserving-machine-learning-global-healthcare-ai",
    title:
      "Privacy-Preserving Machine Learning in Global Healthcare AI: Breaking the Clinical Validation Bottleneck Without Breaking the Law",
    year: "2026",
  },
] as const;

const TECHNICAL_DEEPENING =
  "Northwestern MSIS · Security Specialization · CIPM";

function hasStandaloneCc(value: string): boolean {
  return /(?:^| · )CC(?:$| · )/.test(value);
}

function publication(overrides: Partial<PublishedPublication>): PublishedPublication {
  return {
    slug: "example",
    title: "Example",
    seoTitle: null,
    documentKind: "publication",
    documentKindLabel: "Publication",
    publisher: "Independent",
    yearLabel: "2026",
    publishedOn: null,
    abstract: "Existing abstract",
    externalUrl: null,
    author: "RA Milanes",
    track: "all",
    trackRelevance: "Privacy, Compliance & Assurance",
    relatedFocuses: [],
    sortOrder: 10,
    featuredOrder: null,
    availability: "pdf",
    pdfUrl: "https://example.test/paper.pdf",
    ...overrides,
  };
}

describe("V4-03D consulting evidence", () => {
  it("adds one sector/scope item and keeps the existing RAM bullets", () => {
    expect(CONSULTING).toContain(CONSULTING_SENTENCE);
    expect(CONSULTING).toContain("982e5fae-ec27-49c5-9d7f-b88873bc33ec");
    expect(CONSULTING).toContain("Principal Consultant");
    expect(CONSULTING).toContain("RAM Privacy & Security");
    expect(CONSULTING).not.toContain("UPDATE public.experience_items");
    expect(CONSULTING).not.toContain("UPDATE public.experiences");

    for (const scope of SECTOR_SCOPE) {
      expect(CONSULTING_SENTENCE.split(scope)).toHaveLength(2);
    }

    expect(CONSULTING_SENTENCE).not.toMatch(/\d|%|\$/);
    expect(CONSULTING_SENTENCE.toLowerCase()).not.toMatch(
      /revenue|savings|reduced|reduction|client|engagements|contract value/,
    );
  });
});

describe("V4-03D featured writing", () => {
  const library = [
    publication({
      slug: FEATURED_WORKS[2].slug,
      title: FEATURED_WORKS[2].title,
      yearLabel: "2026",
      sortOrder: 10,
      featuredOrder: 3,
      pdfUrl: "https://cdn.test/healthcare.pdf",
    }),
    publication({
      slug: FEATURED_WORKS[1].slug,
      title: FEATURED_WORKS[1].title,
      yearLabel: "2026",
      sortOrder: 20,
      featuredOrder: 2,
      pdfUrl: "https://cdn.test/egov.pdf",
    }),
    publication({
      slug: "other-a",
      sortOrder: 30,
      pdfUrl: "https://cdn.test/a.pdf",
    }),
    publication({
      slug: "other-b",
      sortOrder: 40,
      pdfUrl: "https://cdn.test/b.pdf",
    }),
    publication({
      slug: "other-c",
      sortOrder: 50,
      pdfUrl: "https://cdn.test/c.pdf",
    }),
    publication({
      slug: FEATURED_WORKS[0].slug,
      title: FEATURED_WORKS[0].title,
      yearLabel: "2025",
      sortOrder: 60,
      featuredOrder: 1,
      pdfUrl: "https://cdn.test/world-app.pdf",
    }),
    publication({
      slug: "other-d",
      sortOrder: 70,
      pdfUrl: "https://cdn.test/d.pdf",
    }),
    publication({
      slug: "other-e",
      sortOrder: 80,
      pdfUrl: "https://cdn.test/e.pdf",
    }),
    publication({
      slug: "other-f",
      sortOrder: 90,
      pdfUrl: "https://cdn.test/f.pdf",
    }),
    publication({
      slug: "other-g",
      sortOrder: 100,
      pdfUrl: "https://cdn.test/g.pdf",
    }),
    publication({
      slug: "ncsp-localization-local-government-units",
      sortOrder: 110,
      availability: "external",
      pdfUrl: null,
      externalUrl: "https://publisher.test/ncsp",
    }),
  ];

  it("features exactly the three approved works in order and keeps the full library", () => {
    for (const work of FEATURED_WORKS) {
      expect(FEATURED).toContain(`featured_order = ${work.order}`);
      expect(FEATURED).toContain(work.slug);
      expect(FEATURED).toContain(work.title);
      expect(FEATURED).toContain(`year_label = '${work.year}'`);
    }

    expect(FEATURED).toContain("featured_order IS NULL OR featured_order IN (1, 2, 3)");
    expect(FEATURED).toContain(
      "featured_order IS NULL OR status = 'published'",
    );
    expect(FEATURED).toContain("CREATE UNIQUE INDEX publications_featured_order_unique");
    expect(FEATURED).not.toMatch(/SET (title|abstract|year_label|media_id|external_url|slug)\b/);
    expect(FEATURED).toContain("focus-page featured publication changed");

    const featured = selectFeaturedWriting(library);
    expect(featured.map((item) => item.featuredOrder)).toEqual([1, 2, 3]);
    expect(featured.map((item) => item.slug)).toEqual(
      FEATURED_WORKS.map((work) => work.slug),
    );
    expect(featured.map((item) => item.pdfUrl)).toEqual([
      "https://cdn.test/world-app.pdf",
      "https://cdn.test/egov.pdf",
      "https://cdn.test/healthcare.pdf",
    ]);
    expect(featured[2]?.externalUrl).toBeNull();

    const grouped = groupPublishedWriting(library);
    const librarySlugs = [
      grouped.lead?.slug,
      ...grouped.availableHere.map((item) => item.slug),
      ...grouped.publishedElsewhere.map((item) => item.slug),
    ];
    expect(librarySlugs).toEqual(library.map((item) => item.slug));
    for (const work of FEATURED_WORKS) {
      expect(librarySlugs).toContain(work.slug);
    }

    expect(selectFeaturedWriting(library.map((item) => ({ ...item, featuredOrder: null })))).toEqual(
      [],
    );
    expect(
      selectFeaturedWriting([
        publication({ slug: "a", featuredOrder: 1 }),
        publication({ slug: "b", featuredOrder: 1 }),
        publication({ slug: "c", featuredOrder: 2 }),
      ]),
    ).toEqual([]);

    expect(WRITING_INDEX).toContain('title="Featured Writing"');
    expect(WRITING_INDEX).toContain('title="All Writing"');
    expect(WRITING_INDEX).toContain("selectFeaturedWriting(publications)");
    expect(WRITING_INDEX).toContain("groupPublishedWriting(publications)");
    expect(WRITING_INDEX).not.toContain("featuredPublicationId");
    expect(PUBLICATIONS).toContain("featuredPublicationId");
    expect(PUBLICATIONS).toContain("featured_order");

    const html = renderToStaticMarkup(
      createElement(WritingIndex, {
        kicker: "Writing",
        title: "Writing",
        lede: "Selected work.",
        publications: library,
      }),
    );
    const featuredAt = html.indexOf("Featured Writing");
    const allAt = html.indexOf("All Writing");
    expect(featuredAt).toBeGreaterThan(-1);
    expect(allAt).toBeGreaterThan(featuredAt);
    for (const work of FEATURED_WORKS) {
      expect(html.indexOf(work.title)).toBeGreaterThan(featuredAt);
      expect(html.indexOf(work.title)).toBeLessThan(allAt);
      expect(html.lastIndexOf(work.title)).toBeGreaterThan(allAt);
    }
    expect(html).toContain("/writing/ncsp-localization-local-government-units");
  });
});

describe("V4-03D defensive copy", () => {
  it("shortens the duplicate PrivAI passages and keeps the authoritative boundary", () => {
    expect(DEFENSIVE).toContain(
      "PrivAI Guard, developed as a Northwestern MSIS capstone MVP, reflects current hands-on work in privacy, governance, controls, and technical implementation.",
    );
    expect(DEFENSIVE).not.toContain(
      "current technical evidence from a Northwestern MSIS capstone MVP",
    );
    expect(DEFENSIVE).toContain(
      "strengthens an established privacy, compliance and risk foundation",
    );
    expect(DEFENSIVE).toContain("Non-production. Synthetic demonstration data only.");
    expect(DEFENSIVE).toContain(
      "Human governance review — not automated legal or regulatory decisioning.",
    );
    expect(DEFENSIVE).toContain("No automated legal or regulatory decisioning.");
    expect(DEFENSIVE).toContain("heading = 'MVP boundary'");
    expect(DEFENSIVE).toContain(
      "not a claim of enterprise-grade or production-ready platform status.",
    );
    expect(DEFENSIVE).not.toContain(
      "SET body = demonstrates_before",
    );
    expect(DEFENSIVE).toContain("SET body = demonstrates_after");
    expect(DEFENSIVE).toContain(
      "Capabilities under re-engineering are not represented here as released production functionality",
    );
    expect(DEFENSIVE).toContain(
      "an authoritative boundary or career paragraph changed",
    );
  });
});

describe("V4-03D homepage CC hierarchy", () => {
  it("drops the homepage CC token and leaves ISC2 CC on credentials", () => {
    expect(HOMEPAGE).toContain(
      "supporting = 'Northwestern MSIS · Security Specialization · CIPM · CC'",
    );
    expect(HOMEPAGE).toContain(`supporting = '${TECHNICAL_DEEPENING}'`);
    expect(TECHNICAL_DEEPENING).toContain("Northwestern MSIS");
    expect(TECHNICAL_DEEPENING).toContain("Security Specialization");
    expect(TECHNICAL_DEEPENING).toContain("CIPM");
    expect(hasStandaloneCc(TECHNICAL_DEEPENING)).toBe(false);
    expect(hasStandaloneCc(`${TECHNICAL_DEEPENING} · CC`)).toBe(true);
    expect(HOMEPAGE).toContain("Certified in Cybersecurity (CC)");
    expect(HOMEPAGE).toContain("issuer = 'ISC2'");
    expect(HOMEPAGE).not.toContain("UPDATE public.credentials");
    expect(HOMEPAGE).toContain("another proof item changed");
    expect(CREDENTIAL_CARD).toContain("{credential.name}");
  });
});

describe("V4-03D inquiry hold", () => {
  it("keeps version 20260926190200 from enabling inquiry intake", () => {
    expect(INQUIRY).toContain("contact_form_enabled IS DISTINCT FROM false");
    expect(INQUIRY).toContain("contact_form_enabled did not remain false");
    expect(INQUIRY).toContain("No write. Public inquiry intake stays disabled.");
    expect(INQUIRY).toContain(
      "Inquiry activation requires a future explicitly authorized migration",
    );
    expect(INQUIRY).not.toContain("contact_form_enabled = true");
    expect(INQUIRY).not.toContain("SET contact_form_enabled");
    expect(INQUIRY).not.toContain("featured_order");
    expect(INQUIRY).not.toContain("Selected consulting work");
    expect(INQUIRY).not.toContain("Technical Deepening");

    const fallback = readFileSync(
      resolve(ROOT, "src/components/contact/InquiryUnavailable.tsx"),
      "utf8",
    );
    expect(fallback).toContain("is temporarily unavailable.");
    expect(fallback).toContain("Email and LinkedIn above remain open.");
  });
});
