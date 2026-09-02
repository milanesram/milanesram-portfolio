import { cache } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { publicMediaObjectUrl } from "@/lib/content/media-bucket";
import {
  mapResumePage,
  mapResumeTrack,
  type PublicResumePage,
  type PublicResumeTrack,
  type ResumePageRow,
  type ResumeTrackRow,
} from "@/lib/content/resume-page";

export type {
  PublicResumePage,
  PublicResumeTrack,
  PublicResumeMedia,
} from "@/lib/content/resume-page";

export type PublishedResumePageResult =
  | { ok: true; page: PublicResumePage }
  | { ok: true; page: null }
  | { ok: false };

export type PublishedResumeTracksResult =
  | { ok: true; tracks: PublicResumeTrack[] }
  | { ok: false };

const PAGE_COLUMNS =
  "status, kicker, headline, lede, request_intro, request_footnote, closing_heading, closing_lede";

const TRACK_COLUMNS =
  "id, slug, title, summary, delivery_mode, request_cta_label, home_kicker, sort_order, status, focus_pages(slug, status), media_assets(id, kind, purpose, title, mime_type, bucket_path, status, is_public)";

async function loadPublishedResumePage(): Promise<PublishedResumePageResult> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("resume_page")
    .select(PAGE_COLUMNS)
    .eq("singleton_key", "default")
    .maybeSingle();

  if (error) {
    return { ok: false };
  }

  if (!data) {
    return { ok: true, page: null };
  }

  return { ok: true, page: mapResumePage(data as ResumePageRow) };
}

async function loadPublishedResumeTracks(): Promise<PublishedResumeTracksResult> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("resume_tracks")
    .select(TRACK_COLUMNS)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error || !data) {
    return { ok: false };
  }

  return {
    ok: true,
    tracks: data.flatMap((row) => {
      const mapped = mapResumeTrack(row as ResumeTrackRow, publicMediaObjectUrl);
      return mapped ? [mapped] : [];
    }),
  };
}

export const getPublishedResumePage = cache(loadPublishedResumePage);
export const getPublishedResumeTracks = cache(loadPublishedResumeTracks);
