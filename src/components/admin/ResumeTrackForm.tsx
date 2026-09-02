"use client";

import { useActionState } from "react";
import {
  deleteResumeTrackAction,
  saveResumeTrackAction,
  type MutationState,
} from "@/app/admin/resume/actions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type {
  AdminFocusChoice,
  AdminResumeMediaChoice,
  AdminResumeTrack,
} from "@/lib/admin/resume/queries";

const initialState: MutationState = { error: null, message: null };
const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

export function ResumeTrackForm({
  track,
  focusChoices,
  mediaChoices,
}: {
  track?: AdminResumeTrack | null;
  focusChoices: AdminFocusChoice[];
  mediaChoices: AdminResumeMediaChoice[];
}) {
  const [state, formAction, pending] = useActionState(
    saveResumeTrackAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {track ? <input type="hidden" name="id" value={track.id} /> : null}
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
      {track ? (
        <p className="text-sm text-ink-soft">
          Status: <StatusBadge status={track.status} />
        </p>
      ) : null}
      <label className={labelClass}>
        Title
        <input
          name="title"
          required
          defaultValue={track?.title}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Slug
        <input
          name="slug"
          required
          defaultValue={track?.slug}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Summary
        <textarea
          name="summary"
          required
          rows={4}
          defaultValue={track?.summary}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Focus relationship
        <select
          name="focus_page_id"
          defaultValue={track?.focus_page_id ?? ""}
          disabled={pending}
          className={fieldClass}
        >
          <option value="">None</option>
          {focusChoices.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {choice.nav_label} · {choice.slug}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Delivery mode
        <select
          name="delivery_mode"
          required
          defaultValue={track?.delivery_mode ?? "request"}
          disabled={pending}
          className={fieldClass}
        >
          <option value="request">Request</option>
          <option value="public_file">Public file</option>
        </select>
      </label>
      <p className="text-sm leading-6 text-ink-soft">
        Public-file mode only renders a download when the selected media is a
        published, public resume PDF. Version 1.0 tracks should stay on request.
      </p>
      <label className={labelClass}>
        Resume file
        <select
          name="media_asset_id"
          defaultValue={track?.media_asset_id ?? ""}
          disabled={pending}
          className={fieldClass}
        >
          <option value="">None</option>
          {mediaChoices.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {choice.title}
              {choice.status === "published" && choice.is_public
                ? " · public"
                : ` · ${choice.status}`}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Request CTA label
        <input
          name="request_cta_label"
          required
          defaultValue={track?.request_cta_label ?? "View this profile"}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Home kicker
        <input
          name="home_kicker"
          defaultValue={track?.home_kicker ?? ""}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <p className="text-sm leading-6 text-ink-soft">
        Short label on the matching Home Focus card, such as Resume A. A third
        track does not require a hard-coded A/B switch.
      </p>
      <label className={labelClass}>
        Sort order
        <input
          name="sort_order"
          required
          inputMode="numeric"
          defaultValue={track?.sort_order ?? 30}
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
        {track ? (
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
      {track ? (
        <div className="border-t border-line pt-5">
          <p className="text-sm text-ink-soft">
            Removing a track does not delete Focus pages or media files.
          </p>
          <button
            formAction={deleteResumeTrackAction}
            type="submit"
            name="id"
            value={track.id}
            disabled={pending}
            className="mt-3 inline-flex min-h-11 items-center rounded-full border border-danger/30 px-5 text-sm font-medium text-danger disabled:opacity-60"
          >
            Delete track
          </button>
        </div>
      ) : null}
    </form>
  );
}
