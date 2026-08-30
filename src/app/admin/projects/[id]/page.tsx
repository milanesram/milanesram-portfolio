import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { DeleteProjectButton, ProjectForm } from "@/components/admin/ProjectForm";
import { ProjectSectionEditor } from "@/components/admin/ProjectSectionEditor";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { isUuid } from "@/lib/admin/ids";
import {
  getAdminProject,
  listAdminProjectSections,
} from "@/lib/admin/projects/queries";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isUuid(id)) {
    notFound();
  }

  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const projectResult = await getAdminProject(auth.supabase, id);

  if (projectResult.error || !projectResult.data) {
    notFound();
  }

  const sectionsResult = await listAdminProjectSections(auth.supabase, id);
  const sections = sectionsResult.error ? [] : (sectionsResult.data ?? []);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-serif text-2xl text-ink">{projectResult.data.name}</h2>
        <StatusBadge status={projectResult.data.status} />
      </div>

      <section className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
        <h3 className="font-serif text-xl text-ink">Project details</h3>
        <div className="mt-6 space-y-5">
          <ProjectForm project={projectResult.data} />
          <DeleteProjectButton
            projectId={projectResult.data.id}
            name={projectResult.data.name}
          />
        </div>
      </section>

      <section>
        <h3 className="font-serif text-xl text-ink">Sections</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Ordered case-study narrative. Delete requires confirmation. A section
          can only be changed if it belongs to this project.
        </p>
        <div className="mt-6">
          <ProjectSectionEditor
            projectId={projectResult.data.id}
            sections={sections}
          />
        </div>
      </section>
    </div>
  );
}
