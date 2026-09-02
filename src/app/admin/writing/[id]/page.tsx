import { notFound, redirect } from "next/navigation";
import { PublicationForm } from "@/components/admin/PublicationForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { isUuid } from "@/lib/admin/ids";
import {
  getAdminPublication,
  listAdminPublicationMediaChoices,
} from "@/lib/admin/writing/queries";

export default async function EditWritingPage({
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

  const [publicationResult, mediaResult] = await Promise.all([
    getAdminPublication(auth.supabase, id),
    listAdminPublicationMediaChoices(auth.supabase),
  ]);

  if (publicationResult.error || !publicationResult.data) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-serif text-2xl text-ink">
          {publicationResult.data.title}
        </h2>
        <StatusBadge status={publicationResult.data.status} />
      </div>
      <div className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
        <PublicationForm
          publication={publicationResult.data}
          mediaChoices={mediaResult.data ?? []}
        />
      </div>
    </div>
  );
}
