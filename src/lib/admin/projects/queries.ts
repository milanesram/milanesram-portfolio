import type { AdminClient } from "@/lib/admin/authorization";
import type { ContentStatus, TrackTag } from "@/lib/supabase/database.types";

export type AdminProject = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  year_label: string;
  role: string;
  summary: string;
  stack: string[];
  limits: string;
  is_featured: boolean;
  status: ContentStatus;
  sort_order: number;
  updated_at: string;
};

export type AdminProjectSection = {
  id: string;
  project_id: string;
  heading: string;
  body: string;
  track: TrackTag;
  status: ContentStatus;
  sort_order: number;
};

const PROJECT_COLUMNS =
  "id, slug, name, tagline, year_label, role, summary, stack, limits, is_featured, status, sort_order, updated_at";

export async function listAdminProjects(supabase: AdminClient) {
  return supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
}

export async function getAdminProject(supabase: AdminClient, id: string) {
  return supabase.from("projects").select(PROJECT_COLUMNS).eq("id", id).maybeSingle();
}

export async function listAdminProjectSections(
  supabase: AdminClient,
  projectId: string,
) {
  return supabase
    .from("project_sections")
    .select("id, project_id, heading, body, track, status, sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("heading", { ascending: true });
}

export async function getAdminProjectSection(
  supabase: AdminClient,
  sectionId: string,
) {
  return supabase
    .from("project_sections")
    .select("id, project_id, heading, body, track, status, sort_order")
    .eq("id", sectionId)
    .maybeSingle();
}
