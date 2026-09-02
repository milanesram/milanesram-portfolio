"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { readUuid } from "@/lib/admin/ids";
import {
  LICENSE_KIND,
  getAdminLicense,
} from "@/lib/admin/licenses/queries";
import { revalidateCredentialSurfaces } from "@/lib/admin/credentials/revalidate";
import {
  parseLicenseFormData,
  statusFromIntent,
} from "@/lib/admin/licenses/validation";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const SAVE_FAILED = "The license could not be saved.";

function mapWriteError(code: string | undefined): string {
  if (code === "23514") {
    return "One or more fields did not meet the required format.";
  }

  return SAVE_FAILED;
}

function revalidateAdminLicense(id?: string) {
  revalidateCredentialSurfaces(id);
  revalidatePath("/admin/licenses");

  if (id) {
    revalidatePath(`/admin/licenses/${id}`);
  }
}

export async function saveLicenseAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseLicenseFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  let currentStatus: "draft" | "published" | "archived" | null = null;

  if (input.id) {
    const existing = await getAdminLicense(auth.supabase, input.id);

    if (existing.error || !existing.data) {
      return { error: SAVE_FAILED, message: null };
    }

    currentStatus = existing.data.status;
  }

  const values = {
    kind: LICENSE_KIND,
    name: input.name,
    issuer: input.issuer,
    year_label: input.yearLabel,
    details: input.details,
    needs_verification: input.needsVerification,
    track: input.track,
    highlight: input.highlight,
    sort_order: input.sortOrder,
    verification_url: input.verificationUrl,
    expires_on: input.expiresOn,
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

    revalidateAdminLicense(data.id);
    redirect(`/admin/licenses/${data.id}`);
  }

  const { error } = await auth.supabase
    .from("credentials")
    .update(values)
    .eq("id", input.id)
    .eq("kind", LICENSE_KIND);

  if (error) {
    return { error: mapWriteError(error.code), message: null };
  }

  revalidateAdminLicense(input.id);

  const messages: Record<typeof input.intent, string> = {
    draft: "Saved as draft.",
    publish: "Published.",
    unpublish: "Unpublished and saved as draft.",
    archive: "Archived.",
    keep: "Saved.",
  };

  return { error: null, message: messages[input.intent] };
}

export async function deleteLicenseAction(formData: FormData) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const id = readUuid(formData.get("id"));

  if (!id) {
    return;
  }

  const existing = await getAdminLicense(auth.supabase, id);

  if (existing.error || !existing.data) {
    return;
  }

  const { error } = await auth.supabase
    .from("credentials")
    .delete()
    .eq("id", id)
    .eq("kind", LICENSE_KIND);

  if (error) {
    return;
  }

  revalidateAdminLicense(id);
  redirect("/admin/licenses");
}
