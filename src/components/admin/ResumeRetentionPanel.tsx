"use client";

import { useActionState } from "react";
import {
  purgeExpiredResumeRequestsAction,
  type MutationState,
} from "@/app/admin/resume-requests/actions";
import { RETENTION_NOTICE } from "@/lib/admin/resume-fulfillment/policy";

const initialState: MutationState = { error: null, message: null };

export function ResumeRetentionPanel({ count }: { count: number | null }) {
  const [state, formAction, pending] = useActionState(
    purgeExpiredResumeRequestsAction,
    initialState,
  );

  return (
    <section className="max-w-2xl rounded-xl border border-line bg-paper-elevated p-6">
      <h3 className="font-serif text-xl text-ink">Retention</h3>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{RETENTION_NOTICE}</p>
      {count === null ? (
        <p className="mt-4 text-sm text-ink-soft">Retention status is unavailable.</p>
      ) : (
        <form action={formAction} className="mt-4 space-y-4">
          <p className="text-sm text-ink">Expired closed requests: {count}</p>
          {state.error ? (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          ) : null}
          {state.message ? (
            <p role="status" className="text-sm text-ink">
              {state.message}
            </p>
          ) : null}
          <label className="flex items-start gap-3 text-sm text-ink">
            <input
              type="checkbox"
              name="confirm"
              value="purge-expired"
              required
              className="mt-1"
            />
            <span>Permanently delete expired closed requests.</span>
          </label>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60"
          >
            {pending ? "Purging…" : "Purge expired requests"}
          </button>
        </form>
      )}
    </section>
  );
}
