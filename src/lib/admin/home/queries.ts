import type { AdminClient } from "@/lib/admin/authorization";
import type { ContentStatus } from "@/lib/supabase/database.types";

export const HOME_PAGE_SINGLETON_KEY = "default" as const;

export type AdminHomePage = {
  id: string;
  status: ContentStatus;
  featured_project_id: string | null;
  headline: string;
  lede: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string;
  secondary_cta_href: string;
  project_kicker: string;
  project_heading: string;
  project_problem: string;
  project_body: string;
  project_cta_label: string;
  project_cta_href: string;
  project_proof_points: string[];
  experience_kicker: string;
  experience_heading: string;
  experience_lede: string;
  experience_cta_label: string;
  experience_cta_href: string;
  credentials_kicker: string;
  credentials_heading: string;
  credentials_lede: string;
  credentials_cta_label: string;
  credentials_cta_href: string;
  focus_kicker: string;
  focus_heading: string;
  focus_lede: string;
  closing_heading: string;
  closing_body: string;
  closing_primary_cta_label: string;
  closing_primary_cta_href: string;
  closing_secondary_cta_label: string;
  closing_secondary_cta_href: string;
  seo_title: string;
  seo_description: string;
  updated_at: string;
};

export type AdminHomeChip = {
  id: string;
  label: string;
  sort_order: number;
};

export type AdminHomeProofItem = {
  id: string;
  label: string;
  supporting: string;
  href: string | null;
  credential_id: string | null;
  project_id: string | null;
  sort_order: number;
};

export type AdminHomeExperienceLink = {
  id: string;
  experience_item_id: string;
  sort_order: number;
};

export type AdminHomeCredentialLink = {
  id: string;
  credential_id: string;
  sort_order: number;
};

export type AdminHomePickerItem = {
  id: string;
  organization: string;
  title: string;
  excerpt: string;
  status: ContentStatus;
};

export type AdminHomePickerCredential = {
  id: string;
  name: string;
  issuer: string;
  year_label: string | null;
  status: ContentStatus;
  needs_verification: boolean;
};

export type AdminHomePickerProject = {
  id: string;
  name: string;
  slug: string;
  status: ContentStatus;
};

const HOME_COLUMNS =
  "id, status, featured_project_id, headline, lede, primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href, project_kicker, project_heading, project_problem, project_body, project_cta_label, project_cta_href, project_proof_points, experience_kicker, experience_heading, experience_lede, experience_cta_label, experience_cta_href, credentials_kicker, credentials_heading, credentials_lede, credentials_cta_label, credentials_cta_href, focus_kicker, focus_heading, focus_lede, closing_heading, closing_body, closing_primary_cta_label, closing_primary_cta_href, closing_secondary_cta_label, closing_secondary_cta_href, seo_title, seo_description, updated_at";

export async function getAdminHomePage(supabase: AdminClient) {
  return supabase
    .from("home_page")
    .select(HOME_COLUMNS)
    .eq("singleton_key", HOME_PAGE_SINGLETON_KEY)
    .maybeSingle();
}

export async function listAdminHomeChips(supabase: AdminClient, homePageId: string) {
  return supabase
    .from("home_page_chips")
    .select("id, label, sort_order")
    .eq("home_page_id", homePageId)
    .order("sort_order", { ascending: true });
}

export async function listAdminHomeProofItems(
  supabase: AdminClient,
  homePageId: string,
) {
  return supabase
    .from("home_proof_items")
    .select("id, label, supporting, href, credential_id, project_id, sort_order")
    .eq("home_page_id", homePageId)
    .order("sort_order", { ascending: true });
}

export async function listAdminHomeExperienceLinks(
  supabase: AdminClient,
  homePageId: string,
) {
  return supabase
    .from("home_experience_items")
    .select("id, experience_item_id, sort_order")
    .eq("home_page_id", homePageId)
    .order("sort_order", { ascending: true });
}

export async function listAdminHomeCredentialLinks(
  supabase: AdminClient,
  homePageId: string,
) {
  return supabase
    .from("home_credentials")
    .select("id, credential_id, sort_order")
    .eq("home_page_id", homePageId)
    .order("sort_order", { ascending: true });
}

export async function listAdminHomeExperienceChoices(supabase: AdminClient) {
  const parents = await supabase
    .from("experiences")
    .select("id, organization, title, status")
    .order("sort_order", { ascending: true });

  if (parents.error) {
    return { data: null, error: parents.error };
  }

  const items = await supabase
    .from("experience_items")
    .select("id, experience_id, body, status, sort_order")
    .order("sort_order", { ascending: true });

  if (items.error) {
    return { data: null, error: items.error };
  }

  const parentById = new Map((parents.data ?? []).map((row) => [row.id, row]));
  const choices: AdminHomePickerItem[] = (items.data ?? []).map((item) => {
    const parent = parentById.get(item.experience_id);

    return {
      id: item.id,
      organization: parent?.organization ?? "Unknown organization",
      title: parent?.title ?? "Unknown role",
      excerpt: item.body,
      status: item.status,
    };
  });

  return { data: choices, error: null };
}

export async function listAdminHomeCredentialChoices(supabase: AdminClient) {
  return supabase
    .from("credentials")
    .select("id, name, issuer, year_label, status, needs_verification")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
}

export async function listAdminHomeProjectChoices(supabase: AdminClient) {
  return supabase
    .from("projects")
    .select("id, name, slug, status")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
}
