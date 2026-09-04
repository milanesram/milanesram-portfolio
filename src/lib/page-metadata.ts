import type { Metadata } from "next";
import { getSiteUrl } from "./site-url";

export function createPageMetadata(
  title: string,
  description: string,
  path = "",
  options?: {
    ogTitle?: string;
    ogDescription?: string;
    index?: boolean;
  },
): Metadata {
  const url = `${getSiteUrl()}${path}`;
  const ogTitle = options?.ogTitle?.trim() || title;
  const ogDescription = options?.ogDescription?.trim() || description;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
    },
    robots:
      options?.index === false
        ? { index: false, follow: true }
        : { index: true, follow: true },
  };
}

export function createPublicationDetailMetadata(publication: {
  title: string;
  seoTitle: string | null;
  abstract: string;
  slug: string;
}): Metadata {
  const metadata = createPageMetadata(
    publication.title,
    publication.abstract,
    `/writing/${publication.slug}`,
  );

  if (!publication.seoTitle) {
    return metadata;
  }

  return {
    ...metadata,
    title: { absolute: publication.seoTitle },
  };
}
