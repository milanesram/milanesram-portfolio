import { PUBLIC_MEDIA_BUCKET } from "@/lib/content/media-bucket";
import type { MediaKind, MediaPurpose } from "@/lib/supabase/database.types";
import { detectUploadContent, type DetectedUploadType } from "./content-signature";

export const RESUME_PDF_UPLOAD_ERROR =
  "Private resume/CV documents must be managed through the private document workflow. Resume PDFs cannot be stored in public media.";

export const RESUME_PDF_PUBLIC_ERROR =
  "Resume PDFs cannot be marked public. They are shared only through the private document workflow.";

export const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const PDF_MIME_TYPES = new Set([
  "application/pdf",
  "application/x-pdf",
]);

export const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif"]);
export const PDF_EXTENSIONS = new Set(["pdf"]);

export const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const PDF_MAX_BYTES = 12 * 1024 * 1024;

export const UPLOAD_CONTENT_MISMATCH =
  "File type is not allowed or does not match its contents.";

export const UPLOAD_FILE_ACCEPT = [...IMAGE_MIME_TYPES, ...PDF_MIME_TYPES].join(",");

const KIND_PURPOSES: Record<MediaKind, readonly MediaPurpose[]> = {
  image: ["portrait", "journey", "project"],
  document: ["publication"],
  resume_pdf: ["resume"],
};

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export function isKindPurposeCompatible(
  kind: MediaKind,
  purpose: MediaPurpose,
): boolean {
  return KIND_PURPOSES[kind].includes(purpose);
}

export function sanitizeUploadFilename(filename: string): string | null {
  if (
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\") ||
    filename.includes("\0")
  ) {
    return null;
  }

  const base = filename.trim();

  if (!base || base.startsWith(".")) {
    return null;
  }

  const lowered = base.toLowerCase();
  const dot = lowered.lastIndexOf(".");

  if (dot <= 0 || dot === lowered.length - 1) {
    return null;
  }

  const stem = lowered
    .slice(0, dot)
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 80);
  const ext = lowered.slice(dot + 1);

  if (!stem || !/^[a-z0-9]{2,8}$/.test(ext)) {
    return null;
  }

  return `${stem}.${ext}`;
}

const DECLARED_TYPES: Record<
  DetectedUploadType,
  { extensions: readonly string[]; mimes: readonly string[]; kinds: readonly MediaKind[] }
> = {
  jpeg: {
    extensions: ["jpg", "jpeg"],
    mimes: ["image/jpeg"],
    kinds: ["image"],
  },
  png: { extensions: ["png"], mimes: ["image/png"], kinds: ["image"] },
  webp: { extensions: ["webp"], mimes: ["image/webp"], kinds: ["image"] },
  avif: { extensions: ["avif"], mimes: ["image/avif"], kinds: ["image"] },
  pdf: {
    extensions: ["pdf"],
    mimes: ["application/pdf", "application/x-pdf"],
    kinds: ["document", "resume_pdf"],
  },
};

function declaredUploadType(
  kind: MediaKind,
  extension: string,
  mimeType: string,
): DetectedUploadType | null {
  const match = (Object.entries(DECLARED_TYPES) as Array<
    [DetectedUploadType, (typeof DECLARED_TYPES)[DetectedUploadType]]
  >).find(
    ([, rule]) =>
      rule.kinds.includes(kind) &&
      rule.extensions.includes(extension) &&
      rule.mimes.includes(mimeType),
  );

  return match?.[0] ?? null;
}

export function validateUploadFile(args: {
  kind: MediaKind;
  purpose: MediaPurpose;
  filename: string;
  mimeType: string;
  byteSize: number;
  bytes: Uint8Array;
}): ParseResult<{ safeFilename: string; mimeType: string }> {
  if (!isKindPurposeCompatible(args.kind, args.purpose)) {
    return { ok: false, error: "That file type is not allowed for this purpose." };
  }

  if (!Number.isFinite(args.byteSize) || args.byteSize <= 0) {
    return { ok: false, error: "The file is empty." };
  }

  const maxBytes = args.kind === "image" ? IMAGE_MAX_BYTES : PDF_MAX_BYTES;
  const sizeError =
    args.kind === "image" ? "Images must be 8 MB or smaller." : "PDFs must be 12 MB or smaller.";

  if (args.byteSize > maxBytes || args.bytes.byteLength > maxBytes) {
    return { ok: false, error: sizeError };
  }

  const safeFilename = sanitizeUploadFilename(args.filename);

  if (!safeFilename) {
    return { ok: false, error: "That filename is not allowed." };
  }

  const extension = safeFilename.slice(safeFilename.lastIndexOf(".") + 1);
  const mime = args.mimeType.trim().toLowerCase();
  const typeError =
    args.kind === "image" ? "Upload a JPEG, PNG, WebP, or AVIF image." : "Upload a PDF.";
  const extensionAllowed =
    args.kind === "image" ? IMAGE_EXTENSIONS.has(extension) : PDF_EXTENSIONS.has(extension);
  const mimeAllowed = args.kind === "image" ? IMAGE_MIME_TYPES.has(mime) : PDF_MIME_TYPES.has(mime);
  const declared =
    extensionAllowed && mimeAllowed ? declaredUploadType(args.kind, extension, mime) : null;

  if (!declared) {
    return { ok: false, error: typeError };
  }

  if (args.bytes.byteLength !== args.byteSize || detectUploadContent(args.bytes) !== declared) {
    return { ok: false, error: UPLOAD_CONTENT_MISMATCH };
  }

  return { ok: true, value: { safeFilename, mimeType: mime } };
}

export function resolveMediaUploadBucket(args: {
  kind: MediaKind;
  isPublic: boolean;
}): ParseResult<{ bucket: typeof PUBLIC_MEDIA_BUCKET }> {
  if (args.kind === "resume_pdf") {
    return { ok: false, error: RESUME_PDF_UPLOAD_ERROR };
  }

  return { ok: true, value: { bucket: PUBLIC_MEDIA_BUCKET } };
}

export function assertResumePdfStaysNonPublic(args: {
  kind: MediaKind;
  isPublic: boolean;
}): ParseResult<true> {
  if (args.kind === "resume_pdf" && args.isPublic) {
    return { ok: false, error: RESUME_PDF_PUBLIC_ERROR };
  }

  return { ok: true, value: true };
}

export function mediaStoragePath(
  purpose: MediaPurpose,
  mediaId: string,
  safeFilename: string,
): string {
  return `${purpose}/${mediaId}/${safeFilename}`;
}

export async function rollbackUploadedObjectIfInsertFailed(args: {
  insertError: unknown;
  removeObject: () => Promise<unknown>;
}): Promise<ParseResult<true>> {
  if (!args.insertError) {
    return { ok: true, value: true };
  }

  await args.removeObject();
  return { ok: false, error: "The media record could not be saved." };
}

export function assertMediaNotReferenced(usageTotal: number): ParseResult<true> {
  if (usageTotal > 0) {
    return {
      ok: false,
      error:
        "Remove this asset from Journey, Projects, Resume, or Writing before deleting it.",
    };
  }

  return { ok: true, value: true };
}
