import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  return paths.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
