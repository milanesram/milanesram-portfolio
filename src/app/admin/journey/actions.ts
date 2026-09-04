"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminMutation } from "@/lib/admin/authorization";
import {
  getAdminJourneyMediaChoice,
  getAdminJourneyMilestone,
} from "@/lib/admin/journey/queries";
import {
  parseJourneyMilestoneFormData,
  statusFromIntent,
} from "@/lib/admin/journey/validation";
import { canPublishJourneyMilestone } from "@/lib/content/about-page";
import { completePublicCmsMutation } from "@/lib/indexnow";
import { isPublishedStatus, journeyPaths } from "@/lib/indexnow-content-map";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const SAVE_FAILED = "The Journey milestone could not be saved.";
const MEDIA_REQUIRED =
  "Attach an approved public image before publishing. Drafts may have no media.";

function revalidateJourney(id?: string) {
  revalidatePath("/admin/journey");
  revalidatePath("/admin/about");
  revalidatePath("/about");

  if (id) {
    revalidatePath(`/admin/journey/${id}`);
  }
}

export async function saveJourneyMilestoneAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseJourneyMilestoneFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  let currentStatus: "draft" | "published" | "archived" | null = null;

  if (input.id) {
    const existing = await getAdminJourneyMilestone(auth.supabase, input.id);

    if (existing.error || !existing.data) {
      return { error: SAVE_FAILED, message: null };
    }

    currentStatus = existing.data.status;
  }

  const nextStatus = statusFromIntent(input.intent, currentStatus);
  let mediaRow = null;

  if (input.mediaAssetId) {
    const found = await getAdminJourneyMediaChoice(
      auth.supabase,
      input.mediaAssetId,
    );

    if (found.error || !found.data) {
      return { error: "A media selection does not exist.", message: null };
    }

    mediaRow = found.data;
  }

  if (
    !canPublishJourneyMilestone({
      intentStatus: nextStatus,
      media: mediaRow,
    })
  ) {
    return { error: MEDIA_REQUIRED, message: null };
  }

  const values = {
    title: input.title,
    year: input.year,
    caption: input.caption,
    media_asset_id: input.mediaAssetId,
    sort_order: input.sortOrder,
    status: nextStatus,
  };

  if (!input.id) {
    const { data, error } = await auth.supabase
      .from("journey_milestones")
      .insert(values)
      .select("id")
      .single();

    if (error || !data) {
      return { error: SAVE_FAILED, message: null };
    }

    await completePublicCmsMutation({
      revalidate: () => revalidateJourney(data.id),
      paths: journeyPaths({
        wasPublished: false,
        isPublished: isPublishedStatus(nextStatus),
      }),
    });
    redirect(`/admin/journey/${data.id}`);
  }

  const { error } = await auth.supabase
    .from("journey_milestones")
    .update(values)
    .eq("id", input.id);

  if (error) {
    return { error: SAVE_FAILED, message: null };
  }

  await completePublicCmsMutation({
    revalidate: () => revalidateJourney(input.id ?? undefined),
    paths: journeyPaths({
      wasPublished: isPublishedStatus(currentStatus),
      isPublished: isPublishedStatus(nextStatus),
    }),
  });

  const messages: Record<typeof input.intent, string> = {
    draft: "Saved as draft.",
    publish: "Published.",
    unpublish: "Unpublished and saved as draft.",
    archive: "Archived.",
    keep: "Saved.",
  };

  return { error: null, message: messages[input.intent] };
}
