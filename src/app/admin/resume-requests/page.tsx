import Link from "next/link";
import { ResumeRetentionPanel } from "@/components/admin/ResumeRetentionPanel";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { listAdminResumeRequests } from "@/lib/admin/resume-requests/queries";
import { RESUME_REQUEST_LABELS } from "@/lib/resume-requests/choices";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import type { ResumeRequestStatus } from "@/lib/supabase/database.types";
import { redirect } from "next/navigation";

const STATUS_LABELS: Record<ResumeRequestStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  closed: "Closed",
};

function formatReceived(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export default async function AdminResumeRequestsPage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const result = await listAdminResumeRequests(auth.supabase);
  const records = result.error ? [] : (result.data ?? []);
  const expiredCount = await countExpiredClosedRequests();

  return (
    <div>
      <div>
        <h2 className="font-serif text-2xl text-ink">Resume requests</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Owner review only. Submitted details are read-only. Update the status
          after you decide whether and how to respond. This site does not send
          a resume automatically.
        </p>
      </div>

      <div className="mt-8">
        <ResumeRetentionPanel count={expiredCount} />
      </div>

      {result.error ? (
        <p role="alert" className="mt-8 text-sm text-danger">
          Resume requests could not be loaded.
        </p>
      ) : null}

      {records.length === 0 && !result.error ? (
        <p className="mt-8 rounded-xl border border-dashed border-line bg-paper-elevated p-6 text-sm text-ink-soft">
          No resume requests yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-paper-elevated">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Resume requests</caption>
            <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-ink-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Received</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Requested document</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-line last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                    {formatReceived(record.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/resume-requests/${record.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {record.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{record.email}</td>
                  <td className="px-4 py-3 text-ink-soft">{record.organization}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {RESUME_REQUEST_LABELS[record.resume_choice]}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {STATUS_LABELS[record.status]}
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

async function countExpiredClosedRequests(): Promise<number | null> {
  try {
    const supabase = createPrivilegedSupabaseClient();
    const { data, error } = await supabase.rpc("count_expired_resume_requests");

    if (error || typeof data !== "number") {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}
