import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const PUBLICATIONS_SOURCE = readFileSync(
  resolve(import.meta.dirname, "./publications.ts"),
  "utf8",
);
const DETAIL_SOURCE = readFileSync(
  resolve(import.meta.dirname, "../../components/writing/WritingDetail.tsx"),
  "utf8",
);
const INDEX_CARD_SOURCE = readFileSync(
  resolve(import.meta.dirname, "../../components/writing/WritingIndexCard.tsx"),
  "utf8",
);
const DETAIL_PAGE_SOURCE = readFileSync(
  resolve(import.meta.dirname, "../../app/writing/[slug]/page.tsx"),
  "utf8",
);
const ACTIONS_SOURCE = readFileSync(
  resolve(import.meta.dirname, "../../app/admin/writing/actions.ts"),
  "utf8",
);
const ADMIN_QUERIES_SOURCE = readFileSync(
  resolve(import.meta.dirname, "../admin/writing/queries.ts"),
  "utf8",
);
const MIGRATION_SOURCE = readFileSync(
  resolve(
    import.meta.dirname,
    "../../../supabase/migrations/20260904010000_publication_seo_title.sql",
  ),
  "utf8",
);

const SEEDED_PUBLICATION_SEO_TITLES = [
  [
    "egov-ph-architectural-fragility-bcdr",
    "eGov PH Outage: Resilience, BC/DR & Digital Risk",
  ],
  [
    "ncsp-localization-local-government-units",
    "Localizing the Philippines’ NCSP 2023–2028 for LGUs",
  ],
  [
    "generative-ai-privacy-compliance-documentation",
    "Generative AI for Privacy Compliance Documentation",
  ],
  [
    "before-blocks-build-the-bedrock",
    "Why Blockchain Shouldn’t Lead Philippine Budget Reform",
  ],
  [
    "philippine-elections-2025-data-privacy",
    "Philippine Elections 2025: Personal Data & Privacy Risk",
  ],
  [
    "privacy-preserving-machine-learning-global-healthcare-ai",
    "Privacy-Preserving ML for Global Healthcare AI",
  ],
  [
    "price-of-ubiquity-gcash-critical-infrastructure",
    "GCash as Critical Infrastructure: Cybersecurity & Resilience",
  ],
  [
    "data-breach-to-boardroom-cyber-governance",
    "From Data Breach to Boardroom: Cybersecurity Governance",
  ],
] as const;

describe("publication SEO title data flow", () => {
  it("selects nullable seo_title from public and admin publication queries", () => {
    expect(PUBLICATIONS_SOURCE).toContain(
      '"id, slug, title, seo_title, document_kind, rights_status, author, publisher, published_on, year_label, abstract, external_url, track, status, sort_order, media_id"',
    );
    expect(PUBLICATIONS_SOURCE).toContain("seo_title: string | null");
    expect(PUBLICATIONS_SOURCE).toContain("seoTitle: string | null");
    expect(PUBLICATIONS_SOURCE).toContain("seoTitle: row.seo_title");
    expect(ADMIN_QUERIES_SOURCE).toContain(
      '"id, slug, title, seo_title, document_kind, rights_status, author, publisher, published_on, year_label, abstract, external_url, track, status, sort_order, media_id, updated_at"',
    );
    expect(ADMIN_QUERIES_SOURCE).toContain("seo_title: string | null");
    expect(ACTIONS_SOURCE).toContain("seo_title: input.seoTitle");
  });

  it("keeps visible publication titles on the canonical title field", () => {
    expect(DETAIL_SOURCE).toContain("{publication.title}");
    expect(DETAIL_SOURCE).not.toContain("publication.seoTitle");
    expect(INDEX_CARD_SOURCE).toContain("{publication.title}");
    expect(INDEX_CARD_SOURCE).not.toContain("publication.seoTitle");
    expect(DETAIL_PAGE_SOURCE).toContain("createPublicationDetailMetadata");
    expect(DETAIL_PAGE_SOURCE).toContain("seoTitle: result.publication.seoTitle");
    expect(DETAIL_PAGE_SOURCE).toContain("title: result.publication.title");
  });
});

describe("seeded publication SEO titles", () => {
  it("keeps all eight intended titles at or under 70 characters", () => {
    expect(SEEDED_PUBLICATION_SEO_TITLES).toHaveLength(8);

    for (const [slug, title] of SEEDED_PUBLICATION_SEO_TITLES) {
      expect(title.length, `${slug} is ${title.length} characters`).toBeLessThanOrEqual(
        70,
      );
      expect(title).toBe(title.trim());
      expect(title.length).toBeGreaterThan(0);
      expect(MIGRATION_SOURCE).toContain(slug);
      expect(MIGRATION_SOURCE).toContain(title);
    }

    expect(MIGRATION_SOURCE).toContain("found_count <> 8");
    expect(MIGRATION_SOURCE).toContain("UPDATE public.publications AS p");
    expect(MIGRATION_SOURCE).toContain("WHERE p.slug = v.slug");
    expect(MIGRATION_SOURCE).not.toContain("SET title");
    expect(MIGRATION_SOURCE).not.toContain("SET slug");
  });
});
