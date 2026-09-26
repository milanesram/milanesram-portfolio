"use client";

import { useActionState } from "react";
import {
  updateResumeRequestStatusAction,
  type MutationState,
} from "@/app/admin/resume-requests/actions";
import type { ResumeRequestStatus } from "@/lib/supabase/database.types";

const initialState: MutationState = { error: null, message: null };

const STATUS_OPTIONS: { value: ResumeRequestStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "closed", label: "Closed" },
];

export function ResumeRequestStatusForm({
  requestId,
  status,
}: {
  requestId: string;
  status: ResumeRequestStatus;
}) {
  const [state, formAction, pending] = useActionState(
    updateResumeRequestStatusAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="id" value={requestId} />

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

      <label className="block text-sm font-medium text-ink" htmlFor="resume-request-status">
        Status
        <select
          id="resume-request-status"
          name="status"
          defaultValue={status}
          disabled={pending}
          className="mt-2 min-h-11 w-full max-w-xs rounded-lg border border-line bg-paper px-3 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60"
      >
        Save status
      </button>
    </form>
  );
}
