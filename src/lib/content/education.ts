import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentStatus, TrackTag } from "@/lib/supabase/database.types";
import { isUuid } from "@/lib/admin/ids";

/**
 * Public education reads from Supabase.
 *
 * Education is stored in `public.credentials` with `kind = 'degree'`.
 * Cutover: do not use these from `src/app/credentials/**` or the home
 * education section until an explicit content step loads reviewed rows.
 * Public pages still render from `src/content/credentials.ts`.
 */

export const EDUCATION_KIND = "degree" as const;

export type PublishedEducation = {
  id: string;
  name: string;
  issuer: string;
  yearLabel: string | null;
  details: string | null;
  track: TrackTag;
  highlight: boolean;
  sortOrder: number;
};

function isPublishedStatus(status: ContentStatus): boolean {
  return status === "published";
}

function mapEducation(row: {
  id: string;
  name: string;
  issuer: string;
  year_label: string | null;
  details: string | null;
  track: TrackTag;
  highlight: boolean;
  sort_order: number;
}): PublishedEducation {
  return {
    id: row.id,
    name: row.name,
    issuer: row.issuer,
    yearLabel: row.year_label,
    details: row.details,
    track: row.track,
    highlight: row.highlight,
    sortOrder: row.sort_order,
  };
}

export async function getPublishedEducation(): Promise<PublishedEducation[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("credentials")
    .select(
      "id, name, issuer, year_label, details, needs_verification, track, highlight, status, sort_order",
    )
    .eq("kind", EDUCATION_KIND)
    .eq("status", "published")
    .eq("needs_verification", false)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data
    .filter(
      (row) => isPublishedStatus(row.status) && row.needs_verification === false,
    )
    .map(mapEducation);
}

export async function getPublishedEducationById(
  id: string,
): Promise<PublishedEducation | null> {
  if (!isUuid(id)) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("credentials")
    .select(
      "id, name, issuer, year_label, details, needs_verification, track, highlight, status, sort_order",
    )
    .eq("id", id)
    .eq("kind", EDUCATION_KIND)
    .eq("status", "published")
    .eq("needs_verification", false)
    .maybeSingle();

  if (
    error ||
    !data ||
    !isPublishedStatus(data.status) ||
    data.needs_verification
  ) {
    return null;
  }

  return mapEducation(data);
}
