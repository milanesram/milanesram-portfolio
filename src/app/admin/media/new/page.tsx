import { MediaUploadForm } from "@/components/admin/MediaUploadForm";

export default function AdminNewMediaPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-ink">Upload media</h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Images and PDFs only. Files are stored at a UUID path. Upload does not
          publish the asset or attach it to a page.
        </p>
      </div>
      <div className="rounded-xl border border-line bg-paper-elevated p-6">
        <MediaUploadForm />
      </div>
    </div>
  );
}
