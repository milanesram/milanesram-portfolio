import { notFound, redirect } from "next/navigation";
import {
  DeleteInquiryButton,
  InquiryReadForm,
} from "@/components/admin/InquiryReview";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { isUuid } from "@/lib/admin/ids";
import { getAdminInquiry } from "@/lib/admin/inquiries/queries";
import { safeMailtoHref } from "@/lib/admin/inquiries/validation";

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

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export default async function InquiryDetailPage({
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

  const result = await getAdminInquiry(auth.supabase, id);

  if (result.error || !result.data) {
    notFound();
  }

  const inquiry = result.data;
  const mailto = safeMailtoHref(inquiry.email);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-serif text-2xl text-ink">{inquiry.name}</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Received {formatTimestamp(inquiry.created_at)} UTC
          {inquiry.read_at
            ? ` · Read ${formatTimestamp(inquiry.read_at)} UTC`
            : " · Unread"}
        </p>
      </div>

      <section className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
        <h3 className="font-serif text-xl text-ink">Sender</h3>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Sender-provided fields are read-only. Original inbound values are
          not edited here.
        </p>
        <dl className="mt-6 space-y-4 text-sm">
          <div>
            <dt className="font-medium text-ink">Name</dt>
            <dd className="mt-1 whitespace-pre-wrap text-ink-soft">
              {inquiry.name}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Email</dt>
            <dd className="mt-1 text-ink-soft">
              {mailto ? (
                <a className="text-accent hover:underline" href={mailto}>
                  {inquiry.email}
                </a>
              ) : (
                inquiry.email
              )}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Organization</dt>
            <dd className="mt-1 whitespace-pre-wrap text-ink-soft">
              {inquiry.organization ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Context</dt>
            <dd className="mt-1 text-ink-soft">
              {CONTEXT_LABELS[inquiry.context]}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Track</dt>
            <dd className="mt-1 text-ink-soft">
              {TRACK_LABELS[inquiry.track]}
            </dd>
          </div>
        </dl>
      </section>

      <section className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
        <h3 className="font-serif text-xl text-ink">Message</h3>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-ink">
          {inquiry.message}
        </p>
      </section>

      <section className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
        <h3 className="font-serif text-xl text-ink">Inbox</h3>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          The only mutable field is read state. There is no status, archive,
          or notes column.
        </p>
        <div className="mt-6 space-y-5">
          <InquiryReadForm inquiryId={inquiry.id} readAt={inquiry.read_at} />
          <DeleteInquiryButton inquiryId={inquiry.id} name={inquiry.name} />
        </div>
      </section>
    </div>
  );
}
