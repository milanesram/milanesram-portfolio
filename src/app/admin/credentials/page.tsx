import Link from "next/link";
import { CredentialsPageForm } from "@/components/admin/CredentialsPageForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { credentialEligibilityLabel } from "@/lib/admin/credentials/fields";
import {
  getAdminCredentialsPage,
  listAdminCredentials,
} from "@/lib/admin/credentials/queries";
import { redirect } from "next/navigation";

const KIND_LABELS = {
  degree: "Education",
  certification: "Certification",
  training: "Training",
  license: "License",
} as const;

export default async function AdminCredentialsPage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const [pageResult, listResult] = await Promise.all([
    getAdminCredentialsPage(auth.supabase),
    listAdminCredentials(auth.supabase),
  ]);
  const records = listResult.error ? [] : (listResult.data ?? []);

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl text-ink">Credentials page</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            Page headline and lede. Section group labels stay in code. Public
            SEO is managed under SEO.
          </p>
        </div>
        {pageResult.error ? (
          <p role="alert" className="text-sm text-danger">
            Credentials page settings could not be loaded.
          </p>
        ) : (
          <div className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
            <CredentialsPageForm page={pageResult.data} />
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-ink">All credentials</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
              Hosted credential facts used by /credentials, Home, Focus, and
              About Education. Kind-specific editors remain available as
              convenience views.
            </p>
          </div>
          <Link
            href="/admin/credentials/new"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated"
          >
            New credential
          </Link>
        </div>

        {listResult.error ? (
          <p role="alert" className="mt-8 text-sm text-danger">
            Credentials could not be loaded.
          </p>
        ) : null}

        {records.length === 0 && !listResult.error ? (
          <p className="mt-8 rounded-xl border border-dashed border-line bg-paper-elevated p-6 text-sm text-ink-soft">
            No credentials in Supabase yet.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-paper-elevated">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">Credentials</caption>
              <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-ink-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Issuer</th>
                  <th className="px-4 py-3 font-medium">Kind</th>
                  <th className="px-4 py-3 font-medium">Eligibility</th>
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
                        href={`/admin/credentials/${record.id}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {record.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{record.issuer}</td>
                    <td className="px-4 py-3 text-ink-soft">
                      {KIND_LABELS[record.kind]}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {credentialEligibilityLabel(record)}
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
