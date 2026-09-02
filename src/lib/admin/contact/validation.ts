import { readUuid } from "@/lib/admin/ids";
import {
  statusFromIntent,
  type ProfileIntent,
} from "@/lib/admin/settings/validation";

const INTENTS = new Set(["draft", "publish", "unpublish", "archive", "keep"]);

const LIMITS = {
  kicker: 80,
  headline: 200,
  lede: 2000,
  label: 80,
  formIntro: 2000,
} as const;

export type ContactIntent = ProfileIntent;
export { statusFromIntent };

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export type ParsedContactPageInput = {
  id: string | null;
  kicker: string;
  headline: string;
  lede: string;
  emailEnabled: boolean;
  linkedinEnabled: boolean;
  emailLabel: string;
  linkedinLabel: string;
  formIntro: string;
  intent: ContactIntent;
};

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
  const value = readString(formData, name)?.trim() ?? "";

  if (!value) {
    return { ok: false, error: `${label} is required.` };
  }

  if (value.length > max) {
    return { ok: false, error: `${label} must be ${max} characters or fewer.` };
  }

  return { ok: true, value };
}

export function parseContactPageFormData(
  formData: FormData,
): ParseResult<ParsedContactPageInput> {
  const idRaw = readString(formData, "id");
  const id = idRaw && idRaw.length > 0 ? readUuid(idRaw) : null;

  if (idRaw && idRaw.length > 0 && !id) {
    return { ok: false, error: "The Contact page could not be saved." };
  }

  const kicker = requiredText(formData, "kicker", LIMITS.kicker, "Kicker");
  if (!kicker.ok) return kicker;
  const headline = requiredText(formData, "headline", LIMITS.headline, "Headline");
  if (!headline.ok) return headline;
  const lede = requiredText(formData, "lede", LIMITS.lede, "Lede");
  if (!lede.ok) return lede;
  const emailLabel = requiredText(formData, "email_label", LIMITS.label, "Email label");
  if (!emailLabel.ok) return emailLabel;
  const linkedinLabel = requiredText(
    formData,
    "linkedin_label",
    LIMITS.label,
    "LinkedIn label",
  );
  if (!linkedinLabel.ok) return linkedinLabel;
  const formIntro = requiredText(
    formData,
    "form_intro",
    LIMITS.formIntro,
    "Form intro",
  );
  if (!formIntro.ok) return formIntro;

  const intentRaw = (readString(formData, "intent") ?? "keep").trim();
  if (!INTENTS.has(intentRaw)) {
    return { ok: false, error: "That action is not valid." };
  }

  return {
    ok: true,
    value: {
      id,
      kicker: kicker.value,
      headline: headline.value,
      lede: lede.value,
      emailEnabled: formData.get("email_enabled") === "on",
      linkedinEnabled: formData.get("linkedin_enabled") === "on",
      emailLabel: emailLabel.value,
      linkedinLabel: linkedinLabel.value,
      formIntro: formIntro.value,
      intent: intentRaw as ContactIntent,
    },
  };
}
