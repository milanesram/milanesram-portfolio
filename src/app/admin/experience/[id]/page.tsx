import { notFound, redirect } from "next/navigation";
import {
  DeleteExperienceButton,
  ExperienceForm,
} from "@/components/admin/ExperienceForm";
import { ExperienceItemEditor } from "@/components/admin/ExperienceItemEditor";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { isUuid } from "@/lib/admin/ids";
import {
  getAdminExperience,
  listAdminExperienceItems,
} from "@/lib/admin/experience/queries";

export default async function EditExperiencePage({
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

  const experienceResult = await getAdminExperience(auth.supabase, id);

  if (experienceResult.error || !experienceResult.data) {
    notFound();
  }

  const itemsResult = await listAdminExperienceItems(auth.supabase, id);
  const items = itemsResult.error ? [] : (itemsResult.data ?? []);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-serif text-2xl text-ink">
          {experienceResult.data.title}
        </h2>
        <StatusBadge status={experienceResult.data.status} />
      </div>

      <section className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
        <h3 className="font-serif text-xl text-ink">Experience details</h3>
        <div className="mt-6 space-y-5">
          <ExperienceForm experience={experienceResult.data} />
          <DeleteExperienceButton
            experienceId={experienceResult.data.id}
            title={experienceResult.data.title}
          />
        </div>
      </section>

      <section>
        <h3 className="font-serif text-xl text-ink">Items</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Ordered bullets and optional metrics. Delete requires confirmation. An
          item can only be changed if it belongs to this experience.
        </p>
        <div className="mt-6">
          <ExperienceItemEditor
            experienceId={experienceResult.data.id}
            items={items}
          />
        </div>
      </section>
    </div>
  );
}
