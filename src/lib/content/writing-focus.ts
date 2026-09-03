import type { TrackTag } from "@/lib/supabase/database.types";

/**
 * Writing ↔ Focus presentation helpers.
 *
 * Route slugs remain code-owned. Visible labels come from hosted
 * `focus_pages.nav_label`. Do not infer “both tracks” from a count of 2.
 */

export type PublishedFocusLabel = {
  slug: string;
  label: string;
  sortOrder: number;
};

export type RelatedFocus = {
  href: `/focus/${string}`;
  label: string;
};

const TRACK_FOCUS_SLUGS: Record<Exclude<TrackTag, "all">, readonly string[]> = {
  cybersecurity_grc: ["cybersecurity-grc"],
  privacy_ai: ["privacy-ai-governance"],
};

export function selectRelatedPublishedFocuses(args: {
  track: TrackTag;
  publishedFocuses: PublishedFocusLabel[];
  featuredOnSlugs?: string[];
}): PublishedFocusLabel[] {
  const published = args.publishedFocuses.filter(
    (focus) => focus.slug.trim() && focus.label.trim(),
  );
  const bySlug = new Map(published.map((focus) => [focus.slug, focus]));
  const selected = new Map<string, PublishedFocusLabel>();

  if (args.track === "all") {
    for (const focus of published) {
      selected.set(focus.slug, focus);
    }
  } else {
    for (const slug of TRACK_FOCUS_SLUGS[args.track] ?? []) {
      const focus = bySlug.get(slug);
      if (focus) {
        selected.set(focus.slug, focus);
      }
    }
  }

  for (const slug of args.featuredOnSlugs ?? []) {
    const focus = bySlug.get(slug);
    if (focus) {
      selected.set(focus.slug, focus);
    }
  }

  return [...selected.values()].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.label.localeCompare(right.label);
  });
}

export function formatFocusRelevanceLabels(
  focuses: PublishedFocusLabel[],
): string | null {
  if (focuses.length === 0) {
    return null;
  }

  return focuses.map((focus) => focus.label).join(" · ");
}

export function toRelatedFocuses(
  focuses: PublishedFocusLabel[],
): RelatedFocus[] {
  return focuses.map((focus) => ({
    href: `/focus/${focus.slug}`,
    label: focus.label,
  }));
}
