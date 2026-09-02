"use server";

import { redirect } from "next/navigation";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { readUuid } from "@/lib/admin/ids";
import { isEligibleResumeMedia } from "@/lib/content/resume-page";
import { publicMediaObjectUrl } from "@/lib/content/media-bucket";
import {
  RESUME_PAGE_SINGLETON_KEY,
  getAdminResumePage,
  getAdminResumeTrack,
} from "@/lib/admin/resume/queries";
import {
  parseResumePageFormData,
  parseResumeTrackFormData,
  statusFromIntent,
} from "@/lib/admin/resume/validation";
import {
  revalidateResumeSurfaces,
  revalidateResumeTrackSurfaces,
} from "@/lib/admin/resume/revalidate";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const PAGE_FAILED = "The Resume page could not be saved.";
const TRACK_FAILED = "That Resume track could not be saved.";

export async function saveResumePageAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseResumePageFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  const existing = await getAdminResumePage(auth.supabase);

  if (existing.error) {
    return { error: PAGE_FAILED, message: null };
  }

  if (input.id && (!existing.data || existing.data.id !== input.id)) {
    return { error: PAGE_FAILED, message: null };
  }

  const values = {
    kicker: input.kicker,
    headline: input.headline,
    lede: input.lede,
    request_intro: input.requestIntro,
    request_footnote: input.requestFootnote,
    closing_heading: input.closingHeading,
    closing_lede: input.closingLede,
    status: statusFromIntent(input.intent, existing.data?.status ?? null),
  };

  if (!existing.data) {
    const { error } = await auth.supabase.from("resume_page").insert({
      ...values,
      singleton_key: RESUME_PAGE_SINGLETON_KEY,
    });

    if (error) {
      return { error: PAGE_FAILED, message: null };
    }
  } else {
    const { error } = await auth.supabase
      .from("resume_page")
      .update(values)
      .eq("id", existing.data.id);

    if (error) {
      return { error: PAGE_FAILED, message: null };
    }
  }

  revalidateResumeSurfaces();

  const messages: Record<typeof input.intent, string> = {
    draft: "Saved as draft.",
    publish: "Published.",
    unpublish: "Unpublished and saved as draft.",
    archive: "Archived.",
    keep: "Saved.",
  };

  return { error: null, message: messages[input.intent] };
}

export async function saveResumeTrackAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseResumeTrackFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  let currentStatus: "draft" | "published" | "archived" | null = null;

  if (input.id) {
    const existing = await getAdminResumeTrack(auth.supabase, input.id);

    if (existing.error || !existing.data) {
      return { error: TRACK_FAILED, message: null };
    }

    currentStatus = existing.data.status;
  }

  if (input.deliveryMode === "public_file") {
    if (!input.mediaAssetId) {
      return {
        error: "Public-file delivery requires an eligible resume PDF.",
        message: null,
      };
    }

    const media = await auth.supabase
      .from("media_assets")
      .select(
        "id, kind, purpose, title, mime_type, bucket_path, status, is_public",
      )
      .eq("id", input.mediaAssetId)
      .maybeSingle();

    if (
      media.error ||
      !media.data ||
      !isEligibleResumeMedia(media.data, publicMediaObjectUrl(media.data.bucket_path))
    ) {
      return {
        error: "That file is not an eligible public resume PDF.",
        message: null,
      };
    }
  }

  const values = {
    slug: input.slug,
    focus_page_id: input.focusPageId,
    title: input.title,
    summary: input.summary,
    delivery_mode: input.deliveryMode,
    media_asset_id: input.mediaAssetId,
    request_cta_label: input.requestCtaLabel,
    sort_order: input.sortOrder,
    status: statusFromIntent(input.intent, currentStatus),
  };

  if (!input.id) {
    const { data, error } = await auth.supabase
      .from("resume_tracks")
      .insert(values)
      .select("id")
      .single();

    if (error || !data) {
      if (error?.code === "23505") {
        return {
          error: "That slug or sort order is already used.",
          message: null,
        };
      }

      return { error: TRACK_FAILED, message: null };
    }

    revalidateResumeTrackSurfaces(data.id);
    redirect(`/admin/resume/${data.id}`);
  }

  const { error } = await auth.supabase
    .from("resume_tracks")
    .update(values)
    .eq("id", input.id);

  if (error) {
    if (error.code === "23505") {
      return {
        error: "That slug or sort order is already used.",
        message: null,
      };
    }

    return { error: TRACK_FAILED, message: null };
  }

  revalidateResumeTrackSurfaces(input.id);

  const messages: Record<typeof input.intent, string> = {
    draft: "Saved as draft.",
    publish: "Published.",
    unpublish: "Unpublished and saved as draft.",
    archive: "Archived.",
    keep: "Saved.",
  };

  return { error: null, message: messages[input.intent] };
}

export async function deleteResumeTrackAction(formData: FormData) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const id = readUuid(formData.get("id"));

  if (!id) {
    return;
  }

  const existing = await getAdminResumeTrack(auth.supabase, id);

  if (existing.error || !existing.data) {
    return;
  }

  const { error } = await auth.supabase.from("resume_tracks").delete().eq("id", id);

  if (error) {
    return;
  }

  revalidateResumeTrackSurfaces();
  redirect("/admin/resume");
}
