import { readUuid } from "@/lib/admin/ids";
import { statusFromIntent, type ProfileIntent } from "@/lib/admin/settings/validation";

const INTENTS = new Set(["draft", "publish", "unpublish", "archive", "keep"]);

const LIMITS = {
  headline: 200,
  lede: 2000,
  ctaLabel: 80,
  href: 300,
  section: 200,
  sectionLede: 500,
  proof: 200,
  chip: 40,
  proofPoint: 240,
  maxChips: 8,
  maxProofItems: 6,
  maxProofPoints: 8,
  maxExperience: 12,
  maxCredentials: 8,
} as const;

export type HomeIntent = ProfileIntent;

export type ParsedHomeChip = {
  id: string | null;
  label: string;
  sortOrder: number;
};

export type ParsedHomeProofItem = {
  id: string | null;
  label: string;
  supporting: string;
  href: string | null;
  credentialId: string | null;
  projectId: string | null;
  sortOrder: number;
};

export type ParsedHomeExperienceLink = {
  experienceItemId: string;
  sortOrder: number;
};

export type ParsedHomeCredentialLink = {
  credentialId: string;
  sortOrder: number;
};

export type ParsedHomePageInput = {
  id: string | null;
  headline: string;
  lede: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  projectKicker: string;
  projectHeading: string;
  projectProblem: string;
  projectBody: string;
  projectCtaLabel: string;
  projectCtaHref: string;
  projectProofPoints: string[];
  experienceKicker: string;
  experienceHeading: string;
  experienceLede: string;
  experienceCtaLabel: string;
  experienceCtaHref: string;
  credentialsKicker: string;
  credentialsHeading: string;
  credentialsLede: string;
  credentialsCtaLabel: string;
  credentialsCtaHref: string;
  focusKicker: string;
  focusHeading: string;
  focusLede: string;
  closingHeading: string;
  closingBody: string;
  closingPrimaryCtaLabel: string;
  closingPrimaryCtaHref: string;
  closingSecondaryCtaLabel: string;
  closingSecondaryCtaHref: string;
  featuredProjectId: string | null;
  chips: ParsedHomeChip[];
  proofItems: ParsedHomeProofItem[];
  experienceLinks: ParsedHomeExperienceLink[];
  credentialLinks: ParsedHomeCredentialLink[];
  intent: HomeIntent;
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
  const value = raw?.trim() ?? "";

  if (!value) {
    return { ok: false, error: `${label} is required.` };
  }

  if (value.length > max) {
    return { ok: false, error: `${label} is too long.` };
  }

  return { ok: true, value };
}

export function parseHomeHref(raw: string, label: string): ParseResult<string> {
  const value = raw.trim();

  if (!value) {
    return { ok: false, error: `${label} URL is required.` };
  }

  if (value.length > LIMITS.href) {
    return { ok: false, error: `${label} URL is too long.` };
  }

  if (value.startsWith("/") && !value.startsWith("//")) {
    if (!/^\/[A-Za-z0-9/_-]*$/.test(value)) {
      return { ok: false, error: `${label} URL is not a valid internal path.` };
    }

    return { ok: true, value };
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    return { ok: false, error: `${label} URL is not valid.` };
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, error: `${label} must use an https or internal URL.` };
  }

  return { ok: true, value: parsed.href };
}

function parseOptionalHref(
  raw: string,
  label: string,
): ParseResult<string | null> {
  if (!raw.trim()) {
    return { ok: true, value: null };
  }

  return parseHomeHref(raw, label);
}

function parseSortOrder(raw: string, label: string): ParseResult<number> {
  const value = raw.trim();

  if (!/^-?\d+$/.test(value)) {
    return { ok: false, error: `${label} sort order must be a whole number.` };
  }

  const parsed = Number(value);

  if (parsed < 0 || parsed > 10000) {
    return { ok: false, error: `${label} sort order is out of range.` };
  }

  return { ok: true, value: parsed };
}

function parseIntent(formData: FormData): ParseResult<HomeIntent> {
  const raw = (readString(formData, "intent") ?? "keep").trim();

  if (!INTENTS.has(raw)) {
    return { ok: false, error: "That save action is not allowed." };
  }

  return { ok: true, value: raw as HomeIntent };
}

