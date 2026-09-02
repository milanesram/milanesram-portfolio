import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentStatus, Database } from "@/lib/supabase/database.types";

type AdminClient = SupabaseClient<Database>;

export const CONTACT_PAGE_SINGLETON_KEY = "default";

export type AdminContactPage = {
  id: string;
  status: ContentStatus;
  kicker: string;
  headline: string;
  lede: string;
  email_enabled: boolean;
  linkedin_enabled: boolean;
  email_label: string;
  linkedin_label: string;
  form_intro: string;
  cta_heading: string;
  cta_lede: string;
  updated_at: string;
};

const CONTACT_COLUMNS =
  "id, status, kicker, headline, lede, email_enabled, linkedin_enabled, email_label, linkedin_label, form_intro, cta_heading, cta_lede, updated_at";

export async function getAdminContactPage(client: AdminClient) {
  return client
    .from("contact_page")
    .select(CONTACT_COLUMNS)
    .eq("singleton_key", CONTACT_PAGE_SINGLETON_KEY)
    .maybeSingle();
}

export async function getAdminContactFormFlag(client: AdminClient) {
  return client
    .from("site_settings")
    .select("contact_form_enabled")
    .eq("singleton_key", "default")
    .maybeSingle();
}
