import { revalidatePath } from "next/cache";

export function revalidateResumeSurfaces() {
  revalidatePath("/resume");
  revalidatePath("/admin/resume");
}

export function revalidateResumeTrackSurfaces(id?: string) {
  revalidateResumeSurfaces();
  revalidatePath("/");

  if (id) {
    revalidatePath(`/admin/resume/${id}`);
  }
}
