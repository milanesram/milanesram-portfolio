import { CredentialForm } from "@/components/admin/CredentialForm";

export default function NewCredentialPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl text-ink">New credential</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        New records default to draft. Public pages show a credential only when
        it is published and not held for verification.
      </p>
      <div className="mt-8 rounded-xl border border-line bg-paper-elevated p-6">
        <CredentialForm />
      </div>
    </div>
  );
}
