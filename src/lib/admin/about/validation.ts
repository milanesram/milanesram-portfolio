import { readUuid } from "@/lib/admin/ids";
import {
  statusFromIntent,
  type ProfileIntent,
} from "@/lib/admin/settings/validation";

const INTENTS = new Set(["draft", "publish", "unpublish", "archive", "keep"]);

const LIMITS = {
  kicker: 40,
  headline: 200,
  lede: 2000,
  section: 200,
  speakingBody: 2000,
  paragraph: 4000,
  listItem: 400,
  seoTitle: 160,
  seoDescription: 300,
  maxParagraphs: 8,
  maxSpeaking: 8,
  maxBoundaries: 8,
  maxEducation: 12,
} as const;

export type AboutIntent = ProfileIntent;

export type ParsedAboutParagraph = {
  body: string;
  sortOrder: number;
};

export type ParsedAboutListItem = {
  body: string;
  sortOrder: number;
};

export type ParsedAboutEducationLink = {
  credentialId: string;
  sortOrder: number;
};

export type ParsedAboutPageInput = {
  id: string | null;
  kicker: string;
  headline: string;
  lede: string;
  journeyHeading: string;
  educationHeading: string;
  speakingHeading: string;
  speakingBody: string;
  boundariesHeading: string;
  seoTitle: string;
  seoDescription: string;
  paragraphs: ParsedAboutParagraph[];
  speakingItems: ParsedAboutListItem[];
  boundaryItems: ParsedAboutListItem[];
  educationCredentials: ParsedAboutEducationLink[];
  intent: AboutIntent;
};

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function readString(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" ? value : null;
}

function readAllStrings(formData: FormData, name: string): string[] {
  return formData
    .getAll(name)
    .filter((value): value is string => typeof value === "string");
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
    return { ok: false, error: `${label} is too long.` };
  }

  return { ok: true, value };
}

function parseSortOrder(raw: string, label: string): ParseResult<number> {
  if (!/^-?\d+$/.test(raw.trim())) {
    return { ok: false, error: `${label} sort order must be a whole number.` };
  }

  const parsed = Number(raw.trim());

  if (parsed < 0 || parsed > 10000) {
    return { ok: false, error: `${label} sort order is out of range.` };
  }

  return { ok: true, value: parsed };
}

function parseTextSlots(
  formData: FormData,
  bodyName: string,
  sortName: string,
  max: number,
  maxCount: number,
  label: string,
): ParseResult<ParsedAboutParagraph[]> {
  const bodies = readAllStrings(formData, bodyName);
  const sorts = readAllStrings(formData, sortName);
  const items: ParsedAboutParagraph[] = [];
  const used = new Set<number>();

  for (let index = 0; index < bodies.length; index += 1) {
    const body = bodies[index]?.trim() ?? "";

    if (!body) {
      continue;
    }

    if (body.length > max) {
      return { ok: false, error: `A ${label} is too long.` };
    }

    const sort = parseSortOrder(
      sorts[index] ?? String((index + 1) * 10),
      label,
    );
    if (!sort.ok) return sort;

    if (used.has(sort.value)) {
      return { ok: false, error: `${label} sort order must be unique.` };
    }

    used.add(sort.value);
    items.push({ body, sortOrder: sort.value });
  }

  if (items.length === 0) {
    return { ok: false, error: `At least one ${label} is required.` };
  }

  if (items.length > maxCount) {
    return { ok: false, error: `Too many ${label}s.` };
  }

  return { ok: true, value: items };
}

export { statusFromIntent };

