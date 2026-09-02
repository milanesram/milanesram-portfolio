import type {
  ContentStatus,
  ProjectMediaDisplayRole,
  TrackTag,
} from "@/lib/supabase/database.types";
import { readUuid } from "@/lib/admin/ids";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STATUSES = new Set<ContentStatus>(["draft", "published", "archived"]);
const TRACKS = new Set<TrackTag>(["all", "cybersecurity_grc", "privacy_ai"]);
const INTENTS = new Set(["draft", "publish", "unpublish", "archive", "keep"]);
const DISPLAY_ROLES = new Set<ProjectMediaDisplayRole>([
  "hero",
  "workflow",
  "gallery",
]);

const LIMITS = {
  slug: 80,
  name: 120,
  tagline: 200,
  yearLabel: 32,
  role: 200,
  summary: 2000,
  limits: 2000,
  stackItem: 60,
  stackCount: 20,
  heading: 160,
  body: 8000,
  caption: 400,
  sortOrder: { min: 0, max: 9999 },
} as const;

export type ProjectIntent = "draft" | "publish" | "unpublish" | "archive" | "keep";

export type ParsedProjectInput = {
  id: string | null;
  slug: string;
  name: string;
  tagline: string;
  yearLabel: string;
  role: string;
  summary: string;
  limits: string;
  stack: string[];
  isFeatured: boolean;
  sortOrder: number;
  intent: ProjectIntent;
};

export type ParsedSectionInput = {
  id: string | null;
  projectId: string;
  heading: string;
  body: string;
  track: TrackTag;
  status: ContentStatus;
  sortOrder: number;
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

function parseSortOrder(formData: FormData): ParseResult<number> {
  const raw = readString(formData, "sort_order") ?? "0";
  const value = Number.parseInt(raw, 10);

  if (!Number.isInteger(value)) {
    return { ok: false, error: "Sort order must be a whole number." };
  }

  if (value < LIMITS.sortOrder.min || value > LIMITS.sortOrder.max) {
    return { ok: false, error: "Sort order is out of range." };
  }

  return { ok: true, value };
}

function parseStack(formData: FormData): ParseResult<string[]> {
  const raw = readString(formData, "stack") ?? "";
  const items = raw
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length > LIMITS.stackCount) {
    return { ok: false, error: "Too many stack items." };
  }

  const unique: string[] = [];

  for (const item of items) {
    if (item.length > LIMITS.stackItem) {
      return { ok: false, error: "A stack item is too long." };
    }

    if (!unique.includes(item)) {
      unique.push(item);
    }
  }

  return { ok: true, value: unique };
}

function parseIntent(formData: FormData): ParseResult<ProjectIntent> {
  const raw = (readString(formData, "intent") ?? "keep").trim();

  if (!INTENTS.has(raw)) {
    return { ok: false, error: "That save action is not allowed." };
  }

  return { ok: true, value: raw as ProjectIntent };
}

