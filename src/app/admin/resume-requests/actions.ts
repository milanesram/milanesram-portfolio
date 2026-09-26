"use server";

import { revalidatePath } from "next/cache";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { getAdminResumeRequest } from "@/lib/admin/resume-requests/queries";
import { parseResumeRequestStatusForm } from "@/lib/admin/resume-requests/validation";
import {
  fulfillmentAssetError,
  fulfillmentAuditFields,
  FULFILLMENT_DOCUMENT_LABELS,
  resolveFulfillmentDocument,
} from "@/lib/admin/resume-fulfillment/policy";
import {
  createPrivateSignedUrl,
  readActivePrivateDocument,
} from "@/lib/admin/resume-fulfillment/storage";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const SAVE_FAILED = "The request could not be saved.";

function revalidateResumeRequests(id?: string) {
  revalidatePath("/admin/resume-requests");

  if (id) {
    revalidatePath(`/admin/resume-requests/${id}`);
  }
}

export async function updateResumeRequestStatusAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseResumeRequestStatusForm(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const existing = await getAdminResumeRequest(auth.supabase, parsed.value.id);

  if (existing.error || !existing.data) {
    return { error: SAVE_FAILED, message: null };
  }

  const { error } = await auth.supabase
    .from("resume_requests")
    .update({ status: parsed.value.status })
    .eq("id", existing.data.id);

  if (error) {
    return { error: SAVE_FAILED, message: null };
  }

  revalidateResumeRequests(existing.data.id);

  return { error: null, message: "Status saved." };
}

export type FulfillmentState = {
  error: string | null;
  link: string | null;
  expiresAt: string | null;
  documentLabel: string | null;
};

const FULFILLMENT_FAILED = "The document link could not be created.";

export async function generateResumeFulfillmentLinkAction(
  _previous: FulfillmentState,
  formData: FormData,
): Promise<FulfillmentState> {
  const empty = {
    error: FULFILLMENT_FAILED,
    link: null,
    expiresAt: null,
    documentLabel: null,
  };
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { ...empty, error: auth.error };
  }

  const id = formData.get("id");
  const requestId = typeof id === "string" ? id : "";
  const existing = await getAdminResumeRequest(auth.supabase, requestId);

  if (existing.error || !existing.data) {
    return empty;
  }

  const selected = formData.get("documentKey");
  const resolved = resolveFulfillmentDocument(
    existing.data.resume_choice,
    typeof selected === "string" ? selected : null,
  );

  if (!resolved.ok) {
    return { ...empty, error: resolved.error };
  }

  const asset = await readActivePrivateDocument(resolved.document);
  const unavailable = fulfillmentAssetError(resolved.document, {
    [resolved.document]: asset ? { active: true } : { active: false },
  });

  if (unavailable || !asset) {
    return { ...empty, error: unavailable ?? FULFILLMENT_FAILED };
  }

  const now = new Date();
  const signed = await createPrivateSignedUrl(asset.objectPath, now);

  if (!signed) {
    return empty;
  }

  const user = await auth.supabase.auth.getUser();
  const userId = user.data.user?.id;

  if (!userId) {
    return empty;
  }

  const audit = fulfillmentAuditFields(resolved.document, userId, now);
  const { error } = await auth.supabase
    .from("resume_requests")
    .update(audit)
    .eq("id", existing.data.id);

  if (error) {
    return empty;
  }

  revalidateResumeRequests(existing.data.id);

  return {
    error: null,
    link: signed.url,
    expiresAt: signed.expiresAt,
    documentLabel: FULFILLMENT_DOCUMENT_LABELS[resolved.document],
  };
}

export async function purgeExpiredResumeRequestsAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  if (formData.get("confirm") !== "purge-expired") {
    return { error: "Confirm the purge before continuing.", message: null };
  }

  const supabase = createPrivilegedSupabaseClient();
  const { data, error } = await supabase.rpc("purge_expired_resume_requests");

  if (error || typeof data !== "number") {
    return { error: "Expired requests could not be purged.", message: null };
  }

  revalidateResumeRequests();

  return {
    error: null,
    message: `Deleted ${data} expired closed requests.`,
  };
}
