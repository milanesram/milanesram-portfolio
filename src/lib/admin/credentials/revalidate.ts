import { revalidatePath } from "next/cache";

export function revalidateCredentialSurfaces(id?: string) {
  revalidatePath("/credentials");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/focus/cybersecurity-grc");
  revalidatePath("/focus/privacy-ai-governance");
  revalidatePath("/admin/credentials");
  revalidatePath("/admin/education");
  revalidatePath("/admin/certifications");
  revalidatePath("/admin/training");
  revalidatePath("/admin/licenses");
  revalidatePath("/admin/about");
  revalidatePath("/admin/home");
  revalidatePath("/admin/skills");

  if (id) {
    revalidatePath(`/admin/credentials/${id}`);
    revalidatePath(`/admin/education/${id}`);
    revalidatePath(`/admin/certifications/${id}`);
    revalidatePath(`/admin/training/${id}`);
    revalidatePath(`/admin/licenses/${id}`);
  }
}

export function revalidateAboutEducationSurfaces() {
  revalidatePath("/about");
  revalidatePath("/admin/about");
}

export function revalidateCredentialsPageSurfaces() {
  revalidatePath("/credentials");
  revalidatePath("/admin/credentials");
}
