"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { readUuid } from "@/lib/admin/ids";
import { getAdminInquiry } from "@/lib/admin/inquiries/queries";
import {
  parseInquiryReadFormData,
  readAtFromIntent,
} from "@/lib/admin/inquiries/validation";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const SAVE_FAILED = "The inquiry could not be saved.";

function revalidateAdminInquiries(id?: string) {
  revalidatePath("/admin/inquiries");

  if (id) {
    revalidatePath(`/admin/inquiries/${id}`);
  }
}

export async function updateInquiryReadAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseInquiryReadFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const existing = await getAdminInquiry(auth.supabase, parsed.value.id);

  if (existing.error || !existing.data) {
    return { error: SAVE_FAILED, message: null };
  }

  const { error } = await auth.supabase
    .from("inquiries")
    .update({
      read_at: readAtFromIntent(parsed.value.intent),
    })
    .eq("id", existing.data.id);

  if (error) {
    return { error: SAVE_FAILED, message: null };
  }

  revalidateAdminInquiries(existing.data.id);

  return {
    error: null,
    message:
      parsed.value.intent === "read" ? "Marked as read." : "Marked as unread.",
  };
}

export async function deleteInquiryAction(formData: FormData) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const id = readUuid(formData.get("id"));

  if (!id) {
    return;
  }

  const existing = await getAdminInquiry(auth.supabase, id);

  if (existing.error || !existing.data) {
    return;
  }

  const { error } = await auth.supabase
    .from("inquiries")
    .delete()
    .eq("id", id);

  if (error) {
    return;
  }

  revalidateAdminInquiries(id);
  redirect("/admin/inquiries");
}
