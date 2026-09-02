import { revalidatePath } from "next/cache";

export function revalidateWritingSurfaces(slug?: string) {
  revalidatePath("/writing");
  revalidatePath("/admin/writing");
  revalidatePath("/sitemap.xml");

  if (slug) {
    revalidatePath(`/writing/${slug}`);
  }
}

export function revalidateWritingFocusSurfaces(slugs: string[]) {
  for (const slug of slugs) {
    revalidatePath(`/focus/${slug}`);
  }
}
