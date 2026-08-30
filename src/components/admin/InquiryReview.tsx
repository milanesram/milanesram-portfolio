"use client";

import { useActionState } from "react";
import {
  deleteInquiryAction,
  updateInquiryReadAction,
  type MutationState,
} from "@/app/admin/inquiries/actions";

const initialState: MutationState = { error: null, message: null };

export function InquiryReadForm({
  inquiryId,
  readAt,
}: {
  inquiryId: string;
  readAt: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateInquiryReadAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="id" value={inquiryId} />

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p
          role="status"
          className="rounded-lg border border-accent/20 bg-accent-soft px-3 py-2 text-sm text-ink"
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          name="intent"
          value="read"
          disabled={pending || readAt != null}
          className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated disabled:opacity-60"
        >
          Mark as read
        </button>
        <button
          type="submit"
          name="intent"
          value="unread"
          disabled={pending || readAt == null}
          className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-5 text-sm font-medium text-ink disabled:opacity-60"
        >
          Mark as unread
        </button>
      </div>
    </form>
  );
}

export function DeleteInquiryButton({
  inquiryId,
  name,
}: {
  inquiryId: string;
  name: string;
}) {
  return (
    <form
      action={deleteInquiryAction}
      className="border-t border-line pt-5"
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete the inquiry from “${name}”? This permanently removes the inbox row.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={inquiryId} />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center text-sm font-medium text-danger hover:underline"
      >
        Delete inquiry
      </button>
    </form>
  );
}
