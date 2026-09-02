import type {
  ContentStatus,
  DocumentKind,
  PublicationRightsStatus,
  TrackTag,
} from "@/lib/supabase/database.types";
import { readUuid } from "@/lib/admin/ids";
import {
  statusFromIntent,
  type ProfileIntent,
} from "@/lib/admin/settings/validation";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const INTENTS = new Set(["draft", "publish", "unpublish", "archive", "keep"]);
const KINDS = new Set<DocumentKind>([
  "publication",
  "white_paper",
  "editorial",
  "feature",
  "four_minute_read",
  "other",
]);
const RIGHTS = new Set<PublicationRightsStatus>([
  "host_pdf",
  "link_only",
  "review_required",
]);
const TRACKS = new Set<TrackTag>(["all", "cybersecurity_grc", "privacy_ai"]);

const LIMITS = {
  slug: 80,
  title: 200,
  publisher: 160,
  yearLabel: 32,
  abstract: 4000,
  author: 160,
  url: 500,
  sortOrder: { min: 0, max: 9999 },
} as const;

export type WritingIntent = ProfileIntent;
export { statusFromIntent };

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export type ParsedPublicationInput = {
  id: string | null;
  slug: string;
  title: string;
  documentKind: DocumentKind;
  rightsStatus: PublicationRightsStatus;
  author: string | null;
  publisher: string;
  publishedOn: string | null;
  yearLabel: string;
  abstract: string;
  externalUrl: string | null;
  track: TrackTag;
  mediaId: string | null;
  sortOrder: number;
  confirmReplaceFile: boolean;
  intent: WritingIntent;
};

function readString(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" ? value : null;
}

function requiredText(
  formData: FormData,
  name: string,
  max: number,
  label: string,
): ParseResult<string> {
  const value = readString(formData, name)?.trim() ?? "";

  if (!value) {
    return { ok: false, error: `${label} is required.` };
  }

  if (value.length > max) {
    return { ok: false, error: `${label} must be ${max} characters or fewer.` };
  }

  return { ok: true, value };
}

function optionalText(
  formData: FormData,
  name: string,
  max: number,
  label: string,
): ParseResult<string | null> {
  const value = readString(formData, name)?.trim() ?? "";

  if (!value) {
    return { ok: true, value: null };
  }

  if (value.length > max) {
    return { ok: false, error: `${label} must be ${max} characters or fewer.` };
  }

  return { ok: true, value };
}

function parseHttpsUrl(value: string | null): ParseResult<string | null> {
  if (!value) {
    return { ok: true, value: null };
  }

  try {
    const parsed = new URL(value);

    if (parsed.protocol !== "https:") {
      return { ok: false, error: "External URL must use HTTPS." };
    }

    return { ok: true, value };
  } catch {
    return { ok: false, error: "Enter a valid HTTPS URL." };
  }
}

