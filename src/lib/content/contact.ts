import { cache } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import {
  mapContactPage,
  type ContactPageRow,
  type PublicContactPage,
} from "@/lib/content/contact-page";

export type { PublicContactPage } from "@/lib/content/contact-page";
export {
  selectVisibleContactChannels,
  type ResumeContactChannels,
  type PublicContactChannel,
} from "@/lib/content/contact-page";

export type PublishedContactPageResult =
  | { ok: true; page: PublicContactPage }
  | { ok: true; page: null }
  | { ok: false };

const CONTACT_COLUMNS =
  "status, kicker, headline, lede, email_enabled, linkedin_enabled, email_label, linkedin_label, form_intro, cta_heading, cta_lede";

async function loadPublishedContactPage(): Promise<PublishedContactPageResult> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("contact_page")
    .select(CONTACT_COLUMNS)
    .eq("singleton_key", "default")
    .maybeSingle();

  if (error) {
    return { ok: false };
  }

  if (!data) {
    return { ok: true, page: null };
  }

  return { ok: true, page: mapContactPage(data as ContactPageRow) };
}

export const getPublishedContactPage = cache(loadPublishedContactPage);