function parseOptionalId(formData: FormData, name = "id"): ParseResult<string | null> {
  const raw = readString(formData, name);
  const id = raw && raw.length > 0 ? readUuid(raw) : null;

  if (raw && raw.length > 0 && !id) {
    return { ok: false, error: "That record could not be saved." };
  }

  return { ok: true, value: id };
}

export { statusFromIntent };

export function parseHomePageFormData(
  formData: FormData,
): ParseResult<ParsedHomePageInput> {
  const id = parseOptionalId(formData);
  if (!id.ok) return id;

  const featuredProjectId = parseOptionalId(formData, "featured_project_id");
  if (!featuredProjectId.ok) return featuredProjectId;

  const fields = {
    headline: requiredText(formData, "headline", LIMITS.headline, "Headline"),
    lede: requiredText(formData, "lede", LIMITS.lede, "Lede"),
    primaryCtaLabel: requiredText(
      formData,
      "primary_cta_label",
      LIMITS.ctaLabel,
      "Primary CTA label",
    ),
    secondaryCtaLabel: requiredText(
      formData,
      "secondary_cta_label",
      LIMITS.ctaLabel,
      "Secondary CTA label",
    ),
    projectKicker: requiredText(formData, "project_kicker", LIMITS.section, "Project kicker"),
    projectHeading: requiredText(formData, "project_heading", LIMITS.section, "Project heading"),
    projectProblem: requiredText(formData, "project_problem", LIMITS.lede, "Project problem"),
    projectBody: requiredText(formData, "project_body", LIMITS.lede, "Project body"),
    projectCtaLabel: requiredText(
      formData,
      "project_cta_label",
      LIMITS.ctaLabel,
      "Project CTA label",
    ),
    experienceKicker: requiredText(
      formData,
      "experience_kicker",
      LIMITS.section,
      "Experience kicker",
    ),
    experienceHeading: requiredText(
      formData,
      "experience_heading",
      LIMITS.section,
      "Experience heading",
    ),
    experienceLede: requiredText(
      formData,
      "experience_lede",
      LIMITS.sectionLede,
      "Experience lede",
    ),
    experienceCtaLabel: requiredText(
      formData,
      "experience_cta_label",
      LIMITS.ctaLabel,
      "Experience CTA label",
    ),
    credentialsKicker: requiredText(
      formData,
      "credentials_kicker",
      LIMITS.section,
      "Credentials kicker",
    ),
    credentialsHeading: requiredText(
      formData,
      "credentials_heading",
      LIMITS.section,
      "Credentials heading",
    ),
    credentialsLede: requiredText(
      formData,
      "credentials_lede",
      LIMITS.sectionLede,
      "Credentials lede",
    ),
    credentialsCtaLabel: requiredText(
      formData,
      "credentials_cta_label",
      LIMITS.ctaLabel,
      "Credentials CTA label",
    ),
    focusKicker: requiredText(formData, "focus_kicker", LIMITS.section, "Focus kicker"),
    focusHeading: requiredText(formData, "focus_heading", LIMITS.section, "Focus heading"),
    focusLede: requiredText(formData, "focus_lede", LIMITS.sectionLede, "Focus lede"),
    closingHeading: requiredText(
      formData,
      "closing_heading",
      LIMITS.section,
      "Closing heading",
    ),
    closingBody: requiredText(formData, "closing_body", LIMITS.lede, "Closing body"),
    closingPrimaryCtaLabel: requiredText(
      formData,
      "closing_primary_cta_label",
      LIMITS.ctaLabel,
      "Closing primary CTA label",
    ),
    closingSecondaryCtaLabel: requiredText(
      formData,
      "closing_secondary_cta_label",
      LIMITS.ctaLabel,
      "Closing secondary CTA label",
    ),
  };

  for (const field of Object.values(fields)) {
    if (!field.ok) {
      return field;
    }
  }

  const hrefs = {
    primaryCtaHref: parseHomeHref(
      readString(formData, "primary_cta_href") ?? "",
      "Primary CTA",
    ),
    secondaryCtaHref: parseHomeHref(
      readString(formData, "secondary_cta_href") ?? "",
      "Secondary CTA",
    ),
    projectCtaHref: parseHomeHref(
      readString(formData, "project_cta_href") ?? "",
      "Project CTA",
    ),
    experienceCtaHref: parseHomeHref(
      readString(formData, "experience_cta_href") ?? "",
      "Experience CTA",
    ),
    credentialsCtaHref: parseHomeHref(
      readString(formData, "credentials_cta_href") ?? "",
      "Credentials CTA",
    ),
    closingPrimaryCtaHref: parseHomeHref(
      readString(formData, "closing_primary_cta_href") ?? "",
      "Closing primary CTA",
    ),
    closingSecondaryCtaHref: parseHomeHref(
      readString(formData, "closing_secondary_cta_href") ?? "",
      "Closing secondary CTA",
    ),
  };

  for (const field of Object.values(hrefs)) {
    if (!field.ok) {
      return field;
    }
  }

  const proofPoints = (readString(formData, "project_proof_points") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (proofPoints.length > LIMITS.maxProofPoints) {
    return { ok: false, error: "Too many project proof points." };
  }

  if (proofPoints.some((point) => point.length > LIMITS.proofPoint)) {
    return { ok: false, error: "A project proof point is too long." };
  }

  const chipLabels = readAllStrings(formData, "chip_label");
  const chipSorts = readAllStrings(formData, "chip_sort");
  const chips: ParsedHomeChip[] = [];

  for (let index = 0; index < chipLabels.length; index += 1) {
    const label = chipLabels[index]?.trim() ?? "";

    if (!label) {
      continue;
    }

    if (label.length > LIMITS.chip) {
      return { ok: false, error: "A chip label is too long." };
    }

    const sort = parseSortOrder(chipSorts[index] ?? String((index + 1) * 10), "Chip");
    if (!sort.ok) return sort;

    chips.push({ id: null, label, sortOrder: sort.value });
  }

  if (chips.length > LIMITS.maxChips) {
    return { ok: false, error: "Too many chips." };
  }

  const chipSortsUsed = new Set<number>();
  const chipLabelsUsed = new Set<string>();

  for (const chip of chips) {
    if (chipSortsUsed.has(chip.sortOrder) || chipLabelsUsed.has(chip.label)) {
      return { ok: false, error: "Chip labels and sort order must be unique." };
    }

    chipSortsUsed.add(chip.sortOrder);
    chipLabelsUsed.add(chip.label);
  }

  const proofLabels = readAllStrings(formData, "proof_label");
  const proofSupporting = readAllStrings(formData, "proof_supporting");
  const proofHrefs = readAllStrings(formData, "proof_href");
  const proofCredentials = readAllStrings(formData, "proof_credential_id");
  const proofProjects = readAllStrings(formData, "proof_project_id");
  const proofSorts = readAllStrings(formData, "proof_sort");
  const proofItems: ParsedHomeProofItem[] = [];

  for (let index = 0; index < proofLabels.length; index += 1) {
    const label = proofLabels[index]?.trim() ?? "";
    const supporting = proofSupporting[index]?.trim() ?? "";

    if (!label && !supporting) {
      continue;
    }

    if (!label || !supporting) {
      return { ok: false, error: "Each proof item needs a label and supporting text." };
    }

    if (label.length > LIMITS.proof || supporting.length > LIMITS.proof) {
      return { ok: false, error: "A proof item is too long." };
    }

    const href = parseOptionalHref(proofHrefs[index] ?? "", "Proof item");
    if (!href.ok) return href;

    const credentialId = proofCredentials[index]?.trim()
      ? readUuid(proofCredentials[index])
      : null;
    const projectId = proofProjects[index]?.trim()
      ? readUuid(proofProjects[index])
      : null;

    if (proofCredentials[index]?.trim() && !credentialId) {
      return { ok: false, error: "A proof credential selection is not valid." };
    }

    if (proofProjects[index]?.trim() && !projectId) {
      return { ok: false, error: "A proof project selection is not valid." };
    }

    if (credentialId && projectId) {
      return { ok: false, error: "A proof item can link to a credential or a project, not both." };
    }

    const sort = parseSortOrder(proofSorts[index] ?? String((index + 1) * 10), "Proof item");
    if (!sort.ok) return sort;

    proofItems.push({
      id: null,
      label,
      supporting,
      href: href.value,
      credentialId,
      projectId,
      sortOrder: sort.value,
    });
  }

  if (proofItems.length > LIMITS.maxProofItems) {
    return { ok: false, error: "Too many proof items." };
  }

  const proofSortsUsed = new Set<number>();

  for (const item of proofItems) {
    if (proofSortsUsed.has(item.sortOrder)) {
      return { ok: false, error: "Proof item sort order must be unique." };
    }

    proofSortsUsed.add(item.sortOrder);
  }

  const experienceIds = readAllStrings(formData, "experience_item_id");
  const experienceLinks: ParsedHomeExperienceLink[] = [];
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
  const credentialLinks: ParsedHomeCredentialLink[] = [];
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

  const intent = parseIntent(formData);
  if (!intent.ok) return intent;

  return {
    ok: true,
    value: {
      id: id.value,
      headline: fields.headline.ok ? fields.headline.value : "",
      lede: fields.lede.ok ? fields.lede.value : "",
      primaryCtaLabel: fields.primaryCtaLabel.ok ? fields.primaryCtaLabel.value : "",
      primaryCtaHref: hrefs.primaryCtaHref.ok ? hrefs.primaryCtaHref.value : "",
      secondaryCtaLabel: fields.secondaryCtaLabel.ok ? fields.secondaryCtaLabel.value : "",
      secondaryCtaHref: hrefs.secondaryCtaHref.ok ? hrefs.secondaryCtaHref.value : "",
      projectKicker: fields.projectKicker.ok ? fields.projectKicker.value : "",
      projectHeading: fields.projectHeading.ok ? fields.projectHeading.value : "",
      projectProblem: fields.projectProblem.ok ? fields.projectProblem.value : "",
      projectBody: fields.projectBody.ok ? fields.projectBody.value : "",
      projectCtaLabel: fields.projectCtaLabel.ok ? fields.projectCtaLabel.value : "",
      projectCtaHref: hrefs.projectCtaHref.ok ? hrefs.projectCtaHref.value : "",
      projectProofPoints: proofPoints,
      experienceKicker: fields.experienceKicker.ok ? fields.experienceKicker.value : "",
      experienceHeading: fields.experienceHeading.ok ? fields.experienceHeading.value : "",
      experienceLede: fields.experienceLede.ok ? fields.experienceLede.value : "",
      experienceCtaLabel: fields.experienceCtaLabel.ok ? fields.experienceCtaLabel.value : "",
      experienceCtaHref: hrefs.experienceCtaHref.ok ? hrefs.experienceCtaHref.value : "",
      credentialsKicker: fields.credentialsKicker.ok ? fields.credentialsKicker.value : "",
      credentialsHeading: fields.credentialsHeading.ok ? fields.credentialsHeading.value : "",
      credentialsLede: fields.credentialsLede.ok ? fields.credentialsLede.value : "",
      credentialsCtaLabel: fields.credentialsCtaLabel.ok ? fields.credentialsCtaLabel.value : "",
      credentialsCtaHref: hrefs.credentialsCtaHref.ok ? hrefs.credentialsCtaHref.value : "",
      focusKicker: fields.focusKicker.ok ? fields.focusKicker.value : "",
      focusHeading: fields.focusHeading.ok ? fields.focusHeading.value : "",
      focusLede: fields.focusLede.ok ? fields.focusLede.value : "",
      closingHeading: fields.closingHeading.ok ? fields.closingHeading.value : "",
      closingBody: fields.closingBody.ok ? fields.closingBody.value : "",
      closingPrimaryCtaLabel: fields.closingPrimaryCtaLabel.ok
        ? fields.closingPrimaryCtaLabel.value
        : "",
      closingPrimaryCtaHref: hrefs.closingPrimaryCtaHref.ok
        ? hrefs.closingPrimaryCtaHref.value
        : "",
      closingSecondaryCtaLabel: fields.closingSecondaryCtaLabel.ok
        ? fields.closingSecondaryCtaLabel.value
        : "",
      closingSecondaryCtaHref: hrefs.closingSecondaryCtaHref.ok
        ? hrefs.closingSecondaryCtaHref.value
        : "",
      featuredProjectId: featuredProjectId.value,
      chips,
      proofItems,
      experienceLinks,
      credentialLinks,
      intent: intent.value,
    },
  };
}
