import { cache } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import {
  interpretPublishedHomePageResponse,
  toPublicHomePage,
  type HomeCredentialRecord,
  type HomeExperienceItemRecord,
  type HomeExperienceParentRecord,
  type HomeProjectRecord,
  type PublishedHomePageResult,
} from "@/lib/content/home-page";

/**
 * Public Home reads from hosted `home_page` and UUID relationships.
 *
 * Focus track cards consume hosted Focus records via
 * `getPublishedFocusPages()`. Home editorial copy stays on `home_page`.
 */

export type { PublishedHomePageResult };

export const HOME_PAGE_SINGLETON_KEY = "default" as const;

const HOME_COLUMNS =
  "id, status, featured_project_id, headline, lede, primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href, project_kicker, project_heading, project_problem, project_body, project_cta_label, project_cta_href, project_proof_points, experience_kicker, experience_heading, experience_lede, experience_cta_label, experience_cta_href, credentials_kicker, credentials_heading, credentials_lede, credentials_cta_label, credentials_cta_href, focus_kicker, focus_heading, focus_lede, closing_heading, closing_body, closing_primary_cta_label, closing_primary_cta_href, closing_secondary_cta_label, closing_secondary_cta_href";

async function loadPublishedHomePage(): Promise<PublishedHomePageResult> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("home_page")
    .select(
      `${HOME_COLUMNS}, chips:home_page_chips(id, label, sort_order), proof:home_proof_items(id, label, supporting, href, credential_id, project_id, sort_order), experience_links:home_experience_items(experience_item_id, sort_order), credential_links:home_credentials(credential_id, sort_order)`,
    )
    .eq("singleton_key", HOME_PAGE_SINGLETON_KEY)
    .eq("status", "published")
    .maybeSingle();

  const interpreted = interpretPublishedHomePageResponse({
    error,
    data: data ?? null,
  });

  if (!interpreted.ok) {
    return { ok: false };
  }

  if (!interpreted.row) {
    return { ok: true, page: null };
  }

  const home = interpreted.row;
  const embedded = data as typeof data & {
    chips?: { id: string; label: string; sort_order: number }[];
    proof?: {
      id: string;
      label: string;
      supporting: string;
      href: string | null;
      credential_id: string | null;
      project_id: string | null;
      sort_order: number;
    }[];
    experience_links?: { experience_item_id: string; sort_order: number }[];
    credential_links?: { credential_id: string; sort_order: number }[];
  };
  const chips = embedded.chips ?? [];
  const proofItems = embedded.proof ?? [];
  const experienceLinks = embedded.experience_links ?? [];
  const credentialLinks = embedded.credential_links ?? [];
  const experienceItemIds = experienceLinks.map((row) => row.experience_item_id);
  const credentialIds = credentialLinks.map((row) => row.credential_id);

  const [itemsResult, credentialsResult, projectResult] = await Promise.all([
    experienceItemIds.length > 0
      ? supabase
          .from("experience_items")
          .select(
            "id, experience_id, body, status, track, parent:experiences(id, organization, title, title_secondary, location_display, kind, start_date, end_date, date_precision, start_year, end_year, is_current, status)",
          )
          .in("id", experienceItemIds)
          .eq("status", "published")
      : Promise.resolve({ data: [], error: null }),
    credentialIds.length > 0
      ? supabase
          .from("credentials")
          .select(
            "id, kind, name, issuer, year_label, details, track, highlight, status, needs_verification",
          )
          .in("id", credentialIds)
          .eq("status", "published")
          .eq("needs_verification", false)
      : Promise.resolve({ data: [], error: null }),
    home.featured_project_id
      ? supabase
          .from("projects")
          .select(
            "id, slug, name, tagline, year_label, role, summary, limits, stack, is_featured, status",
          )
          .eq("id", home.featured_project_id)
          .eq("status", "published")
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (itemsResult.error || credentialsResult.error || projectResult.error) {
    return { ok: false };
  }

  const experienceItems: HomeExperienceItemRecord[] = [];
  const parentsById = new Map<string, HomeExperienceParentRecord>();

  for (const row of itemsResult.data ?? []) {
    const { parent, ...item } = row as HomeExperienceItemRecord & {
      parent: HomeExperienceParentRecord | HomeExperienceParentRecord[] | null;
    };
    experienceItems.push(item);
    const resolved = Array.isArray(parent) ? parent[0] : parent;
    if (resolved) {
      parentsById.set(resolved.id, resolved);
    }
  }

  return {
    ok: true,
    page: toPublicHomePage({
      row: home,
      chips,
      proofItems,
      experienceLinks,
      experienceItems,
      experienceParents: [...parentsById.values()],
      credentialLinks,
      credentials: (credentialsResult.data ?? []) as HomeCredentialRecord[],
      featuredProject: (projectResult.data ?? null) as HomeProjectRecord | null,
    }),
  };
}

export const getPublishedHomePage = cache(loadPublishedHomePage);
