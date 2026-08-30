import { readUuid } from "@/lib/admin/ids";
import type { MediaKind } from "@/lib/supabase/database.types";

const INTENTS = new Set(["draft", "publish", "unpublish", "archive", "keep"]);
const KINDS = new Set<MediaKind>(["resume_pdf", "image", "document"]);

const LIMITS = {
  title: 200,
  altText: 300,
} as const;

export type MediaIntent =
  | "draft"
  | "publish"
  | "unpublish"
  | "archive"
  | "keep";

export type ParsedMediaInput = {
  id: string;
  title: string;
  altText: string | null;
  kind: MediaKind;
  isPublic: boolean;
  intent: MediaIntent;
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

function parseIntent(formData: FormData): ParseResult<MediaIntent> {
  const raw = (readString(formData, "intent") ?? "keep").trim();

  if (!INTENTS.has(raw)) {
    return { ok: false, error: "That save action is not allowed." };
  }

  return { ok: true, value: raw as MediaIntent };
}

function parseKind(formData: FormData): ParseResult<MediaKind> {
  const raw = readString(formData, "kind");

  if (raw == null || !KINDS.has(raw as MediaKind)) {
    return { ok: false, error: "That media type is not allowed." };
  }

  return { ok: true, value: raw as MediaKind };
}

export function statusFromIntent(
  intent: MediaIntent,
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

export function parseMediaFormData(
  formData: FormData,
): ParseResult<ParsedMediaInput> {
  const id = readUuid(formData.get("id"));

  if (!id) {
    return { ok: false, error: "That record could not be saved." };
  }

  const title = requiredText(formData, "title", LIMITS.title, "Title");
  if (!title.ok) return title;

  const altText = optionalText(formData, "alt_text", LIMITS.altText, "Alt text");
  if (!altText.ok) return altText;

  const kind = parseKind(formData);
  if (!kind.ok) return kind;

  const intent = parseIntent(formData);
  if (!intent.ok) return intent;

  return {
    ok: true,
    value: {
      id,
      title: title.value,
      altText: altText.value,
      kind: kind.value,
      isPublic: formData.get("is_public") === "on",
      intent: intent.value,
    },
  };
}
