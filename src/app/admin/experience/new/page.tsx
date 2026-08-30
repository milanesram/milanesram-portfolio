import { ExperienceForm } from "@/components/admin/ExperienceForm";

export default function NewExperiencePage() {
  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl text-ink">New experience</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        New records default to draft unless you publish. Public pages will not
        show this until they are switched to the Supabase adapter.
      </p>
      <div className="mt-8 rounded-xl border border-line bg-paper-elevated p-6">
        <ExperienceForm />
      </div>
    </div>
  );
}
