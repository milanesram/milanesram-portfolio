import { cache } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { PageSeoKey } from "@/lib/supabase/database.types";
import {
  mapPageSeo,
  resolvePageSeo,
  type PageSeoRow,
  type PublicPageSeo,
} from "@/lib/content/page-seo";

export type { PublicPageSeo } from "@/lib/content/page-seo";

export type PublishedPageSeoResult =
  | { ok: true; records: PublicPageSeo[] }
  | { ok: false };

const SEO_COLUMNS =
  "page_key, title, description, og_title, og_description, indexable, status";

async function loadPublishedPageSeo(): Promise<PublishedPageSeoResult> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("page_seo")
    .select(SEO_COLUMNS)
    .eq("status", "published");

  if (error || !data) {
    return { ok: false };
  }

  return {
    ok: true,
    records: data.flatMap((row) => {
      const mapped = mapPageSeo(row as PageSeoRow);
      return mapped ? [mapped] : [];
    }),
  };
}

async function loadPublicSiteIndexability(): Promise<boolean | null> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("site_indexable")
    .eq("singleton_key", "default")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.site_indexable;
}

export const getPublishedPageSeo = cache(loadPublishedPageSeo);
export const getPublicSiteIndexability = cache(loadPublicSiteIndexability);

export async function getPublishedPageSeoByKey(
  pageKey: PageSeoKey,
): Promise<PublicPageSeo> {
  const result = await getPublishedPageSeo();

  if (!result.ok) {
    return resolvePageSeo(null, pageKey);
  }

  return (
    result.records.find((item) => item.pageKey === pageKey) ??
    resolvePageSeo(null, pageKey)
  );
}
