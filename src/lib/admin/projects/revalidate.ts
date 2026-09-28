import { revalidatePath } from "next/cache";

export function revalidateProjectSurfaces(slug?: string) {
  revalidatePath("/projects");
  revalidatePath("/");
  revalidatePath("/focus/cybersecurity-grc");
  revalidatePath("/focus/privacy-compliance-assurance");
  revalidatePath("/admin/projects");

  if (slug) {
    revalidatePath(`/projects/${slug}`);
  }
}
