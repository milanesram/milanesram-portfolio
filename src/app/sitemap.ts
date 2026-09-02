import type { MetadataRoute } from "next";
import { getPublishedPublications } from "@/lib/content/publications";
import { getPublishedProjects } from "@/lib/content/projects";
import { getPublishedPageSeo } from "@/lib/content/seo";
import { publicSitemapIndexPaths } from "@/lib/content/page-seo";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const FALLBACK_PATHS = [
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
  const [seoResult, publicationsResult, projectsResult] = await Promise.all([
    getPublishedPageSeo(),
    getPublishedPublications(),
    getPublishedProjects(),
  ]);

  const indexPaths = seoResult.ok
    ? publicSitemapIndexPaths(seoResult.records)
    : FALLBACK_PATHS.filter((path) => path !== "/projects/privai-guard");

  const includeWriting = indexPaths.includes("/writing");
  const includeProjects = indexPaths.includes("/projects");

  const staticEntries = indexPaths.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "/" ? 1 : 0.7,
  }));

  const writingEntries =
    includeWriting && publicationsResult.ok
      ? publicationsResult.publications.map((publication) => ({
          url: `${base}/writing/${publication.slug}`,
          lastModified: new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }))
      : [];

  const projectEntries =
    includeProjects && projectsResult.ok
      ? projectsResult.projects
          .filter((project) => project.slug === "privai-guard")
          .map((project) => ({
            url: `${base}/projects/${project.slug}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.7,
          }))
      : [];

  return [...staticEntries, ...projectEntries, ...writingEntries];
}
