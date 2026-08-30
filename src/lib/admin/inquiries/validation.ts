import { readUuid } from "@/lib/admin/ids";

const INTENTS = new Set(["read", "unread"]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type InquiryReadIntent = "read" | "unread";

export type ParsedInquiryReadInput = {
  id: string;
  intent: InquiryReadIntent;
};

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function readString(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" ? value : null;
}

function parseIntent(formData: FormData): ParseResult<InquiryReadIntent> {
  const raw = (readString(formData, "intent") ?? "").trim();

  if (!INTENTS.has(raw)) {
    return { ok: false, error: "That save action is not allowed." };
  }

  return { ok: true, value: raw as InquiryReadIntent };
}

export function parseInquiryReadFormData(
  formData: FormData,
): ParseResult<ParsedInquiryReadInput> {
  const id = readUuid(formData.get("id"));

  if (!id) {
    return { ok: false, error: "That record could not be saved." };
  }

  const intent = parseIntent(formData);
  if (!intent.ok) return intent;

  return {
    ok: true,
    value: {
      id,
      intent: intent.value,
    },
  };
}

export function readAtFromIntent(intent: InquiryReadIntent): string | null {
  if (intent === "unread") {
    return null;
  }

  return new Date().toISOString();
}

export function safeMailtoHref(email: string): string | null {
  const trimmed = email.trim();

  if (!EMAIL_PATTERN.test(trimmed)) {
    return null;
  }

  if (/[:/\s<>"'\\]/.test(trimmed)) {
    return null;
  }

  return `mailto:${trimmed}`;
}

export function previewInquiryMessage(message: string, max = 80): string {
  const collapsed = message.replace(/\s+/g, " ").trim();

  if (collapsed.length <= max) {
    return collapsed;
  }

  return `${collapsed.slice(0, max).trimEnd()}…`;
}
