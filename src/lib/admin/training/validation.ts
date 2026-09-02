import type { TrackTag } from "@/lib/supabase/database.types";
import { readUuid } from "@/lib/admin/ids";
import {
  parseOptionalDate,
  parseOptionalHttpsUrl,
} from "@/lib/admin/credentials/fields";

const TRACKS = new Set<TrackTag>(["all", "cybersecurity_grc", "privacy_ai"]);
const INTENTS = new Set(["draft", "publish", "unpublish", "archive", "keep"]);

const LIMITS = {
  name: 200,
  issuer: 160,
  yearLabel: 40,
  details: 2000,
  sortOrder: { min: 0, max: 9999 },
} as const;

export type TrainingIntent =
  | "draft"
  | "publish"
  | "unpublish"
  | "archive"
  | "keep";

export type ParsedTrainingInput = {
  id: string | null;
  name: string;
  issuer: string;
  yearLabel: string | null;
  details: string | null;
  needsVerification: boolean;
  track: TrackTag;
  highlight: boolean;
  sortOrder: number;
  verificationUrl: string | null;
  expiresOn: string | null;
  intent: TrainingIntent;
};

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

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

  if (raw == null) {
    return { ok: false, error: `${label} is required.` };
  }

  const value = raw.trim();

  if (!value) {
    return { ok: false, error: `${label} is required.` };
  }

  if (value.length > max) {
    return { ok: false, error: `${label} is too long.` };
  }

  return { ok: true, value };
}

function optionalText(
  formData: FormData,
  name: string,
  max: number,
  label: string,
): ParseResult<string | null> {
  const raw = readString(formData, name);

  if (raw == null || raw.trim() === "") {
    return { ok: true, value: null };
  }

  const value = raw.trim();

  if (value.length > max) {
    return { ok: false, error: `${label} is too long.` };
  }

  return { ok: true, value };
}

function parseSortOrder(formData: FormData): ParseResult<number> {
  const raw = readString(formData, "sort_order") ?? "0";
  const value = Number.parseInt(raw, 10);

  if (!Number.isInteger(value)) {
    return { ok: false, error: "Sort order must be a whole number." };
  }

  if (value < LIMITS.sortOrder.min || value > LIMITS.sortOrder.max) {
    return { ok: false, error: "Sort order is out of range." };
  }

  return { ok: true, value };
}

function parseIntent(formData: FormData): ParseResult<TrainingIntent> {
  const raw = (readString(formData, "intent") ?? "keep").trim();

  if (!INTENTS.has(raw)) {
    return { ok: false, error: "That save action is not allowed." };
  }

  return { ok: true, value: raw as TrainingIntent };
}

export function statusFromIntent(
  intent: TrainingIntent,
  current: "draft" | "published" | "archived" | null,
): "draft" | "published" | "archived" {
  if (intent === "publish") {
    return "published";
  }

  if (intent === "unpublish" || intent === "draft") {
    return "draft";
  }

  if (intent === "archive") {
    return "archived";
  }

  return current ?? "draft";
}

export function parseTrainingFormData(
  formData: FormData,
): ParseResult<ParsedTrainingInput> {
  const idRaw = readString(formData, "id");
  const id = idRaw && idRaw.length > 0 ? readUuid(idRaw) : null;

  if (idRaw && idRaw.length > 0 && !id) {
    return { ok: false, error: "That training record could not be saved." };
  }

  const name = requiredText(formData, "name", LIMITS.name, "Name");
  if (!name.ok) return name;

  const issuer = requiredText(formData, "issuer", LIMITS.issuer, "Issuer");
  if (!issuer.ok) return issuer;

  const yearLabel = optionalText(
    formData,
    "year_label",
    LIMITS.yearLabel,
    "Year label",
  );
  if (!yearLabel.ok) return yearLabel;

  const details = optionalText(formData, "details", LIMITS.details, "Details");
  if (!details.ok) return details;

  const verificationUrl = parseOptionalHttpsUrl(
    readString(formData, "verification_url"),
    "Verification URL",
  );
  if (!verificationUrl.ok) return verificationUrl;

  const expiresOn = parseOptionalDate(
    readString(formData, "expires_on"),
    "Expiration date",
  );
  if (!expiresOn.ok) return expiresOn;

  const trackRaw = (readString(formData, "track") ?? "all").trim();

  if (!TRACKS.has(trackRaw as TrackTag)) {
    return { ok: false, error: "Choose a valid career track." };
  }

  const sortOrder = parseSortOrder(formData);
  if (!sortOrder.ok) return sortOrder;

  const intent = parseIntent(formData);
  if (!intent.ok) return intent;

  return {
    ok: true,
    value: {
      id,
      name: name.value,
      issuer: issuer.value,
      yearLabel: yearLabel.value,
      details: details.value,
      needsVerification: readString(formData, "needs_verification") === "on",
      track: trackRaw as TrackTag,
      highlight: readString(formData, "highlight") === "on",
      sortOrder: sortOrder.value,
      verificationUrl: verificationUrl.value,
      expiresOn: expiresOn.value,
      intent: intent.value,
    },
  };
}
