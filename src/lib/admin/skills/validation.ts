import { readUuid } from "@/lib/admin/ids";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const INTENTS = new Set(["draft", "publish", "unpublish", "archive", "keep"]);
const DIRECTIONS = new Set(["up", "down"]);

const LIMITS = {
  slug: 80,
  navLabel: 120,
  headline: 200,
  summary: 2000,
  cardSummary: 2000,
  cardChip: 80,
  featuredProjectLede: 500,
  competency: 80,
  sortOrder: { min: 0, max: 9999 },
  maxCardChips: 8,
  maxExperience: 20,
  maxCredentials: 12,
} as const;

export type FocusPageIntent =
  | "draft"
  | "publish"
  | "unpublish"
  | "archive"
  | "keep";

export type ParsedFocusExperienceLink = {
  experienceItemId: string;
  sortOrder: number;
};

export type ParsedFocusCredentialLink = {
  credentialId: string;
  sortOrder: number;
};

export type ParsedFocusPageInput = {
  id: string | null;
  slug: string;
  navLabel: string;
  headline: string;
  summary: string;
  cardSummary: string;
  cardChips: string[];
  featuredProjectLede: string;
  featuredProjectId: string | null;
  featuredPublicationId: string | null;
  experienceLinks: ParsedFocusExperienceLink[];
  credentialLinks: ParsedFocusCredentialLink[];
  sortOrder: number;
  intent: FocusPageIntent;
};

export type ParsedCompetencyInput = {
  pageId: string;
  index: number | null;
  text: string | null;
  direction: "up" | "down" | null;
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
): ParseResult<string> {
  const raw = readString(formData, name);
  const value = raw?.trim() ?? "";

  if (value.length > max) {
    return { ok: false, error: `${label} is too long.` };
  }

  return { ok: true, value };
}

function parseSortOrder(
  raw: string,
  label: string,
): ParseResult<number> {
  const value = Number.parseInt(raw, 10);

  if (!Number.isInteger(value)) {
    return { ok: false, error: `${label} sort order must be a whole number.` };
  }

  if (value < LIMITS.sortOrder.min || value > LIMITS.sortOrder.max) {
    return { ok: false, error: `${label} sort order is out of range.` };
  }

  return { ok: true, value };
}

function parseOptionalId(
  formData: FormData,
  name: string,
): ParseResult<string | null> {
  const raw = readString(formData, name);
  const id = raw && raw.length > 0 ? readUuid(raw) : null;

  if (raw && raw.length > 0 && !id) {
    return { ok: false, error: "That selection is not valid." };
  }

  return { ok: true, value: id };
}

function parsePageSortOrder(formData: FormData): ParseResult<number> {
  return parseSortOrder(readString(formData, "sort_order") ?? "0", "Focus");
}

function parseIntent(formData: FormData): ParseResult<FocusPageIntent> {
  const raw = (readString(formData, "intent") ?? "keep").trim();

  if (!INTENTS.has(raw)) {
    return { ok: false, error: "That save action is not allowed." };
  }

  return { ok: true, value: raw as FocusPageIntent };
}

