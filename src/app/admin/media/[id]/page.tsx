import { notFound, redirect } from "next/navigation";
import { DeleteMediaButton, MediaForm } from "@/components/admin/MediaForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { isUuid } from "@/lib/admin/ids";
import {
  getAdminMediaAsset,
  listMediaFocusReferences,
} from "@/lib/admin/media/queries";

export default async function EditMediaPage({
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

  const [assetResult, refsResult] = await Promise.all([
    getAdminMediaAsset(auth.supabase, id),
    listMediaFocusReferences(auth.supabase, id),
  ]);

  if (assetResult.error || !assetResult.data) {
    notFound();
  }

  const references = refsResult.error ? [] : (refsResult.data ?? []);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-serif text-2xl text-ink">{assetResult.data.title}</h2>
        <StatusBadge status={assetResult.data.status} />
      </div>

      <section className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
        <h3 className="font-serif text-xl text-ink">Media details</h3>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Storage identity is read-only. This step does not upload, replace,
          or delete Storage objects.
        </p>
        <div className="mt-6 space-y-5">
          <MediaForm media={assetResult.data} />
          <DeleteMediaButton
            mediaId={assetResult.data.id}
            title={assetResult.data.title}
            referenceCount={references.length}
          />
        </div>
      </section>

      <section className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
        <h3 className="font-serif text-xl text-ink">References</h3>
        {refsResult.error ? (
          <p role="alert" className="mt-4 text-sm text-danger">
            References could not be loaded.
          </p>
        ) : references.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">
            Not referenced by any focus page.
          </p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            {references.map((reference) => (
              <li key={reference.id}>
                Used by focus page {reference.nav_label} ({reference.slug})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
