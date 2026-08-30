import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { listAdminProjects } from "@/lib/admin/projects/queries";
import { redirect } from "next/navigation";

export default async function AdminProjectsPage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const { data, error } = await listAdminProjects(auth.supabase);
  const projects = error ? [] : (data ?? []);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ink">All projects</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            Drafts stay in the admin. Public pages still use local content until
            the reviewed seed is applied and the public adapter is switched on.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated"
        >
          New project
        </Link>
      </div>

      {error ? (
        <p role="alert" className="mt-8 text-sm text-danger">
          Projects could not be loaded.
        </p>
      ) : null}

      {projects.length === 0 && !error ? (
        <p className="mt-8 rounded-xl border border-dashed border-line bg-paper-elevated p-6 text-sm text-ink-soft">
          No projects in Supabase yet. Create one here, or apply the reviewed
          PrivAI Guard seed in a later step.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-paper-elevated">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Projects</caption>
            <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-ink-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                <th className="px-4 py-3 font-medium">Order</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {project.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                    {project.slug}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {project.is_featured ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{project.sort_order}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
