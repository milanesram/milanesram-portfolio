import type { MetadataRoute } from "next";
import { getPublishedPublications } from "@/lib/content/publications";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const paths = [
  "/",
  "/about",
  "/experience",
  "/projects",
  "/projects/privai-guard",
  "/writing",
  "/credentials",
  "/resume",
  "/contact",
  "/focus/cybersecurity-grc",
  "/focus/privacy-ai-governance",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticEntries = paths.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "/" ? 1 : 0.7,
  }));

  const result = await getPublishedPublications();
  const writingEntries =
    result.ok
      ? result.publications.map((publication) => ({
          url: `${base}/writing/${publication.slug}`,
          lastModified: new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }))
      : [];

  return [...staticEntries, ...writingEntries];
}
