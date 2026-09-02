import type { ContentStatus, PageSeoKey } from "@/lib/supabase/database.types";

export const PAGE_SEO_KEYS = [
  "home",
  "about",
  "focus-cybersecurity-grc",
  "focus-privacy-ai-governance",
  "experience",
  "projects",
  "writing",
  "credentials",
  "resume",
  "contact",
] as const satisfies readonly PageSeoKey[];

export const PAGE_SEO_PATHS: Record<PageSeoKey, string> = {
  home: "",
  about: "/about",
  "focus-cybersecurity-grc": "/focus/cybersecurity-grc",
  "focus-privacy-ai-governance": "/focus/privacy-ai-governance",
  experience: "/experience",
  projects: "/projects",
  writing: "/writing",
  credentials: "/credentials",
  resume: "/resume",
  contact: "/contact",
};

export const PAGE_SEO_LABELS: Record<PageSeoKey, string> = {
  home: "Home",
  about: "About",
  "focus-cybersecurity-grc": "Focus · Cybersecurity / GRC",
  "focus-privacy-ai-governance": "Focus · Privacy / AI Governance",
  experience: "Experience",
  projects: "Projects",
  writing: "Writing",
  credentials: "Credentials",
  resume: "Resume",
  contact: "Contact",
};

/** Structural only. Never a career-narrative fallback. */
export const PAGE_SEO_STRUCTURAL_FALLBACK: Record<
  PageSeoKey,
  { title: string; description: string }
> = {
  home: {
    title: "Portfolio",
    description: "Professional portfolio.",
  },
  about: {
    title: "About",
    description: "About this professional record.",
  },
  "focus-cybersecurity-grc": {
    title: "Focus profile",
    description: "Professional focus profile.",
  },
  "focus-privacy-ai-governance": {
    title: "Focus profile",
    description: "Professional focus profile.",
  },
  experience: {
    title: "Experience",
    description: "Professional experience.",
  },
  projects: {
    title: "Projects",
    description: "Selected projects.",
  },
  writing: {
    title: "Writing",
    description: "Selected writing.",
  },
  credentials: {
    title: "Credentials",
    description: "Education and credentials.",
  },
  resume: {
    title: "Resume",
    description: "Resume options for this professional record.",
  },
  contact: {
    title: "Contact",
    description: "Public contact channels.",
  },
};

export type PublicPageSeo = {
  pageKey: PageSeoKey;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  indexable: boolean;
  path: string;
};

export type PageSeoRow = {
  page_key: string;
  title: string;
  description: string;
  og_title: string | null;
  og_description: string | null;
  indexable: boolean;
  status: ContentStatus;
};

export function isPageSeoKey(value: string): value is PageSeoKey {
  return (PAGE_SEO_KEYS as readonly string[]).includes(value);
}

export function isPublishedStatus(status: ContentStatus): boolean {
  return status === "published";
}

export function mapPageSeo(row: PageSeoRow): PublicPageSeo | null {
  if (!isPageSeoKey(row.page_key) || !isPublishedStatus(row.status)) {
    return null;
  }

  const title = row.title.trim();
  const description = row.description.trim();

  if (!title || !description) {
    return null;
  }

  const ogTitle = row.og_title?.trim() || title;
  const ogDescription = row.og_description?.trim() || description;

  return {
    pageKey: row.page_key,
    title,
    description,
    ogTitle,
    ogDescription,
    indexable: row.indexable,
    path: PAGE_SEO_PATHS[row.page_key],
  };
}

export function resolvePageSeo(
  row: PageSeoRow | null | undefined,
  pageKey: PageSeoKey,
): PublicPageSeo {
  const mapped = row ? mapPageSeo(row) : null;

  if (mapped && mapped.pageKey === pageKey) {
    return mapped;
  }

  const fallback = PAGE_SEO_STRUCTURAL_FALLBACK[pageKey];

  return {
    pageKey,
    title: fallback.title,
    description: fallback.description,
    ogTitle: fallback.title,
    ogDescription: fallback.description,
    indexable: true,
    path: PAGE_SEO_PATHS[pageKey],
  };
}

export function publicSitemapIndexPaths(records: PublicPageSeo[]): string[] {
  const byKey = new Map(records.map((record) => [record.pageKey, record]));

  return PAGE_SEO_KEYS.filter((key) => byKey.get(key)?.indexable !== false).map(
    (key) => PAGE_SEO_PATHS[key] || "/",
  );
}

export function buildRobotsRules(siteIndexable: boolean | null): {
  allow: string;
  disallow: string[];
} {
  if (siteIndexable === false) {
    return { allow: "", disallow: ["/"] };
  }

  return {
    allow: "/",
    disallow: ["/private-source/", "/admin", "/admin/"],
  };
}
