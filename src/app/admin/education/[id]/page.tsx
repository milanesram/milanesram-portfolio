import { notFound, redirect } from "next/navigation";
import {
  DeleteEducationButton,
  EducationForm,
} from "@/components/admin/EducationForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { isUuid } from "@/lib/admin/ids";
import { getAdminEducation } from "@/lib/admin/education/queries";

export default async function EditEducationPage({
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

  const result = await getAdminEducation(auth.supabase, id);

  if (result.error || !result.data) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-serif text-2xl text-ink">{result.data.name}</h2>
        <StatusBadge status={result.data.status} />
      </div>

      <section className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
        <h3 className="font-serif text-xl text-ink">Education details</h3>
        <div className="mt-6 space-y-5">
          <EducationForm education={result.data} />
          <DeleteEducationButton
            educationId={result.data.id}
            name={result.data.name}
          />
        </div>
      </section>
    </div>
  );
}