export function parseAboutPageFormData(
  formData: FormData,
): ParseResult<ParsedAboutPageInput> {
  const rawId = readString(formData, "id");
  const id = rawId && rawId.length > 0 ? readUuid(rawId) : null;

  if (rawId && rawId.length > 0 && !id) {
    return { ok: false, error: "That record could not be saved." };
  }

  const fields = {
    kicker: requiredText(formData, "kicker", LIMITS.kicker, "Kicker"),
    headline: requiredText(formData, "headline", LIMITS.headline, "Headline"),
    lede: requiredText(formData, "lede", LIMITS.lede, "Lede"),
    journeyHeading: requiredText(
      formData,
      "journey_heading",
      LIMITS.section,
      "Journey heading",
    ),
    educationHeading: requiredText(
      formData,
      "education_heading",
      LIMITS.section,
      "Education heading",
    ),
    speakingHeading: requiredText(
      formData,
      "speaking_heading",
      LIMITS.section,
      "Speaking heading",
    ),
    speakingBody: requiredText(
      formData,
      "speaking_body",
      LIMITS.speakingBody,
      "Speaking body",
    ),
    boundariesHeading: requiredText(
      formData,
      "boundaries_heading",
      LIMITS.section,
      "Boundaries heading",
    ),
    seoTitle: requiredText(formData, "seo_title", LIMITS.seoTitle, "SEO title"),
    seoDescription: requiredText(
      formData,
      "seo_description",
      LIMITS.seoDescription,
      "SEO description",
    ),
  };

  for (const field of Object.values(fields)) {
    if (!field.ok) {
      return field;
    }
  }

  const paragraphs = parseTextSlots(
    formData,
    "paragraph_body",
    "paragraph_sort",
    LIMITS.paragraph,
    LIMITS.maxParagraphs,
    "paragraph",
  );
  if (!paragraphs.ok) return paragraphs;

  const speakingItems = parseTextSlots(
    formData,
    "speaking_item",
    "speaking_sort",
    LIMITS.listItem,
    LIMITS.maxSpeaking,
    "speaking item",
  );
  if (!speakingItems.ok) return speakingItems;

  const boundaryItems = parseTextSlots(
    formData,
    "boundary_item",
    "boundary_sort",
    LIMITS.listItem,
    LIMITS.maxBoundaries,
    "boundary item",
  );
  if (!boundaryItems.ok) return boundaryItems;

  const educationCredentials = parseEducationCredentials(formData);
  if (!educationCredentials.ok) return educationCredentials;

  const intentRaw = (readString(formData, "intent") ?? "keep").trim();

  if (!INTENTS.has(intentRaw)) {
    return { ok: false, error: "That save action is not allowed." };
  }

  return {
    ok: true,
    value: {
      id,
      kicker: fields.kicker.ok ? fields.kicker.value : "",
      headline: fields.headline.ok ? fields.headline.value : "",
      lede: fields.lede.ok ? fields.lede.value : "",
      journeyHeading: fields.journeyHeading.ok ? fields.journeyHeading.value : "",
      educationHeading: fields.educationHeading.ok
        ? fields.educationHeading.value
        : "",
      speakingHeading: fields.speakingHeading.ok ? fields.speakingHeading.value : "",
      speakingBody: fields.speakingBody.ok ? fields.speakingBody.value : "",
      boundariesHeading: fields.boundariesHeading.ok
        ? fields.boundariesHeading.value
        : "",
      seoTitle: fields.seoTitle.ok ? fields.seoTitle.value : "",
      seoDescription: fields.seoDescription.ok ? fields.seoDescription.value : "",
      paragraphs: paragraphs.value,
      speakingItems: speakingItems.value,
      boundaryItems: boundaryItems.value,
      educationCredentials: educationCredentials.value,
      intent: intentRaw as AboutIntent,
    },
  };
}

function parseEducationCredentials(
  formData: FormData,
): ParseResult<ParsedAboutEducationLink[]> {
  const credentialIds = readAllStrings(formData, "education_credential_id");
  const links: ParsedAboutEducationLink[] = [];
  const used = new Set<string>();

  for (const rawId of credentialIds) {
    const credentialId = readUuid(rawId);

    if (!credentialId) {
      return { ok: false, error: "A credential selection is not valid." };
    }

    if (used.has(credentialId)) {
      return { ok: false, error: "Education credential selections must be unique." };
    }

    const sort = parseSortOrder(
      readString(formData, `education_credential_sort_${credentialId}`) ?? "",
      "Education credential",
    );
    if (!sort.ok) return sort;

    used.add(credentialId);
    links.push({ credentialId, sortOrder: sort.value });
  }

  if (links.length > LIMITS.maxEducation) {
    return { ok: false, error: "Too many Education credential selections." };
  }

  const sorts = new Set<number>();

  for (const link of links) {
    if (sorts.has(link.sortOrder)) {
      return { ok: false, error: "Education credential sort order must be unique." };
    }

    sorts.add(link.sortOrder);
  }

  return { ok: true, value: links };
}

export function selectedEducationIsEligible(row: {
  status: string;
  needs_verification: boolean;
}): boolean {
  return row.status === "published" && row.needs_verification === false;
}
