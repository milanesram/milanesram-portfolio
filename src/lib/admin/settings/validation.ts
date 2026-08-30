import { readUuid } from "@/lib/admin/ids";

const INTENTS = new Set(["draft", "publish", "unpublish", "archive", "keep"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIMITS = {
  displayName: 120,
  headline: 200,
  summary: 2000,
  workAuthorization: 200,
  locationDisplay: 160,
  linkedinUrl: 500,
  publicEmail: 160,
  heroCtaPrimaryLabel: 80,
} as const;

export type ProfileIntent =
  | "draft"
  | "publish"
  | "unpublish"
  | "archive"
  | "keep";

export type ParsedSiteProfileInput = {
  id: string | null;
  displayName: string;
  headline: string;
  summary: string;
  workAuthorization: string;
  locationDisplay: string | null;
  linkedinUrl: string;
  publicEmail: string;
  heroCtaPrimaryLabel: string | null;
  intent: ProfileIntent;
};

export type ParsedSiteSettingsInput = {
  id: string | null;
  contactFormEnabled: boolean;
  siteIndexable: boolean;
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

function parseIntent(formData: FormData): ParseResult<ProfileIntent> {
  const raw = (readString(formData, "intent") ?? "keep").trim();

  if (!INTENTS.has(raw)) {
    return { ok: false, error: "That save action is not allowed." };
  }

  return { ok: true, value: raw as ProfileIntent };
}

function parseOptionalId(formData: FormData): ParseResult<string | null> {
  const idRaw = readString(formData, "id");
  const id = idRaw && idRaw.length > 0 ? readUuid(idRaw) : null;

  if (idRaw && idRaw.length > 0 && !id) {
    return { ok: false, error: "That record could not be saved." };
  }

  return { ok: true, value: id };
}

export function statusFromIntent(
  intent: ProfileIntent,
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

export function parseHttpsUrl(
  raw: string,
  max: number,
): ParseResult<string> {
  const value = raw.trim();

  if (!value) {
    return { ok: false, error: "URL is required." };
  }

  if (value.length > max) {
    return { ok: false, error: "URL is too long." };
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    return { ok: false, error: "That URL is not valid." };
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, error: "Use an https URL." };
  }

  return { ok: true, value: parsed.href };
}

function parsePublicEmail(formData: FormData): ParseResult<string> {
  const email = requiredText(
    formData,
    "public_email",
    LIMITS.publicEmail,
    "Public email",
  );

  if (!email.ok) {
    return email;
  }

  if (!EMAIL_PATTERN.test(email.value)) {
    return { ok: false, error: "Enter a valid public email address." };
  }

  return email;
}

export function parseSiteProfileFormData(
  formData: FormData,
): ParseResult<ParsedSiteProfileInput> {
  const id = parseOptionalId(formData);
  if (!id.ok) return id;

  const displayName = requiredText(
    formData,
    "display_name",
    LIMITS.displayName,
    "Display name",
  );
  if (!displayName.ok) return displayName;

  const headline = requiredText(
    formData,
    "headline",
    LIMITS.headline,
    "Headline",
  );
  if (!headline.ok) return headline;

  const summary = requiredText(formData, "summary", LIMITS.summary, "Summary");
  if (!summary.ok) return summary;

  const workAuthorization = requiredText(
    formData,
    "work_authorization",
    LIMITS.workAuthorization,
    "Work authorization",
  );
  if (!workAuthorization.ok) return workAuthorization;

  const locationDisplay = optionalText(
    formData,
    "location_display",
    LIMITS.locationDisplay,
    "Location",
  );
  if (!locationDisplay.ok) return locationDisplay;

  const linkedinRaw = requiredText(
    formData,
    "linkedin_url",
    LIMITS.linkedinUrl,
    "LinkedIn URL",
  );
  if (!linkedinRaw.ok) return linkedinRaw;

  const linkedinUrl = parseHttpsUrl(linkedinRaw.value, LIMITS.linkedinUrl);
  if (!linkedinUrl.ok) return linkedinUrl;

  const publicEmail = parsePublicEmail(formData);
  if (!publicEmail.ok) return publicEmail;

  const heroCtaPrimaryLabel = optionalText(
    formData,
    "hero_cta_primary_label",
    LIMITS.heroCtaPrimaryLabel,
    "Primary call-to-action label",
  );
  if (!heroCtaPrimaryLabel.ok) return heroCtaPrimaryLabel;

  const intent = parseIntent(formData);
  if (!intent.ok) return intent;

  return {
    ok: true,
    value: {
      id: id.value,
      displayName: displayName.value,
      headline: headline.value,
      summary: summary.value,
      workAuthorization: workAuthorization.value,
      locationDisplay: locationDisplay.value,
      linkedinUrl: linkedinUrl.value,
      publicEmail: publicEmail.value,
      heroCtaPrimaryLabel: heroCtaPrimaryLabel.value,
      intent: intent.value,
    },
  };
}

export function parseSiteSettingsFormData(
  formData: FormData,
): ParseResult<ParsedSiteSettingsInput> {
  const id = parseOptionalId(formData);
  if (!id.ok) return id;

  return {
    ok: true,
    value: {
      id: id.value,
      contactFormEnabled: formData.get("contact_form_enabled") === "on",
      siteIndexable: formData.get("site_indexable") === "on",
    },
  };
}
