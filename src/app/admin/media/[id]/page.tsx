import { notFound, redirect } from "next/navigation";
import { DeleteMediaButton, MediaForm } from "@/components/admin/MediaForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { isUuid } from "@/lib/admin/ids";
import {
  getAdminMediaAsset,
  getMediaUsageCounts,
  mediaUsageTotal,
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

  const assetResult = await getAdminMediaAsset(auth.supabase, id);

  if (assetResult.error || !assetResult.data) {
    notFound();
  }

  const usage = await getMediaUsageCounts(
    auth.supabase,
    id,
    assetResult.data.purpose,
  );
  const referenceCount = mediaUsageTotal(usage);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-serif text-2xl text-ink">{assetResult.data.title}</h2>
        <StatusBadge status={assetResult.data.status} />
      </div>

      <section className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
        <h3 className="font-serif text-xl text-ink">Media details</h3>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Storage identity is read-only. Replace a published file by uploading a
          new asset and updating the relationship explicitly.
        </p>
        <p className="mt-2 text-sm text-ink-faint">
          {assetResult.data.mime_type ?? "Unknown type"}
          {assetResult.data.byte_size
            ? ` · ${Math.round(assetResult.data.byte_size / 1024)} KB`
            : ""}
          {assetResult.data.purpose ? ` · ${assetResult.data.purpose}` : ""}
        </p>
        <div className="mt-6 space-y-5">
          <MediaForm media={assetResult.data} />
          <DeleteMediaButton
            mediaId={assetResult.data.id}
            title={assetResult.data.title}
            referenceCount={referenceCount}
          />
        </div>
      </section>

      <section className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
        <h3 className="font-serif text-xl text-ink">References</h3>
        {referenceCount === 0 && !usage.portrait ? (
          <p className="mt-4 text-sm text-ink-soft">
            Not referenced by Journey, Projects, Resume, or Writing.
          </p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            {usage.journey > 0 ? (
              <li>Journey milestones: {usage.journey}</li>
            ) : null}
            {usage.projects > 0 ? (
              <li>Project screenshots: {usage.projects}</li>
            ) : null}
            {usage.resume > 0 ? <li>Resume tracks: {usage.resume}</li> : null}
            {usage.publications > 0 ? (
              <li>Publications: {usage.publications}</li>
            ) : null}
            {usage.portrait ? (
              <li>
                Portrait purpose. Public Home/About select published portrait
                assets by purpose, not a foreign key.
              </li>
            ) : null}
          </ul>
        )}
      </section>
    </div>
  );
}
