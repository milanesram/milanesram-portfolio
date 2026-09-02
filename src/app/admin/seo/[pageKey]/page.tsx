import { notFound, redirect } from "next/navigation";
import { PageSeoForm } from "@/components/admin/PageSeoForm";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { getAdminPageSeoByKey } from "@/lib/admin/seo/queries";
import { isPageSeoKey, PAGE_SEO_LABELS } from "@/lib/content/page-seo";

export default async function AdminSeoRecordPage({
  params,
}: {
  params: Promise<{ pageKey: string }>;
}) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const { pageKey } = await params;

  if (!isPageSeoKey(pageKey)) {
    notFound();
  }

  const { data, error } = await getAdminPageSeoByKey(auth.supabase, pageKey);

  if (error || !data) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-ink">{PAGE_SEO_LABELS[pageKey]}</h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Editing this record does not create a new application route.
        </p>
      </div>
      <div className="rounded-xl border border-line bg-paper-elevated p-6">
        <PageSeoForm record={data} />
      </div>
    </div>
  );
}
