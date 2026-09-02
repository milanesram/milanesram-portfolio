import { cache } from "react";
import { FOCUS_PUBLIC_ROUTES } from "@/content/site";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import {
  interpretPublishedFocusPageResponse,
  interpretPublishedFocusPagesResponse,
  toPublicFocusPage,
  mapFocusCard,
  type PublishedFocusPageResult,
  type PublishedFocusPagesResult,
  type PublicFocusCard,
  type PublicFocusPage,
  type FocusSelectedWriting,
} from "@/lib/content/focus-page";
import type {
  HomeCredentialRecord,
  HomeExperienceItemRecord,
  HomeExperienceParentRecord,
  HomeProjectRecord,
} from "@/lib/content/home-page";

/**
 * Public Focus reads from hosted `focus_pages` and UUID relationships.
 *
 * Routes stay code-owned. Supporting evidence is selected by UUID, not
 * static arrays, slugs, or body-string matching. Home/Resume consume the
 * cached list helper. `resume_media_id` is unused until Step 52G.
 */

export type {
  FocusSelectedWriting,
  PublicFocusCard,
  PublicFocusPage,
  PublishedFocusPageResult,
  PublishedFocusPagesResult,
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export { FOCUS_PUBLIC_ROUTES };

export const HOME_FOCUS_CARD_PRESENTATION = {
  "cybersecurity-grc": {
    resumeLabel: "Resume A",
    ctaLabel: "View this track",
  },
  "privacy-ai-governance": {
    resumeLabel: "Resume B",
    ctaLabel: "View this track",
  },
} as const;

const FOCUS_COLUMNS =
  "id, slug, nav_label, headline, summary, competencies, featured_project_id, featured_publication_id, featured_project_lede, card_summary, card_chips, status, sort_order";

const KNOWN_SLUGS = new Set<string>(FOCUS_PUBLIC_ROUTES.map((route) => route.slug));

function isKnownFocusSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && slug.length <= 80 && KNOWN_SLUGS.has(slug);
}

async function loadPublishedFocusPages(): Promise<PublishedFocusPagesResult> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("focus_pages")
    .select(FOCUS_COLUMNS)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("nav_label", { ascending: true });

  const interpreted = interpretPublishedFocusPagesResponse({
    error,
    data: data ?? null,
  });

  if (!interpreted.ok) {
    return { ok: false };
  }

  return {
    ok: true,
    pages: interpreted.rows
      .filter((row) => isKnownFocusSlug(row.slug))
      .map(mapFocusCard),
  };
}

async function loadPublishedFocusPage(
  slug: string,
): Promise<PublishedFocusPageResult> {
  if (!isKnownFocusSlug(slug)) {
    return { ok: true, page: null };
  }

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("focus_pages")
    .select(
      `${FOCUS_COLUMNS}, experience_links:focus_experience_items(experience_item_id, sort_order), credential_links:focus_credentials(credential_id, sort_order)`,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  const interpreted = interpretPublishedFocusPageResponse({
    error,
    data: data ?? null,
  });

  if (!interpreted.ok) {
    return { ok: false };
  }

  if (!interpreted.row) {
    return { ok: true, page: null };
  }

  const focus = interpreted.row;
  const embedded = data as typeof data & {
    experience_links?: { experience_item_id: string; sort_order: number }[];
    credential_links?: { credential_id: string; sort_order: number }[];
  };
  const experienceLinks = embedded.experience_links ?? [];
  const credentialLinks = embedded.credential_links ?? [];
  const experienceItemIds = experienceLinks.map((row) => row.experience_item_id);
  const credentialIds = credentialLinks.map((row) => row.credential_id);

  const [itemsResult, credentialsResult, projectResult, publicationResult] =
    await Promise.all([
      experienceItemIds.length > 0
        ? supabase
            .from("experience_items")
            .select(
              "id, experience_id, body, status, track, parent:experiences(id, organization, title, title_secondary, location_display, kind, start_date, end_date, is_current, status)",
            )
            .in("id", experienceItemIds)
            .eq("status", "published")
        : Promise.resolve({ data: [], error: null }),
      credentialIds.length > 0
        ? supabase
            .from("credentials")
            .select(
              "id, kind, name, issuer, year_label, details, track, highlight, status, needs_verification",
            )
            .in("id", credentialIds)
            .eq("status", "published")
            .eq("needs_verification", false)
        : Promise.resolve({ data: [], error: null }),
      focus.featured_project_id
        ? supabase
            .from("projects")
            .select(
              "id, slug, name, tagline, year_label, role, summary, limits, stack, is_featured, status",
            )
            .eq("id", focus.featured_project_id)
            .eq("status", "published")
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      focus.featured_publication_id
        ? supabase
            .from("publications")
            .select("id, slug, title, document_kind, year_label, abstract, status")
            .eq("id", focus.featured_publication_id)
            .eq("status", "published")
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

  const experienceItems: HomeExperienceItemRecord[] = [];
  const parentsById = new Map<string, HomeExperienceParentRecord>();

  if (!itemsResult.error) {
    for (const row of itemsResult.data ?? []) {
      const { parent, ...item } = row as HomeExperienceItemRecord & {
        parent: HomeExperienceParentRecord | HomeExperienceParentRecord[] | null;
      };
      experienceItems.push(item);
      const resolved = Array.isArray(parent) ? parent[0] : parent;
      if (resolved) {
        parentsById.set(resolved.id, resolved);
      }
    }
  }

  return {
    ok: true,
    page: toPublicFocusPage({
      row: focus,
      experienceLinks,
      experienceItems,
      experienceParents: [...parentsById.values()],
      credentialLinks,
      credentials: ((credentialsResult.error ? [] : credentialsResult.data) ??
        []) as HomeCredentialRecord[],
      featuredProject: (projectResult.error
        ? null
        : (projectResult.data ?? null)) as HomeProjectRecord | null,
      featuredPublication: publicationResult.error
        ? null
        : (publicationResult.data ?? null),
    }),
  };
}

export const getPublishedFocusPages = cache(loadPublishedFocusPages);
export const getPublishedFocusPage = cache(loadPublishedFocusPage);

export function otherFocusRoute(slug: string) {
  return (
    FOCUS_PUBLIC_ROUTES.find((route) => route.slug !== slug) ??
    FOCUS_PUBLIC_ROUTES[0]
  );
}
