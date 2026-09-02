import type { ContentStatus } from "@/lib/supabase/database.types";

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export const CREDENTIAL_FIELD_LIMITS = {
  name: 200,
  issuer: 160,
  yearLabel: 40,
  details: 2000,
  verificationUrl: 500,
  sortOrder: { min: 0, max: 9999 },
} as const;

/**
 * Optional public verification URL.
 * HTTPS only. Blank/null is allowed. HTTP, javascript:, data:,
 * protocol-relative, and malformed URLs are rejected.
 */
export function parseOptionalHttpsUrl(
  raw: string | null,
  label: string,
  max = CREDENTIAL_FIELD_LIMITS.verificationUrl,
): ParseResult<string | null> {
  if (raw == null || raw.trim() === "") {
    return { ok: true, value: null };
  }

  const value = raw.trim();

  if (value.length > max) {
    return { ok: false, error: `${label} is too long.` };
  }

  const lower = value.toLowerCase();

  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    value.startsWith("//") ||
    lower.startsWith("http://")
  ) {
    return { ok: false, error: `${label} must be an https URL.` };
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    return { ok: false, error: `${label} is not a valid URL.` };
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, error: `${label} must be an https URL.` };
  }

  return { ok: true, value };
}

export function parseOptionalDate(
  raw: string | null,
  label: string,
): ParseResult<string | null> {
  if (raw == null || raw.trim() === "") {
    return { ok: true, value: null };
  }

  const value = raw.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { ok: false, error: `${label} must be a valid date.` };
  }

  const [year, month, day] = value.split("-").map((part) => Number(part));
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return { ok: false, error: `${label} must be a valid date.` };
  }

  return { ok: true, value };
}

export function isPubliclyEligibleCredential(row: {
  status: ContentStatus;
  needs_verification: boolean;
}): boolean {
  return row.status === "published" && row.needs_verification === false;
}

export function credentialEligibilityLabel(row: {
  status: ContentStatus;
  needs_verification: boolean;
}): string {
  if (isPubliclyEligibleCredential(row)) {
    return "Publicly eligible";
  }

  if (row.needs_verification) {
    return row.status === "draft" ? "Held · draft" : "Held";
  }

  if (row.status === "archived") {
    return "Archived · not public";
  }

  return "Draft · not public";
}
