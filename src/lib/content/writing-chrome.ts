import { cache } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { mapIndexChrome, type PublicIndexChrome } from "./index-chrome";

export type PublicWritingPage = PublicIndexChrome;

export type PublishedWritingPageResult =
  | { ok: true; page: PublicWritingPage }
  | { ok: true; page: null }
  | { ok: false };

const COLUMNS = "status, kicker, headline, lede";

async function loadPublishedWritingPage(): Promise<PublishedWritingPageResult> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("writing_page")
    .select(COLUMNS)
    .eq("singleton_key", "default")
    .maybeSingle();

  if (error) {
    return { ok: false };
  }

  if (!data) {
    return { ok: true, page: null };
  }

  return { ok: true, page: mapIndexChrome(data, "Writing") };
}

export const getPublishedWritingPage = cache(loadPublishedWritingPage);
