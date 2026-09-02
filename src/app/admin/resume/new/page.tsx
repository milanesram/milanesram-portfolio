import { ResumeTrackForm } from "@/components/admin/ResumeTrackForm";
import { requireAdminMutation } from "@/lib/admin/authorization";
import {
  listAdminFocusChoices,
  listAdminResumeMediaChoices,
} from "@/lib/admin/resume/queries";
import { redirect } from "next/navigation";

export default async function AdminNewResumeTrackPage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const [focusResult, mediaResult] = await Promise.all([
    listAdminFocusChoices(auth.supabase),
    listAdminResumeMediaChoices(auth.supabase),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-ink">New Resume track</h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Focus relationship is optional. Public-file delivery requires an
          eligible resume PDF.
        </p>
      </div>
      <div className="rounded-xl border border-line bg-paper-elevated p-6">
        <ResumeTrackForm
          focusChoices={focusResult.data ?? []}
          mediaChoices={mediaResult.data ?? []}
        />
      </div>
    </div>
  );
}
