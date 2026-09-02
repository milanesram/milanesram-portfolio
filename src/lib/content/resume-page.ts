import type {
  ContentStatus,
  ResumeDeliveryMode,
} from "@/lib/supabase/database.types";

export type PublicResumePage = {
  kicker: string;
  headline: string;
  lede: string;
  requestIntro: string;
  requestFootnote: string;
  closingHeading: string;
  closingLede: string;
};

export type PublicResumeMedia = {
  id: string;
  title: string;
  publicUrl: string;
  mimeType: string;
};

export type PublicResumeTrack = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  href: string | null;
  ctaLabel: string;
  deliveryMode: ResumeDeliveryMode;
  media: PublicResumeMedia | null;
};

export type ResumePageRow = {
  status: ContentStatus;
  kicker: string;
  headline: string;
  lede: string;
  request_intro: string;
  request_footnote: string;
  closing_heading: string;
  closing_lede: string;
};

export type ResumeMediaRow = {
  id: string;
  kind: string;
  purpose: string | null;
  title: string;
  mime_type: string | null;
  bucket_path: string;
  status: ContentStatus;
  is_public: boolean;
};

export type ResumeTrackRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  delivery_mode: ResumeDeliveryMode;
  request_cta_label: string;
  sort_order: number;
  status: ContentStatus;
  focus_pages:
    | { slug: string; status: ContentStatus }
    | { slug: string; status: ContentStatus }[]
    | null;
  media_assets: ResumeMediaRow | ResumeMediaRow[] | null;
};

function isPublishedStatus(status: ContentStatus): boolean {
  return status === "published";
}

function unwrap<T>(value: T | T[] | null): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function isEligibleResumeMedia(
  asset: ResumeMediaRow | null,
  publicUrl: string | null,
): asset is ResumeMediaRow {
  if (!asset || !publicUrl) {
    return false;
  }

  return (
    asset.kind === "resume_pdf" &&
    asset.purpose === "resume" &&
    isPublishedStatus(asset.status) &&
    asset.is_public &&
    (asset.mime_type === "application/pdf" ||
      asset.mime_type === "application/x-pdf")
  );
}

export function mapResumePage(row: ResumePageRow): PublicResumePage | null {
  if (!isPublishedStatus(row.status)) {
    return null;
  }

  const headline = row.headline.trim();
  const lede = row.lede.trim();

  if (!headline || !lede) {
    return null;
  }

  return {
    kicker: row.kicker.trim() || "Resume",
    headline,
    lede,
    requestIntro: row.request_intro.trim(),
    requestFootnote: row.request_footnote.trim(),
    closingHeading: row.closing_heading.trim(),
    closingLede: row.closing_lede.trim(),
  };
}

export function mapResumeTrack(
  row: ResumeTrackRow,
  publicUrlFor: (bucketPath: string) => string | null,
): PublicResumeTrack | null {
  if (!isPublishedStatus(row.status)) {
    return null;
  }

  const title = row.title.trim();
  const summary = row.summary.trim();

  if (!title || !summary) {
    return null;
  }

  const focus = unwrap(row.focus_pages);
  const href =
    focus && isPublishedStatus(focus.status) && focus.slug.trim()
      ? `/focus/${focus.slug.trim()}`
      : null;

  const asset = unwrap(row.media_assets);
  const publicUrl = asset ? publicUrlFor(asset.bucket_path) : null;
  const eligible = isEligibleResumeMedia(asset, publicUrl);
  const media =
    eligible && publicUrl
      ? {
          id: asset.id,
          title: asset.title,
          publicUrl,
          mimeType: asset.mime_type ?? "application/pdf",
        }
      : null;

  const deliveryMode = row.delivery_mode;
  const downloadable = deliveryMode === "public_file" && media;

  return {
    id: row.id,
    slug: row.slug,
    title,
    summary,
    href: downloadable ? media.publicUrl : href,
    ctaLabel: downloadable ? "Download resume" : row.request_cta_label.trim(),
    deliveryMode,
    media: downloadable ? media : null,
  };
}
