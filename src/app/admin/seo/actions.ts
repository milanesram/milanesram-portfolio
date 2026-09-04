"use server";

import { requireAdminMutation } from "@/lib/admin/authorization";
import { getAdminPageSeoByKey } from "@/lib/admin/seo/queries";
import {
  parsePageSeoFormData,
  statusFromIntent,
} from "@/lib/admin/seo/validation";
import { revalidateSeoSurfaces } from "@/lib/admin/seo/revalidate";
import { completePublicCmsMutation } from "@/lib/indexnow";
import { isPublishedStatus, seoPagePaths } from "@/lib/indexnow-content-map";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const SAVE_FAILED = "That SEO record could not be saved.";

export async function savePageSeoAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parsePageSeoFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  const existing = await getAdminPageSeoByKey(auth.supabase, input.pageKey);

  if (existing.error || !existing.data) {
    return { error: SAVE_FAILED, message: null };
  }

  if (input.id && existing.data.id !== input.id) {
    return { error: SAVE_FAILED, message: null };
  }

  const { error } = await auth.supabase
    .from("page_seo")
    .update({
      title: input.title,
      description: input.description,
      og_title: input.ogTitle,
      og_description: input.ogDescription,
      indexable: input.indexable,
      status: statusFromIntent(input.intent, existing.data.status),
    })
    .eq("id", existing.data.id)
    .eq("page_key", input.pageKey);

  if (error) {
    return { error: SAVE_FAILED, message: null };
  }

  await completePublicCmsMutation({
    revalidate: () => revalidateSeoSurfaces(input.pageKey),
    paths: seoPagePaths({
      pageKey: input.pageKey,
      wasPublished: isPublishedStatus(existing.data.status),
      isPublished: isPublishedStatus(
        statusFromIntent(input.intent, existing.data.status),
      ),
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
