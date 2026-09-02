import { notFound, redirect } from "next/navigation";
import { ResumeTrackForm } from "@/components/admin/ResumeTrackForm";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { readUuid } from "@/lib/admin/ids";
import {
  getAdminResumeTrack,
  listAdminFocusChoices,
  listAdminResumeMediaChoices,
} from "@/lib/admin/resume/queries";

export default async function AdminResumeTrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const { id: rawId } = await params;
  const id = readUuid(rawId);

  if (!id) {
    notFound();
  }

  const [trackResult, focusResult, mediaResult] = await Promise.all([
    getAdminResumeTrack(auth.supabase, id),
    listAdminFocusChoices(auth.supabase),
    listAdminResumeMediaChoices(auth.supabase),
  ]);

  if (trackResult.error || !trackResult.data) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-ink">Edit Resume track</h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Renaming a track does not rename the related Focus page.
        </p>
      </div>
      <div className="rounded-xl border border-line bg-paper-elevated p-6">
        <ResumeTrackForm
          track={trackResult.data}
          focusChoices={focusResult.data ?? []}
          mediaChoices={mediaResult.data ?? []}
        />
      </div>
    </div>
  );
}
