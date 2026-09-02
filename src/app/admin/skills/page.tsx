import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { listAdminFocusPages } from "@/lib/admin/skills/queries";
import { redirect } from "next/navigation";

export default async function AdminSkillsPage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const { data, error } = await listAdminFocusPages(auth.supabase);
  const records = error ? [] : (data ?? []);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ink">All skill groups</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            Skills are stored as the <code>competencies</code> array on{" "}
            <code>focus_pages</code>. Public Focus, Home track cards, and
            Resume track cards read published hosted Focus records.
          </p>
        </div>
        <Link
          href="/admin/skills/new"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated"
        >
          New skill group
        </Link>
      </div>

      {error ? (
        <p role="alert" className="mt-8 text-sm text-danger">
          Skill groups could not be loaded.
        </p>
      ) : null}

      {records.length === 0 && !error ? (
        <p className="mt-8 rounded-xl border border-dashed border-line bg-paper-elevated p-6 text-sm text-ink-soft">
          No focus pages in Supabase yet. Create a disposable group here. Do
          not load real competency names in this step.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-paper-elevated">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Skill groups</caption>
            <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-ink-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Nav label</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Skills</th>
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
                      href={`/admin/skills/${record.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {record.nav_label}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{record.slug}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {record.competencies.length}
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
