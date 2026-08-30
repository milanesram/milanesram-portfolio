import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentStatus, TrackTag } from "@/lib/supabase/database.types";
import { isUuid } from "@/lib/admin/ids";

/**
 * Public license reads from Supabase.
 *
 * Licenses are stored in `public.credentials` with `kind = 'license'`.
 * Cutover: do not use these from `src/app/credentials/**` until an explicit
 * content step loads reviewed rows. Public pages still render from
 * `src/content/credentials.ts`.
 */

export const LICENSE_KIND = "license" as const;

export type PublishedLicense = {
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

function mapLicense(row: {
  id: string;
  name: string;
  issuer: string;
  year_label: string | null;
  details: string | null;
  track: TrackTag;
  highlight: boolean;
  sort_order: number;
}): PublishedLicense {
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

export async function getPublishedLicenses(): Promise<PublishedLicense[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("credentials")
    .select(
      "id, name, issuer, year_label, details, needs_verification, track, highlight, status, sort_order",
    )
    .eq("kind", LICENSE_KIND)
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
    .map(mapLicense);
}

export async function getPublishedLicenseById(
  id: string,
): Promise<PublishedLicense | null> {
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
    .eq("kind", LICENSE_KIND)
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

  return mapLicense(data);
}
