"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { readUuid } from "@/lib/admin/ids";
import {
  getAdminExperience,
  getAdminExperienceItem,
  listAdminExperienceItems,
} from "@/lib/admin/experience/queries";
import {
  parseExperienceFormData,
  parseExperienceItemFormData,
  parseOwnedItemRef,
  statusFromIntent,
} from "@/lib/admin/experience/validation";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const SAVE_FAILED = "The experience could not be saved.";
const ITEM_FAILED = "The item could not be updated.";

function mapWriteError(code: string | undefined): string {
  if (code === "23514") {
    return "One or more fields did not meet the required format.";
  }

  return SAVE_FAILED;
}

function revalidateAdminExperience(id?: string) {
  revalidatePath("/admin/experience");
  revalidatePath("/experience");
  revalidatePath("/");
  revalidatePath("/focus/cybersecurity-grc");
  revalidatePath("/focus/privacy-ai-governance");

  if (id) {
    revalidatePath(`/admin/experience/${id}`);
  }
}

export async function saveExperienceAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseExperienceFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  let currentStatus: "draft" | "published" | "archived" | null = null;

  if (input.id) {
    const existing = await getAdminExperience(auth.supabase, input.id);

    if (existing.error || !existing.data) {
      return { error: SAVE_FAILED, message: null };
    }

    currentStatus = existing.data.status;
  }

  const values = {
    organization: input.organization,
    title: input.title,
    title_secondary: input.titleSecondary,
    location_display: input.locationDisplay,
    kind: input.kind,
    start_date: input.startDate,
    end_date: input.endDate,
    date_precision: input.datePrecision,
    start_year: input.startYear,
    end_year: input.endYear,
    is_current: input.isCurrent,
    is_featured: input.isFeatured,
    summary: input.summary,
    sort_order: input.sortOrder,
    status: statusFromIntent(input.intent, currentStatus),
  };

  if (!input.id) {
    const { data, error } = await auth.supabase
      .from("experiences")
      .insert(values)
      .select("id")
      .single();

    if (error || !data) {
      return { error: mapWriteError(error?.code), message: null };
    }

    revalidateAdminExperience(data.id);
    redirect(`/admin/experience/${data.id}`);
  }

  const { error } = await auth.supabase
    .from("experiences")
    .update(values)
    .eq("id", input.id);

  if (error) {
    return { error: mapWriteError(error.code), message: null };
  }

  revalidateAdminExperience(input.id);

  const messages: Record<typeof input.intent, string> = {
    draft: "Saved as draft.",
    publish: "Published.",
    unpublish: "Unpublished and saved as draft.",
    archive: "Archived.",
    keep: "Saved.",
  };

  return { error: null, message: messages[input.intent] };
}

export async function deleteExperienceAction(formData: FormData) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const id = readUuid(formData.get("id"));

  if (!id) {
    return;
  }

  const existing = await getAdminExperience(auth.supabase, id);

  if (existing.error || !existing.data) {
    return;
  }

  const { error } = await auth.supabase.from("experiences").delete().eq("id", id);

  if (error) {
    return;
  }

  revalidateAdminExperience(id);
  redirect("/admin/experience");
}

export async function saveExperienceItemAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseExperienceItemFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  const experience = await getAdminExperience(auth.supabase, input.experienceId);

  if (experience.error || !experience.data) {
    return { error: ITEM_FAILED, message: null };
  }

  const values = {
    experience_id: input.experienceId,
    body: input.body,
    track: input.track,
    is_metric: input.isMetric,
    metric_context: input.metricContext,
    show_on_home: input.showOnHome,
    status: input.status,
    sort_order: input.sortOrder,
  };

  if (!input.id) {
    const { error } = await auth.supabase.from("experience_items").insert(values);

    if (error) {
      return { error: ITEM_FAILED, message: null };
    }

    revalidateAdminExperience(input.experienceId);
    return { error: null, message: "Item added." };
  }

  const existing = await getAdminExperienceItem(auth.supabase, input.id);

  if (
    existing.error ||
    !existing.data ||
    existing.data.experience_id !== input.experienceId
  ) {
    return { error: ITEM_FAILED, message: null };
  }

  const { error } = await auth.supabase
    .from("experience_items")
    .update({
      body: values.body,
      track: values.track,
      is_metric: values.is_metric,
      metric_context: values.metric_context,
      show_on_home: values.show_on_home,
      status: values.status,
      sort_order: values.sort_order,
    })
    .eq("id", input.id)
    .eq("experience_id", input.experienceId);

  if (error) {
    return { error: ITEM_FAILED, message: null };
  }

  revalidateAdminExperience(input.experienceId);
  return { error: null, message: "Item saved." };
}

export async function deleteExperienceItemAction(formData: FormData) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const parsed = parseOwnedItemRef(formData);
  const experienceId = parsed.ok ? parsed.value.experienceId : null;

  if (!parsed.ok) {
    return;
  }

  const existing = await getAdminExperienceItem(
    auth.supabase,
    parsed.value.itemId,
  );

  if (
    existing.error ||
    !existing.data ||
    existing.data.experience_id !== parsed.value.experienceId
  ) {
    return;
  }

  await auth.supabase
    .from("experience_items")
    .delete()
    .eq("id", parsed.value.itemId)
    .eq("experience_id", parsed.value.experienceId);

  revalidateAdminExperience(parsed.value.experienceId);
  redirect(`/admin/experience/${experienceId}`);
}

export async function moveExperienceItemAction(formData: FormData) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const parsed = parseOwnedItemRef(formData);

  if (!parsed.ok) {
    return;
  }

  const direction = formData.get("direction");

  if (direction !== "up" && direction !== "down") {
    return;
  }

  const existing = await getAdminExperienceItem(
    auth.supabase,
    parsed.value.itemId,
  );

  if (
    existing.error ||
    !existing.data ||
    existing.data.experience_id !== parsed.value.experienceId
  ) {
    return;
  }

  const siblings = await listAdminExperienceItems(
    auth.supabase,
    parsed.value.experienceId,
  );

  if (siblings.error || !siblings.data) {
    return;
  }

  const index = siblings.data.findIndex(
    (item) => item.id === parsed.value.itemId,
  );
  const swapWith = direction === "up" ? index - 1 : index + 1;

  if (index < 0 || swapWith < 0 || swapWith >= siblings.data.length) {
    return;
  }

  const current = siblings.data[index];
  const neighbor = siblings.data[swapWith];

  await auth.supabase
    .from("experience_items")
    .update({ sort_order: swapWith })
    .eq("id", current.id)
    .eq("experience_id", parsed.value.experienceId);

  await auth.supabase
    .from("experience_items")
    .update({ sort_order: index })
    .eq("id", neighbor.id)
    .eq("experience_id", parsed.value.experienceId);

  revalidateAdminExperience(parsed.value.experienceId);
  redirect(`/admin/experience/${parsed.value.experienceId}`);
}
