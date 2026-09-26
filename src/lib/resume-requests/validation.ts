import {
  isResumeRequestChoice,
  type ResumeRequestChoice,
} from "./choices";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RESUME_REQUEST_LIMITS = {
  fullNameMin: 2,
  fullNameMax: 120,
  emailMax: 254,
  organizationMin: 2,
  organizationMax: 160,
  messageMax: 1500,
  bodyMax: 8_192,
} as const;

export type ResumeRequestField =
  | "fullName"
  | "email"
  | "organization"
  | "resumeChoice"
  | "message";

export type ResumeRequestFieldCode = "required" | "invalid" | "too_long";

export type ResumeRequestFieldErrors = Partial<
  Record<ResumeRequestField, ResumeRequestFieldCode>
>;

export type PublicResumeRequestInput = {
  fullName: string;
  email: string;
  organization: string;
  resumeChoice: ResumeRequestChoice;
  message: string | null;
};

export type ParseResumeRequestResult =
  | { ok: true; value: PublicResumeRequestInput }
  | { ok: false; fields: ResumeRequestFieldErrors };

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function boundedText(
  raw: string | null,
  min: number,
  max: number,
): { value: string } | { code: ResumeRequestFieldCode } {
  if (raw == null) {
    return { code: "required" };
  }

  const value = normalizeWhitespace(raw);

  if (value.length === 0) {
    return { code: "required" };
  }

  if (value.length < min) {
    return { code: "invalid" };
  }

  if (value.length > max) {
    return { code: "too_long" };
  }

  return { value };
}

export function parsePublicResumeRequest(
  body: Record<string, unknown>,
): ParseResumeRequestResult {
  const fields: ResumeRequestFieldErrors = {};

  const name = boundedText(
    asString(body.fullName),
    RESUME_REQUEST_LIMITS.fullNameMin,
    RESUME_REQUEST_LIMITS.fullNameMax,
  );
  if ("code" in name) {
    fields.fullName = name.code;
  }

  const emailRaw = asString(body.email);
  let email = "";

  if (emailRaw == null || normalizeWhitespace(emailRaw).length === 0) {
    fields.email = "required";
  } else {
    email = emailRaw.trim().toLowerCase();

    if (email.length > RESUME_REQUEST_LIMITS.emailMax || !EMAIL_PATTERN.test(email)) {
      fields.email = "invalid";
    }
  }

  const organization = boundedText(
    asString(body.organization),
    RESUME_REQUEST_LIMITS.organizationMin,
    RESUME_REQUEST_LIMITS.organizationMax,
  );
  if ("code" in organization) {
    fields.organization = organization.code;
  }

  const choiceRaw = asString(body.resumeChoice);
  let resumeChoice: ResumeRequestChoice | null = null;

  if (choiceRaw == null || choiceRaw.trim() === "") {
    fields.resumeChoice = "required";
  } else if (!isResumeRequestChoice(choiceRaw)) {
    fields.resumeChoice = "invalid";
  } else {
    resumeChoice = choiceRaw;
  }

  const messageRaw = asString(body.message);
  let message: string | null = null;

  if (messageRaw != null && messageRaw.trim() !== "") {
    const normalized = normalizeWhitespace(messageRaw);

    if (normalized.length > RESUME_REQUEST_LIMITS.messageMax) {
      fields.message = "too_long";
    } else {
      message = normalized;
    }
  }

  if (
    Object.keys(fields).length > 0 ||
    !("value" in name) ||
    !("value" in organization) ||
    !resumeChoice
  ) {
    return { ok: false, fields };
  }

  return {
    ok: true,
    value: {
      fullName: name.value,
      email,
      organization: organization.value,
      resumeChoice,
      message,
    },
  };
}

export function isHoneypotEmpty(value: unknown): boolean {
  return value == null || value === "";
}

export function resumeRequestFieldMessage(
  field: ResumeRequestField,
  code: ResumeRequestFieldCode,
): string {
  if (field === "fullName") {
    return code === "too_long"
      ? "Full name must be 120 characters or fewer."
      : "Enter your full name.";
  }

  if (field === "email") {
    return code === "required"
      ? "Enter your professional email."
      : "Enter a valid professional email address.";
  }

  if (field === "organization") {
    return code === "too_long"
      ? "Organization must be 160 characters or fewer."
      : "Enter your organization.";
  }

  if (field === "resumeChoice") {
    return "Choose a document.";
  }

  return "Keep the message under 1,500 characters.";
}
