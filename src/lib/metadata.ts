import type { Metadata } from "next";
import { getPublishedSiteProfile } from "@/lib/content/profile";
import {
  SITE_CHROME_FALLBACK,
  profileFromPublishedResult,
} from "@/lib/content/site-profile";
import { getSiteUrl } from "./site-url";

const seoTitleSuffix = "Cybersecurity, GRC, IT Risk & Privacy";
const defaultDescription =
  "Cybersecurity governance, GRC, technology risk, privacy, and AI governance. Northwestern MSIS graduate with applied work through PrivAI Guard.";

export function createPageMetadata(
  title: string,
  description: string,
  path = "",
): Metadata {
  const url = `${getSiteUrl()}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export async function generateRootMetadata(): Promise<Metadata> {
  const profile = profileFromPublishedResult(await getPublishedSiteProfile());
  const displayName = profile?.displayName ?? SITE_CHROME_FALLBACK.displayName;
  const shortName = profile?.shortName ?? SITE_CHROME_FALLBACK.shortName;
  const defaultTitle = profile
    ? `${profile.displayName} — ${seoTitleSuffix}`
    : SITE_CHROME_FALLBACK.displayName;

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
      index: true,
      follow: true,
    },
  };
}
