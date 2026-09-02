import type { AdminClient } from "@/lib/admin/authorization";
import type { ContentStatus } from "@/lib/supabase/database.types";

export type AdminFocusPage = {
  id: string;
  slug: string;
  nav_label: string;
  headline: string;
  summary: string;
  competencies: string[];
  featured_project_id: string | null;
  featured_publication_id: string | null;
  featured_project_lede: string | null;
  card_summary: string | null;
  card_chips: string[];
  status: ContentStatus;
  sort_order: number;
  updated_at: string;
};

export type AdminFocusExperienceLink = {
  id: string;
  experience_item_id: string;
  sort_order: number;
};

export type AdminFocusCredentialLink = {
  id: string;
  credential_id: string;
  sort_order: number;
};

export type AdminFocusPickerItem = {
  id: string;
  organization: string;
  title: string;
  excerpt: string;
  status: ContentStatus;
};

export type AdminFocusPickerCredential = {
  id: string;
  name: string;
  issuer: string;
  year_label: string | null;
  kind: string;
  status: ContentStatus;
  needs_verification: boolean;
};

export type AdminFocusPickerProject = {
  id: string;
  name: string;
  slug: string;
  status: ContentStatus;
};

export type AdminFocusPickerPublication = {
  id: string;
  title: string;
  slug: string;
  document_kind: string;
  rights_status: string;
  status: ContentStatus;
};

const FOCUS_PAGE_COLUMNS =
  "id, slug, nav_label, headline, summary, competencies, featured_project_id, featured_publication_id, featured_project_lede, card_summary, card_chips, status, sort_order, updated_at";

export async function listAdminFocusPages(supabase: AdminClient) {
  return supabase
    .from("focus_pages")
    .select(FOCUS_PAGE_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("nav_label", { ascending: true });
}

export async function getAdminFocusPage(supabase: AdminClient, id: string) {
  return supabase
    .from("focus_pages")
    .select(FOCUS_PAGE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
}

export async function listAdminFocusExperienceLinks(
  supabase: AdminClient,
  focusPageId: string,
) {
  return supabase
    .from("focus_experience_items")
    .select("id, experience_item_id, sort_order")
    .eq("focus_page_id", focusPageId)
    .order("sort_order", { ascending: true });
}

export async function listAdminFocusCredentialLinks(
  supabase: AdminClient,
  focusPageId: string,
) {
  return supabase
    .from("focus_credentials")
    .select("id, credential_id, sort_order")
    .eq("focus_page_id", focusPageId)
    .order("sort_order", { ascending: true });
}

export async function listAdminFocusExperienceChoices(supabase: AdminClient) {
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
  const choices: AdminFocusPickerItem[] = (items.data ?? []).map((item) => {
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

export async function listAdminFocusCredentialChoices(supabase: AdminClient) {
  return supabase
    .from("credentials")
    .select("id, name, issuer, year_label, kind, status, needs_verification")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
}

export async function listAdminFocusProjectChoices(supabase: AdminClient) {
  return supabase
    .from("projects")
    .select("id, name, slug, status")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
}

export async function listAdminFocusPublicationChoices(supabase: AdminClient) {
  return supabase
    .from("publications")
    .select("id, title, slug, document_kind, rights_status, status")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });
}
