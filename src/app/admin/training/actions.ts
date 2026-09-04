"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { readUuid } from "@/lib/admin/ids";
import {
  TRAINING_KIND,
  getAdminTraining,
} from "@/lib/admin/training/queries";
import { revalidateCredentialSurfaces } from "@/lib/admin/credentials/revalidate";
import { completePublicCmsMutation } from "@/lib/indexnow";
import { credentialPaths, isPublicCredential } from "@/lib/indexnow-content-map";
import {
  parseTrainingFormData,
  statusFromIntent,
} from "@/lib/admin/training/validation";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const SAVE_FAILED = "The training record could not be saved.";

function mapWriteError(code: string | undefined): string {
  if (code === "23514") {
    return "One or more fields did not meet the required format.";
  }

  return SAVE_FAILED;
}

function revalidateAdminTraining(id?: string) {
  revalidateCredentialSurfaces(id);
  revalidatePath("/admin/training");

  if (id) {
    revalidatePath(`/admin/training/${id}`);
  }
}

export async function saveTrainingAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseTrainingFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  let currentStatus: "draft" | "published" | "archived" | null = null;
  let currentNeedsVerification = false;

  if (input.id) {
    const existing = await getAdminTraining(auth.supabase, input.id);

    if (existing.error || !existing.data) {
      return { error: SAVE_FAILED, message: null };
    }

    currentStatus = existing.data.status;
    currentNeedsVerification = existing.data.needs_verification;
  }

  const values = {
    kind: TRAINING_KIND,
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

    await completePublicCmsMutation({
      revalidate: () => revalidateAdminTraining(data.id),
      paths: credentialPaths({
        wasPublic: false,
        isPublic: isPublicCredential({
          status: values.status,
          needsVerification: values.needs_verification,
        }),
      }),
    });
    redirect(`/admin/training/${data.id}`);
  }

  const { error } = await auth.supabase
    .from("credentials")
    .update(values)
    .eq("id", input.id)
    .eq("kind", TRAINING_KIND);

  if (error) {
    return { error: mapWriteError(error.code), message: null };
  }

  await completePublicCmsMutation({
    revalidate: () => revalidateAdminTraining(input.id ?? undefined),
    paths: credentialPaths({
      wasPublic: isPublicCredential({
        status: currentStatus,
        needsVerification: currentNeedsVerification,
      }),
      isPublic: isPublicCredential({
        status: values.status,
        needsVerification: values.needs_verification,
      }),
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

export async function deleteTrainingAction(formData: FormData) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const id = readUuid(formData.get("id"));

  if (!id) {
    return;
  }

  const existing = await getAdminTraining(auth.supabase, id);

  if (existing.error || !existing.data) {
    return;
  }

  const { error } = await auth.supabase
    .from("credentials")
    .delete()
    .eq("id", id)
    .eq("kind", TRAINING_KIND);

  if (error) {
    return;
  }

  await completePublicCmsMutation({
    revalidate: () => revalidateAdminTraining(id),
    paths: credentialPaths({
      wasPublic: isPublicCredential({
        status: existing.data.status,
        needsVerification: existing.data.needs_verification,
      }),
      isPublic: false,
    }),
  });
  redirect("/admin/training");
}
