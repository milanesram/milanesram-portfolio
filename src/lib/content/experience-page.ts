import type { Experience, ExperienceBullet, TrackId } from "@/content/types";
import type {
  ContentStatus,
  ExperienceDatePrecision,
  ExperienceKind,
  TrackTag,
} from "@/lib/supabase/database.types";

export type PublishedExperienceItemRow = {
  id: string;
  experience_id: string;
  body: string;
  track: TrackTag;
  is_metric: boolean;
  metric_context: string | null;
  status: ContentStatus;
  sort_order: number;
};

export type PublishedExperienceRow = {
  id: string;
  organization: string;
  title: string;
  title_secondary: string | null;
  location_display: string;
  kind: ExperienceKind;
  start_date: string | null;
  end_date: string | null;
  date_precision: ExperienceDatePrecision;
  start_year: number | null;
  end_year: number | null;
  is_current: boolean;
  is_featured: boolean;
  summary: string | null;
  status: ContentStatus;
  sort_order: number;
};

export type ExperienceDateFields = {
  date_precision?: ExperienceDatePrecision | null;
  start_date: string | null;
  end_date: string | null;
  start_year?: number | null;
  end_year?: number | null;
  is_current: boolean;
};

export type PublishedExperiencesResult =
  | { ok: true; experiences: Experience[] }
  | { ok: false };

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function isPublishedStatus(status: ContentStatus): boolean {
  return status === "published";
}

export function formatMonthYear(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-\d{2}/.exec(isoDate);

  if (!match) {
    return isoDate;
  }

  const month = MONTH_LABELS[Number(match[2]) - 1];

  if (!month) {
    return isoDate;
  }

  return `${month} ${match[1]}`;
}

export function formatExperienceDateRange(row: ExperienceDateFields): {
  startLabel: string;
  endLabel: string;
} {
  const precision = row.date_precision ?? "month";

  if (precision === "year") {
    return {
      startLabel: row.start_year == null ? "" : String(row.start_year),
      endLabel:
        row.is_current || row.end_year == null
          ? "Present"
          : String(row.end_year),
    };
  }

  return {
    startLabel: row.start_date ? formatMonthYear(row.start_date) : "",
    endLabel:
      row.is_current || !row.end_date
        ? "Present"
        : formatMonthYear(row.end_date),
  };
}

export function toPresentationTracks(track: TrackTag): Array<TrackId | "all"> {
  if (track === "cybersecurity_grc") {
    return ["cyber"];
  }

  if (track === "privacy_ai") {
    return ["privacy"];
  }

  return ["all"];
}

export function bulletsForTrack(
  experience: Experience,
  track?: "cyber" | "privacy",
) {
  if (!track) {
    return experience.bullets.filter((bullet) => bullet.tracks.includes("all"));
  }

  return experience.bullets.filter(
    (bullet) =>
      bullet.tracks.includes(track) || bullet.tracks.includes("all"),
  );
}

export function interpretPublishedExperiencesResponse(args: {
  error: { message: string } | null;
  data: PublishedExperienceRow[] | null;
}): { ok: true; rows: PublishedExperienceRow[] } | { ok: false } {
  if (args.error || !args.data) {
    return { ok: false };
  }

  return {
    ok: true,
    rows: args.data.filter((row) => isPublishedStatus(row.status)),
  };
}

export function toPublicExperience(
  row: PublishedExperienceRow,
  items: PublishedExperienceItemRow[],
): Experience {
  const dates = formatExperienceDateRange(row);
  const bullets: ExperienceBullet[] = [...items]
    .filter((item) => isPublishedStatus(item.status))
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((item) => ({
      body: item.body,
      tracks: toPresentationTracks(item.track),
    }));

  return {
    id: row.id,
    organization: row.organization,
    title: row.title,
    ...(row.title_secondary ? { titleSecondary: row.title_secondary } : {}),
    location: row.location_display,
    kind: row.kind,
    startLabel: dates.startLabel,
    endLabel: dates.endLabel,
    ...(row.is_current ? { isCurrent: true } : {}),
    ...(row.summary ? { summary: row.summary } : {}),
    featuredOnHome: row.is_featured,
    tracks: ["all"],
    bullets,
  };
}

export function toPublicExperiences(
  rows: PublishedExperienceRow[],
  items: PublishedExperienceItemRow[],
): Experience[] {
  const itemsByExperience = new Map<string, PublishedExperienceItemRow[]>();

  for (const item of items) {
    if (!isPublishedStatus(item.status)) {
      continue;
    }

    const list = itemsByExperience.get(item.experience_id) ?? [];
    list.push(item);
    itemsByExperience.set(item.experience_id, list);
  }

  return [...rows]
    .filter((row) => isPublishedStatus(row.status))
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((row) => toPublicExperience(row, itemsByExperience.get(row.id) ?? []));
}
