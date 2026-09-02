import type { Metadata } from "next";
import { getPublishedSiteProfile } from "@/lib/content/profile";
import {
  SITE_CHROME_FALLBACK,
  profileFromPublishedResult,
} from "@/lib/content/site-profile";
import {
  getPublishedPageSeoByKey,
  getPublicSiteIndexability,
} from "@/lib/content/seo";
import type { PageSeoKey } from "@/lib/supabase/database.types";
import { PAGE_SEO_PATHS } from "@/lib/content/page-seo";
import { getSiteUrl } from "./site-url";
import { isVercelPreviewDeployment } from "./vercel-env";

const seoTitleSuffix = "Cybersecurity, GRC, IT Risk & Privacy";
const defaultDescription =
  "Cybersecurity governance, GRC, technology risk, privacy, and AI governance. Northwestern MSIS graduate with applied work through PrivAI Guard.";

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

export async function resolvePublicIndexability(
  pageIndexable = true,
): Promise<boolean> {
  if (isVercelPreviewDeployment()) {
    return false;
  }

  const global = await getPublicSiteIndexability();
  const globallyIndexable = global !== false;
  return globallyIndexable && pageIndexable;
}

export async function generateRouteMetadata(
  pageKey: PageSeoKey,
): Promise<Metadata> {
  const [seo, indexable] = await Promise.all([
    getPublishedPageSeoByKey(pageKey),
    getPublicSiteIndexability(),
  ]);
  const globallyIndexable = isVercelPreviewDeployment()
    ? false
    : indexable !== false;
  const metadata = createPageMetadata(
    seo.title,
    seo.description,
    PAGE_SEO_PATHS[pageKey],
    {
      ogTitle: seo.ogTitle,
      ogDescription: seo.ogDescription,
      index: globallyIndexable && seo.indexable,
    },
  );

  if (pageKey === "home") {
    return {
      ...metadata,
      title: { absolute: seo.title },
      openGraph: {
        ...metadata.openGraph,
        title: seo.ogTitle,
        description: seo.ogDescription,
      },
      twitter: {
        ...metadata.twitter,
        title: seo.ogTitle,
        description: seo.ogDescription,
      },
    };
  }

  return metadata;
}

export async function withPublicRobots(metadata: Metadata): Promise<Metadata> {
  const indexable = await resolvePublicIndexability(true);

  if (indexable) {
    return metadata;
  }

  return {
    ...metadata,
    robots: { index: false, follow: true },
  };
}

export async function generateRootMetadata(): Promise<Metadata> {
  const [profileResult, indexable] = await Promise.all([
    getPublishedSiteProfile(),
    getPublicSiteIndexability(),
  ]);
  const profile = profileFromPublishedResult(profileResult);
  const displayName = profile?.displayName ?? SITE_CHROME_FALLBACK.displayName;
  const shortName = profile?.shortName ?? SITE_CHROME_FALLBACK.shortName;
  const defaultTitle = profile
    ? `${profile.displayName} — ${seoTitleSuffix}`
    : SITE_CHROME_FALLBACK.displayName;
  const globallyIndexable = indexable !== false;

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: defaultTitle,
      template: `%s — ${shortName}`,
    },
    description: defaultDescription,
    applicationName: displayName,
    authors: profile
      ? [{ name: profile.displayName, url: profile.linkedinUrl }]
      : [{ name: SITE_CHROME_FALLBACK.displayName }],
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      siteName: displayName,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDescription,
    },
    robots: {
      index: globallyIndexable,
      follow: true,
    },
  };
}
