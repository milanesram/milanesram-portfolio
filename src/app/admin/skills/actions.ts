"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { readUuid } from "@/lib/admin/ids";
import { getAdminFocusPage } from "@/lib/admin/skills/queries";
import {
  isPubliclySelectableCredential,
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

function revalidateFocusSurfaces(id?: string) {
  revalidatePath("/admin/skills");
  revalidatePath("/");
  revalidatePath("/resume");
  revalidatePath("/focus/cybersecurity-grc");
  revalidatePath("/focus/privacy-ai-governance");

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

  const experienceIds = input.experienceLinks.map((link) => link.experienceItemId);
  const credentialIds = input.credentialLinks.map((link) => link.credentialId);

  if (experienceIds.length > 0) {
    const found = await auth.supabase
      .from("experience_items")
      .select("id")
      .in("id", experienceIds);

    if (found.error || (found.data ?? []).length !== experienceIds.length) {
      return { error: "An experience selection does not exist.", message: null };
    }
  }

  if (credentialIds.length > 0) {
    const unique = [...new Set(credentialIds)];
    const found = await auth.supabase
      .from("credentials")
      .select("id, status, needs_verification")
      .in("id", unique);

    if (found.error || (found.data ?? []).length !== unique.length) {
      return { error: "A credential selection does not exist.", message: null };
    }

    const ineligible = (found.data ?? []).some(
      (row) =>
        !isPubliclySelectableCredential({
          status: row.status,
          needsVerification: row.needs_verification,
        }),
    );

    if (ineligible) {
      return {
        error: "Selected credentials must be published and verified.",
        message: null,
      };
    }
  }

  if (input.featuredProjectId) {
    const found = await auth.supabase
      .from("projects")
      .select("id")
      .eq("id", input.featuredProjectId)
      .maybeSingle();

    if (found.error || !found.data) {
      return { error: "That project selection does not exist.", message: null };
    }
  }

  if (input.featuredPublicationId) {
    const found = await auth.supabase
      .from("publications")
      .select("id")
      .eq("id", input.featuredPublicationId)
      .maybeSingle();

    if (found.error || !found.data) {
      return { error: "That publication selection does not exist.", message: null };
    }
  }

  const values = {
    slug: input.slug,
    nav_label: input.navLabel,
    headline: input.headline,
    summary: input.summary,
    card_summary: input.cardSummary,
    card_chips: input.cardChips,
    featured_project_lede: input.featuredProjectLede || null,
    featured_project_id: input.featuredProjectId,
    featured_publication_id: input.featuredPublicationId,
    sort_order: input.sortOrder,
    status: statusFromIntent(input.intent, currentStatus),
  };

  let pageId = input.id;

  if (!input.id) {
    const { data, error } = await auth.supabase
      .from("focus_pages")
      .insert({ ...values, competencies: [] })
      .select("id")
      .single();

    if (error || !data) {
      return { error: mapWriteError(error?.code), message: null };
    }

    pageId = data.id;
  } else {
    const { error } = await auth.supabase
      .from("focus_pages")
      .update(values)
      .eq("id", input.id);

    if (error) {
      return { error: mapWriteError(error.code), message: null };
    }
  }

  if (!pageId) {
    return { error: SAVE_FAILED, message: null };
  }

  const [experienceDelete, credentialsDelete] = await Promise.all([
    auth.supabase.from("focus_experience_items").delete().eq("focus_page_id", pageId),
    auth.supabase.from("focus_credentials").delete().eq("focus_page_id", pageId),
  ]);

  if (experienceDelete.error || credentialsDelete.error) {
    return { error: SAVE_FAILED, message: null };
  }

  if (input.experienceLinks.length > 0) {
    const { error } = await auth.supabase.from("focus_experience_items").insert(
      input.experienceLinks.map((link) => ({
        focus_page_id: pageId,
        experience_item_id: link.experienceItemId,
        sort_order: link.sortOrder,
      })),
    );

    if (error) {
      return { error: mapWriteError(error.code), message: null };
    }
  }

  if (input.credentialLinks.length > 0) {
    const { error } = await auth.supabase.from("focus_credentials").insert(
      input.credentialLinks.map((link) => ({
        focus_page_id: pageId,
        credential_id: link.credentialId,
        sort_order: link.sortOrder,
      })),
    );

    if (error) {
      return { error: mapWriteError(error.code), message: null };
    }
  }

  revalidateFocusSurfaces(pageId);

  if (!input.id) {
    redirect(`/admin/skills/${pageId}`);
  }

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

  revalidateFocusSurfaces(id);
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
    return { error: mapWriteError(error?.code), message: null };
  }

  revalidateFocusSurfaces(pageId);
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

  revalidateFocusSurfaces(parsed.value.pageId);
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

  revalidateFocusSurfaces(parsed.value.pageId);
}
