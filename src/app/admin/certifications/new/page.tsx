import { CertificationForm } from "@/components/admin/CertificationForm";

export default function NewCertificationPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl text-ink">New certification</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        New records are stored as credentials with kind{" "}
        <code>certification</code> and default to draft unless you publish.
        Public pages show a credential only when it is published and not held.
      </p>
      <div className="mt-8 rounded-xl border border-line bg-paper-elevated p-6">
        <CertificationForm />
      </div>
    </div>
  );
}
