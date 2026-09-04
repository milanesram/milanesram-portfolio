"use server";

import { revalidatePath } from "next/cache";
import { requireAdminMutation } from "@/lib/admin/authorization";
import {
  ABOUT_PAGE_SINGLETON_KEY,
  getAdminAboutPage,
} from "@/lib/admin/about/queries";
import {
  parseAboutPageFormData,
  selectedEducationIsEligible,
  statusFromIntent,
} from "@/lib/admin/about/validation";
import { revalidateAboutEducationSurfaces } from "@/lib/admin/credentials/revalidate";
import { completePublicCmsMutation } from "@/lib/indexnow";
import { isPublishedStatus, singletonPagePaths } from "@/lib/indexnow-content-map";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const SAVE_FAILED = "The About page could not be saved.";

function revalidateAbout() {
  revalidateAboutEducationSurfaces();
  revalidatePath("/admin/about");
  revalidatePath("/about");
}

export async function saveAboutPageAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseAboutPageFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  const existing = await getAdminAboutPage(auth.supabase);

  if (existing.error) {
    return { error: SAVE_FAILED, message: null };
  }

  if (input.id && (!existing.data || existing.data.id !== input.id)) {
    return { error: SAVE_FAILED, message: null };
  }

  const nextStatus = statusFromIntent(input.intent, existing.data?.status ?? null);

  if (nextStatus === "published" && input.educationCredentials.length > 0) {
    const selectedIds = input.educationCredentials.map((item) => item.credentialId);
    const { data: selectedRows, error: selectedError } = await auth.supabase
      .from("credentials")
      .select("id, status, needs_verification")
      .in("id", selectedIds);

    if (selectedError || !selectedRows || selectedRows.length !== selectedIds.length) {
      return { error: "A selected Education credential could not be found.", message: null };
    }

    if (selectedRows.some((row) => !selectedEducationIsEligible(row))) {
      return {
        error:
          "Publishing About requires every selected Education credential to be publicly eligible.",
        message: null,
      };
    }
  }

  const values = {
    kicker: input.kicker,
    headline: input.headline,
    lede: input.lede,
    journey_heading: input.journeyHeading,
    education_heading: input.educationHeading,
    speaking_heading: input.speakingHeading,
    speaking_body: input.speakingBody,
    boundaries_heading: input.boundariesHeading,
    status: nextStatus,
  };

  let aboutPageId = existing.data?.id ?? null;

  if (!existing.data) {
    const inserted = await auth.supabase
      .from("about_page")
      .insert({
        ...values,
        singleton_key: ABOUT_PAGE_SINGLETON_KEY,
      })
      .select("id")
      .maybeSingle();

    if (inserted.error || !inserted.data) {
      return { error: SAVE_FAILED, message: null };
    }

    aboutPageId = inserted.data.id;
  } else {
    const { error } = await auth.supabase
      .from("about_page")
      .update(values)
      .eq("id", existing.data.id)
      .eq("singleton_key", ABOUT_PAGE_SINGLETON_KEY);

    if (error) {
      return { error: SAVE_FAILED, message: null };
    }
  }

  if (!aboutPageId) {
    return { error: SAVE_FAILED, message: null };
  }

  const [paragraphsDelete, listDelete] = await Promise.all([
    auth.supabase.from("about_page_paragraphs").delete().eq("about_page_id", aboutPageId),
    auth.supabase.from("about_page_list_items").delete().eq("about_page_id", aboutPageId),
  ]);

  if (paragraphsDelete.error || listDelete.error) {
    return { error: SAVE_FAILED, message: null };
  }

  const { error: paragraphError } = await auth.supabase
    .from("about_page_paragraphs")
    .insert(
      input.paragraphs.map((item) => ({
        about_page_id: aboutPageId,
        body: item.body,
        sort_order: item.sortOrder,
      })),
    );

  if (paragraphError) {
    return { error: SAVE_FAILED, message: null };
  }

  const { error: listError } = await auth.supabase.from("about_page_list_items").insert([
    ...input.speakingItems.map((item) => ({
      about_page_id: aboutPageId,
      kind: "speaking" as const,
      body: item.body,
      sort_order: item.sortOrder,
    })),
    ...input.boundaryItems.map((item) => ({
      about_page_id: aboutPageId,
      kind: "boundary" as const,
      body: item.body,
      sort_order: item.sortOrder,
    })),
  ]);

  if (listError) {
    return { error: SAVE_FAILED, message: null };
  }

  const { error: educationDeleteError } = await auth.supabase
    .from("about_education_credentials")
    .delete()
    .eq("about_page_id", aboutPageId);

  if (educationDeleteError) {
    return { error: SAVE_FAILED, message: null };
  }

  if (input.educationCredentials.length > 0) {
    const { error: educationError } = await auth.supabase
      .from("about_education_credentials")
      .insert(
        input.educationCredentials.map((item) => ({
          about_page_id: aboutPageId,
          credential_id: item.credentialId,
          sort_order: item.sortOrder,
        })),
      );

    if (educationError) {
      return { error: SAVE_FAILED, message: null };
    }
  }

  await completePublicCmsMutation({
    revalidate: () => revalidateAbout(),
    paths: singletonPagePaths({
      wasPublished: isPublishedStatus(existing.data?.status),
      isPublished: isPublishedStatus(values.status),
      path: "/about",
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
