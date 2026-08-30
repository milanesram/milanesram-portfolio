import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentStatus } from "@/lib/supabase/database.types";

/**
 * Public site-profile reads from Supabase.
 *
 * Cutover: do not use this from Home, About, header, or footer until an
 * explicit content step loads a reviewed published row. Public pages still
 * render from `src/content/site.ts`.
 *
 * Returns published public chrome only. Omits `singleton_key` and
 * timestamps. Never returns owner Auth email or `user_roles` data.
 */

export type PublishedSiteProfile = {
  displayName: string;
  headline: string;
  summary: string;
  workAuthorization: string;
  locationDisplay: string | null;
  linkedinUrl: string;
  publicEmail: string;
  heroCtaPrimaryLabel: string | null;
};

function isPublishedStatus(status: ContentStatus): boolean {
  return status === "published";
}

const PROFILE_COLUMNS =
  "display_name, headline, summary, work_authorization, location_display, linkedin_url, public_email, hero_cta_primary_label, status";

export async function getPublishedSiteProfile(): Promise<PublishedSiteProfile | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_profile")
    .select(PROFILE_COLUMNS)
    .eq("singleton_key", "default")
    .eq("status", "published")
    .maybeSingle();

  if (error || !data || !isPublishedStatus(data.status)) {
    return null;
  }

  return {
    displayName: data.display_name,
    headline: data.headline,
    summary: data.summary,
    workAuthorization: data.work_authorization,
    locationDisplay: data.location_display,
    linkedinUrl: data.linkedin_url,
    publicEmail: data.public_email,
    heroCtaPrimaryLabel: data.hero_cta_primary_label,
  };
}
