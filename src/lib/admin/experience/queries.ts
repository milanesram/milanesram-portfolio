import type { AdminClient } from "@/lib/admin/authorization";
import type {
  ContentStatus,
  ExperienceDatePrecision,
  ExperienceKind,
  TrackTag,
} from "@/lib/supabase/database.types";

export type AdminExperience = {
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
  updated_at: string;
};

export type AdminExperienceItem = {
  id: string;
  experience_id: string;
  body: string;
  track: TrackTag;
  is_metric: boolean;
  metric_context: string | null;
  show_on_home: boolean;
  status: ContentStatus;
  sort_order: number;
};

const EXPERIENCE_COLUMNS =
  "id, organization, title, title_secondary, location_display, kind, start_date, end_date, date_precision, start_year, end_year, is_current, is_featured, summary, status, sort_order, updated_at";

const ITEM_COLUMNS =
  "id, experience_id, body, track, is_metric, metric_context, show_on_home, status, sort_order";

export async function listAdminExperiences(supabase: AdminClient) {
  return supabase
    .from("experiences")
    .select(EXPERIENCE_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("start_date", { ascending: false })
    .order("organization", { ascending: true });
}

export async function getAdminExperience(supabase: AdminClient, id: string) {
  return supabase
    .from("experiences")
    .select(EXPERIENCE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
}

export async function listAdminExperienceItems(
  supabase: AdminClient,
  experienceId: string,
) {
  return supabase
    .from("experience_items")
    .select(ITEM_COLUMNS)
    .eq("experience_id", experienceId)
    .order("sort_order", { ascending: true })
    .order("body", { ascending: true });
}

export async function getAdminExperienceItem(
  supabase: AdminClient,
  itemId: string,
) {
  return supabase
    .from("experience_items")
    .select(ITEM_COLUMNS)
    .eq("id", itemId)
    .maybeSingle();
}
