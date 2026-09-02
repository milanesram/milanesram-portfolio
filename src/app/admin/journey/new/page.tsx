import { JourneyForm } from "@/components/admin/JourneyForm";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { listAdminJourneyMediaChoices } from "@/lib/admin/journey/queries";
import { redirect } from "next/navigation";

export default async function NewJourneyPage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const mediaResult = await listAdminJourneyMediaChoices(auth.supabase);

  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl text-ink">New Journey milestone</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        Drafts may have no image. Publishing requires an approved public image.
      </p>
      {mediaResult.error ? (
        <p role="alert" className="mt-8 text-sm text-danger">
          Media choices could not be loaded.
        </p>
      ) : (
        <div className="mt-8 rounded-xl border border-line bg-paper-elevated p-6">
          <JourneyForm mediaChoices={mediaResult.data ?? []} />
        </div>
      )}
    </div>
  );
}
