import type { FocusPage, TrackId } from "@/content/types";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { ContentStatus } from "@/lib/supabase/database.types";

/**
 * Public focus-page reads from Supabase.
 *
 * `/focus/cybersecurity-grc` and `/focus/privacy-ai-governance` read the
 * published focus record through the anonymous publishable client. RLS
 * remains the publication boundary. Supporting lists on FocusView stay on
 * their existing sources. `src/content/site.ts` is retained for Home,
 * Resume, footer, and presentation aliases.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const TRACK_BY_SLUG: Record<string, TrackId> = {
  "cybersecurity-grc": "cyber",
  "privacy-ai-governance": "privacy",
};

export type PublishedFocusPage = {
  slug: string;
  navLabel: string;
  headline: string;
  summary: string;
  competencies: string[];
};

export type PublishedFocusPageResult =
  | { ok: true; page: PublishedFocusPage }
  | { ok: true; page: null }
  | { ok: false };

function isPublishedStatus(status: ContentStatus): boolean {
  return status === "published";
}

export function toPresentationFocusPage(
  page: PublishedFocusPage,
  trackId: TrackId,
): FocusPage {
  return {
    id: trackId,
    slug: page.slug,
    navLabel: page.navLabel,
    headline: page.headline,
    summary: page.summary,
    competencies: page.competencies,
  };
}

export async function getPublishedFocusPageBySlug(
  slug: string,
): Promise<PublishedFocusPageResult> {
  if (!SLUG_PATTERN.test(slug) || slug.length > 80 || !(slug in TRACK_BY_SLUG)) {
    return { ok: true, page: null };
  }

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("focus_pages")
    .select("slug, nav_label, headline, summary, competencies, status")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    return { ok: false };
  }

  if (!data || !isPublishedStatus(data.status)) {
    return { ok: true, page: null };
  }

  return {
    ok: true,
    page: {
      slug: data.slug,
      navLabel: data.nav_label,
      headline: data.headline,
      summary: data.summary,
      competencies: data.competencies,
    },
  };
}
