import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createPublicationDetailMetadata } from "./page-metadata";

const LONG_TITLE =
  "Privacy-Preserving Machine Learning in Global Healthcare AI: Breaking the Clinical Validation Bottleneck Without Breaking the Law";
const SEO_TITLE = "Privacy-Preserving ML for Global Healthcare AI";
const ABSTRACT = "A published abstract that must remain unchanged.";
const SLUG = "privacy-preserving-machine-learning-global-healthcare-ai";

describe("publication detail metadata", () => {
  const previousUrl = process.env.NEXT_PUBLIC_SITE_URL;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://milanesram.com";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_SITE_URL = previousUrl;
  });

  it("uses an absolute SEO title without replacing social or canonical metadata", () => {
    const metadata = createPublicationDetailMetadata({
      title: LONG_TITLE,
      seoTitle: SEO_TITLE,
      abstract: ABSTRACT,
      slug: SLUG,
    });

    expect(metadata.title).toEqual({ absolute: SEO_TITLE });
    expect(metadata.title).not.toEqual(LONG_TITLE);
    expect(metadata.openGraph?.title).toBe(LONG_TITLE);
    expect(metadata.twitter?.title).toBe(LONG_TITLE);
    expect(metadata.description).toBe(ABSTRACT);
    expect(metadata.alternates?.canonical).toBe(
      `https://milanesram.com/writing/${SLUG}`,
    );
  });

  it("falls back to the canonical title when seoTitle is null", () => {
    const metadata = createPublicationDetailMetadata({
      title: LONG_TITLE,
      seoTitle: null,
      abstract: ABSTRACT,
      slug: SLUG,
    });

    expect(metadata.title).toBe(LONG_TITLE);
    expect(metadata.openGraph?.title).toBe(LONG_TITLE);
    expect(metadata.twitter?.title).toBe(LONG_TITLE);
    expect(metadata.alternates?.canonical).toBe(
      `https://milanesram.com/writing/${SLUG}`,
    );
  });
});
