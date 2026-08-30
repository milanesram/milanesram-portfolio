import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ContentStatus,
  ExperienceKind,
  TrackTag,
} from "@/lib/supabase/database.types";
import { isUuid } from "@/lib/admin/ids";

/**
 * Public experience reads from Supabase.
 *
 * Cutover: do not use these from `src/app/experience/**` until an explicit
 * content step loads reviewed experience rows. Public pages still render from
 * `src/content/experiences.ts`.
 */

export type PublishedExperienceItem = {
  id: string;
  body: string;
  track: TrackTag;
  isMetric: boolean;
  metricContext: string | null;
  showOnHome: boolean;
  sortOrder: number;
};

export type PublishedExperience = {
  id: string;
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

function isPublishedStatus(status: ContentStatus): boolean {
  return status === "published";
}

function mapExperience(
  row: {
    id: string;
    organization: string;
    title: string;
    title_secondary: string | null;
    location_display: string;
    kind: ExperienceKind;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    is_featured: boolean;
    summary: string | null;
    sort_order: number;
  },
  items: PublishedExperienceItem[],
): PublishedExperience {
  return {
    id: row.id,
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
    items,
  };
}

export async function getPublishedExperiences(): Promise<PublishedExperience[]> {
  const supabase = await createSupabaseServerClient();
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
    return [];
  }

  const published = data.filter((row) => isPublishedStatus(row.status));

  if (published.length === 0) {
    return [];
  }

  const { data: items, error: itemError } = await supabase
    .from("experience_items")
    .select(
      "id, experience_id, body, track, is_metric, metric_context, show_on_home, status, sort_order",
    )
    .in(
      "experience_id",
      published.map((row) => row.id),
    )
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (itemError) {
    return [];
  }

  const itemsByExperience = new Map<string, PublishedExperienceItem[]>();

  for (const item of items ?? []) {
    if (!isPublishedStatus(item.status)) {
      continue;
    }

    const list = itemsByExperience.get(item.experience_id) ?? [];
    list.push({
      id: item.id,
      body: item.body,
      track: item.track,
      isMetric: item.is_metric,
      metricContext: item.metric_context,
      showOnHome: item.show_on_home,
      sortOrder: item.sort_order,
    });
    itemsByExperience.set(item.experience_id, list);
  }

  return published.map((row) =>
    mapExperience(row, itemsByExperience.get(row.id) ?? []),
  );
}

export async function getPublishedExperienceById(
  id: string,
): Promise<PublishedExperience | null> {
  if (!isUuid(id)) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data: experience, error } = await supabase
    .from("experiences")
    .select(
      "id, organization, title, title_secondary, location_display, kind, start_date, end_date, is_current, is_featured, summary, status, sort_order",
    )
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error || !experience || !isPublishedStatus(experience.status)) {
    return null;
  }

  const { data: items, error: itemError } = await supabase
    .from("experience_items")
    .select(
      "id, body, track, is_metric, metric_context, show_on_home, status, sort_order",
    )
    .eq("experience_id", experience.id)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (itemError) {
    return null;
  }

  return mapExperience(
    experience,
    (items ?? [])
      .filter((item) => isPublishedStatus(item.status))
      .map((item) => ({
        id: item.id,
        body: item.body,
        track: item.track,
        isMetric: item.is_metric,
        metricContext: item.metric_context,
        showOnHome: item.show_on_home,
        sortOrder: item.sort_order,
      })),
  );
}
