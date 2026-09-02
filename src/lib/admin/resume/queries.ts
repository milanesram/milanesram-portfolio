import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ContentStatus,
  Database,
  ResumeDeliveryMode,
} from "@/lib/supabase/database.types";

type AdminClient = SupabaseClient<Database>;

export const RESUME_PAGE_SINGLETON_KEY = "default";

export type AdminResumePage = {
  id: string;
  status: ContentStatus;
  kicker: string;
  headline: string;
  lede: string;
  request_intro: string;
  request_footnote: string;
  closing_heading: string;
  closing_lede: string;
  updated_at: string;
};

export type AdminResumeTrack = {
  id: string;
  slug: string;
  focus_page_id: string | null;
  title: string;
  summary: string;
  delivery_mode: ResumeDeliveryMode;
  media_asset_id: string | null;
  request_cta_label: string;
  home_kicker: string | null;
  sort_order: number;
  status: ContentStatus;
  updated_at: string;
};

export type AdminFocusChoice = {
  id: string;
  slug: string;
  nav_label: string;
  status: ContentStatus;
};

export type AdminResumeMediaChoice = {
  id: string;
  title: string;
  status: ContentStatus;
  is_public: boolean;
  mime_type: string | null;
  kind: string;
  purpose: string | null;
};

const PAGE_COLUMNS =
  "id, status, kicker, headline, lede, request_intro, request_footnote, closing_heading, closing_lede, updated_at";

const TRACK_COLUMNS =
  "id, slug, focus_page_id, title, summary, delivery_mode, media_asset_id, request_cta_label, home_kicker, sort_order, status, updated_at";

export async function getAdminResumePage(client: AdminClient) {
  return client
    .from("resume_page")
    .select(PAGE_COLUMNS)
    .eq("singleton_key", RESUME_PAGE_SINGLETON_KEY)
    .maybeSingle();
}

export async function listAdminResumeTracks(client: AdminClient) {
  return client
    .from("resume_tracks")
    .select(TRACK_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });
}

export async function getAdminResumeTrack(client: AdminClient, id: string) {
  return client.from("resume_tracks").select(TRACK_COLUMNS).eq("id", id).maybeSingle();
}

export async function listAdminFocusChoices(client: AdminClient) {
  return client
    .from("focus_pages")
    .select("id, slug, nav_label, status")
    .order("sort_order", { ascending: true });
}

export async function listAdminResumeMediaChoices(client: AdminClient) {
  return client
    .from("media_assets")
    .select("id, title, status, is_public, mime_type, kind, purpose")
    .eq("purpose", "resume")
    .order("title", { ascending: true });
}
