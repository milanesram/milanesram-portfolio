"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { readUuid } from "@/lib/admin/ids";
import { getAdminMediaAsset } from "@/lib/admin/media/queries";
import {
  parseMediaFormData,
  statusFromIntent,
} from "@/lib/admin/media/validation";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const SAVE_FAILED = "The media record could not be saved.";

function mapWriteError(code: string | undefined): string {
  if (code === "23514") {
    return "One or more fields did not meet the required format.";
  }

  return SAVE_FAILED;
}

function revalidateAdminMedia(id?: string) {
  revalidatePath("/admin/media");

  if (id) {
    revalidatePath(`/admin/media/${id}`);
  }
}

export async function saveMediaAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseMediaFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  const existing = await getAdminMediaAsset(auth.supabase, input.id);

  if (existing.error || !existing.data) {
    return { error: SAVE_FAILED, message: null };
  }

  const { error } = await auth.supabase
    .from("media_assets")
    .update({
      title: input.title,
      alt_text: input.altText,
      kind: input.kind,
      is_public: input.isPublic,
      status: statusFromIntent(input.intent, existing.data.status),
    })
    .eq("id", existing.data.id);

  if (error) {
    return { error: mapWriteError(error.code), message: null };
  }

  revalidateAdminMedia(existing.data.id);

  const messages: Record<typeof input.intent, string> = {
    draft: "Saved as draft.",
    publish: "Published.",
    unpublish: "Unpublished and saved as draft.",
    archive: "Archived.",
    keep: "Saved.",
  };

  return { error: null, message: messages[input.intent] };
}

export async function deleteMediaAction(formData: FormData) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const id = readUuid(formData.get("id"));

  if (!id) {
    return;
  }

  const existing = await getAdminMediaAsset(auth.supabase, id);

  if (existing.error || !existing.data) {
    return;
  }

  const { error } = await auth.supabase
    .from("media_assets")
    .delete()
    .eq("id", id);

  if (error) {
    return;
  }

  revalidateAdminMedia(id);
  redirect("/admin/media");
}
