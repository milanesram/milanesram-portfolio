export const CANONICAL_SITE_URL = "https://milanesram.com";

/**
 * Public SEO origin for canonical URLs, sitemap entries, robots sitemap
 * references, and metadataBase.
 *
 * Preview, local, and other deployment hostnames must not appear in
 * public canonical metadata. VERCEL_URL remains available to platform
 * code that needs the operational deployment origin.
 */
export function getSiteUrl() {
  return CANONICAL_SITE_URL;
}
