"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { readUuid } from "@/lib/admin/ids";
import {
  getAdminProject,
  getAdminProjectSection,
  listAdminProjectSections,
} from "@/lib/admin/projects/queries";
import {
  parseOwnedSectionRef,
  parseProjectFormData,
  parseSectionFormData,
  statusFromIntent,
} from "@/lib/admin/projects/validation";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const SAVE_FAILED = "The project could not be saved.";
const SECTION_FAILED = "The section could not be updated.";

function mapWriteError(code: string | undefined): string {
  if (code === "23505") {
    return "That slug is already in use.";
  }

  if (code === "23514") {
    return "One or more fields did not meet the required format.";
  }

  return SAVE_FAILED;
}

function revalidateAdminProjects(id?: string) {
  revalidatePath("/admin/projects");

  if (id) {
    revalidatePath(`/admin/projects/${id}`);
  }
}

export async function saveProjectAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseProjectFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  let currentStatus: "draft" | "published" | "archived" | null = null;

  if (input.id) {
    const existing = await getAdminProject(auth.supabase, input.id);

    if (existing.error || !existing.data) {
      return { error: SAVE_FAILED, message: null };
    }

    currentStatus = existing.data.status;
  }

  const status = statusFromIntent(input.intent, currentStatus);
  const values = {
    slug: input.slug,
    name: input.name,
    tagline: input.tagline,
    year_label: input.yearLabel,
    role: input.role,
    summary: input.summary,
    limits: input.limits,
    stack: input.stack,
    is_featured: input.isFeatured,
    sort_order: input.sortOrder,
    status,
  };

  if (!input.id) {
    const { data, error } = await auth.supabase
      .from("projects")
      .insert(values)
      .select("id")
      .single();

    if (error || !data) {
      return { error: mapWriteError(error?.code), message: null };
    }

    revalidateAdminProjects(data.id);
    redirect(`/admin/projects/${data.id}`);
  }

  const { error } = await auth.supabase
    .from("projects")
    .update(values)
    .eq("id", input.id);

  if (error) {
    return { error: mapWriteError(error.code), message: null };
  }

  revalidateAdminProjects(input.id);

  const messages: Record<typeof input.intent, string> = {
    draft: "Saved as draft.",
    publish: "Published.",
    unpublish: "Unpublished and saved as draft.",
    archive: "Archived.",
    keep: "Saved.",
  };

  return { error: null, message: messages[input.intent] };
}

export async function deleteProjectAction(formData: FormData) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const id = readUuid(formData.get("id"));

  if (!id) {
    return;
  }

  const existing = await getAdminProject(auth.supabase, id);

  if (existing.error || !existing.data) {
    return;
  }

  const { error } = await auth.supabase.from("projects").delete().eq("id", id);

  if (error) {
    return;
  }

  revalidateAdminProjects(id);
  redirect("/admin/projects");
}

export async function saveProjectSectionAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseSectionFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  const project = await getAdminProject(auth.supabase, input.projectId);

  if (project.error || !project.data) {
    return { error: SECTION_FAILED, message: null };
  }

  const values = {
    project_id: input.projectId,
    heading: input.heading,
    body: input.body,
    track: input.track,
    status: input.status,
    sort_order: input.sortOrder,
  };

  if (!input.id) {
    const { error } = await auth.supabase.from("project_sections").insert(values);

    if (error) {
      return { error: SECTION_FAILED, message: null };
    }

    revalidateAdminProjects(input.projectId);
    return { error: null, message: "Section added." };
  }

  const existing = await getAdminProjectSection(auth.supabase, input.id);

  if (
    existing.error ||
    !existing.data ||
    existing.data.project_id !== input.projectId
  ) {
    return { error: SECTION_FAILED, message: null };
  }

  const { error } = await auth.supabase
    .from("project_sections")
    .update({
      heading: values.heading,
      body: values.body,
      track: values.track,
      status: values.status,
      sort_order: values.sort_order,
    })
    .eq("id", input.id)
    .eq("project_id", input.projectId);

  if (error) {
    return { error: SECTION_FAILED, message: null };
  }

  revalidateAdminProjects(input.projectId);
  return { error: null, message: "Section saved." };
}

export async function deleteProjectSectionAction(formData: FormData) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const parsed = parseOwnedSectionRef(formData);
  const projectId = parsed.ok ? parsed.value.projectId : null;

  if (!parsed.ok) {
    return;
  }

  const existing = await getAdminProjectSection(
    auth.supabase,
    parsed.value.sectionId,
  );

  if (
    existing.error ||
    !existing.data ||
    existing.data.project_id !== parsed.value.projectId
  ) {
    return;
  }

  await auth.supabase
    .from("project_sections")
    .delete()
    .eq("id", parsed.value.sectionId)
    .eq("project_id", parsed.value.projectId);

  revalidateAdminProjects(parsed.value.projectId);
  redirect(`/admin/projects/${projectId}`);
}

export async function moveProjectSectionAction(formData: FormData) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const parsed = parseOwnedSectionRef(formData);

  if (!parsed.ok) {
    return;
  }

  const direction = formData.get("direction");

  if (direction !== "up" && direction !== "down") {
    return;
  }

  const existing = await getAdminProjectSection(
    auth.supabase,
    parsed.value.sectionId,
  );

  if (
    existing.error ||
    !existing.data ||
    existing.data.project_id !== parsed.value.projectId
  ) {
    return;
  }

  const siblings = await listAdminProjectSections(
    auth.supabase,
    parsed.value.projectId,
  );

  if (siblings.error || !siblings.data) {
    return;
  }

  const index = siblings.data.findIndex(
    (section) => section.id === parsed.value.sectionId,
  );
  const swapWith = direction === "up" ? index - 1 : index + 1;

  if (index < 0 || swapWith < 0 || swapWith >= siblings.data.length) {
    return;
  }

  const current = siblings.data[index];
  const neighbor = siblings.data[swapWith];

  await auth.supabase
    .from("project_sections")
    .update({ sort_order: swapWith })
    .eq("id", current.id)
    .eq("project_id", parsed.value.projectId);

  await auth.supabase
    .from("project_sections")
    .update({ sort_order: index })
    .eq("id", neighbor.id)
    .eq("project_id", parsed.value.projectId);

  revalidateAdminProjects(parsed.value.projectId);
  redirect(`/admin/projects/${parsed.value.projectId}`);
}