export function statusFromIntent(
  intent: ProjectIntent,
  current: ContentStatus | null,
): ContentStatus {
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

export function parseProjectFormData(
  formData: FormData,
): ParseResult<ParsedProjectInput> {
  const idRaw = readString(formData, "id");
  const id = idRaw && idRaw.length > 0 ? readUuid(idRaw) : null;

  if (idRaw && idRaw.length > 0 && !id) {
    return { ok: false, error: "That project could not be saved." };
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

  const name = requiredText(formData, "name", LIMITS.name, "Name");
  if (!name.ok) return name;

  const tagline = requiredText(formData, "tagline", LIMITS.tagline, "Tagline");
  if (!tagline.ok) return tagline;

  const yearLabel = requiredText(
    formData,
    "year_label",
    LIMITS.yearLabel,
    "Year",
  );
  if (!yearLabel.ok) return yearLabel;

  const role = requiredText(formData, "role", LIMITS.role, "Role");
  if (!role.ok) return role;

  const summary = requiredText(formData, "summary", LIMITS.summary, "Summary");
  if (!summary.ok) return summary;

  const limits = requiredText(formData, "limits", LIMITS.limits, "Limits");
  if (!limits.ok) return limits;

  const stack = parseStack(formData);
  if (!stack.ok) return stack;

  const sortOrder = parseSortOrder(formData);
  if (!sortOrder.ok) return sortOrder;

  const intent = parseIntent(formData);
  if (!intent.ok) return intent;

  return {
    ok: true,
    value: {
      id,
      slug,
      name: name.value,
      tagline: tagline.value,
      yearLabel: yearLabel.value,
      role: role.value,
      summary: summary.value,
      limits: limits.value,
      stack: stack.value,
      isFeatured: readString(formData, "is_featured") === "on",
      sortOrder: sortOrder.value,
      intent: intent.value,
    },
  };
}

export function parseSectionFormData(
  formData: FormData,
): ParseResult<ParsedSectionInput> {
  const projectId = readUuid(readString(formData, "project_id"));

  if (!projectId) {
    return { ok: false, error: "That section could not be saved." };
  }

  const idRaw = readString(formData, "id");
  const id = idRaw && idRaw.length > 0 ? readUuid(idRaw) : null;

  if (idRaw && idRaw.length > 0 && !id) {
    return { ok: false, error: "That section could not be saved." };
  }

  const heading = requiredText(formData, "heading", LIMITS.heading, "Heading");
  if (!heading.ok) return heading;

  const body = requiredText(formData, "body", LIMITS.body, "Section content");
  if (!body.ok) return body;

  const trackRaw = (readString(formData, "track") ?? "all").trim();

  if (!TRACKS.has(trackRaw as TrackTag)) {
    return { ok: false, error: "Choose a valid career track." };
  }

  const statusRaw = (readString(formData, "status") ?? "draft").trim();

  if (!STATUSES.has(statusRaw as ContentStatus)) {
    return { ok: false, error: "Choose a valid section status." };
  }

  const sortOrder = parseSortOrder(formData);
  if (!sortOrder.ok) return sortOrder;

  return {
    ok: true,
    value: {
      id,
      projectId,
      heading: heading.value,
      body: body.value,
      track: trackRaw as TrackTag,
      status: statusRaw as ContentStatus,
      sortOrder: sortOrder.value,
    },
  };
}

export function parseOwnedSectionRef(
  formData: FormData,
): ParseResult<{ projectId: string; sectionId: string }> {
  const projectId = readUuid(readString(formData, "project_id"));
  const sectionId = readUuid(readString(formData, "section_id") ?? readString(formData, "id"));

  if (!projectId || !sectionId) {
    return { ok: false, error: "That section could not be updated." };
  }

  return { ok: true, value: { projectId, sectionId } };
}

export type ParsedProjectMediaInput = {
  id: string | null;
  projectId: string;
  mediaAssetId: string;
  displayRole: ProjectMediaDisplayRole;
  caption: string;
  status: ContentStatus;
  sortOrder: number;
};

export function parseProjectMediaFormData(
  formData: FormData,
): ParseResult<ParsedProjectMediaInput> {
  const projectId = readUuid(readString(formData, "project_id"));

  if (!projectId) {
    return { ok: false, error: "That screenshot could not be saved." };
  }

  const idRaw = readString(formData, "id");
  const id = idRaw && idRaw.length > 0 ? readUuid(idRaw) : null;

  if (idRaw && idRaw.length > 0 && !id) {
    return { ok: false, error: "That screenshot could not be saved." };
  }

  const mediaAssetId = readUuid(readString(formData, "media_asset_id"));

  if (!mediaAssetId) {
    return { ok: false, error: "Choose a screenshot media file." };
  }

  const caption = requiredText(formData, "caption", LIMITS.caption, "Caption");
  if (!caption.ok) return caption;

  const roleRaw = (readString(formData, "display_role") ?? "workflow").trim();

  if (!DISPLAY_ROLES.has(roleRaw as ProjectMediaDisplayRole)) {
    return { ok: false, error: "Choose a valid display role." };
  }

  const statusRaw = (readString(formData, "status") ?? "draft").trim();

  if (!STATUSES.has(statusRaw as ContentStatus)) {
    return { ok: false, error: "Choose a valid screenshot status." };
  }

  const sortOrder = parseSortOrder(formData);
  if (!sortOrder.ok) return sortOrder;

  return {
    ok: true,
    value: {
      id,
      projectId,
      mediaAssetId,
      displayRole: roleRaw as ProjectMediaDisplayRole,
      caption: caption.value,
      status: statusRaw as ContentStatus,
      sortOrder: sortOrder.value,
    },
  };
}

export function parseOwnedProjectMediaRef(
  formData: FormData,
): ParseResult<{ projectId: string; relationshipId: string }> {
  const projectId = readUuid(readString(formData, "project_id"));
  const relationshipId = readUuid(
    readString(formData, "relationship_id") ?? readString(formData, "id"),
  );

  if (!projectId || !relationshipId) {
    return { ok: false, error: "That screenshot could not be updated." };
  }

  return { ok: true, value: { projectId, relationshipId } };
}
