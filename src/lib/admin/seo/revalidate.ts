import { revalidatePath } from "next/cache";
import { PAGE_SEO_PATHS } from "@/lib/content/page-seo";
import type { PageSeoKey } from "@/lib/supabase/database.types";

export function revalidateSeoSurfaces(pageKey: PageSeoKey) {
  const path = PAGE_SEO_PATHS[pageKey];
  revalidatePath(path || "/");
  revalidatePath("/admin/seo");
  revalidatePath(`/admin/seo/${pageKey}`);
  revalidatePath("/robots.txt");
  revalidatePath("/sitemap.xml");
}
