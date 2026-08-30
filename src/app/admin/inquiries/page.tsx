import Link from "next/link";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { listAdminInquiries } from "@/lib/admin/inquiries/queries";
import { previewInquiryMessage } from "@/lib/admin/inquiries/validation";
import { redirect } from "next/navigation";

const CONTEXT_LABELS = {
  recruiter: "Recruiter",
  hiring_manager: "Hiring manager",
  other: "Other",
} as const;

const TRACK_LABELS = {
  cybersecurity_grc: "Cybersecurity / GRC",
  privacy_ai: "Privacy / AI",
  either: "Either",
} as const;

function formatReceived(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export default async function AdminInquiriesPage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const result = await listAdminInquiries(auth.supabase);
  const records = result.error ? [] : (result.data ?? []);

  return (
    <div>
      <div>
        <h2 className="font-serif text-2xl text-ink">All inquiries</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Owner inbox only. Sender fields are read-only. There is no New
          action because public intake is not enabled. The public contact
          page is unchanged.
        </p>
      </div>

      {result.error ? (
        <p role="alert" className="mt-8 text-sm text-danger">
          Inquiries could not be loaded.
        </p>
      ) : null}

      {records.length === 0 && !result.error ? (
        <p className="mt-8 rounded-xl border border-dashed border-line bg-paper-elevated p-6 text-sm text-ink-soft">
          No inquiries in Supabase yet. Incoming messages cannot be created
          here. Public submission remains disabled.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-paper-elevated">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Inquiries</caption>
            <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-ink-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Received</th>
                <th className="px-4 py-3 font-medium">Sender</th>
                <th className="px-4 py-3 font-medium">Context</th>
                <th className="px-4 py-3 font-medium">Track</th>
                <th className="px-4 py-3 font-medium">Preview</th>
                <th className="px-4 py-3 font-medium">Read</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-line last:border-0"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                    {formatReceived(record.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/inquiries/${record.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {record.name}
                    </Link>
                    <p className="mt-1 text-ink-soft">{record.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {CONTEXT_LABELS[record.context]}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {TRACK_LABELS[record.track]}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-ink-soft">
                    {previewInquiryMessage(record.message)}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {record.read_at ? "Read" : "Unread"}
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
