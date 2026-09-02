import { isPageSeoKey } from "@/lib/content/page-seo";
import { readUuid } from "@/lib/admin/ids";
import {
  statusFromIntent,
  type ProfileIntent,
} from "@/lib/admin/settings/validation";
import type { PageSeoKey } from "@/lib/supabase/database.types";

const INTENTS = new Set(["draft", "publish", "unpublish", "archive", "keep"]);

const LIMITS = {
  title: 200,
  description: 500,
} as const;

export type SeoIntent = ProfileIntent;
export { statusFromIntent };

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export type ParsedPageSeoInput = {
  id: string | null;
  pageKey: PageSeoKey;
  title: string;
  description: string;
  ogTitle: string | null;
  ogDescription: string | null;
  indexable: boolean;
  intent: SeoIntent;
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

function optionalText(
  formData: FormData,
  name: string,
  max: number,
  label: string,
): ParseResult<string | null> {
  const value = readString(formData, name)?.trim() ?? "";

  if (!value) {
    return { ok: true, value: null };
  }

  if (value.length > max) {
    return { ok: false, error: `${label} must be ${max} characters or fewer.` };
  }

  return { ok: true, value };
}

export function parsePageSeoFormData(
  formData: FormData,
): ParseResult<ParsedPageSeoInput> {
  const pageKeyRaw = readString(formData, "page_key")?.trim() ?? "";

  if (!isPageSeoKey(pageKeyRaw)) {
    return { ok: false, error: "That page key is not a known public route." };
  }

  const idRaw = readString(formData, "id");
  const id = idRaw && idRaw.length > 0 ? readUuid(idRaw) : null;

  if (idRaw && idRaw.length > 0 && !id) {
    return { ok: false, error: "That SEO record could not be saved." };
  }

  const title = requiredText(formData, "title", LIMITS.title, "Title");
  if (!title.ok) return title;
  const description = requiredText(
    formData,
    "description",
    LIMITS.description,
    "Description",
  );
  if (!description.ok) return description;
  const ogTitle = optionalText(formData, "og_title", LIMITS.title, "OG title");
  if (!ogTitle.ok) return ogTitle;
  const ogDescription = optionalText(
    formData,
    "og_description",
    LIMITS.description,
    "OG description",
  );
  if (!ogDescription.ok) return ogDescription;

  const intentRaw = (readString(formData, "intent") ?? "keep").trim();
  if (!INTENTS.has(intentRaw)) {
    return { ok: false, error: "That action is not valid." };
  }

  return {
    ok: true,
    value: {
      id,
      pageKey: pageKeyRaw,
      title: title.value,
      description: description.value,
      ogTitle: ogTitle.value,
      ogDescription: ogDescription.value,
      indexable: formData.get("indexable") === "on",
      intent: intentRaw as SeoIntent,
    },
  };
}
