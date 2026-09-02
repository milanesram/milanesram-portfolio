import { notFound, redirect } from "next/navigation";
import {
  SkillCompetencyEditor,
  SkillFocusForm,
  DeleteFocusPageButton,
} from "@/components/admin/SkillFocusForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { isUuid } from "@/lib/admin/ids";
import {
  getAdminFocusPage,
  listAdminFocusCredentialChoices,
  listAdminFocusCredentialLinks,
  listAdminFocusExperienceChoices,
  listAdminFocusExperienceLinks,
  listAdminFocusProjectChoices,
  listAdminFocusPublicationChoices,
} from "@/lib/admin/skills/queries";

export default async function EditSkillGroupPage({
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

  const result = await getAdminFocusPage(auth.supabase, id);

  if (result.error || !result.data) {
    notFound();
  }

  const [
    experienceLinks,
    credentialLinks,
    experienceChoices,
    credentialChoices,
    projectChoices,
    publicationChoices,
  ] = await Promise.all([
    listAdminFocusExperienceLinks(auth.supabase, id),
    listAdminFocusCredentialLinks(auth.supabase, id),
    listAdminFocusExperienceChoices(auth.supabase),
    listAdminFocusCredentialChoices(auth.supabase),
    listAdminFocusProjectChoices(auth.supabase),
    listAdminFocusPublicationChoices(auth.supabase),
  ]);

  const loadError =
    experienceLinks.error ||
    credentialLinks.error ||
    experienceChoices.error ||
    credentialChoices.error ||
    projectChoices.error ||
    publicationChoices.error;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-serif text-2xl text-ink">{result.data.nav_label}</h2>
        <StatusBadge status={result.data.status} />
      </div>

      <section className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
        <h3 className="font-serif text-xl text-ink">Focus page</h3>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Core copy and supporting evidence use hosted records and UUID
          relationships. Resume media is not edited here.
        </p>
        {loadError ? (
          <p role="alert" className="mt-4 text-sm text-danger">
            Evidence choices could not be loaded.
          </p>
        ) : (
          <div className="mt-6">
            <SkillFocusForm
              page={result.data}
              experienceLinks={experienceLinks.data ?? []}
              credentialLinks={credentialLinks.data ?? []}
              experienceChoices={experienceChoices.data ?? []}
              credentialChoices={credentialChoices.data ?? []}
              projectChoices={projectChoices.data ?? []}
              publicationChoices={publicationChoices.data ?? []}
            />
          </div>
        )}
      </section>

      <section className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
        <h3 className="font-serif text-xl text-ink">Skills</h3>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          These values are the <code>competencies</code> array on this focus
          page. Reorder stays inside this group.
        </p>
        <div className="mt-6">
          <SkillCompetencyEditor
            pageId={result.data.id}
            competencies={result.data.competencies}
          />
        </div>
      </section>

      <section className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
        <DeleteFocusPageButton
          pageId={result.data.id}
          name={result.data.nav_label}
        />
      </section>
    </div>
  );
}
