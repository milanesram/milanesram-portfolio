import "server-only";
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
 * Home and About may use `getPublishedPublicMediaAssetsByPurpose` for
 * `portrait` and `journey` images. Writing still resolves publication
 * PDFs through `getPublishedPublicMediaAssetById`. Do not import this
 * from Projects, Resume, or Focus for image purposes.
 *
 * Uses the anonymous publishable client. RLS remains the publication
 * boundary (published AND is_public). Does not read cookies, attach an
 * owner session, or use the service role. No writes.
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

export const VISUAL_MEDIA_PURPOSES = ["portrait", "journey"] as const;

export type VisualMediaPurpose = (typeof VISUAL_MEDIA_PURPOSES)[number];

export type PublicImageMedia = {
  id: string;
  purpose: VisualMediaPurpose;
  title: string;
  altText: string;
  caption: string | null;
  yearLabel: string | null;
  credit: string | null;
  sortOrder: number;
  publicUrl: string;
};

export type PublishedPublicMediaByPurposeResult =
  | { ok: true; assets: PublicImageMedia[] }
  | { ok: false };

const SUPPORTED_PUBLIC_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

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

function isVisualMediaPurpose(purpose: MediaPurpose | null): purpose is VisualMediaPurpose {
  return purpose === "portrait" || purpose === "journey";
}

function isSupportedPublicImageMime(mimeType: string | null): boolean {
  return (
    mimeType === "image/jpeg" ||
    mimeType === "image/png" ||
    mimeType === "image/webp" ||
    mimeType === "image/avif"
  );
}

function mapPublicImage(
  client: PublicClient,
  row: MediaRow,
): PublicImageMedia | null {
  if (row.kind !== "image" || !isVisualMediaPurpose(row.purpose)) {
    return null;
  }

  if (!isSupportedPublicImageMime(row.mime_type)) {
    return null;
  }

  const altText = row.alt_text?.trim();

  if (!altText) {
    return null;
  }

  const publicUrl = buildPublicMediaObjectUrl(client, row.bucket_path);

  if (!publicUrl) {
    return null;
  }

  return {
    id: row.id,
    purpose: row.purpose,
    title: row.title,
    altText,
    caption: row.caption,
    yearLabel: row.year_label,
    credit: row.credit,
    sortOrder: row.sort_order,
    publicUrl,
  };
}

/**
 * Purpose-filtered published public images for Home and About.
 * Queries only the requested purpose. Does not list the full media table.
 */
export async function getPublishedPublicMediaAssetsByPurpose(
  purpose: VisualMediaPurpose,
): Promise<PublishedPublicMediaByPurposeResult> {
  if (!isVisualMediaPurpose(purpose)) {
    return { ok: false };
  }

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select(MEDIA_COLUMNS)
    .eq("status", "published")
    .eq("is_public", true)
    .eq("kind", "image")
    .eq("purpose", purpose)
    .in("mime_type", [...SUPPORTED_PUBLIC_IMAGE_MIMES])
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return { ok: false };
  }

  return {
    ok: true,
    assets: data.flatMap((row) => {
      if (!isPubliclyReadable(row.status, row.is_public)) {
        return [];
      }

      if (row.purpose !== purpose) {
        return [];
      }

      const mapped = mapPublicImage(supabase, row);
      return mapped ? [mapped] : [];
    }),
  };
}

/**
 * Home and About use the first published portrait after sort_order ASC.
 * Zero assets or a failed helper both resolve to null.
 */
export function selectPublishedPortrait(
  result: PublishedPublicMediaByPurposeResult,
): PublicImageMedia | null {
  if (!result.ok || result.assets.length === 0) {
    return null;
  }

  return result.assets[0];
}
