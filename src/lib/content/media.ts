import type { SupabaseClient } from "@supabase/supabase-js";
import { PUBLIC_MEDIA_BUCKET } from "@/lib/content/media-bucket";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type {
  ContentStatus,
  Database,
  MediaKind,
  MediaPurpose,
} from "@/lib/supabase/database.types";

/**
 * Public media-metadata reads from Supabase.
 *
 * Cutover: do not import this from Home, About, Writing, Projects,
 * Resume, or Focus until an explicit later step. This module establishes
 * the anonymous read contract only.
 *
 * Uses the anonymous publishable client. RLS remains the publication
 * boundary (published AND is_public). Does not read cookies, attach an
 * owner session, or use the service role.
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MEDIA_COLUMNS =
  "id, bucket_path, kind, purpose, title, alt_text, caption, credit, year_label, mime_type, byte_size, sort_order, status, is_public";

export type PublishedPublicMedia = {
  id: string;
  kind: MediaKind;
  purpose: MediaPurpose | null;
  title: string;
  altText: string | null;
  caption: string | null;
  credit: string | null;
  yearLabel: string | null;
  mimeType: string | null;
  byteSize: number | null;
  bucketPath: string;
  publicUrl: string;
  sortOrder: number;
};

type PublicClient = SupabaseClient<Database>;

type MediaRow = {
  id: string;
  bucket_path: string;
  kind: MediaKind;
  purpose: MediaPurpose | null;
  title: string;
  alt_text: string | null;
  caption: string | null;
  credit: string | null;
  year_label: string | null;
  mime_type: string | null;
  byte_size: number | null;
  sort_order: number;
  status: ContentStatus;
  is_public: boolean;
};

function isMediaUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function isPubliclyReadable(status: ContentStatus, isPublic: boolean): boolean {
  return status === "published" && isPublic;
}

function normalizeBucketPath(path: string): string | null {
  const trimmed = path.trim();

  if (!trimmed || trimmed.startsWith("/") || trimmed.includes("..")) {
    return null;
  }

  return trimmed;
}

function buildPublicMediaObjectUrl(
  client: PublicClient,
  bucketPath: string,
): string | null {
  const normalized = normalizeBucketPath(bucketPath);

  if (!normalized) {
    return null;
  }

  const { data } = client.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(normalized);
  return data.publicUrl || null;
}

/**
 * Deterministic public object URL for an approved public-media path.
 * Uses Storage getPublicUrl. No signed URL, no listing, no write.
 * Bucket name is fixed to public-media.
 */
export function getPublicMediaObjectUrl(bucketPath: string): string | null {
  return buildPublicMediaObjectUrl(createPublicSupabaseClient(), bucketPath);
}

function mapMedia(client: PublicClient, row: MediaRow): PublishedPublicMedia | null {
  const publicUrl = buildPublicMediaObjectUrl(client, row.bucket_path);

  if (!publicUrl) {
    return null;
  }

  return {
    id: row.id,
    kind: row.kind,
    purpose: row.purpose,
    title: row.title,
    altText: row.alt_text,
    caption: row.caption,
    credit: row.credit,
    yearLabel: row.year_label,
    mimeType: row.mime_type,
    byteSize: row.byte_size,
    bucketPath: row.bucket_path,
    publicUrl,
    sortOrder: row.sort_order,
  };
}

export async function getPublishedPublicMediaAssets(): Promise<
  PublishedPublicMedia[]
> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select(MEDIA_COLUMNS)
    .eq("status", "published")
    .eq("is_public", true)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.flatMap((row) => {
    if (!isPubliclyReadable(row.status, row.is_public)) {
      return [];
    }

    const mapped = mapMedia(supabase, row);
    return mapped ? [mapped] : [];
  });
}

export async function getPublishedPublicMediaAssetById(
  id: string,
): Promise<PublishedPublicMedia | null> {
  if (!isMediaUuid(id)) {
    return null;
  }

  const supabase = createPublicSupabaseClient();
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

  return mapMedia(supabase, data);
}