export function parsePublicationFormData(
  formData: FormData,
): ParseResult<ParsedPublicationInput> {
  const idRaw = readString(formData, "id");
  const id = idRaw && idRaw.length > 0 ? readUuid(idRaw) : null;

  if (idRaw && idRaw.length > 0 && !id) {
    return { ok: false, error: "That publication could not be saved." };
  }

  const slug = requiredText(formData, "slug", LIMITS.slug, "Slug");
  if (!slug.ok) return slug;

  if (!SLUG_PATTERN.test(slug.value)) {
    return { ok: false, error: "Use a lowercase hyphenated slug." };
  }

  const title = requiredText(formData, "title", LIMITS.title, "Title");
  if (!title.ok) return title;
  const publisher = requiredText(
    formData,
    "publisher",
    LIMITS.publisher,
    "Publisher",
  );
  if (!publisher.ok) return publisher;
  const yearLabel = requiredText(
    formData,
    "year_label",
    LIMITS.yearLabel,
    "Year label",
  );
  if (!yearLabel.ok) return yearLabel;
  const abstract = requiredText(
    formData,
    "abstract",
    LIMITS.abstract,
    "Summary",
  );
  if (!abstract.ok) return abstract;

  const author = optionalText(formData, "author", LIMITS.author, "Author");
  if (!author.ok) return author;

  const kindRaw = (readString(formData, "document_kind") ?? "").trim();
  if (!KINDS.has(kindRaw as DocumentKind)) {
    return { ok: false, error: "Choose a valid publication type." };
  }

  const rightsRaw = (readString(formData, "rights_status") ?? "").trim();
  if (!RIGHTS.has(rightsRaw as PublicationRightsStatus)) {
    return { ok: false, error: "Choose a valid delivery mode." };
  }

  const trackRaw = (readString(formData, "track") ?? "all").trim();
  if (!TRACKS.has(trackRaw as TrackTag)) {
    return { ok: false, error: "Choose a valid track." };
  }

  const publishedOnRaw = readString(formData, "published_on")?.trim() ?? "";
  const publishedOn = publishedOnRaw === "" ? null : publishedOnRaw;

  if (publishedOn && !/^\d{4}-\d{2}-\d{2}$/.test(publishedOn)) {
    return { ok: false, error: "Use a valid published date." };
  }

  const mediaRaw = readString(formData, "media_id")?.trim() ?? "";
  const mediaId = mediaRaw ? readUuid(mediaRaw) : null;

  if (mediaRaw && !mediaId) {
    return { ok: false, error: "Choose a valid PDF." };
  }

  const external = parseHttpsUrl(
    readString(formData, "external_url")?.trim() || null,
  );
  if (!external.ok) return external;

  const rightsStatus = rightsRaw as PublicationRightsStatus;

  if (rightsStatus === "link_only") {
    if (!external.value) {
      return {
        ok: false,
        error: "Link-only publications require an HTTPS URL.",
      };
    }

    if (mediaId) {
      return {
        ok: false,
        error: "Link-only publications cannot attach a local PDF.",
      };
    }
  }

  if (rightsStatus === "host_pdf" && external.value) {
    return {
      ok: false,
      error: "Hosted PDFs should not use an external URL as the delivery source.",
    };
  }

  const sortRaw = Number.parseInt(readString(formData, "sort_order") ?? "", 10);
  if (
    Number.isNaN(sortRaw) ||
    sortRaw < LIMITS.sortOrder.min ||
    sortRaw > LIMITS.sortOrder.max
  ) {
    return { ok: false, error: "Sort order must be between 0 and 9999." };
  }

  const intentRaw = (readString(formData, "intent") ?? "keep").trim();
  if (!INTENTS.has(intentRaw)) {
    return { ok: false, error: "That action is not valid." };
  }

  return {
    ok: true,
    value: {
      id,
      slug: slug.value,
      title: title.value,
      documentKind: kindRaw as DocumentKind,
      rightsStatus,
      author: author.value,
      publisher: publisher.value,
      publishedOn,
      yearLabel: yearLabel.value,
      abstract: abstract.value,
      externalUrl: rightsStatus === "link_only" ? external.value : null,
      track: trackRaw as TrackTag,
      mediaId: rightsStatus === "host_pdf" ? mediaId : null,
      sortOrder: sortRaw,
      confirmReplaceFile: formData.get("confirm_replace_file") === "on",
      intent: intentRaw as WritingIntent,
    },
  };
}

export function assertPublicationPublishReady(
  input: ParsedPublicationInput,
): ParseResult<true> {
  if (input.intent !== "publish") {
    return { ok: true, value: true };
  }

  if (input.rightsStatus === "host_pdf" && !input.mediaId) {
    return {
      ok: false,
      error: "Publishing a hosted PDF requires a publication file.",
    };
  }

  if (input.rightsStatus === "link_only" && !input.externalUrl) {
    return {
      ok: false,
      error: "Publishing a link-only work requires an HTTPS URL.",
    };
  }

  return { ok: true, value: true };
}

export function assertImmutablePublishedSlug(args: {
  currentStatus: ContentStatus | null;
  currentSlug: string | null;
  nextSlug: string;
}): ParseResult<true> {
  if (args.currentStatus === "published" && args.currentSlug && args.nextSlug !== args.currentSlug) {
    return {
      ok: false,
      error: "Published slugs cannot be changed because they are public URLs.",
    };
  }

  return { ok: true, value: true };
}

export function assertDeliberateFileChange(args: {
  currentStatus: ContentStatus | null;
  currentRights: PublicationRightsStatus | null;
  currentMediaId: string | null;
  nextMediaId: string | null;
  confirmReplaceFile: boolean;
}): ParseResult<true> {
  if (
    args.currentStatus === "published" &&
    args.currentRights === "host_pdf" &&
    args.currentMediaId &&
    args.nextMediaId &&
    args.currentMediaId !== args.nextMediaId &&
    !args.confirmReplaceFile
  ) {
    return {
      ok: false,
      error:
        "Confirm replacing the publication file. This does not rewrite the existing PDF.",
    };
  }

  return { ok: true, value: true };
}
