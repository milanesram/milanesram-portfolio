import { TrainingForm } from "@/components/admin/TrainingForm";

export default function NewTrainingPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl text-ink">New training</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        New records are stored as credentials with kind <code>training</code>{" "}
        and default to draft unless you publish. Public pages will not show
        this until they are switched to the Supabase adapter.
      </p>
      <div className="mt-8 rounded-xl border border-line bg-paper-elevated p-6">
        <TrainingForm />
      </div>
    </div>
  );
}
