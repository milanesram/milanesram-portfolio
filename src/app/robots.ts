import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { buildRobotsRules } from "@/lib/content/page-seo";
import { getPublicSiteIndexability } from "@/lib/content/seo";
import { isVercelPreviewDeployment } from "@/lib/vercel-env";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const indexable = isVercelPreviewDeployment()
    ? false
    : await getPublicSiteIndexability();
  const rules = buildRobotsRules(indexable);

  return {
    rules: {
      userAgent: "*",
      ...(rules.allow ? { allow: rules.allow } : {}),
      disallow: rules.disallow,
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
