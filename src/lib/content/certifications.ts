import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentStatus, TrackTag } from "@/lib/supabase/database.types";
import { isUuid } from "@/lib/admin/ids";

/**
 * Public certification reads from Supabase.
 *
 * Certifications are stored in `public.credentials` with
 * `kind = 'certification'`. Cutover: do not use these from
 * `src/app/credentials/**` until an explicit content step loads reviewed
 * rows. Public pages use `getPublishedCredentials()` and UUID
 * relationships, not this adapter.
 */

export const CERTIFICATION_KIND = "certification" as const;

export type PublishedCertification = {
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

function mapCertification(row: {
  id: string;
  name: string;
  issuer: string;
  year_label: string | null;
  details: string | null;
  track: TrackTag;
  highlight: boolean;
  sort_order: number;
}): PublishedCertification {
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

export async function getPublishedCertifications(): Promise<
  PublishedCertification[]
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("credentials")
    .select(
      "id, name, issuer, year_label, details, needs_verification, track, highlight, status, sort_order",
    )
    .eq("kind", CERTIFICATION_KIND)
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
    .map(mapCertification);
}

export async function getPublishedCertificationById(
  id: string,
): Promise<PublishedCertification | null> {
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
    .eq("kind", CERTIFICATION_KIND)
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

  return mapCertification(data);
}
