import { notFound, redirect } from "next/navigation";
import { ResumeRequestStatusForm } from "@/components/admin/ResumeRequestReview";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { isUuid } from "@/lib/admin/ids";
import { getAdminResumeRequest } from "@/lib/admin/resume-requests/queries";
import { resumeRequestMailto } from "@/lib/admin/resume-requests/validation";
import { RESUME_REQUEST_LABELS } from "@/lib/resume-requests/choices";

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export default async function ResumeRequestDetailPage({
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

  const result = await getAdminResumeRequest(auth.supabase, id);

  if (result.error || !result.data) {
    notFound();
  }

  const request = result.data;
  const mailto = resumeRequestMailto(request.email);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-serif text-2xl text-ink">{request.full_name}</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Received {formatTimestamp(request.created_at)} UTC
        </p>
      </div>

      <section className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
        <h3 className="font-serif text-xl text-ink">Request</h3>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          These fields are read-only. Respond from your own email after you
          decide whether to share a resume.
        </p>
        <dl className="mt-6 space-y-4 text-sm">
          <div>
            <dt className="font-medium text-ink">Full name</dt>
            <dd className="mt-1 whitespace-pre-wrap text-ink-soft">{request.full_name}</dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Professional email</dt>
            <dd className="mt-1 text-ink-soft">
              {mailto ? (
                <a className="text-accent hover:underline" href={mailto}>
                  {request.email}
                </a>
              ) : (
                request.email
              )}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Organization</dt>
            <dd className="mt-1 whitespace-pre-wrap text-ink-soft">
              {request.organization}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Requested resume</dt>
            <dd className="mt-1 text-ink-soft">
              {RESUME_REQUEST_LABELS[request.resume_choice]}
            </dd>
          </div>
        </dl>
      </section>

      {request.message ? (
        <section className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
          <h3 className="font-serif text-xl text-ink">Message</h3>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-ink">
            {request.message}
          </p>
        </section>
      ) : null}

      <section className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
        <h3 className="font-serif text-xl text-ink">Status</h3>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Mark the request reviewed while you decide, then closed after you
          respond or decline. There is no pipeline, score, or automatic delivery.
        </p>
        <div className="mt-6">
          <ResumeRequestStatusForm requestId={request.id} status={request.status} />
        </div>
      </section>
    </div>
  );
}
