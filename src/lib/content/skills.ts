import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentStatus } from "@/lib/supabase/database.types";
import { isUuid } from "@/lib/admin/ids";

/**
 * Public skills reads from Supabase.
 *
 * Unused leftover helper. Public Focus, Home track cards, and Resume
 * consume `src/lib/content/focus.ts`. Do not add a second public authority.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type PublishedFocusPage = {
  id: string;
  slug: string;
  navLabel: string;
  headline: string;
  summary: string;
  competencies: string[];
  sortOrder: number;
};

function isPublishedStatus(status: ContentStatus): boolean {
  return status === "published";
}

function mapFocusPage(row: {
  id: string;
  slug: string;
  nav_label: string;
  headline: string;
  summary: string;
  competencies: string[];
  sort_order: number;
}): PublishedFocusPage {
  return {
    id: row.id,
    slug: row.slug,
    navLabel: row.nav_label,
    headline: row.headline,
    summary: row.summary,
    competencies: row.competencies,
    sortOrder: row.sort_order,
  };
}

const FOCUS_PAGE_COLUMNS =
  "id, slug, nav_label, headline, summary, competencies, status, sort_order";

export async function getPublishedFocusPages(): Promise<PublishedFocusPage[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("focus_pages")
    .select(FOCUS_PAGE_COLUMNS)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("nav_label", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.filter((row) => isPublishedStatus(row.status)).map(mapFocusPage);
}

export async function getPublishedFocusPageById(
  id: string,
): Promise<PublishedFocusPage | null> {
  if (!isUuid(id)) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("focus_pages")
    .select(FOCUS_PAGE_COLUMNS)
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data || !isPublishedStatus(data.status)) {
    return null;
  }

  return mapFocusPage(data);
}

export async function getPublishedFocusPageBySlug(
  slug: string,
): Promise<PublishedFocusPage | null> {
  if (!SLUG_PATTERN.test(slug) || slug.length > 80) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("focus_pages")
    .select(FOCUS_PAGE_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data || !isPublishedStatus(data.status)) {
    return null;
  }

  return mapFocusPage(data);
}
