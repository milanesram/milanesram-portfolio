"use server";

import { requireAdminMutation } from "@/lib/admin/authorization";
import {
  CONTACT_PAGE_SINGLETON_KEY,
  getAdminContactPage,
} from "@/lib/admin/contact/queries";
import {
  parseContactPageFormData,
  statusFromIntent,
} from "@/lib/admin/contact/validation";
import { revalidateContactSurfaces } from "@/lib/admin/contact/revalidate";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const PAGE_FAILED = "The Contact page could not be saved.";

export async function saveContactPageAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseContactPageFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  const existing = await getAdminContactPage(auth.supabase);

  if (existing.error) {
    return { error: PAGE_FAILED, message: null };
  }

  if (input.id && (!existing.data || existing.data.id !== input.id)) {
    return { error: PAGE_FAILED, message: null };
  }

  const values = {
    kicker: input.kicker,
    headline: input.headline,
    lede: input.lede,
    email_enabled: input.emailEnabled,
    linkedin_enabled: input.linkedinEnabled,
    email_label: input.emailLabel,
    linkedin_label: input.linkedinLabel,
    form_intro: input.formIntro,
    cta_heading: input.ctaHeading,
    cta_lede: input.ctaLede,
    status: statusFromIntent(input.intent, existing.data?.status ?? null),
  };

  if (!existing.data) {
    const { error } = await auth.supabase.from("contact_page").insert({
      ...values,
      singleton_key: CONTACT_PAGE_SINGLETON_KEY,
    });

    if (error) {
      return { error: PAGE_FAILED, message: null };
    }
  } else {
    const { error } = await auth.supabase
      .from("contact_page")
      .update(values)
      .eq("id", existing.data.id);

    if (error) {
      return { error: PAGE_FAILED, message: null };
    }
  }

  revalidateContactSurfaces();

  const messages: Record<typeof input.intent, string> = {
    draft: "Saved as draft.",
    publish: "Published.",
    unpublish: "Unpublished and saved as draft.",
    archive: "Archived.",
    keep: "Saved.",
  };

  return { error: null, message: messages[input.intent] };
}
