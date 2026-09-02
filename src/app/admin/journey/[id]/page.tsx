import { notFound, redirect } from "next/navigation";
import { JourneyForm } from "@/components/admin/JourneyForm";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { readUuid } from "@/lib/admin/ids";
import {
  getAdminJourneyMilestone,
  listAdminJourneyMediaChoices,
} from "@/lib/admin/journey/queries";

export default async function EditJourneyPage({
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

  const [milestoneResult, mediaResult] = await Promise.all([
    getAdminJourneyMilestone(auth.supabase, id),
    listAdminJourneyMediaChoices(auth.supabase),
  ]);

  if (milestoneResult.error) {
    return (
      <p role="alert" className="text-sm text-danger">
        Journey milestone could not be loaded.
      </p>
    );
  }

  if (!milestoneResult.data) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl text-ink">Edit Journey milestone</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        Caption and year live on the milestone. The media asset stays an
        optional presentation file.
      </p>
      {mediaResult.error ? (
        <p role="alert" className="mt-8 text-sm text-danger">
          Media choices could not be loaded.
        </p>
      ) : (
        <div className="mt-8 rounded-xl border border-line bg-paper-elevated p-6">
          <JourneyForm
            milestone={milestoneResult.data}
            mediaChoices={mediaResult.data ?? []}
          />
        </div>
      )}
    </div>
  );
}
