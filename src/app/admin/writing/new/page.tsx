import { PublicationForm } from "@/components/admin/PublicationForm";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { listAdminPublicationMediaChoices } from "@/lib/admin/writing/queries";
import { redirect } from "next/navigation";

export default async function AdminNewWritingPage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const mediaResult = await listAdminPublicationMediaChoices(auth.supabase);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-ink">New publication</h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Upload the PDF in Media first when hosting a file. Link-only works
          keep the external HTTPS URL as authority.
        </p>
      </div>
      <div className="rounded-xl border border-line bg-paper-elevated p-6">
        <PublicationForm mediaChoices={mediaResult.data ?? []} />
      </div>
    </div>
  );
}
