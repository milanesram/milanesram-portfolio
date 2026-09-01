import type { Metadata } from "next";
import { siteProfile } from "@/content";
import { getSiteUrl } from "./site-url";

const defaultTitle =
  "Rainier (Ram) Milanes — Cybersecurity, GRC, IT Risk & Privacy";
const defaultDescription =
  "Targeting analyst, specialist, and consultant roles in cybersecurity, GRC, and privacy. Northwestern MSIS graduate with applied work through PrivAI Guard.";

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
      siteName: siteProfile.displayName,
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

export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: defaultTitle,
    template: `%s — ${siteProfile.shortName}`,
  },
  description: defaultDescription,
  applicationName: siteProfile.displayName,
  authors: [{ name: siteProfile.displayName, url: siteProfile.linkedinUrl }],
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    siteName: siteProfile.displayName,
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
