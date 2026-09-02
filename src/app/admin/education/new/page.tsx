import { EducationForm } from "@/components/admin/EducationForm";

export default function NewEducationPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl text-ink">New education</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        New records are stored as credentials with kind{" "}
        <code>degree</code> and default to draft unless you publish. Public
        pages show a credential only when it is published and not held.
      </p>
      <div className="mt-8 rounded-xl border border-line bg-paper-elevated p-6">
        <EducationForm />
      </div>
    </div>
  );
}
