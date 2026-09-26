"use server";

import { revalidatePath } from "next/cache";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { getAdminResumeRequest } from "@/lib/admin/resume-requests/queries";
import { parseResumeRequestStatusForm } from "@/lib/admin/resume-requests/validation";

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
