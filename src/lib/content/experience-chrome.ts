import { cache } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { mapIndexChrome, type PublicIndexChrome } from "./index-chrome";

export type PublicExperiencePage = PublicIndexChrome & {
  additionalHeading: string;
};

export type PublishedExperiencePageResult =
  | { ok: true; page: PublicExperiencePage }
  | { ok: true; page: null }
  | { ok: false };

const COLUMNS = "status, kicker, headline, lede, additional_heading";

async function loadPublishedExperiencePage(): Promise<PublishedExperiencePageResult> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("experience_page")
    .select(COLUMNS)
    .eq("singleton_key", "default")
    .maybeSingle();

  if (error) {
    return { ok: false };
  }

  if (!data) {
    return { ok: true, page: null };
  }

  const chrome = mapIndexChrome(data, "Experience");
  const additionalHeading = data.additional_heading.trim();

  if (!chrome || !additionalHeading) {
    return { ok: true, page: null };
  }

  return { ok: true, page: { ...chrome, additionalHeading } };
}

export const getPublishedExperiencePage = cache(loadPublishedExperiencePage);
