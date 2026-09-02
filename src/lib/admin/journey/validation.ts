import { readUuid } from "@/lib/admin/ids";
import {
  statusFromIntent,
  type ProfileIntent,
} from "@/lib/admin/settings/validation";

const INTENTS = new Set(["draft", "publish", "unpublish", "archive", "keep"]);

const LIMITS = {
  title: 160,
  caption: 500,
} as const;

export type JourneyIntent = ProfileIntent;

export type ParsedJourneyMilestoneInput = {
  id: string | null;
  title: string;
  year: number | null;
  caption: string;
  mediaAssetId: string | null;
  sortOrder: number;
  intent: JourneyIntent;
};

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function readString(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" ? value : null;
}

export { statusFromIntent };

export function parseJourneyYear(raw: string): ParseResult<number | null> {
  const value = raw.trim();

  if (!value) {
    return { ok: true, value: null };
  }

  if (!/^\d{4}$/.test(value)) {
    return { ok: false, error: "Year must be a four-digit year or blank." };
  }

  const year = Number(value);

  if (year < 1900 || year > 2100) {
    return { ok: false, error: "Year is out of range." };
  }

  return { ok: true, value: year };
}

export function parseJourneyMilestoneFormData(
  formData: FormData,
): ParseResult<ParsedJourneyMilestoneInput> {
  const rawId = readString(formData, "id");
  const id = rawId && rawId.length > 0 ? readUuid(rawId) : null;

  if (rawId && rawId.length > 0 && !id) {
    return { ok: false, error: "That record could not be saved." };
  }

  const title = readString(formData, "title")?.trim() ?? "";
  const caption = readString(formData, "caption")?.trim() ?? "";

  if (!title) {
    return { ok: false, error: "Title is required." };
  }

  if (title.length > LIMITS.title) {
    return { ok: false, error: "Title is too long." };
  }

  if (!caption) {
    return { ok: false, error: "Caption is required." };
  }

  if (caption.length > LIMITS.caption) {
    return { ok: false, error: "Caption is too long." };
  }

  const year = parseJourneyYear(readString(formData, "year") ?? "");
  if (!year.ok) return year;

  const rawMedia = readString(formData, "media_asset_id")?.trim() ?? "";
  const mediaAssetId = rawMedia ? readUuid(rawMedia) : null;

  if (rawMedia && !mediaAssetId) {
    return { ok: false, error: "A media selection is not valid." };
  }

  const sortRaw = (readString(formData, "sort_order") ?? "").trim();

  if (!/^-?\d+$/.test(sortRaw)) {
    return { ok: false, error: "Sort order must be a whole number." };
  }

  const sortOrder = Number(sortRaw);

  if (sortOrder < 0 || sortOrder > 10000) {
    return { ok: false, error: "Sort order is out of range." };
  }

  const intentRaw = (readString(formData, "intent") ?? "keep").trim();

  if (!INTENTS.has(intentRaw)) {
    return { ok: false, error: "That save action is not allowed." };
  }

  return {
    ok: true,
    value: {
      id,
      title,
      year: year.value,
      caption,
      mediaAssetId,
      sortOrder,
      intent: intentRaw as JourneyIntent,
    },
  };
}
