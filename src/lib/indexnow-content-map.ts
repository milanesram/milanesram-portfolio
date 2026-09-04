/**
 * Canonical public-path mapping for CMS mutations.
 *
 * Paths are site-relative. IndexNow builds absolute milanesram.com URLs.
 * Do not include admin, API, sitemap, robots, or verification-file paths.
 */

import { PAGE_SEO_PATHS } from "@/lib/content/page-seo";
import type {
  ContentStatus,
  MediaPurpose,
  PageSeoKey,
  TrackTag,
} from "@/lib/supabase/database.types";

export const PUBLIC_FOCUS_SLUGS = [
  "cybersecurity-grc",
  "privacy-ai-governance",
] as const;

export type PublicFocusSlug = (typeof PUBLIC_FOCUS_SLUGS)[number];

export const PUBLIC_PROJECT_DETAIL_SLUG = "privai-guard";

export const SITE_WIDE_PUBLIC_PATHS = [
  "/",
  "/about",
  "/experience",
  "/projects",
  `/projects/${PUBLIC_PROJECT_DETAIL_SLUG}`,
  "/writing",
  "/credentials",
  "/resume",
  "/contact",
  "/focus/cybersecurity-grc",
  "/focus/privacy-ai-governance",
] as const;

const FOCUS_HOME_AND_RESUME = ["/", "/resume"] as const;

function unique(paths: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const path of paths) {
    if (!path || seen.has(path)) {
      continue;
    }

    seen.add(path);
    out.push(path);
  }

  return out;
}

export function isPublishedStatus(
  status: ContentStatus | null | undefined,
): boolean {
  return status === "published";
}

export function isPublicCredential(args: {
  status: ContentStatus | null | undefined;
  needsVerification: boolean;
}): boolean {
  return isPublishedStatus(args.status) && args.needsVerification === false;
}

export function focusPagePath(slug: string | null | undefined): string | null {
  if (slug === "cybersecurity-grc") {
    return "/focus/cybersecurity-grc";
  }

  if (slug === "privacy-ai-governance") {
    return "/focus/privacy-ai-governance";
  }

  return null;
}

export function projectDetailPath(slug: string | null | undefined): string | null {
  return slug === PUBLIC_PROJECT_DETAIL_SLUG
    ? `/projects/${PUBLIC_PROJECT_DETAIL_SLUG}`
    : null;
}

export function writingDetailPath(slug: string | null | undefined): string | null {
  const trimmed = slug?.trim() ?? "";

  if (!trimmed || trimmed.includes("/") || trimmed.includes(".")) {
    return null;
  }

  return `/writing/${trimmed}`;
}

export function publicPathForPageSeoKey(pageKey: PageSeoKey): string {
  return PAGE_SEO_PATHS[pageKey] || "/";
}

function focusPathsForTrack(track: TrackTag | null | undefined): string[] {
  if (track === "cybersecurity_grc") {
    return ["/focus/cybersecurity-grc"];
  }

  if (track === "privacy_ai") {
    return ["/focus/privacy-ai-governance"];
  }

  if (track === "all") {
    return ["/focus/cybersecurity-grc", "/focus/privacy-ai-governance"];
  }

  return [];
}

export function singletonPagePaths(args: {
  wasPublished: boolean;
  isPublished: boolean;
  path: string;
}): string[] {
  if (!args.wasPublished && !args.isPublished) {
    return [];
  }

  return unique([args.path]);
}

export function publicationPaths(args: {
  wasPublished: boolean;
  isPublished: boolean;
  oldSlug?: string | null;
  newSlug?: string | null;
  featuredFocusSlugs?: string[];
  track?: TrackTag | null;
}): string[] {
  if (!args.wasPublished && !args.isPublished) {
    return [];
  }

  const paths: Array<string | null> = ["/writing"];

  if (args.wasPublished) {
    paths.push(writingDetailPath(args.oldSlug ?? args.newSlug));
  }

  if (args.isPublished) {
    paths.push(writingDetailPath(args.newSlug ?? args.oldSlug));
  }

  for (const slug of args.featuredFocusSlugs ?? []) {
    paths.push(focusPagePath(slug));
  }

  if (args.track) {
    paths.push(...focusPathsForTrack(args.track));
  }

  return unique(paths);
}

