import "server-only";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { getPublishedPublicMediaAssetById } from "@/lib/content/media";
import type { PublishedPublicMedia } from "@/lib/content/media";
import {
  formatFocusRelevanceLabels,
  selectRelatedPublishedFocuses,
  toRelatedFocuses,
  type PublishedFocusLabel,
  type RelatedFocus,
} from "@/lib/content/writing-focus";
import type {
  ContentStatus,
  DocumentKind,
  PublicationRightsStatus,
  TrackTag,
} from "@/lib/supabase/database.types";

export type { RelatedFocus };

/**
 * Public publication reads from Supabase.
 *
 * `/writing` and `/writing/[slug]` use this helper. Focus server pages
 * may resolve one frozen slug through `getPublishedPublicationBySlug`.
 * Do not import this helper from Home or client presentation code.
 *
 * Uses the anonymous publishable client. RLS remains the publication
 * boundary (`status = published`). Does not read cookies, attach an owner
 * session, or use the service role. No writes.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const PUBLICATION_SELECT =
  "id, slug, title, document_kind, rights_status, author, publisher, published_on, year_label, abstract, external_url, track, status, sort_order, media_id" as const;

const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  publication: "Publication",
  white_paper: "White paper",
  editorial: "Editorial",
  feature: "Feature",
  four_minute_read: "4 Minute Read",
  other: "Other",
};

export type PublicationAvailability = "pdf" | "external" | "html_only";

export type PublishedPublication = {
  slug: string;
  title: string;
  documentKind: DocumentKind;
  documentKindLabel: string;
  publisher: string;
  yearLabel: string;
  publishedOn: string | null;
  abstract: string;
  externalUrl: string | null;
  author: string;
  track: TrackTag;
  trackRelevance: string | null;
  relatedFocuses: RelatedFocus[];
  sortOrder: number;
  availability: PublicationAvailability;
  pdfUrl: string | null;
};

export type PublishedPublicationsResult =
  | { ok: true; publications: PublishedPublication[] }
  | { ok: false };

export type WritingLibraryGroups = {
  lead: PublishedPublication | null;
  availableHere: PublishedPublication[];
  publishedElsewhere: PublishedPublication[];
};

export type PublishedPublicationResult =
  | { ok: true; publication: PublishedPublication }
  | { ok: true; publication: null }
  | { ok: false };

type PublicationRow = {
  id: string;
  slug: string;
  title: string;
  document_kind: DocumentKind;
  rights_status: PublicationRightsStatus;
  author: string | null;
  publisher: string;
  published_on: string | null;
  year_label: string;
  abstract: string;
  external_url: string | null;
  track: TrackTag;
  status: ContentStatus;
  sort_order: number;
  media_id: string | null;
};

function isPublishedStatus(status: ContentStatus): boolean {
  return status === "published";
}

function isPubliclyEligible(row: PublicationRow): boolean {
  return isPublishedStatus(row.status) && row.rights_status !== "review_required";
}

export function getDocumentKindLabel(kind: DocumentKind): string {
  return DOCUMENT_KIND_LABELS[kind];
}

export function getAvailabilityLabel(
  availability: PublicationAvailability,
): string {
  if (availability === "pdf") {
    return "PDF available here";
  }

  if (availability === "external") {
    return "Published elsewhere";
  }

  return "Read on this site";
}

export function groupPublishedWriting(
  publications: PublishedPublication[],
): WritingLibraryGroups {
  const [lead, ...rest] = publications;

  return {
    lead: lead ?? null,
    availableHere: rest.filter((item) => item.availability === "pdf"),
    publishedElsewhere: rest.filter((item) => item.availability === "external"),
  };
}

function featuredSlugsForPublication(
  publicationId: string,
  focuses: Array<PublishedFocusLabel & { featuredPublicationId: string | null }>,
): string[] {
  return focuses
    .filter((focus) => focus.featuredPublicationId === publicationId)
    .map((focus) => focus.slug);
}

function mapByline(author: string | null): string {
  return author?.trim() ?? "";
}

function normalizeExternalUrl(value: string | null): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }

    return trimmed;
  } catch {
    return null;
  }
}

function isQualifiedPublicationPdf(
  rightsStatus: PublicationRightsStatus,
  media: PublishedPublicMedia | null,
): media is PublishedPublicMedia {
  return (
    rightsStatus === "host_pdf" &&
    media !== null &&
    media.kind === "document" &&
    media.purpose === "publication" &&
    media.mimeType === "application/pdf" &&
    Boolean(media.publicUrl)
  );
}

function mapPublication(
  row: PublicationRow,
  media: PublishedPublicMedia | null,
  hostedFocuses: Array<
    PublishedFocusLabel & { featuredPublicationId: string | null }
  >,
): PublishedPublication | null {
  if (!isPubliclyEligible(row)) {
    return null;
  }

  const externalUrl = normalizeExternalUrl(row.external_url);
  const pdfUrl = isQualifiedPublicationPdf(row.rights_status, media)
    ? media.publicUrl
    : null;

  let availability: PublicationAvailability;

  if (pdfUrl) {
    availability = "pdf";
  } else if (externalUrl) {
    availability = "external";
  } else {
    availability = "html_only";
  }

  const relatedFocuses = selectRelatedPublishedFocuses({
    track: row.track,
    publishedFocuses: hostedFocuses,
    featuredOnSlugs: featuredSlugsForPublication(row.id, hostedFocuses),
  });

  return {
    slug: row.slug,
    title: row.title,
    documentKind: row.document_kind,
    documentKindLabel: getDocumentKindLabel(row.document_kind),
    publisher: row.publisher,
    yearLabel: row.year_label,
    publishedOn: row.published_on,
    abstract: row.abstract,
    externalUrl,
    author: mapByline(row.author),
    track: row.track,
    trackRelevance: formatFocusRelevanceLabels(relatedFocuses),
    relatedFocuses: toRelatedFocuses(relatedFocuses),
    sortOrder: row.sort_order,
    availability,
    pdfUrl: availability === "pdf" ? pdfUrl : null,
  };
}

async function loadPublishedFocusLabels(): Promise<
  Array<PublishedFocusLabel & { featuredPublicationId: string | null }>
> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("focus_pages")
    .select("slug, nav_label, sort_order, status, featured_publication_id")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("nav_label", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data
    .filter((row) => row.status === "published")
    .map((row) => ({
      slug: row.slug.trim(),
      label: row.nav_label.trim(),
      sortOrder: row.sort_order,
      featuredPublicationId: row.featured_publication_id,
    }))
    .filter((row) => row.slug && row.label);
}

async function resolvePublicationMedia(
  row: PublicationRow,
): Promise<PublishedPublicMedia | null> {
  if (row.rights_status !== "host_pdf" || !row.media_id) {
    return null;
  }

  return getPublishedPublicMediaAssetById(row.media_id);
}

export async function getPublishedPublications(): Promise<PublishedPublicationsResult> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("publications")
    .select(PUBLICATION_SELECT)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error || !data) {
    return { ok: false };
  }

  const hostedFocuses = await loadPublishedFocusLabels();
  const mapped = await Promise.all(
    data.filter(isPubliclyEligible).map(async (row) => {
      const media = await resolvePublicationMedia(row);
      return mapPublication(row, media, hostedFocuses);
    }),
  );

  return {
    ok: true,
    publications: mapped.filter((item): item is PublishedPublication => item !== null),
  };
}

export async function getPublishedPublicationBySlug(
  slug: string,
): Promise<PublishedPublicationResult> {
  if (!SLUG_PATTERN.test(slug) || slug.length > 80) {
    return { ok: true, publication: null };
  }

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("publications")
    .select(PUBLICATION_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    return { ok: false };
  }

  if (!data || !isPubliclyEligible(data)) {
    return { ok: true, publication: null };
  }

  const [media, hostedFocuses] = await Promise.all([
    resolvePublicationMedia(data),
    loadPublishedFocusLabels(),
  ]);
  const mapped = mapPublication(data, media, hostedFocuses);

  if (!mapped) {
    return { ok: true, publication: null };
  }

  return { ok: true, publication: mapped };
}
