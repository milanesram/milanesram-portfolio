import type { AdminClient } from "@/lib/admin/authorization";
import type { ContentStatus, MediaKind, MediaPurpose } from "@/lib/supabase/database.types";

export type AdminMediaAsset = {
  id: string;
  bucket_path: string;
  kind: MediaKind;
  purpose: MediaPurpose | null;
  title: string;
  alt_text: string | null;
  mime_type: string | null;
  byte_size: number | null;
  is_public: boolean;
  status: ContentStatus;
  updated_at: string;
};

export type MediaUsageCounts = {
  journey: number;
  projects: number;
  resume: number;
  publications: number;
  portrait: boolean;
};

const MEDIA_COLUMNS =
  "id, bucket_path, kind, purpose, title, alt_text, mime_type, byte_size, is_public, status, updated_at";

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

export async function getMediaUsageCounts(
  supabase: AdminClient,
  mediaId: string,
  purpose: MediaPurpose | null,
): Promise<MediaUsageCounts> {
  const [journey, projects, resume, publications] = await Promise.all([
    supabase
      .from("journey_milestones")
      .select("id", { count: "exact", head: true })
      .eq("media_asset_id", mediaId),
    supabase
      .from("project_media")
      .select("id", { count: "exact", head: true })
      .eq("media_asset_id", mediaId),
    supabase
      .from("resume_tracks")
      .select("id", { count: "exact", head: true })
      .eq("media_asset_id", mediaId),
    supabase
      .from("publications")
      .select("id", { count: "exact", head: true })
      .eq("media_id", mediaId),
  ]);

  return {
    journey: journey.count ?? 0,
    projects: projects.count ?? 0,
    resume: resume.count ?? 0,
    publications: publications.count ?? 0,
    portrait: purpose === "portrait",
  };
}

export function mediaUsageTotal(usage: MediaUsageCounts): number {
  return usage.journey + usage.projects + usage.resume + usage.publications;
}

export async function listAllMediaUsage(supabase: AdminClient) {
  const [journey, projects, resume, publications] = await Promise.all([
    supabase.from("journey_milestones").select("media_asset_id"),
    supabase.from("project_media").select("media_asset_id"),
    supabase.from("resume_tracks").select("media_asset_id"),
    supabase.from("publications").select("media_id"),
  ]);

  const usage = new Map<string, number>();

  function add(id: string | null) {
    if (!id) return;
    usage.set(id, (usage.get(id) ?? 0) + 1);
  }

  for (const row of journey.error ? [] : (journey.data ?? [])) {
    add(row.media_asset_id);
  }
  for (const row of projects.error ? [] : (projects.data ?? [])) {
    add(row.media_asset_id);
  }
  for (const row of resume.error ? [] : (resume.data ?? [])) {
    add(row.media_asset_id);
  }
  for (const row of publications.error ? [] : (publications.data ?? [])) {
    add(row.media_id);
  }

  return usage;
}
