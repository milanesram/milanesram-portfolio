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
  additionalHeading: 120,
} as const;

export type ChromeIntent = ProfileIntent;
export { statusFromIntent };

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export type ParsedIndexChromeInput = {
  id: string | null;
  kicker: string;
  headline: string;
  lede: string;
  additionalHeading: string | null;
  intent: ChromeIntent;
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

export function parseIndexChromeFormData(
  formData: FormData,
  options: { additionalHeading?: boolean } = {},
): ParseResult<ParsedIndexChromeInput> {
  const idRaw = readString(formData, "id");
  const id = idRaw && idRaw.length > 0 ? readUuid(idRaw) : null;

  if (idRaw && idRaw.length > 0 && !id) {
    return { ok: false, error: "The page could not be saved." };
  }

  const kicker = requiredText(formData, "kicker", LIMITS.kicker, "Kicker");
  if (!kicker.ok) return kicker;
  const headline = requiredText(formData, "headline", LIMITS.headline, "Headline");
  if (!headline.ok) return headline;
  const lede = requiredText(formData, "lede", LIMITS.lede, "Lede");
  if (!lede.ok) return lede;

  let additionalHeading: string | null = null;

  if (options.additionalHeading) {
    const additional = requiredText(
      formData,
      "additional_heading",
      LIMITS.additionalHeading,
      "Additional heading",
    );
    if (!additional.ok) return additional;
    additionalHeading = additional.value;
  }

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
      additionalHeading,
      intent: intentRaw as ChromeIntent,
    },
  };
}
