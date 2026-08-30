import type { AdminClient } from "@/lib/admin/authorization";
import type { ContentStatus } from "@/lib/supabase/database.types";

export type AdminSiteProfile = {
  id: string;
  display_name: string;
  headline: string;
  summary: string;
  work_authorization: string;
  location_display: string | null;
  linkedin_url: string;
  public_email: string;
  hero_cta_primary_label: string | null;
  status: ContentStatus;
  updated_at: string;
};

export type AdminSiteSettings = {
  id: string;
  contact_form_enabled: boolean;
  site_indexable: boolean;
  updated_at: string;
};

const PROFILE_COLUMNS =
  "id, display_name, headline, summary, work_authorization, location_display, linkedin_url, public_email, hero_cta_primary_label, status, updated_at";

const SETTINGS_COLUMNS =
  "id, contact_form_enabled, site_indexable, updated_at";

export const SETTINGS_SINGLETON_KEY = "default" as const;

export async function getAdminSiteProfile(supabase: AdminClient) {
  return supabase
    .from("site_profile")
    .select(PROFILE_COLUMNS)
    .eq("singleton_key", SETTINGS_SINGLETON_KEY)
    .maybeSingle();
}

export async function getAdminSiteSettings(supabase: AdminClient) {
  return supabase
    .from("site_settings")
    .select(SETTINGS_COLUMNS)
    .eq("singleton_key", SETTINGS_SINGLETON_KEY)
    .maybeSingle();
}
