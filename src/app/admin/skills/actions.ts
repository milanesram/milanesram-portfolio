"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { readUuid } from "@/lib/admin/ids";
import { getAdminFocusPage } from "@/lib/admin/skills/queries";
import {
  moveCompetency,
  parseCompetencyMutation,
  parseFocusPageFormData,
  removeCompetency,
  replaceCompetency,
  statusFromIntent,
} from "@/lib/admin/skills/validation";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const SAVE_FAILED = "The skills record could not be saved.";
const SKILL_FAILED = "That skill could not be saved.";

function mapWriteError(code: string | undefined): string {
  if (code === "23505") {
    return "That slug is already in use.";
  }

  if (code === "23514") {
    return "One or more fields did not meet the required format.";
  }

  return SAVE_FAILED;
}

function revalidateAdminSkills(id?: string) {
  revalidatePath("/admin/skills");

  if (id) {
    revalidatePath(`/admin/skills/${id}`);
  }
}

export async function saveFocusPageAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseFocusPageFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  let currentStatus: "draft" | "published" | "archived" | null = null;

  if (input.id) {
    const existing = await getAdminFocusPage(auth.supabase, input.id);

    if (existing.error || !existing.data) {
      return { error: SAVE_FAILED, message: null };
    }

    currentStatus = existing.data.status;
  }

  const values = {
    slug: input.slug,
    nav_label: input.navLabel,
    headline: input.headline,
    summary: input.summary,
    sort_order: input.sortOrder,
    status: statusFromIntent(input.intent, currentStatus),
  };

  if (!input.id) {
    const { data, error } = await auth.supabase
      .from("focus_pages")
      .insert({ ...values, competencies: [] })
      .select("id")
      .single();

    if (error || !data) {
      return { error: mapWriteError(error?.code), message: null };
    }

    revalidateAdminSkills(data.id);
    redirect(`/admin/skills/${data.id}`);
  }

  const { error } = await auth.supabase
    .from("focus_pages")
    .update(values)
    .eq("id", input.id);

  if (error) {
    return { error: mapWriteError(error.code), message: null };
  }

  revalidateAdminSkills(input.id);

  const messages: Record<typeof input.intent, string> = {
    draft: "Saved as draft.",
    publish: "Published.",
    unpublish: "Unpublished and saved as draft.",
    archive: "Archived.",
    keep: "Saved.",
  };

  return { error: null, message: messages[input.intent] };
}

export async function deleteFocusPageAction(formData: FormData) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const id = readUuid(formData.get("id"));

  if (!id) {
    return;
  }

  const existing = await getAdminFocusPage(auth.supabase, id);

  if (existing.error || !existing.data) {
    return;
  }

  const { error } = await auth.supabase.from("focus_pages").delete().eq("id", id);

  if (error) {
    return;
  }

  revalidateAdminSkills(id);
  redirect("/admin/skills");
}

async function updateCompetencies(
  pageId: string,
  next: string[] | null,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  if (!next) {
    return { error: SKILL_FAILED, message: null };
  }

  const existing = await getAdminFocusPage(auth.supabase, pageId);

  if (existing.error || !existing.data) {
    return { error: SKILL_FAILED, message: null };
  }

  const { error } = await auth.supabase
    .from("focus_pages")
    .update({ competencies: next })
    .eq("id", pageId);

  if (error) {
    return { error: mapWriteError(error.code), message: null };
  }

  revalidateAdminSkills(pageId);
  return { error: null, message: "Saved." };
}

export async function addCompetencyAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const parsed = parseCompetencyMutation(formData);

  if (!parsed.ok || !parsed.value.text) {
    return { error: parsed.ok ? SKILL_FAILED : parsed.error, message: null };
  }

  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const existing = await getAdminFocusPage(auth.supabase, parsed.value.pageId);

  if (existing.error || !existing.data) {
    return { error: SKILL_FAILED, message: null };
  }

  return updateCompetencies(parsed.value.pageId, [
    ...existing.data.competencies,
    parsed.value.text,
  ]);
}

export async function saveCompetencyAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const parsed = parseCompetencyMutation(formData);

  if (!parsed.ok || parsed.value.index == null || !parsed.value.text) {
    return { error: parsed.ok ? SKILL_FAILED : parsed.error, message: null };
  }

  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const existing = await getAdminFocusPage(auth.supabase, parsed.value.pageId);

  if (existing.error || !existing.data) {
    return { error: SKILL_FAILED, message: null };
  }

  return updateCompetencies(
    parsed.value.pageId,
    replaceCompetency(
      existing.data.competencies,
      parsed.value.index,
      parsed.value.text,
    ),
  );
}

export async function deleteCompetencyAction(formData: FormData) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const parsed = parseCompetencyMutation(formData);

  if (!parsed.ok || parsed.value.index == null) {
    return;
  }

  const existing = await getAdminFocusPage(auth.supabase, parsed.value.pageId);

  if (existing.error || !existing.data) {
    return;
  }

  const next = removeCompetency(
    existing.data.competencies,
    parsed.value.index,
  );

  if (!next) {
    return;
  }

  const { error } = await auth.supabase
    .from("focus_pages")
    .update({ competencies: next })
    .eq("id", parsed.value.pageId);

  if (error) {
    return;
  }

  revalidateAdminSkills(parsed.value.pageId);
}

export async function moveCompetencyAction(formData: FormData) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const parsed = parseCompetencyMutation(formData);

  if (!parsed.ok || parsed.value.index == null || !parsed.value.direction) {
    return;
  }

  const existing = await getAdminFocusPage(auth.supabase, parsed.value.pageId);

  if (existing.error || !existing.data) {
    return;
  }

  const next = moveCompetency(
    existing.data.competencies,
    parsed.value.index,
    parsed.value.direction,
  );

  if (!next) {
    return;
  }

  const { error } = await auth.supabase
    .from("focus_pages")
    .update({ competencies: next })
    .eq("id", parsed.value.pageId);

  if (error) {
    return;
  }

  revalidateAdminSkills(parsed.value.pageId);
}
