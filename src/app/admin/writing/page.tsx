import Link from "next/link";
import { IndexChromeForm } from "@/components/admin/IndexChromeForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { saveWritingPageAction } from "@/app/admin/writing/actions";
import { requireAdminMutation } from "@/lib/admin/authorization";
import {
  getAdminWritingPage,
  listAdminPublications,
} from "@/lib/admin/writing/queries";
import { redirect } from "next/navigation";

const RIGHTS_LABELS = {
  host_pdf: "Hosted PDF",
  link_only: "External link",
  review_required: "Review required",
} as const;

export default async function AdminWritingPage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const [pageResult, listResult] = await Promise.all([
    getAdminWritingPage(auth.supabase),
    listAdminPublications(auth.supabase),
  ]);
  const records = listResult.error ? [] : (listResult.data ?? []);

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl text-ink">Writing page</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            Public index kicker, headline, and lede. Section labels stay in
            code. Publication facts stay in the list below.
          </p>
        </div>
        {pageResult.error ? (
          <p role="alert" className="text-sm text-danger">
            Writing page settings could not be loaded.
          </p>
        ) : (
          <div className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
            <IndexChromeForm page={pageResult.data} action={saveWritingPageAction} />
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-ink">Publications</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
              Metadata, ordering, and publication status. Hosted PDFs are
              existing files; this editor does not rewrite published works.
            </p>
          </div>
          <Link
            href="/admin/writing/new"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated"
          >
            New publication
          </Link>
        </div>

        {listResult.error ? (
          <p role="alert" className="mt-8 text-sm text-danger">
            Publications could not be loaded.
          </p>
        ) : null}

        {records.length === 0 && !listResult.error ? (
          <p className="mt-8 rounded-xl border border-dashed border-line bg-paper-elevated p-6 text-sm text-ink-soft">
            No publications in Supabase yet.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-paper-elevated">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">Publications</caption>
              <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-ink-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Delivery</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-line last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/writing/${record.id}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {record.title}
                      </Link>
                      <p className="mt-1 font-mono text-xs text-ink-faint">
                        {record.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {RIGHTS_LABELS[record.rights_status]}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {record.sort_order}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
