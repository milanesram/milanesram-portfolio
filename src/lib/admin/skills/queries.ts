import type { AdminClient } from "@/lib/admin/authorization";
import type { ContentStatus } from "@/lib/supabase/database.types";

export type AdminFocusPage = {
  id: string;
  slug: string;
  nav_label: string;
  headline: string;
  summary: string;
  competencies: string[];
  status: ContentStatus;
  sort_order: number;
  updated_at: string;
};

const FOCUS_PAGE_COLUMNS =
  "id, slug, nav_label, headline, summary, competencies, status, sort_order, updated_at";

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
