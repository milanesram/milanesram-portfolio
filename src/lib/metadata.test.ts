import { afterEach, describe, expect, it } from "vitest";
import {
  createPageMetadata,
  createPublicationDetailMetadata,
} from "./page-metadata";

const LONG_TITLE =
  "Privacy-Preserving Machine Learning in Global Healthcare AI: Breaking the Clinical Validation Bottleneck Without Breaking the Law";
const SEO_TITLE = "Privacy-Preserving ML for Global Healthcare AI";
const ABSTRACT = "A published abstract that must remain unchanged.";
const SLUG = "privacy-preserving-machine-learning-global-healthcare-ai";

const ORIGINAL = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  VERCEL_URL: process.env.VERCEL_URL,
};

afterEach(() => {
  if (ORIGINAL.NEXT_PUBLIC_SITE_URL === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL.NEXT_PUBLIC_SITE_URL;
  }

  if (ORIGINAL.VERCEL_URL === undefined) {
    delete process.env.VERCEL_URL;
  } else {
    process.env.VERCEL_URL = ORIGINAL.VERCEL_URL;
  }
});

describe("publication detail metadata", () => {
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
    expect(metadata.openGraph?.url).toBe(
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

  it("keeps production canonical URLs when rendered from a Preview origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL =
      "https://rainier-portfolio-example.vercel.app";
    process.env.VERCEL_URL = "rainier-portfolio-example.vercel.app";

    const metadata = createPublicationDetailMetadata({
      title: LONG_TITLE,
      seoTitle: SEO_TITLE,
      abstract: ABSTRACT,
      slug: "example-slug",
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://milanesram.com/writing/example-slug",
    );
    expect(metadata.title).toEqual({ absolute: SEO_TITLE });
    expect(metadata.openGraph?.title).toBe(LONG_TITLE);
    expect(metadata.twitter?.title).toBe(LONG_TITLE);
  });
});

describe("page metadata canonical origin", () => {
  it("emits a production canonical for a writing path", () => {
    const metadata = createPageMetadata(
      "Example",
      "Description",
      "/writing/example-slug",
    );

    expect(metadata.alternates?.canonical).toBe(
      "https://milanesram.com/writing/example-slug",
    );
  });
});
