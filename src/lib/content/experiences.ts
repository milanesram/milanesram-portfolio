import type { Experience, ExperienceBullet, TrackId } from "@/content/types";
import { experiences as staticExperiences } from "@/content/experiences";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type {
  ContentStatus,
  ExperienceKind,
  TrackTag,
} from "@/lib/supabase/database.types";

/**
 * Public experience reads from Supabase, plus the static Scionetrade hold.
 *
 * `/experience` reads published parents and children through the anonymous
 * publishable client, then merges only the existing static Scionetrade
 * record. RLS remains the publication boundary. Home and FocusView still
 * read `src/content/experiences.ts`.
 */

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

const SCIONETRADE_ID = "scionetrade";

export type PublishedExperienceItem = {
  body: string;
  track: TrackTag;
  isMetric: boolean;
  metricContext: string | null;
  showOnHome: boolean;
  sortOrder: number;
};

export type PublishedExperience = {
  organization: string;
  title: string;
  titleSecondary: string | null;
  locationDisplay: string;
  kind: ExperienceKind;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  featured: boolean;
  summary: string | null;
  sortOrder: number;
  items: PublishedExperienceItem[];
};

export type HybridExperiencesResult =
  | {
      ok: true;
      experiences: Experience[];
      hostedParentCount: number;
      hostedItemCount: number;
    }
  | { ok: false };

function isPublishedStatus(status: ContentStatus): boolean {
  return status === "published";
}

function formatMonthYear(isoDate: string): string {
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

function toPresentationTracks(track: TrackTag): Array<TrackId | "all"> {
  if (track === "cybersecurity_grc") {
    return ["cyber"];
  }

  if (track === "privacy_ai") {
    return ["privacy"];
  }

  return ["all"];
}

function presentationId(organization: string, title: string): string {
  const match = staticExperiences.find(
    (item) => item.organization === organization && item.title === title,
  );

  if (match) {
    return match.id;
  }

  return `${organization}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getStaticScionetrade(): Experience | null {
  return staticExperiences.find((item) => item.id === SCIONETRADE_ID) ?? null;
}

export function toPresentationExperience(
  experience: PublishedExperience,
): Experience {
  return {
    id: presentationId(experience.organization, experience.title),
    organization: experience.organization,
    title: experience.title,
    ...(experience.titleSecondary
      ? { titleSecondary: experience.titleSecondary }
      : {}),
    location: experience.locationDisplay,
    kind: experience.kind,
    startLabel: formatMonthYear(experience.startDate),
    endLabel:
      experience.isCurrent || !experience.endDate
        ? "Present"
        : formatMonthYear(experience.endDate),
    ...(experience.isCurrent ? { isCurrent: true } : {}),
    ...(experience.summary ? { summary: experience.summary } : {}),
    featuredOnHome: experience.featured,
    tracks: ["all"],
    bullets: experience.items.map(
      (item): ExperienceBullet => ({
        body: item.body,
        tracks: toPresentationTracks(item.track),
      }),
    ),
  };
}

function mergeWithScionetrade(hosted: Experience[]): Experience[] | null {
  const scionetrade = getStaticScionetrade();

  if (!scionetrade) {
    return null;
  }

  const hostedByKey = new Map(
    hosted.map((item) => [`${item.organization}::${item.title}`, item]),
  );
  const merged: Experience[] = [];
  const used = new Set<string>();

  for (const staticExperience of staticExperiences) {
    if (staticExperience.id === SCIONETRADE_ID) {
      merged.push(scionetrade);
      continue;
    }

    const key = `${staticExperience.organization}::${staticExperience.title}`;
    const hostedExperience = hostedByKey.get(key);

    if (hostedExperience) {
      merged.push(hostedExperience);
      used.add(key);
    }
  }

  if (used.size !== hosted.length) {
    return null;
  }

  return merged;
}

export async function getHybridPublicExperiences(): Promise<HybridExperiencesResult> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("experiences")
    .select(
      "id, organization, title, title_secondary, location_display, kind, start_date, end_date, is_current, is_featured, summary, status, sort_order",
    )
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("start_date", { ascending: false })
    .order("organization", { ascending: true });

  if (error || !data) {
    return { ok: false };
  }

  const published = data.filter((row) => isPublishedStatus(row.status));

  if (published.length === 0) {
    return {
      ok: true,
      experiences: [],
      hostedParentCount: 0,
      hostedItemCount: 0,
    };
  }

  const parentIds = published.map((row) => row.id);
  const { data: items, error: itemError } = await supabase
    .from("experience_items")
    .select(
      "id, experience_id, body, track, is_metric, metric_context, show_on_home, status, sort_order",
    )
    .in("experience_id", parentIds)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (itemError) {
    return { ok: false };
  }

  const itemsByExperience = new Map<string, PublishedExperienceItem[]>();
  const parentIdSet = new Set(parentIds);

  for (const item of items ?? []) {
    if (!isPublishedStatus(item.status) || !parentIdSet.has(item.experience_id)) {
      continue;
    }

    const list = itemsByExperience.get(item.experience_id) ?? [];
    list.push({
      body: item.body,
      track: item.track,
      isMetric: item.is_metric,
      metricContext: item.metric_context,
      showOnHome: item.show_on_home,
      sortOrder: item.sort_order,
    });
    itemsByExperience.set(item.experience_id, list);
  }

  const hosted = published.map((row) =>
    toPresentationExperience({
      organization: row.organization,
      title: row.title,
      titleSecondary: row.title_secondary,
      locationDisplay: row.location_display,
      kind: row.kind,
      startDate: row.start_date,
      endDate: row.end_date,
      isCurrent: row.is_current,
      featured: row.is_featured,
      summary: row.summary,
      sortOrder: row.sort_order,
      items: itemsByExperience.get(row.id) ?? [],
    }),
  );

  const merged = mergeWithScionetrade(hosted);

  if (!merged) {
    return { ok: false };
  }

  const hostedItemCount = hosted.reduce(
    (total, experience) => total + experience.bullets.length,
    0,
  );

  return {
    ok: true,
    experiences: merged,
    hostedParentCount: hosted.length,
    hostedItemCount,
  };
}
