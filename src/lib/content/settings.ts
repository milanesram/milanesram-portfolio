import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Public site-settings reads from Supabase.
 *
 * `site_settings` is intentionally fully public website flags. RLS SELECT
 * is `USING (true)` because every column is safe to expose. Never store
 * secrets or unpublished values in this table.
 *
 * `/contact` may read `contactFormEnabled` for form activation only.
 * Submission still requires the server-only `CONTACT_INTAKE_ENABLED`
 * gate and secrets. `robots.ts` reads `site_indexable`.
 */

export type PublicSiteSettings = {
  contactFormEnabled: boolean;
  siteIndexable: boolean;
};

const SETTINGS_COLUMNS = "contact_form_enabled, site_indexable";

export async function getPublicSiteSettings(): Promise<PublicSiteSettings | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select(SETTINGS_COLUMNS)
    .eq("singleton_key", "default")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    contactFormEnabled: data.contact_form_enabled,
    siteIndexable: data.site_indexable,
  };
}
