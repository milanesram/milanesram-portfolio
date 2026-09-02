"use client";

import { useActionState } from "react";
import {
  saveContactPageAction,
  type MutationState,
} from "@/app/admin/contact/actions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { AdminContactPage } from "@/lib/admin/contact/queries";

const initialState: MutationState = { error: null, message: null };
const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

export function ContactPageForm({
  page,
  formEnabled,
}: {
  page?: AdminContactPage | null;
  formEnabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    saveContactPageAction,
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
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-ink">Channel visibility</legend>
        <p className="text-sm leading-6 text-ink-soft">
          Email address and LinkedIn URL stay on Site Profile. These flags only
          control whether they render on /contact.
        </p>
        <label className="flex min-h-11 items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            name="email_enabled"
            defaultChecked={page?.email_enabled ?? true}
            disabled={pending}
          />
          Show email
        </label>
        <label className={labelClass}>
          Email label
          <input
            name="email_label"
            required
            defaultValue={page?.email_label ?? "Email"}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <label className="flex min-h-11 items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            name="linkedin_enabled"
            defaultChecked={page?.linkedin_enabled ?? true}
            disabled={pending}
          />
          Show LinkedIn
        </label>
        <label className={labelClass}>
          LinkedIn label
          <input
            name="linkedin_label"
            required
            defaultValue={page?.linkedin_label ?? "LinkedIn"}
            disabled={pending}
            className={fieldClass}
          />
        </label>
      </fieldset>
      <label className={labelClass}>
        Form unpublished copy
        <textarea
          name="form_intro"
          required
          rows={3}
          defaultValue={page?.form_intro}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Shared CTA heading
        <input
          name="cta_heading"
          required
          defaultValue={page?.cta_heading ?? "Start a conversation"}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Shared CTA lede
        <textarea
          name="cta_lede"
          required
          rows={3}
          defaultValue={
            page?.cta_lede ??
            "Email and LinkedIn are the public contact channels."
          }
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <p className="text-sm leading-6 text-ink-soft">
        Used by the generic site CTA when a page does not supply its own
        heading and lede. Button labels stay in code.
      </p>
      <div className="rounded-lg border border-line bg-paper px-4 py-3 text-sm leading-6 text-ink-soft">
        Contact form flag (Settings):{" "}
        <strong className="text-ink">{formEnabled ? "enabled" : "unpublished"}</strong>
        . The public form also requires server-only <code>CONTACT_INTAKE_ENABLED</code>{" "}
        and intake secrets. Do not treat this UI as enough to operate the form.
      </div>
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
