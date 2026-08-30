import { LicenseForm } from "@/components/admin/LicenseForm";

export default function NewLicensePage() {
  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl text-ink">New license</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        New records are stored as credentials with kind <code>license</code>{" "}
        and default to draft unless you publish. Public pages will not show
        this until they are switched to the Supabase adapter.
      </p>
      <div className="mt-8 rounded-xl border border-line bg-paper-elevated p-6">
        <LicenseForm />
      </div>
    </div>
  );
}
