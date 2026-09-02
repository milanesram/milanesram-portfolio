import { revalidatePath } from "next/cache";

export function revalidateContactSurfaces() {
  revalidatePath("/contact");
  revalidatePath("/admin/contact");
  revalidatePath("/", "layout");
}
