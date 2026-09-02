import type { MediaKind, MediaPurpose } from "@/lib/supabase/database.types";

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

export function validateUploadFile(args: {
  kind: MediaKind;
  purpose: MediaPurpose;
  filename: string;
  mimeType: string;
  byteSize: number;
}): ParseResult<{ safeFilename: string; mimeType: string }> {
  if (!isKindPurposeCompatible(args.kind, args.purpose)) {
    return { ok: false, error: "That file type is not allowed for this purpose." };
  }

  if (!Number.isFinite(args.byteSize) || args.byteSize <= 0) {
    return { ok: false, error: "The file is empty." };
  }

  const safeFilename = sanitizeUploadFilename(args.filename);

  if (!safeFilename) {
    return { ok: false, error: "That filename is not allowed." };
  }

  const extension = safeFilename.slice(safeFilename.lastIndexOf(".") + 1);
  const mime = args.mimeType.trim().toLowerCase();

  if (args.kind === "image") {
    if (!IMAGE_EXTENSIONS.has(extension) || !IMAGE_MIME_TYPES.has(mime)) {
      return { ok: false, error: "Upload a JPEG, PNG, WebP, or AVIF image." };
    }

    if (args.byteSize > IMAGE_MAX_BYTES) {
      return { ok: false, error: "Images must be 8 MB or smaller." };
    }
  } else {
    if (!PDF_EXTENSIONS.has(extension) || !PDF_MIME_TYPES.has(mime)) {
      return { ok: false, error: "Upload a PDF." };
    }

    if (args.byteSize > PDF_MAX_BYTES) {
      return { ok: false, error: "PDFs must be 12 MB or smaller." };
    }
  }

  return { ok: true, value: { safeFilename, mimeType: mime } };
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
