import { cache } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { mapIndexChrome, type PublicIndexChrome } from "./index-chrome";

export type PublicProjectsPage = PublicIndexChrome;

export type PublishedProjectsPageResult =
  | { ok: true; page: PublicProjectsPage }
  | { ok: true; page: null }
  | { ok: false };

const COLUMNS = "status, kicker, headline, lede";

async function loadPublishedProjectsPage(): Promise<PublishedProjectsPageResult> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("projects_page")
    .select(COLUMNS)
    .eq("singleton_key", "default")
    .maybeSingle();

  if (error) {
    return { ok: false };
  }

  if (!data) {
    return { ok: true, page: null };
  }

  const chrome = mapIndexChrome(data, "Projects");

  return { ok: true, page: chrome };
}

export const getPublishedProjectsPage = cache(loadPublishedProjectsPage);
