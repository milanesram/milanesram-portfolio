import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentStatus, MediaKind } from "@/lib/supabase/database.types";
import { isUuid } from "@/lib/admin/ids";

/**
 * Public media-metadata reads from Supabase.
 *
 * Cutover: do not use these from resume, project, or focus routes until
 * an explicit later step. Public pages still render from `src/content/`
 * and local `/public` assets.
 *
 * Returns published + public display metadata only. Omits `bucket_path`,
 * timestamps, and owner/Auth data. Storage objects are not served here.
 */

export type PublishedPublicMedia = {
  id: string;
  title: string;
  altText: string | null;
  kind: MediaKind;
};

function isPubliclyReadable(
  status: ContentStatus,
  isPublic: boolean,
): boolean {
  return status === "published" && isPublic;
}

const MEDIA_COLUMNS = "id, title, alt_text, kind, status, is_public";

function mapMedia(row: {
  id: string;
  title: string;
  alt_text: string | null;
  kind: MediaKind;
}): PublishedPublicMedia {
  return {
    id: row.id,
    title: row.title,
    altText: row.alt_text,
    kind: row.kind,
  };
}

export async function getPublishedPublicMediaAssets(): Promise<
  PublishedPublicMedia[]
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select(MEDIA_COLUMNS)
    .eq("status", "published")
    .eq("is_public", true)
    .order("title", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data
    .filter((row) => isPubliclyReadable(row.status, row.is_public))
    .map(mapMedia);
}

export async function getPublishedPublicMediaAssetById(
  id: string,
): Promise<PublishedPublicMedia | null> {
  if (!isUuid(id)) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select(MEDIA_COLUMNS)
    .eq("id", id)
    .eq("status", "published")
    .eq("is_public", true)
    .maybeSingle();

  if (error || !data || !isPubliclyReadable(data.status, data.is_public)) {
    return null;
  }

  return mapMedia(data);
}
