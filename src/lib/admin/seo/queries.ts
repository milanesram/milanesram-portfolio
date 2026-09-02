import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentStatus, Database, PageSeoKey } from "@/lib/supabase/database.types";

type AdminClient = SupabaseClient<Database>;

export type AdminPageSeo = {
  id: string;
  page_key: PageSeoKey;
  title: string;
  description: string;
  og_title: string | null;
  og_description: string | null;
  indexable: boolean;
  status: ContentStatus;
  updated_at: string;
};

const SEO_COLUMNS =
  "id, page_key, title, description, og_title, og_description, indexable, status, updated_at";

export async function listAdminPageSeo(client: AdminClient) {
  return client.from("page_seo").select(SEO_COLUMNS).order("page_key", {
    ascending: true,
  });
}

export async function getAdminPageSeoByKey(
  client: AdminClient,
  pageKey: PageSeoKey,
) {
  return client
    .from("page_seo")
    .select(SEO_COLUMNS)
    .eq("page_key", pageKey)
    .maybeSingle();
}
