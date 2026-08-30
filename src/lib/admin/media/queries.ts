import type { AdminClient } from "@/lib/admin/authorization";
import type { ContentStatus, MediaKind } from "@/lib/supabase/database.types";

export type AdminMediaAsset = {
  id: string;
  bucket_path: string;
  kind: MediaKind;
  title: string;
  alt_text: string | null;
  is_public: boolean;
  status: ContentStatus;
  updated_at: string;
};

export type AdminMediaReference = {
  id: string;
  slug: string;
  nav_label: string;
};

const MEDIA_COLUMNS =
  "id, bucket_path, kind, title, alt_text, is_public, status, updated_at";

export async function listAdminMediaAssets(supabase: AdminClient) {
  return supabase
    .from("media_assets")
    .select(MEDIA_COLUMNS)
    .order("title", { ascending: true });
}

export async function getAdminMediaAsset(supabase: AdminClient, id: string) {
  return supabase
    .from("media_assets")
    .select(MEDIA_COLUMNS)
    .eq("id", id)
    .maybeSingle();
}

export async function listMediaFocusReferences(
  supabase: AdminClient,
  mediaId: string,
) {
  return supabase
    .from("focus_pages")
    .select("id, slug, nav_label")
    .eq("resume_media_id", mediaId)
    .order("nav_label", { ascending: true });
}

export async function listAllMediaFocusReferences(supabase: AdminClient) {
  return supabase
    .from("focus_pages")
    .select("id, resume_media_id")
    .not("resume_media_id", "is", null);
}
