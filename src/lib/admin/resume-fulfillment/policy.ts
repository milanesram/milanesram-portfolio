import type { ResumeRequestChoice } from "@/lib/supabase/database.types";

export const PRIVATE_RESUME_BUCKET = "private-resumes";

export const SIGNED_LINK_TTL_SECONDS = 15 * 60;

export const SIGNED_LINK_TTL_MAX_SECONDS = 30 * 60;

export const RESUME_REQUEST_RETENTION_DAYS = 90;

export const FULFILLMENT_DOCUMENT_KEYS = [
  "grc_it_risk",
  "privacy_compliance",
  "professional_cv",
] as const;

export type FulfillmentDocumentKey = (typeof FULFILLMENT_DOCUMENT_KEYS)[number];

export const FULFILLMENT_DOCUMENT_LABELS: Record<FulfillmentDocumentKey, string> =
  {
    grc_it_risk: "GRC, IT Risk & Security Compliance",
    privacy_compliance: "Privacy, Compliance & Assurance",
    professional_cv: "Comprehensive Professional CV",
  };

export const FULFILLMENT_DOWNLOAD_FILENAMES: Record<
  FulfillmentDocumentKey,
  string
> = {
  grc_it_risk: "ramilanes_resume_grc_it_risk_v4.pdf",
  privacy_compliance: "ramilanes_resume_privacy_compliance_v4.pdf",
  professional_cv: "ramilanes_professional_cv_v2.pdf",
};

export const CV_UNVERIFIED_MESSAGE =
  "CV asset not yet verified for fulfillment.";

export const CV_UNVERIFIED_DETAIL =
  "No verified private CV asset is available yet.";

export const RETENTION_NOTICE =
  "Closed requests are retained for 90 days and then become eligible for deletion.";

const FULFILLMENT_KEY_SET = new Set<string>(FULFILLMENT_DOCUMENT_KEYS);

export type PrivateAssetState = {
  active: boolean;
};

export type ResumeRequestLifecycle = {
  status: "new" | "reviewed" | "closed";
  reviewedAt: string | null;
  closedAt: string | null;
};

export function isFulfillmentDocumentKey(
  value: string,
): value is FulfillmentDocumentKey {
  return FULFILLMENT_KEY_SET.has(value);
}

export function defaultFulfillmentDocument(
  choice: ResumeRequestChoice,
): FulfillmentDocumentKey | null {
  if (choice === "not_sure") {
    return null;
  }

  return choice;
}

export function resolveFulfillmentDocument(
  choice: ResumeRequestChoice,
  selected: string | null,
):
  | { ok: true; document: FulfillmentDocumentKey }
  | { ok: false; error: string } {
  const trimmed = selected?.trim() ?? "";

  if (choice === "not_sure") {
    if (!trimmed || !isFulfillmentDocumentKey(trimmed)) {
      return { ok: false, error: "Choose the document to provide." };
    }

    return { ok: true, document: trimmed };
  }

  if (!trimmed) {
    return { ok: true, document: choice };
  }

  if (!isFulfillmentDocumentKey(trimmed)) {
    return { ok: false, error: "Choose a valid document." };
  }

  return { ok: true, document: trimmed };
}

export function fulfillmentAssetError(
  document: FulfillmentDocumentKey,
  assets: Partial<Record<FulfillmentDocumentKey, PrivateAssetState | null>>,
): string | null {
  if (assets[document]?.active) {
    return null;
  }

  if (document === "professional_cv") {
    return CV_UNVERIFIED_MESSAGE;
  }

  return "That document is not available.";
}

export function signedLinkExpiresAt(now: Date, ttlSeconds = SIGNED_LINK_TTL_SECONDS) {
  if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
    throw new Error("Invalid signed-link lifetime.");
  }

  if (ttlSeconds > SIGNED_LINK_TTL_MAX_SECONDS) {
    throw new Error("Invalid signed-link lifetime.");
  }

  return new Date(now.getTime() + ttlSeconds * 1000);
}

export function fulfillmentAuditFields(
  document: FulfillmentDocumentKey,
  userId: string,
  now: Date,
) {
  return {
    fulfilled_document: document,
    fulfilled_at: now.toISOString(),
    fulfilled_by: userId,
  };
}

export function availabilityLabel(
  document: FulfillmentDocumentKey,
  available: boolean,
): string {
  if (document === "grc_it_risk") {
    return available
      ? "GRC, IT Risk & Security Compliance — Available"
      : "GRC, IT Risk & Security Compliance — Not available";
  }

  if (document === "privacy_compliance") {
    return available
      ? "Privacy, Compliance & Assurance — Available"
      : "Privacy, Compliance & Assurance — Not available";
  }

  return available
    ? "Professional CV — Available"
    : "Professional CV — Not yet verified";
}

export function isExpiredClosedRequest(
  request: { status: string; closedAt: string | null },
  now: Date,
): boolean {
  if (request.status !== "closed" || !request.closedAt) {
    return false;
  }

  const closedAt = new Date(request.closedAt).getTime();

  if (Number.isNaN(closedAt)) {
    return false;
  }

  const cutoff =
    now.getTime() - RESUME_REQUEST_RETENTION_DAYS * 24 * 60 * 60 * 1000;

  return closedAt < cutoff;
}

export function applyResumeRequestLifecycle(
  current: ResumeRequestLifecycle,
  nextStatus: ResumeRequestLifecycle["status"],
  now: Date,
): ResumeRequestLifecycle {
  const next: ResumeRequestLifecycle = {
    status: nextStatus,
    reviewedAt: current.reviewedAt,
    closedAt: current.closedAt,
  };

  if (nextStatus === "reviewed" && current.status !== "reviewed" && !next.reviewedAt) {
    next.reviewedAt = now.toISOString();
  }

  if (nextStatus === "closed" && current.status !== "closed") {
    next.closedAt = now.toISOString();
  }

  if (current.status === "closed" && nextStatus !== "closed") {
    next.closedAt = null;
  }

  return next;
}

export function privateDownloadHeaders(document: FulfillmentDocumentKey) {
  const filename = FULFILLMENT_DOWNLOAD_FILENAMES[document];

  return {
    "content-type": "application/pdf",
    "content-disposition": `attachment; filename="${filename}"`,
    "cache-control": "no-store",
    "x-robots-tag": "noindex",
  };
}
