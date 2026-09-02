import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { listAdminLicenses } from "@/lib/admin/licenses/queries";
import { redirect } from "next/navigation";

const TRACK_LABELS = {
  all: "All",
  cybersecurity_grc: "Cybersecurity / GRC",
  privacy_ai: "Privacy / AI",
} as const;

export default async function AdminLicensesPage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const { data, error } = await listAdminLicenses(auth.supabase);
  const records = error ? [] : (data ?? []);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ink">All licenses</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            License rows are stored as credentials with kind{" "}
            <code>license</code>. Public pages read hosted credentials only.
          </p>
        </div>
        <Link
          href="/admin/licenses/new"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated"
        >
          New license
        </Link>
      </div>

      {error ? (
        <p role="alert" className="mt-8 text-sm text-danger">
          License records could not be loaded.
        </p>
      ) : null}

      {records.length === 0 && !error ? (
        <p className="mt-8 rounded-xl border border-dashed border-line bg-paper-elevated p-6 text-sm text-ink-soft">
          No license records in Supabase yet. Create one here. Do not load
          real license names or verification data in this step.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-paper-elevated">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Licenses</caption>
            <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-ink-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Issuer</th>
                <th className="px-4 py-3 font-medium">Year</th>
                <th className="px-4 py-3 font-medium">Track</th>
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
                      href={`/admin/licenses/${record.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {record.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{record.issuer}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {record.year_label ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {TRACK_LABELS[record.track]}
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
    </div>
  );
}
