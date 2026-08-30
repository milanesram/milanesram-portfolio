"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { readUuid } from "@/lib/admin/ids";
import {
  CERTIFICATION_KIND,
  getAdminCertification,
} from "@/lib/admin/certifications/queries";
import {
  parseCertificationFormData,
  statusFromIntent,
} from "@/lib/admin/certifications/validation";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const SAVE_FAILED = "The certification could not be saved.";

function mapWriteError(code: string | undefined): string {
  if (code === "23514") {
    return "One or more fields did not meet the required format.";
  }

  return SAVE_FAILED;
}

function revalidateAdminCertification(id?: string) {
  revalidatePath("/admin/certifications");

  if (id) {
    revalidatePath(`/admin/certifications/${id}`);
  }
}

export async function saveCertificationAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseCertificationFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  let currentStatus: "draft" | "published" | "archived" | null = null;

  if (input.id) {
    const existing = await getAdminCertification(auth.supabase, input.id);

    if (existing.error || !existing.data) {
      return { error: SAVE_FAILED, message: null };
    }

    currentStatus = existing.data.status;
  }

  const values = {
    kind: CERTIFICATION_KIND,
    name: input.name,
    issuer: input.issuer,
    year_label: input.yearLabel,
    details: input.details,
    needs_verification: input.needsVerification,
    track: input.track,
    highlight: input.highlight,
    sort_order: input.sortOrder,
    status: statusFromIntent(input.intent, currentStatus),
  };

  if (!input.id) {
    const { data, error } = await auth.supabase
      .from("credentials")
      .insert(values)
      .select("id")
      .single();

    if (error || !data) {
      return { error: mapWriteError(error?.code), message: null };
    }

    revalidateAdminCertification(data.id);
    redirect(`/admin/certifications/${data.id}`);
  }

  const { error } = await auth.supabase
    .from("credentials")
    .update(values)
    .eq("id", input.id)
    .eq("kind", CERTIFICATION_KIND);

  if (error) {
    return { error: mapWriteError(error.code), message: null };
  }

  revalidateAdminCertification(input.id);

  const messages: Record<typeof input.intent, string> = {
    draft: "Saved as draft.",
    publish: "Published.",
    unpublish: "Unpublished and saved as draft.",
    archive: "Archived.",
    keep: "Saved.",
  };

  return { error: null, message: messages[input.intent] };
}

export async function deleteCertificationAction(formData: FormData) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const id = readUuid(formData.get("id"));

  if (!id) {
    return;
  }

  const existing = await getAdminCertification(auth.supabase, id);

  if (existing.error || !existing.data) {
    return;
  }

  const { error } = await auth.supabase
    .from("credentials")
    .delete()
    .eq("id", id)
    .eq("kind", CERTIFICATION_KIND);

  if (error) {
    return;
  }

  revalidateAdminCertification(id);
  redirect("/admin/certifications");
}
