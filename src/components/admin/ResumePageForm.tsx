"use client";

import { useActionState } from "react";
import {
  saveResumePageAction,
  type MutationState,
} from "@/app/admin/resume/actions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { AdminResumePage } from "@/lib/admin/resume/queries";

const initialState: MutationState = { error: null, message: null };
const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

export function ResumePageForm({ page }: { page?: AdminResumePage | null }) {
  const [state, formAction, pending] = useActionState(
    saveResumePageAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {page ? <input type="hidden" name="id" value={page.id} /> : null}
      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p role="status" className="text-sm text-accent">
          {state.message}
        </p>
      ) : null}
      {page ? (
        <p className="text-sm text-ink-soft">
          Status: <StatusBadge status={page.status} />
        </p>
      ) : null}
      <label className={labelClass}>
        Kicker
        <input
          name="kicker"
          required
          defaultValue={page?.kicker}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Headline
        <input
          name="headline"
          required
          defaultValue={page?.headline}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Lede
        <textarea
          name="lede"
          required
          rows={4}
          defaultValue={page?.lede}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Request intro
        <input
          name="request_intro"
          required
          defaultValue={page?.request_intro}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Request footnote
        <input
          name="request_footnote"
          required
          defaultValue={page?.request_footnote}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Closing heading
        <input
          name="closing_heading"
          required
          defaultValue={page?.closing_heading}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Closing lede
        <textarea
          name="closing_lede"
          required
          rows={3}
          defaultValue={page?.closing_lede}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          name="intent"
          value="draft"
          disabled={pending}
          className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-5 text-sm font-medium text-ink disabled:opacity-60"
        >
          Save as draft
        </button>
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={pending}
          className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated disabled:opacity-60"
        >
          Publish
        </button>
        {page ? (
          <button
            type="submit"
            name="intent"
            value="unpublish"
            disabled={pending}
            className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-5 text-sm font-medium text-ink disabled:opacity-60"
          >
            Unpublish
          </button>
        ) : null}
      </div>
    </form>
  );
}
