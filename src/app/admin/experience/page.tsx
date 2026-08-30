import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { listAdminExperiences } from "@/lib/admin/experience/queries";
import { redirect } from "next/navigation";

const KIND_LABELS = {
  employment: "Employment",
  consulting: "Consulting",
  additional: "Additional",
  leadership: "Leadership",
} as const;

function formatRange(
  startDate: string,
  endDate: string | null,
  isCurrent: boolean,
) {
  if (isCurrent) {
    return `${startDate} – current`;
  }

  if (endDate) {
    return `${startDate} – ${endDate}`;
  }

  return startDate;
}

export default async function AdminExperiencePage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const { data, error } = await listAdminExperiences(auth.supabase);
  const experiences = error ? [] : (data ?? []);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ink">All experience</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            Drafts stay in the admin. Public pages still use local content until
            a later step switches them to the Supabase adapter.
          </p>
        </div>
        <Link
          href="/admin/experience/new"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated"
        >
          New experience
        </Link>
      </div>

      {error ? (
        <p role="alert" className="mt-8 text-sm text-danger">
          Experience records could not be loaded.
        </p>
      ) : null}

      {experiences.length === 0 && !error ? (
        <p className="mt-8 rounded-xl border border-dashed border-line bg-paper-elevated p-6 text-sm text-ink-soft">
          No experience records in Supabase yet. Create one here. Do not load
          real employment history in this step.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-paper-elevated">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Experience</caption>
            <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-ink-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Kind</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Order</th>
              </tr>
            </thead>
            <tbody>
              {experiences.map((experience) => (
                <tr
                  key={experience.id}
                  className="border-b border-line last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/experience/${experience.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {experience.title}
                    </Link>
                    {experience.title_secondary ? (
                      <p className="mt-1 text-xs text-ink-faint">
                        {experience.title_secondary}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {experience.organization}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {KIND_LABELS[experience.kind]}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {formatRange(
                      experience.start_date,
                      experience.end_date,
                      experience.is_current,
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={experience.status} />
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {experience.sort_order}
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
