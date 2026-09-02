import type { ResumeDeliveryMode } from "@/lib/supabase/database.types";
import { readUuid } from "@/lib/admin/ids";
import {
  statusFromIntent,
  type ProfileIntent,
} from "@/lib/admin/settings/validation";

const MODES = new Set<ResumeDeliveryMode>(["request", "public_file"]);
const INTENTS = new Set(["draft", "publish", "unpublish", "archive", "keep"]);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const LIMITS = {
  kicker: 80,
  headline: 200,
  lede: 2000,
  request: 400,
  closingHeading: 200,
  cta: 80,
  homeKicker: 40,
  slug: 80,
  title: 160,
  summary: 2000,
  sortOrder: { min: 0, max: 9999 },
} as const;

export type ResumeIntent = ProfileIntent;
export { statusFromIntent };

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export type ParsedResumePageInput = {
  id: string | null;
  kicker: string;
  headline: string;
  lede: string;
  requestIntro: string;
  requestFootnote: string;
  closingHeading: string;
  closingLede: string;
  intent: ResumeIntent;
};

export type ParsedResumeTrackInput = {
  id: string | null;
  slug: string;
  focusPageId: string | null;
  title: string;
  summary: string;
  deliveryMode: ResumeDeliveryMode;
  mediaAssetId: string | null;
  requestCtaLabel: string;
  homeKicker: string | null;
  sortOrder: number;
  intent: ResumeIntent;
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
  const raw = readString(formData, name);
  const value = raw?.trim() ?? "";

  if (!value) {
    return { ok: false, error: `${label} is required.` };
  }

  if (value.length > max) {
    return { ok: false, error: `${label} must be ${max} characters or fewer.` };
  }

  return { ok: true, value };
}

function parseIntent(formData: FormData): ParseResult<ResumeIntent> {
  const intent = (readString(formData, "intent") ?? "keep").trim();

  if (!INTENTS.has(intent)) {
    return { ok: false, error: "That action is not valid." };
  }

  return { ok: true, value: intent as ResumeIntent };
}

export function parseResumePageFormData(
  formData: FormData,
): ParseResult<ParsedResumePageInput> {
  const idRaw = readString(formData, "id");
  const id = idRaw && idRaw.length > 0 ? readUuid(idRaw) : null;

  if (idRaw && idRaw.length > 0 && !id) {
    return { ok: false, error: "The Resume page could not be saved." };
  }

  const kicker = requiredText(formData, "kicker", LIMITS.kicker, "Kicker");
  if (!kicker.ok) return kicker;
  const headline = requiredText(formData, "headline", LIMITS.headline, "Headline");
  if (!headline.ok) return headline;
  const lede = requiredText(formData, "lede", LIMITS.lede, "Lede");
  if (!lede.ok) return lede;
  const requestIntro = requiredText(
    formData,
    "request_intro",
    LIMITS.request,
    "Request intro",
  );
  if (!requestIntro.ok) return requestIntro;
  const requestFootnote = requiredText(
    formData,
    "request_footnote",
    LIMITS.request,
    "Request footnote",
  );
  if (!requestFootnote.ok) return requestFootnote;
  const closingHeading = requiredText(
    formData,
    "closing_heading",
    LIMITS.closingHeading,
    "Closing heading",
  );
  if (!closingHeading.ok) return closingHeading;
  const closingLede = requiredText(
    formData,
    "closing_lede",
    LIMITS.lede,
    "Closing lede",
  );
  if (!closingLede.ok) return closingLede;
  const intent = parseIntent(formData);
  if (!intent.ok) return intent;

  return {
    ok: true,
    value: {
      id,
      kicker: kicker.value,
      headline: headline.value,
      lede: lede.value,
      requestIntro: requestIntro.value,
      requestFootnote: requestFootnote.value,
      closingHeading: closingHeading.value,
      closingLede: closingLede.value,
      intent: intent.value,
    },
  };
}

export function parseResumeTrackFormData(
  formData: FormData,
): ParseResult<ParsedResumeTrackInput> {
  const idRaw = readString(formData, "id");
  const id = idRaw && idRaw.length > 0 ? readUuid(idRaw) : null;

  if (idRaw && idRaw.length > 0 && !id) {
    return { ok: false, error: "That Resume track could not be saved." };
  }

  const slug = requiredText(formData, "slug", LIMITS.slug, "Slug");
  if (!slug.ok) return slug;

  if (!SLUG_PATTERN.test(slug.value)) {
    return { ok: false, error: "Use a lowercase hyphenated slug." };
  }

  const title = requiredText(formData, "title", LIMITS.title, "Title");
  if (!title.ok) return title;
  const summary = requiredText(formData, "summary", LIMITS.summary, "Summary");
  if (!summary.ok) return summary;
  const requestCtaLabel = requiredText(
    formData,
    "request_cta_label",
    LIMITS.cta,
    "CTA label",
  );
  if (!requestCtaLabel.ok) return requestCtaLabel;

  const homeKickerRaw = readString(formData, "home_kicker")?.trim() ?? "";
  if (homeKickerRaw.length > LIMITS.homeKicker) {
    return {
      ok: false,
      error: `Home kicker must be ${LIMITS.homeKicker} characters or fewer.`,
    };
  }

  const modeRaw = (readString(formData, "delivery_mode") ?? "request").trim();
  if (!MODES.has(modeRaw as ResumeDeliveryMode)) {
    return { ok: false, error: "Choose a valid delivery mode." };
  }

  const deliveryMode = modeRaw as ResumeDeliveryMode;
  const focusRaw = readString(formData, "focus_page_id")?.trim() ?? "";
  const focusPageId = focusRaw ? readUuid(focusRaw) : null;

  if (focusRaw && !focusPageId) {
    return { ok: false, error: "Choose a valid Focus page." };
  }

  const mediaRaw = readString(formData, "media_asset_id")?.trim() ?? "";
  const mediaAssetId = mediaRaw ? readUuid(mediaRaw) : null;

  if (mediaRaw && !mediaAssetId) {
    return { ok: false, error: "Choose a valid resume file." };
  }

  if (deliveryMode === "public_file" && !mediaAssetId) {
    return {
      ok: false,
      error: "Public-file delivery requires an eligible resume PDF.",
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

  const intent = parseIntent(formData);
  if (!intent.ok) return intent;

  return {
    ok: true,
    value: {
      id,
      slug: slug.value,
      focusPageId,
      title: title.value,
      summary: summary.value,
      deliveryMode,
      mediaAssetId,
      requestCtaLabel: requestCtaLabel.value,
      homeKicker: homeKickerRaw || null,
      sortOrder: sortRaw,
      intent: intent.value,
    },
  };
}
