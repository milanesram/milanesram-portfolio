"use client";

import { useActionState } from "react";
import {
  uploadMediaAction,
  type MutationState,
} from "@/app/admin/media/actions";

const initialState: MutationState = { error: null, message: null };
const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

export function MediaUploadForm() {
  const [state, formAction, pending] = useActionState(
    uploadMediaAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}
      <label className={labelClass}>
        Kind
        <select name="kind" required disabled={pending} className={fieldClass}>
          <option value="image">Image</option>
          <option value="document">Publication PDF</option>
          <option value="resume_pdf">Resume PDF</option>
        </select>
      </label>
      <label className={labelClass}>
        Purpose
        <select
          name="purpose"
          required
          disabled={pending}
          className={fieldClass}
        >
          <option value="project">Project</option>
          <option value="journey">Journey</option>
          <option value="portrait">Portrait</option>
          <option value="publication">Publication</option>
          <option value="resume">Resume</option>
        </select>
      </label>
      <label className={labelClass}>
        Title
        <input
          name="title"
          required
          maxLength={200}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Alt text
        <input
          name="alt_text"
          maxLength={300}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <p className="text-sm leading-6 text-ink-soft">
        Required for images. Uploaded files start as draft and private unless
        you mark them public here. Publishing stays a separate action.
      </p>
      <label className={labelClass}>
        File
        <input
          name="file"
          type="file"
          required
          disabled={pending}
          accept="image/jpeg,image/png,image/webp,image/avif,application/pdf"
          className={`${fieldClass} py-2`}
        />
      </label>
      <label className="flex items-start gap-3 text-sm font-medium text-ink">
        <input
          name="is_public"
          type="checkbox"
          disabled={pending}
          className="mt-1 h-4 w-4"
        />
        <span>
          Public
          <span className="mt-1 block font-normal text-ink-faint">
            Do not publish a file merely because it was uploaded. The public
            site still requires published status.
          </span>
        </span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated disabled:opacity-60"
      >
        {pending ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
