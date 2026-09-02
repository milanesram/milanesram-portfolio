import type { AdminClient } from "@/lib/admin/authorization";
import type { ContentStatus, MediaKind } from "@/lib/supabase/database.types";

export type AdminJourneyMilestone = {
  id: string;
  title: string;
  year: number | null;
  caption: string;
  media_asset_id: string | null;
  sort_order: number;
  status: ContentStatus;
  updated_at: string;
};

export type AdminJourneyMediaChoice = {
  id: string;
  title: string;
  status: ContentStatus;
  is_public: boolean;
  kind: MediaKind;
  alt_text: string | null;
  mime_type: string | null;
};

export async function listAdminJourneyMilestones(supabase: AdminClient) {
  return supabase
    .from("journey_milestones")
    .select(
      "id, title, year, caption, media_asset_id, sort_order, status, updated_at",
    )
    .order("sort_order", { ascending: true });
}

export async function getAdminJourneyMilestone(
  supabase: AdminClient,
  id: string,
) {
  return supabase
    .from("journey_milestones")
    .select(
      "id, title, year, caption, media_asset_id, sort_order, status, updated_at",
    )
    .eq("id", id)
    .maybeSingle();
}

export async function listAdminJourneyMediaChoices(supabase: AdminClient) {
  return supabase
    .from("media_assets")
    .select("id, title, status, is_public, kind, alt_text, mime_type")
    .eq("kind", "image")
    .order("title", { ascending: true });
}

export async function getAdminJourneyMediaChoice(
  supabase: AdminClient,
  id: string,
) {
  return supabase
    .from("media_assets")
    .select("id, title, status, is_public, kind, alt_text, mime_type")
    .eq("id", id)
    .maybeSingle();
}
