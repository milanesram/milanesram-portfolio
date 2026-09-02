import type { CredentialKind, TrackTag } from "@/lib/supabase/database.types";
import { readUuid } from "@/lib/admin/ids";
import {
  CREDENTIAL_FIELD_LIMITS,
  parseOptionalDate,
  parseOptionalHttpsUrl,
  type ParseResult,
} from "@/lib/admin/credentials/fields";
import {
  statusFromIntent,
  type ProfileIntent,
} from "@/lib/admin/settings/validation";

const TRACKS = new Set<TrackTag>(["all", "cybersecurity_grc", "privacy_ai"]);
const KINDS = new Set<CredentialKind>([
  "degree",
  "certification",
  "training",
  "license",
]);
const INTENTS = new Set(["draft", "publish", "unpublish", "archive", "keep"]);

const PAGE_LIMITS = {
  kicker: 40,
  headline: 200,
  lede: 2000,
} as const;

export type CredentialIntent = ProfileIntent;

export type ParsedCredentialInput = {
  id: string | null;
  kind: CredentialKind;
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
  intent: CredentialIntent;
};

export type ParsedCredentialsPageInput = {
  id: string | null;
  kicker: string;
  headline: string;
  lede: string;
  intent: CredentialIntent;
};

export type { ParseResult };

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

  if (
    value < CREDENTIAL_FIELD_LIMITS.sortOrder.min ||
    value > CREDENTIAL_FIELD_LIMITS.sortOrder.max
  ) {
    return { ok: false, error: "Sort order is out of range." };
  }

  return { ok: true, value };
}

function parseIntent(formData: FormData): ParseResult<CredentialIntent> {
  const raw = (readString(formData, "intent") ?? "keep").trim();

  if (!INTENTS.has(raw)) {
    return { ok: false, error: "That save action is not allowed." };
  }

  return { ok: true, value: raw as CredentialIntent };
}

export { statusFromIntent };

export function parseCredentialFormData(
  formData: FormData,
): ParseResult<ParsedCredentialInput> {
  const idRaw = readString(formData, "id");
  const id = idRaw && idRaw.length > 0 ? readUuid(idRaw) : null;

  if (idRaw && idRaw.length > 0 && !id) {
    return { ok: false, error: "That credential could not be saved." };
  }

  const kindRaw = (readString(formData, "kind") ?? "").trim();

  if (!KINDS.has(kindRaw as CredentialKind)) {
    return { ok: false, error: "Choose a valid credential kind." };
  }

  const name = requiredText(
    formData,
    "name",
    CREDENTIAL_FIELD_LIMITS.name,
    "Name",
  );
  if (!name.ok) return name;

  const issuer = requiredText(
    formData,
    "issuer",
    CREDENTIAL_FIELD_LIMITS.issuer,
    "Issuer",
  );
  if (!issuer.ok) return issuer;

  const yearLabel = optionalText(
    formData,
    "year_label",
    CREDENTIAL_FIELD_LIMITS.yearLabel,
    "Year label",
  );
  if (!yearLabel.ok) return yearLabel;

  const details = optionalText(
    formData,
    "details",
    CREDENTIAL_FIELD_LIMITS.details,
    "Details",
  );
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
      kind: kindRaw as CredentialKind,
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

export function parseCredentialsPageFormData(
  formData: FormData,
): ParseResult<ParsedCredentialsPageInput> {
  const rawId = readString(formData, "id");
  const id = rawId && rawId.length > 0 ? readUuid(rawId) : null;

  if (rawId && rawId.length > 0 && !id) {
    return { ok: false, error: "That record could not be saved." };
  }

  const kicker = requiredText(formData, "kicker", PAGE_LIMITS.kicker, "Kicker");
  if (!kicker.ok) return kicker;

  const headline = requiredText(
    formData,
    "headline",
    PAGE_LIMITS.headline,
    "Headline",
  );
  if (!headline.ok) return headline;

  const lede = requiredText(formData, "lede", PAGE_LIMITS.lede, "Lede");
  if (!lede.ok) return lede;

  const intent = parseIntent(formData);
  if (!intent.ok) return intent;

  return {
    ok: true,
    value: {
      id,
      kicker: kicker.value,
      headline: headline.value,
      lede: lede.value,
      intent: intent.value,
    },
  };
}
