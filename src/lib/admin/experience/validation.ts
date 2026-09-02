import type {
  ContentStatus,
  ExperienceDatePrecision,
  ExperienceKind,
  TrackTag,
} from "@/lib/supabase/database.types";
import { readUuid } from "@/lib/admin/ids";

const STATUSES = new Set<ContentStatus>(["draft", "published", "archived"]);
const TRACKS = new Set<TrackTag>(["all", "cybersecurity_grc", "privacy_ai"]);
const KINDS = new Set<ExperienceKind>([
  "employment",
  "consulting",
  "additional",
  "leadership",
]);
const INTENTS = new Set(["draft", "publish", "unpublish", "archive", "keep"]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PRECISIONS = new Set<ExperienceDatePrecision>(["month", "year"]);
const YEAR_MIN = 1900;
const YEAR_MAX = 2100;

const LIMITS = {
  organization: 160,
  title: 200,
  titleSecondary: 200,
  location: 120,
  summary: 2000,
  body: 2000,
  metricContext: 400,
  sortOrder: { min: 0, max: 9999 },
} as const;

export type ExperienceIntent =
  | "draft"
  | "publish"
  | "unpublish"
  | "archive"
  | "keep";

export type ParsedExperienceInput = {
  id: string | null;
  organization: string;
  title: string;
  titleSecondary: string | null;
  locationDisplay: string;
  kind: ExperienceKind;
  datePrecision: ExperienceDatePrecision;
  startDate: string | null;
  endDate: string | null;
  startYear: number | null;
  endYear: number | null;
  isCurrent: boolean;
  isFeatured: boolean;
  summary: string | null;
  sortOrder: number;
  intent: ExperienceIntent;
};

export type ParsedExperienceItemInput = {
  id: string | null;
  experienceId: string;
  body: string;
  track: TrackTag;
  isMetric: boolean;
  metricContext: string | null;
  showOnHome: boolean;
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

function parseDate(
  formData: FormData,
  name: string,
  label: string,
  required: boolean,
): ParseResult<string | null> {
  const raw = (readString(formData, name) ?? "").trim();

  if (!raw) {
    return required
      ? { ok: false, error: `${label} is required.` }
      : { ok: true, value: null };
  }

  if (!DATE_PATTERN.test(raw)) {
    return { ok: false, error: `${label} must be a valid date.` };
  }

  const date = new Date(`${raw}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== raw) {
    return { ok: false, error: `${label} must be a valid date.` };
  }

  return { ok: true, value: raw };
}

function parseYear(
  formData: FormData,
  name: string,
  label: string,
  required: boolean,
): ParseResult<number | null> {
  const raw = (readString(formData, name) ?? "").trim();

  if (!raw) {
    return required
      ? { ok: false, error: `${label} is required.` }
      : { ok: true, value: null };
  }

  const value = Number.parseInt(raw, 10);

  if (!Number.isInteger(value) || String(value) !== raw) {
    return { ok: false, error: `${label} must be a whole year.` };
  }

  if (value < YEAR_MIN || value > YEAR_MAX) {
    return { ok: false, error: `${label} is out of range.` };
  }

  return { ok: true, value };
}

function parseIntent(formData: FormData): ParseResult<ExperienceIntent> {
  const raw = (readString(formData, "intent") ?? "keep").trim();

  if (!INTENTS.has(raw)) {
    return { ok: false, error: "That save action is not allowed." };
  }

  return { ok: true, value: raw as ExperienceIntent };
}

export function statusFromIntent(
  intent: ExperienceIntent,
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

export function parseExperienceFormData(
  formData: FormData,
): ParseResult<ParsedExperienceInput> {
  const idRaw = readString(formData, "id");
  const id = idRaw && idRaw.length > 0 ? readUuid(idRaw) : null;

  if (idRaw && idRaw.length > 0 && !id) {
    return { ok: false, error: "That experience could not be saved." };
  }

  const organization = requiredText(
    formData,
    "organization",
    LIMITS.organization,
    "Organization",
  );
  if (!organization.ok) return organization;

  const title = requiredText(formData, "title", LIMITS.title, "Title");
  if (!title.ok) return title;

  const titleSecondary = optionalText(
    formData,
    "title_secondary",
    LIMITS.titleSecondary,
    "Secondary title",
  );
  if (!titleSecondary.ok) return titleSecondary;

  const locationDisplay = requiredText(
    formData,
    "location_display",
    LIMITS.location,
    "Location",
  );
  if (!locationDisplay.ok) return locationDisplay;

  const kindRaw = (readString(formData, "kind") ?? "").trim();

  if (!KINDS.has(kindRaw as ExperienceKind)) {
    return { ok: false, error: "Choose a valid experience type." };
  }

  const precisionRaw = (readString(formData, "date_precision") ?? "month").trim();

  if (!PRECISIONS.has(precisionRaw as ExperienceDatePrecision)) {
    return { ok: false, error: "Choose a valid date precision." };
  }

  const datePrecision = precisionRaw as ExperienceDatePrecision;
  const isCurrent = readString(formData, "is_current") === "on";

  let startDate: string | null = null;
  let endDate: string | null = null;
  let startYear: number | null = null;
  let endYear: number | null = null;

  if (datePrecision === "year") {
    const startDatePresent = (readString(formData, "start_date") ?? "").trim();
    const endDatePresent = (readString(formData, "end_date") ?? "").trim();

    if (startDatePresent || endDatePresent) {
      return {
        ok: false,
        error: "Year-only records cannot store a month or day.",
      };
    }

    const parsedStartYear = parseYear(formData, "start_year", "Start year", true);
    if (!parsedStartYear.ok) return parsedStartYear;

    const parsedEndYear = parseYear(
      formData,
      "end_year",
      "End year",
      !isCurrent,
    );
    if (!parsedEndYear.ok) return parsedEndYear;

    if (
      parsedStartYear.value != null &&
      parsedEndYear.value != null &&
      parsedEndYear.value < parsedStartYear.value
    ) {
      return { ok: false, error: "End year cannot be earlier than start year." };
    }

    startYear = parsedStartYear.value;
    endYear = parsedEndYear.value;
  } else {
    const parsedStartDate = parseDate(formData, "start_date", "Start date", true);
    if (!parsedStartDate.ok) return parsedStartDate;

    const parsedEndDate = parseDate(formData, "end_date", "End date", false);
    if (!parsedEndDate.ok) return parsedEndDate;

    if (
      parsedStartDate.value &&
      parsedEndDate.value &&
      parsedEndDate.value < parsedStartDate.value
    ) {
      return { ok: false, error: "End date cannot be earlier than start date." };
    }

    startDate = parsedStartDate.value;
    endDate = parsedEndDate.value;
  }

  const summary = optionalText(formData, "summary", LIMITS.summary, "Summary");
  if (!summary.ok) return summary;

  const sortOrder = parseSortOrder(formData);
  if (!sortOrder.ok) return sortOrder;

  const intent = parseIntent(formData);
  if (!intent.ok) return intent;

  return {
    ok: true,
    value: {
      id,
      organization: organization.value,
      title: title.value,
      titleSecondary: titleSecondary.value,
      locationDisplay: locationDisplay.value,
      kind: kindRaw as ExperienceKind,
      datePrecision,
      startDate,
      endDate,
      startYear,
      endYear,
      isCurrent,
      isFeatured: readString(formData, "is_featured") === "on",
      summary: summary.value,
      sortOrder: sortOrder.value,
      intent: intent.value,
    },
  };
}

export function parseExperienceItemFormData(
  formData: FormData,
): ParseResult<ParsedExperienceItemInput> {
  const experienceId = readUuid(readString(formData, "experience_id"));

  if (!experienceId) {
    return { ok: false, error: "That item could not be saved." };
  }

  const idRaw = readString(formData, "id");
  const id = idRaw && idRaw.length > 0 ? readUuid(idRaw) : null;

  if (idRaw && idRaw.length > 0 && !id) {
    return { ok: false, error: "That item could not be saved." };
  }

  const body = requiredText(formData, "body", LIMITS.body, "Item text");
  if (!body.ok) return body;

  const trackRaw = (readString(formData, "track") ?? "all").trim();

  if (!TRACKS.has(trackRaw as TrackTag)) {
    return { ok: false, error: "Choose a valid career track." };
  }

  const statusRaw = (readString(formData, "status") ?? "draft").trim();

  if (!STATUSES.has(statusRaw as ContentStatus)) {
    return { ok: false, error: "Choose a valid item status." };
  }

  const isMetric = readString(formData, "is_metric") === "on";
  const metricContext = optionalText(
    formData,
    "metric_context",
    LIMITS.metricContext,
    "Metric context",
  );
  if (!metricContext.ok) return metricContext;

  if (isMetric && !metricContext.value) {
    return { ok: false, error: "Metric items need a metric context." };
  }

  const sortOrder = parseSortOrder(formData);
  if (!sortOrder.ok) return sortOrder;

  return {
    ok: true,
    value: {
      id,
      experienceId,
      body: body.value,
      track: trackRaw as TrackTag,
      isMetric,
      metricContext: isMetric ? metricContext.value : null,
      showOnHome: readString(formData, "show_on_home") === "on",
      status: statusRaw as ContentStatus,
      sortOrder: sortOrder.value,
    },
  };
}

export function parseOwnedItemRef(
  formData: FormData,
): ParseResult<{ experienceId: string; itemId: string }> {
  const experienceId = readUuid(readString(formData, "experience_id"));
  const itemId = readUuid(
    readString(formData, "item_id") ?? readString(formData, "id"),
  );

  if (!experienceId || !itemId) {
    return { ok: false, error: "That item could not be updated." };
  }

  return { ok: true, value: { experienceId, itemId } };
}
