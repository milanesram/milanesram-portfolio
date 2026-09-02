import type { AdminClient } from "@/lib/admin/authorization";
import type { ContentStatus } from "@/lib/supabase/database.types";

export const ABOUT_PAGE_SINGLETON_KEY = "default" as const;

export type AdminAboutPage = {
  id: string;
  status: ContentStatus;
  kicker: string;
  headline: string;
  lede: string;
  journey_heading: string;
  education_heading: string;
  speaking_heading: string;
  speaking_body: string;
  boundaries_heading: string;
  seo_title: string;
  seo_description: string;
  updated_at: string;
};

export type AdminAboutParagraph = {
  id: string;
  body: string;
  sort_order: number;
};

export type AdminAboutListItem = {
  id: string;
  kind: "speaking" | "boundary";
  body: string;
  sort_order: number;
};

const ABOUT_COLUMNS =
  "id, status, kicker, headline, lede, journey_heading, education_heading, speaking_heading, speaking_body, boundaries_heading, seo_title, seo_description, updated_at";

export async function getAdminAboutPage(supabase: AdminClient) {
  return supabase
    .from("about_page")
    .select(ABOUT_COLUMNS)
    .eq("singleton_key", ABOUT_PAGE_SINGLETON_KEY)
    .maybeSingle();
}

export async function listAdminAboutParagraphs(
  supabase: AdminClient,
  aboutPageId: string,
) {
  return supabase
    .from("about_page_paragraphs")
    .select("id, body, sort_order")
    .eq("about_page_id", aboutPageId)
    .order("sort_order", { ascending: true });
}

export async function listAdminAboutListItems(
  supabase: AdminClient,
  aboutPageId: string,
) {
  return supabase
    .from("about_page_list_items")
    .select("id, kind, body, sort_order")
    .eq("about_page_id", aboutPageId)
    .order("kind", { ascending: true })
    .order("sort_order", { ascending: true });
}
