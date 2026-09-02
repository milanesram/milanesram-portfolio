import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { listAdminJourneyMilestones } from "@/lib/admin/journey/queries";
import { redirect } from "next/navigation";

export default async function AdminJourneyPage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const { data, error } = await listAdminJourneyMilestones(auth.supabase);
  const milestones = error ? [] : (data ?? []);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ink">Journey milestones</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            Professional events with optional media. Public About shows
            published milestones that have an eligible image.
          </p>
        </div>
        <Link
          href="/admin/journey/new"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated"
        >
          New milestone
        </Link>
      </div>

      {error ? (
        <p role="alert" className="mt-8 text-sm text-danger">
          Journey milestones could not be loaded.
        </p>
      ) : null}

      <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-paper-elevated">
        <table className="min-w-full text-left text-sm">
          <caption className="sr-only">Journey milestones</caption>
          <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-ink-faint">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Year</th>
              <th className="px-4 py-3 font-medium">Media</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Order</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((item) => (
              <tr key={item.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/journey/${item.id}`}
                    className="font-medium text-ink hover:underline"
                  >
                    {item.title}
                  </Link>
                  {!item.media_asset_id ? (
                    <p className="mt-1 text-xs text-ink-soft">
                      Media required before publication
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-ink-soft">{item.year ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {item.media_asset_id ? "Attached" : "None"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3 text-ink-soft">{item.sort_order}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
