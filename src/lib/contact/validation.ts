import type { InquiryContext, InquiryTrack } from "@/lib/supabase/database.types";

const CONTEXTS = new Set<InquiryContext>([
  "recruiter",
  "hiring_manager",
  "other",
]);

const TRACKS = new Set<InquiryTrack>(["cybersecurity_grc", "privacy_ai", "either"]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HASH_PATTERN = /^[a-f0-9]{64}$/;

export const CONTACT_LIMITS = {
  name: 120,
  email: 254,
  organization: 160,
  messageMin: 10,
  messageMax: 5000,
  bodyMax: 12_288,
} as const;

export type PublicInquiryInput = {
  name: string;
  email: string;
  organization: string | null;
  context: InquiryContext;
  track: InquiryTrack;
  message: string;
};

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function requiredText(
  raw: string | null,
  min: number,
  max: number,
): ParseResult<string> {
  if (raw == null) {
    return { ok: false, error: "invalid" };
  }

  const value = raw.trim();

  if (value.length < min || value.length > max) {
    return { ok: false, error: "invalid" };
  }

  return { ok: true, value };
}

export function parsePublicInquiryFields(
  body: Record<string, unknown>,
): ParseResult<PublicInquiryInput> {
  const name = requiredText(asString(body.name), 1, CONTACT_LIMITS.name);
  if (!name.ok) return name;

  const emailRaw = requiredText(asString(body.email), 1, CONTACT_LIMITS.email);
  if (!emailRaw.ok) return emailRaw;

  const email = emailRaw.value.toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "invalid" };
  }

  const organizationRaw = asString(body.organization);
  let organization: string | null = null;

  if (organizationRaw != null && organizationRaw.trim() !== "") {
    const organizationText = requiredText(
      organizationRaw,
      1,
      CONTACT_LIMITS.organization,
    );
    if (!organizationText.ok) return organizationText;
    organization = organizationText.value;
  }

  const contextRaw = asString(body.context);
  if (contextRaw == null || !CONTEXTS.has(contextRaw as InquiryContext)) {
    return { ok: false, error: "invalid" };
  }

  const trackRaw = asString(body.track);
  if (trackRaw == null || !TRACKS.has(trackRaw as InquiryTrack)) {
    return { ok: false, error: "invalid" };
  }

  const message = requiredText(
    asString(body.message),
    CONTACT_LIMITS.messageMin,
    CONTACT_LIMITS.messageMax,
  );
  if (!message.ok) return message;

  return {
    ok: true,
    value: {
      name: name.value,
      email,
      organization,
      context: contextRaw as InquiryContext,
      track: trackRaw as InquiryTrack,
      message: message.value,
    },
  };
}

export function isSha256Hex(value: string): boolean {
  return HASH_PATTERN.test(value);
}

export function isHoneypotEmpty(value: unknown): boolean {
  return value == null || value === "";
}
