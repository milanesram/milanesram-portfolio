import { cache } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import {
  interpretPublishedExperiencesResponse,
  toPublicExperiences,
  type PublishedExperienceItemRow,
  type PublishedExperienceRow,
  type PublishedExperiencesResult,
} from "@/lib/content/experience-page";

/**
 * Public Experience reads hosted `experiences` and `experience_items` only.
 *
 * Year-only records use `date_precision = year` and never store fabricated
 * month/day values. Home and Focus keep their own UUID relationship
 * accessors. There is no static career-content fallback.
 */

export type { PublishedExperiencesResult };

const EXPERIENCE_COLUMNS =
  "id, organization, title, title_secondary, location_display, kind, start_date, end_date, date_precision, start_year, end_year, is_current, is_featured, summary, status, sort_order";

const ITEM_COLUMNS =
  "id, experience_id, body, track, is_metric, metric_context, status, sort_order";

async function loadPublishedExperiences(): Promise<PublishedExperiencesResult> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("experiences")
    .select(EXPERIENCE_COLUMNS)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("organization", { ascending: true });

  const interpreted = interpretPublishedExperiencesResponse({
    error,
    data: (data ?? null) as PublishedExperienceRow[] | null,
  });

  if (!interpreted.ok) {
    return { ok: false };
  }

  if (interpreted.rows.length === 0) {
    return { ok: true, experiences: [] };
  }

  const parentIds = interpreted.rows.map((row) => row.id);
  const { data: items, error: itemError } = await supabase
    .from("experience_items")
    .select(ITEM_COLUMNS)
    .in("experience_id", parentIds)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (itemError) {
    return { ok: false };
  }

  return {
    ok: true,
    experiences: toPublicExperiences(
      interpreted.rows,
      (items ?? []) as PublishedExperienceItemRow[],
    ),
  };
}

export const getPublishedExperiences = cache(loadPublishedExperiences);
