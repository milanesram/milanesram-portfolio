"use server";

import { revalidatePath } from "next/cache";
import { requireAdminMutation } from "@/lib/admin/authorization";
import {
  getAdminSiteProfile,
  getAdminSiteSettings,
  SETTINGS_SINGLETON_KEY,
} from "@/lib/admin/settings/queries";
import {
  parseSiteProfileFormData,
  parseSiteSettingsFormData,
  statusFromIntent,
} from "@/lib/admin/settings/validation";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const PROFILE_SAVE_FAILED = "The site profile could not be saved.";
const SETTINGS_SAVE_FAILED = "Site settings could not be saved.";

function mapWriteError(
  code: string | undefined,
  fallback: string,
): string {
  if (code === "23514") {
    return "One or more fields did not meet the required format.";
  }

  if (code === "23505") {
    return "The singleton row already exists. Reload and try again.";
  }

  return fallback;
}

function revalidateAdminSettings() {
  revalidatePath("/admin/settings");
}

function revalidatePublicSiteProfile() {
  revalidatePath("/", "layout");
}

export async function saveSiteProfileAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseSiteProfileFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  const existing = await getAdminSiteProfile(auth.supabase);

  if (existing.error) {
    return { error: PROFILE_SAVE_FAILED, message: null };
  }

  if (input.id && (!existing.data || existing.data.id !== input.id)) {
    return { error: PROFILE_SAVE_FAILED, message: null };
  }

  const values = {
    display_name: input.displayName,
    headline: input.headline,
    summary: input.summary,
    work_authorization: input.workAuthorization,
    location_display: input.locationDisplay,
    linkedin_url: input.linkedinUrl,
    public_email: input.publicEmail,
    hero_cta_primary_label: input.heroCtaPrimaryLabel,
    status: statusFromIntent(input.intent, existing.data?.status ?? null),
  };

  if (!existing.data) {
    const { error } = await auth.supabase.from("site_profile").insert({
      ...values,
      singleton_key: SETTINGS_SINGLETON_KEY,
    });

    if (error) {
      return { error: mapWriteError(error.code, PROFILE_SAVE_FAILED), message: null };
    }

    revalidateAdminSettings();
    revalidatePublicSiteProfile();

    const messages: Record<typeof input.intent, string> = {
      draft: "Saved as draft.",
      publish: "Published.",
      unpublish: "Unpublished and saved as draft.",
      archive: "Archived.",
      keep: "Saved.",
    };

    return { error: null, message: messages[input.intent] };
  }

  const { error } = await auth.supabase
    .from("site_profile")
    .update(values)
    .eq("id", existing.data.id)
    .eq("singleton_key", SETTINGS_SINGLETON_KEY);

  if (error) {
    return { error: mapWriteError(error.code, PROFILE_SAVE_FAILED), message: null };
  }

  revalidateAdminSettings();
  revalidatePublicSiteProfile();

  const messages: Record<typeof input.intent, string> = {
    draft: "Saved as draft.",
    publish: "Published.",
    unpublish: "Unpublished and saved as draft.",
    archive: "Archived.",
    keep: "Saved.",
  };

  return { error: null, message: messages[input.intent] };
}

export async function saveSiteSettingsAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseSiteSettingsFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  const existing = await getAdminSiteSettings(auth.supabase);

  if (existing.error) {
    return { error: SETTINGS_SAVE_FAILED, message: null };
  }

  if (input.id && (!existing.data || existing.data.id !== input.id)) {
    return { error: SETTINGS_SAVE_FAILED, message: null };
  }

  const values = {
    contact_form_enabled: input.contactFormEnabled,
    site_indexable: input.siteIndexable,
  };

  if (!existing.data) {
    const { error } = await auth.supabase.from("site_settings").insert({
      ...values,
      singleton_key: SETTINGS_SINGLETON_KEY,
    });

    if (error) {
      return {
        error: mapWriteError(error.code, SETTINGS_SAVE_FAILED),
        message: null,
      };
    }

    revalidateAdminSettings();
    return { error: null, message: "Saved." };
  }

  const { error } = await auth.supabase
    .from("site_settings")
    .update(values)
    .eq("id", existing.data.id)
    .eq("singleton_key", SETTINGS_SINGLETON_KEY);

  if (error) {
    return { error: mapWriteError(error.code, SETTINGS_SAVE_FAILED), message: null };
  }

  revalidateAdminSettings();
  return { error: null, message: "Saved." };
}
