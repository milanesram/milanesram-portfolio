import type { AdminClient } from "@/lib/admin/authorization";
import { getPublicMediaObjectUrl } from "@/lib/content/media";
import type {
  ContentStatus,
  ProjectMediaDisplayRole,
  TrackTag,
} from "@/lib/supabase/database.types";

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

export type AdminProjectMedia = {
  id: string;
  project_id: string;
  media_asset_id: string;
  display_role: ProjectMediaDisplayRole;
  caption: string;
  status: ContentStatus;
  sort_order: number;
  title: string;
  alt_text: string | null;
  bucket_path: string;
  media_status: ContentStatus;
  is_public: boolean;
  public_url: string | null;
};

export type AdminProjectMediaChoice = {
  id: string;
  title: string;
  status: ContentStatus;
  is_public: boolean;
  purpose: string | null;
};

const PROJECT_MEDIA_COLUMNS =
  "id, project_id, media_asset_id, display_role, caption, status, sort_order";

export async function listAdminProjectMedia(
  supabase: AdminClient,
  projectId: string,
) {
  const result = await supabase
    .from("project_media")
    .select(
      `${PROJECT_MEDIA_COLUMNS}, media_assets(title, alt_text, bucket_path, status, is_public)`,
    )
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (result.error || !result.data) {
    return result;
  }

  return {
    ...result,
    data: result.data.map((row) => {
      const asset = Array.isArray(row.media_assets)
        ? row.media_assets[0]
        : row.media_assets;

      return {
        id: row.id,
        project_id: row.project_id,
        media_asset_id: row.media_asset_id,
        display_role: row.display_role,
        caption: row.caption,
        status: row.status,
        sort_order: row.sort_order,
        title: asset?.title ?? "Untitled media",
        alt_text: asset?.alt_text ?? null,
        bucket_path: asset?.bucket_path ?? "",
        media_status: asset?.status ?? "draft",
        is_public: asset?.is_public ?? false,
        public_url: asset?.bucket_path
          ? getPublicMediaObjectUrl(asset.bucket_path)
          : null,
      } satisfies AdminProjectMedia;
    }),
  };
}

export async function getAdminProjectMedia(
  supabase: AdminClient,
  relationshipId: string,
) {
  return supabase
    .from("project_media")
    .select(PROJECT_MEDIA_COLUMNS)
    .eq("id", relationshipId)
    .maybeSingle();
}

export async function listAdminProjectMediaChoices(supabase: AdminClient) {
  return supabase
    .from("media_assets")
    .select("id, title, status, is_public, purpose")
    .eq("kind", "image")
    .eq("purpose", "project")
    .order("title", { ascending: true });
}