export function projectPaths(args: {
  wasPublished: boolean;
  isPublished: boolean;
  slug?: string | null;
  oldSlug?: string | null;
}): string[] {
  if (!args.wasPublished && !args.isPublished) {
    return [];
  }

  return unique([
    "/projects",
    "/",
    "/focus/cybersecurity-grc",
    "/focus/privacy-ai-governance",
    projectDetailPath(args.oldSlug),
    projectDetailPath(args.slug),
  ]);
}

export function projectChildPaths(args: {
  parentPublished: boolean;
  wasChildPublished: boolean;
  isChildPublished: boolean;
  projectSlug: string | null | undefined;
}): string[] {
  if (!args.parentPublished) {
    return [];
  }

  if (!args.wasChildPublished && !args.isChildPublished) {
    return [];
  }

  return projectPaths({
    wasPublished: true,
    isPublished: true,
    slug: args.projectSlug,
  });
}

export function experiencePaths(args: {
  wasPublished: boolean;
  isPublished: boolean;
}): string[] {
  if (!args.wasPublished && !args.isPublished) {
    return [];
  }

  return unique([
    "/experience",
    "/",
    "/focus/cybersecurity-grc",
    "/focus/privacy-ai-governance",
  ]);
}

export function experienceItemPaths(args: {
  parentPublished: boolean;
  wasPublished: boolean;
  isPublished: boolean;
}): string[] {
  if (!args.parentPublished) {
    return [];
  }

  return experiencePaths({
    wasPublished: args.wasPublished,
    isPublished: args.isPublished,
  });
}

export function credentialPaths(args: {
  wasPublic: boolean;
  isPublic: boolean;
  affectsAbout?: boolean;
}): string[] {
  if (!args.wasPublic && !args.isPublic) {
    return [];
  }

  return unique([
    "/credentials",
    "/",
    "/focus/cybersecurity-grc",
    "/focus/privacy-ai-governance",
    args.affectsAbout ? "/about" : null,
  ]);
}

export function focusPagePaths(args: {
  wasPublished: boolean;
  isPublished: boolean;
  slug?: string | null;
  oldSlug?: string | null;
}): string[] {
  if (!args.wasPublished && !args.isPublished) {
    return [];
  }

  return unique([
    ...FOCUS_HOME_AND_RESUME,
    focusPagePath(args.oldSlug),
    focusPagePath(args.slug),
  ]);
}

export function profilePaths(args: {
  wasPublished: boolean;
  isPublished: boolean;
}): string[] {
  if (!args.wasPublished && !args.isPublished) {
    return [];
  }

  return [...SITE_WIDE_PUBLIC_PATHS];
}

export function settingsPaths(): string[] {
  return [...SITE_WIDE_PUBLIC_PATHS];
}

export function seoPagePaths(args: {
  pageKey: PageSeoKey;
  wasPublished: boolean;
  isPublished: boolean;
}): string[] {
  if (!args.wasPublished && !args.isPublished) {
    return [];
  }

  return unique([publicPathForPageSeoKey(args.pageKey)]);
}

export function resumeTrackPaths(args: {
  wasPublished: boolean;
  isPublished: boolean;
}): string[] {
  if (!args.wasPublished && !args.isPublished) {
    return [];
  }

  return unique(["/resume", "/"]);
}

export function journeyPaths(args: {
  wasPublished: boolean;
  isPublished: boolean;
}): string[] {
  return singletonPagePaths({
    ...args,
    path: "/about",
  });
}

export function mediaPaths(args: {
  wasPublic: boolean;
  isPublic: boolean;
  purpose: MediaPurpose | null;
  usage: {
    journey: number;
    projects: number;
    resume: number;
    publications: number;
    portrait: boolean;
  };
}): string[] {
  if (!args.wasPublic && !args.isPublic) {
    return [];
  }

  const used =
    args.usage.portrait ||
    args.usage.journey > 0 ||
    args.usage.projects > 0 ||
    args.usage.resume > 0 ||
    args.usage.publications > 0;

  if (!used) {
    return [];
  }

  const paths: string[] = [];

  if (args.purpose === "portrait" || args.usage.portrait) {
    paths.push("/", "/about");
  }

  if (args.usage.journey > 0 || args.purpose === "journey") {
    if (args.usage.journey > 0) {
      paths.push("/about");
    }
  }

  if (args.usage.projects > 0) {
    paths.push("/projects", `/projects/${PUBLIC_PROJECT_DETAIL_SLUG}`);
  }

  if (args.usage.resume > 0) {
    paths.push("/resume", "/");
  }

  if (args.usage.publications > 0) {
    paths.push("/writing");
  }

  return unique(paths);
}
