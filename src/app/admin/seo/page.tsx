import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { listAdminPageSeo } from "@/lib/admin/seo/queries";
import { PAGE_SEO_KEYS, PAGE_SEO_LABELS, PAGE_SEO_PATHS } from "@/lib/content/page-seo";
import { redirect } from "next/navigation";

export default async function AdminSeoPage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const { data, error } = await listAdminPageSeo(auth.supabase);
  const records = error ? [] : (data ?? []);
  const byKey = new Map(records.map((record) => [record.page_key, record]));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-ink">Page SEO</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Known top-level routes only. Writing and Project detail metadata stays
          on those records. Admin routes remain excluded from indexing.
        </p>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          SEO records could not be loaded.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-paper-elevated">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Page SEO records</caption>
            <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-ink-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Page</th>
                <th className="px-4 py-3 font-medium">Path</th>
                <th className="px-4 py-3 font-medium">Indexable</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {PAGE_SEO_KEYS.map((key) => {
                const record = byKey.get(key);
                return (
                  <tr key={key} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/seo/${key}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {PAGE_SEO_LABELS[key]}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {PAGE_SEO_PATHS[key] || "/"}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {record?.indexable === false ? "No" : "Yes"}
                    </td>
                    <td className="px-4 py-3">
                      {record ? <StatusBadge status={record.status} /> : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
