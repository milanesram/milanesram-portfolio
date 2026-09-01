import { cache } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import {
  interpretPublishedSiteProfileResponse,
  type PublicSiteProfile,
  type PublishedSiteProfileResult,
} from "@/lib/content/site-profile";

/**
 * Public site-profile reads from hosted `site_profile`.
 *
 * Uses the anonymous publishable client. RLS remains the publication
 * boundary. `{ ok: false }` is a transport/query failure. A missing or
 * unpublished row is `{ ok: true, profile: null }`.
 *
 * Wrapped in `React.cache()` so layout chrome, metadata, and page
 * consumers share one query per request.
 */

export type { PublicSiteProfile, PublishedSiteProfileResult };

const PROFILE_COLUMNS =
  "display_name, headline, summary, work_authorization, linkedin_url, public_email, status";

async function loadPublishedSiteProfile(): Promise<PublishedSiteProfileResult> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("site_profile")
    .select(PROFILE_COLUMNS)
    .eq("singleton_key", "default")
    .eq("status", "published")
    .maybeSingle();

  return interpretPublishedSiteProfileResponse({
    error,
    data,
  });
}

export const getPublishedSiteProfile = cache(loadPublishedSiteProfile);
