import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminMutation } from "@/lib/admin/authorization";
import {
  listAdminMediaAssets,
  listAllMediaFocusReferences,
} from "@/lib/admin/media/queries";
import { redirect } from "next/navigation";

const KIND_LABELS = {
  resume_pdf: "Resume PDF",
  image: "Image",
  document: "Document",
} as const;

export default async function AdminMediaPage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const [assetsResult, refsResult] = await Promise.all([
    listAdminMediaAssets(auth.supabase),
    listAllMediaFocusReferences(auth.supabase),
  ]);

  const records = assetsResult.error ? [] : (assetsResult.data ?? []);
  const usage = new Map<string, number>();

  for (const row of refsResult.error ? [] : (refsResult.data ?? [])) {
    if (!row.resume_media_id) {
      continue;
    }

    usage.set(row.resume_media_id, (usage.get(row.resume_media_id) ?? 0) + 1);
  }

  return (
    <div>
      <div>
        <h2 className="font-serif text-2xl text-ink">All media</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Media rows are metadata only. Storage buckets are not configured,
          so this CMS does not create assets or upload files. Drafts and
          private rows stay in the admin. Public pages still use local
          content.
        </p>
      </div>

      {assetsResult.error ? (
        <p role="alert" className="mt-8 text-sm text-danger">
          Media records could not be loaded.
        </p>
      ) : null}

      {records.length === 0 && !assetsResult.error ? (
        <p className="mt-8 rounded-xl border border-dashed border-line bg-paper-elevated p-6 text-sm text-ink-soft">
          No media metadata in Supabase yet. There is no New action because
          a row requires a Storage object path, and upload is out of scope.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-paper-elevated">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Media assets</caption>
            <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-ink-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Kind</th>
                <th className="px-4 py-3 font-medium">Public</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Used by</th>
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
                      href={`/admin/media/${record.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {record.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {KIND_LABELS[record.kind]}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {record.is_public ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {usage.get(record.id) ?? 0} focus page
                    {(usage.get(record.id) ?? 0) === 1 ? "" : "s"}
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