export function statusFromIntent(
  intent: FocusPageIntent,
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

export function parseFocusPageFormData(
  formData: FormData,
): ParseResult<ParsedFocusPageInput> {
  const idRaw = readString(formData, "id");
  const id = idRaw && idRaw.length > 0 ? readUuid(idRaw) : null;

  if (idRaw && idRaw.length > 0 && !id) {
    return { ok: false, error: "That focus page could not be saved." };
  }

  const slugRaw = requiredText(formData, "slug", LIMITS.slug, "Slug");
  if (!slugRaw.ok) return slugRaw;

  const slug = slugRaw.value.toLowerCase();

  if (!SLUG_PATTERN.test(slug)) {
    return {
      ok: false,
      error: "Use a lowercase slug with letters, numbers, and hyphens.",
    };
  }

  const navLabel = requiredText(
    formData,
    "nav_label",
    LIMITS.navLabel,
    "Nav label",
  );
  if (!navLabel.ok) return navLabel;

  const headline = requiredText(
    formData,
    "headline",
    LIMITS.headline,
    "Headline",
  );
  if (!headline.ok) return headline;

  const summary = requiredText(formData, "summary", LIMITS.summary, "Summary");
  if (!summary.ok) return summary;

  const cardSummary = requiredText(
    formData,
    "card_summary",
    LIMITS.cardSummary,
    "Home card summary",
  );
  if (!cardSummary.ok) return cardSummary;

  const featuredProjectLede = optionalText(
    formData,
    "featured_project_lede",
    LIMITS.featuredProjectLede,
    "Featured project lede",
  );
  if (!featuredProjectLede.ok) return featuredProjectLede;

  const featuredProjectId = parseOptionalId(formData, "featured_project_id");
  if (!featuredProjectId.ok) return featuredProjectId;

  const featuredPublicationId = parseOptionalId(
    formData,
    "featured_publication_id",
  );
  if (!featuredPublicationId.ok) return featuredPublicationId;

  const cardChips = (readString(formData, "card_chips") ?? "")
    .split("\n")
    .map((chip) => chip.trim())
    .filter(Boolean);

  if (cardChips.some((chip) => chip.length > LIMITS.cardChip)) {
    return { ok: false, error: "A Home card chip is too long." };
  }

  if (cardChips.length > LIMITS.maxCardChips) {
    return { ok: false, error: "Too many Home card chips." };
  }

  const sortOrder = parsePageSortOrder(formData);
  if (!sortOrder.ok) return sortOrder;

  const intent = parseIntent(formData);
  if (!intent.ok) return intent;

  const experienceIds = readAllStrings(formData, "experience_item_id");
  const experienceLinks: ParsedFocusExperienceLink[] = [];
  const experienceUsed = new Set<string>();

  for (const rawId of experienceIds) {
    const experienceItemId = readUuid(rawId);

    if (!experienceItemId) {
      return { ok: false, error: "An experience selection is not valid." };
    }

    if (experienceUsed.has(experienceItemId)) {
      return { ok: false, error: "Experience selections must be unique." };
    }

    const sort = parseSortOrder(
      readString(formData, `experience_sort_${experienceItemId}`) ?? "",
      "Experience",
    );
    if (!sort.ok) return sort;

    experienceUsed.add(experienceItemId);
    experienceLinks.push({ experienceItemId, sortOrder: sort.value });
  }

  if (experienceLinks.length > LIMITS.maxExperience) {
    return { ok: false, error: "Too many experience selections." };
  }

  const experienceSorts = new Set<number>();

  for (const link of experienceLinks) {
    if (experienceSorts.has(link.sortOrder)) {
      return { ok: false, error: "Experience sort order must be unique." };
    }

    experienceSorts.add(link.sortOrder);
  }

  const credentialIds = readAllStrings(formData, "credential_id");
  const credentialLinks: ParsedFocusCredentialLink[] = [];
  const credentialUsed = new Set<string>();

  for (const rawId of credentialIds) {
    const credentialId = readUuid(rawId);

    if (!credentialId) {
      return { ok: false, error: "A credential selection is not valid." };
    }

    if (credentialUsed.has(credentialId)) {
      return { ok: false, error: "Credential selections must be unique." };
    }

    const sort = parseSortOrder(
      readString(formData, `credential_sort_${credentialId}`) ?? "",
      "Credential",
    );
    if (!sort.ok) return sort;

    credentialUsed.add(credentialId);
    credentialLinks.push({ credentialId, sortOrder: sort.value });
  }

  if (credentialLinks.length > LIMITS.maxCredentials) {
    return { ok: false, error: "Too many credential selections." };
  }

  const credentialSorts = new Set<number>();

  for (const link of credentialLinks) {
    if (credentialSorts.has(link.sortOrder)) {
      return { ok: false, error: "Credential sort order must be unique." };
    }

    credentialSorts.add(link.sortOrder);
  }

  return {
    ok: true,
    value: {
      id,
      slug,
      navLabel: navLabel.value,
      headline: headline.value,
      summary: summary.value,
      cardSummary: cardSummary.value,
      cardChips,
      featuredProjectLede: featuredProjectLede.value,
      featuredProjectId: featuredProjectId.value,
      featuredPublicationId: featuredPublicationId.value,
      experienceLinks,
      credentialLinks,
      sortOrder: sortOrder.value,
      intent: intent.value,
    },
  };
}

export function parseCompetencyText(
  formData: FormData,
): ParseResult<string> {
  return requiredText(formData, "text", LIMITS.competency, "Skill");
}

export function parseCompetencyMutation(
  formData: FormData,
): ParseResult<ParsedCompetencyInput> {
  const pageId = readUuid(formData.get("page_id"));

  if (!pageId) {
    return { ok: false, error: "That skill could not be saved." };
  }

  const indexRaw = readString(formData, "index");
  let index: number | null = null;

  if (indexRaw != null && indexRaw.trim() !== "") {
    const value = Number.parseInt(indexRaw, 10);

    if (!Number.isInteger(value) || value < 0) {
      return { ok: false, error: "That skill could not be saved." };
    }

    index = value;
  }

  const directionRaw = (readString(formData, "direction") ?? "").trim();
  const direction =
    directionRaw && DIRECTIONS.has(directionRaw)
      ? (directionRaw as "up" | "down")
      : null;

  if (directionRaw && !direction) {
    return { ok: false, error: "That skill could not be saved." };
  }

  const textRaw = readString(formData, "text");
  let text: string | null = null;

  if (textRaw != null) {
    const parsed = parseCompetencyText(formData);
    if (!parsed.ok) return parsed;
    text = parsed.value;
  }

  return {
    ok: true,
    value: {
      pageId,
      index,
      text,
      direction,
    },
  };
}

export function replaceCompetency(
  competencies: string[],
  index: number,
  text: string,
): string[] | null {
  if (index < 0 || index >= competencies.length) {
    return null;
  }

  const next = [...competencies];
  next[index] = text;
  return next;
}

export function removeCompetency(
  competencies: string[],
  index: number,
): string[] | null {
  if (index < 0 || index >= competencies.length) {
    return null;
  }

  return competencies.filter((_, current) => current !== index);
}

export function moveCompetency(
  competencies: string[],
  index: number,
  direction: "up" | "down",
): string[] | null {
  const target = direction === "up" ? index - 1 : index + 1;

  if (index < 0 || index >= competencies.length) {
    return null;
  }

  if (target < 0 || target >= competencies.length) {
    return competencies;
  }

  const next = [...competencies];
  const current = next[index];
  next[index] = next[target];
  next[target] = current;
  return next;
}

export function isPubliclySelectableCredential(args: {
  status: string;
  needsVerification: boolean;
}): boolean {
  return args.status === "published" && args.needsVerification === false;
}
