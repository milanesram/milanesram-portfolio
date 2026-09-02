import Link from "next/link";
import { ResumePageForm } from "@/components/admin/ResumePageForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminMutation } from "@/lib/admin/authorization";
import {
  getAdminResumePage,
  listAdminResumeTracks,
} from "@/lib/admin/resume/queries";
import { redirect } from "next/navigation";

export default async function AdminResumePage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const [pageResult, listResult] = await Promise.all([
    getAdminResumePage(auth.supabase),
    listAdminResumeTracks(auth.supabase),
  ]);
  const tracks = listResult.error ? [] : (listResult.data ?? []);

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl text-ink">Resume page</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            Headline, request copy, and closing CTA. Public SEO is managed
            separately. Version 1.0 delivery stays request-based.
          </p>
        </div>
        {pageResult.error ? (
          <p role="alert" className="text-sm text-danger">
            Resume page settings could not be loaded.
          </p>
        ) : (
          <div className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
            <ResumePageForm page={pageResult.data} />
          </div>
        )}
      </section>
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-ink">Resume tracks</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
              A third track can be added here without a matching Focus route.
            </p>
          </div>
          <Link
            href="/admin/resume/new"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated"
          >
            New track
          </Link>
        </div>
        {listResult.error ? (
          <p role="alert" className="mt-8 text-sm text-danger">
            Resume tracks could not be loaded.
          </p>
        ) : null}
        {tracks.length === 0 && !listResult.error ? (
          <p className="mt-8 rounded-xl border border-dashed border-line bg-paper-elevated p-6 text-sm text-ink-soft">
            No Resume tracks yet.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-paper-elevated">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">Resume tracks</caption>
              <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-ink-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Delivery</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((track) => (
                  <tr key={track.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/resume/${track.id}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {track.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{track.delivery_mode}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={track.status} />
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{track.sort_order}</td>
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
