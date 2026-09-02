import { ContactPageForm } from "@/components/admin/ContactPageForm";
import { requireAdminMutation } from "@/lib/admin/authorization";
import {
  getAdminContactFormFlag,
  getAdminContactPage,
} from "@/lib/admin/contact/queries";
import { redirect } from "next/navigation";

export default async function AdminContactPage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const [pageResult, flagResult] = await Promise.all([
    getAdminContactPage(auth.supabase),
    getAdminContactFormFlag(auth.supabase),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-ink">Contact page</h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Editorial copy and channel visibility. Email and LinkedIn values remain
          on Site Profile.
        </p>
      </div>
      {pageResult.error ? (
        <p role="alert" className="text-sm text-danger">
          Contact settings could not be loaded.
        </p>
      ) : (
        <div className="rounded-xl border border-line bg-paper-elevated p-6">
          <ContactPageForm
            page={pageResult.data}
            formEnabled={flagResult.data?.contact_form_enabled === true}
          />
        </div>
      )}
    </div>
  );
}
