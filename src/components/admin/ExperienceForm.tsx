"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  deleteExperienceAction,
  saveExperienceAction,
  type MutationState,
} from "@/app/admin/experience/actions";
import type { AdminExperience } from "@/lib/admin/experience/queries";

const initialState: MutationState = { error: null, message: null };

const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

type ExperienceFormProps = {
  experience?: AdminExperience;
};

export function ExperienceForm({ experience }: ExperienceFormProps) {
  const [state, formAction, pending] = useActionState(
    saveExperienceAction,
    initialState,
  );
  const dirtyRef = useRef(false);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  return (
    <form
      action={formAction}
      className="space-y-5"
      noValidate
      onChange={() => {
        dirtyRef.current = true;
      }}
    >
      {experience ? <input type="hidden" name="id" value={experience.id} /> : null}

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

      <label className={labelClass}>
        Organization
        <input
          name="organization"
          required
          maxLength={160}
          defaultValue={experience?.organization}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Title
        <input
          name="title"
          required
          maxLength={200}
          defaultValue={experience?.title}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Secondary title
        <input
          name="title_secondary"
          maxLength={200}
          defaultValue={experience?.title_secondary ?? ""}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Location
        <input
          name="location_display"
          required
          maxLength={120}
          defaultValue={experience?.location_display}
          disabled={pending}
          className={fieldClass}
          aria-describedby="location-hint"
        />
        <span
          id="location-hint"
          className="mt-1 block text-xs font-normal text-ink-faint"
        >
          Display string only. The schema has no company URL, logo, or
          employment-type field.
        </span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Kind
          <select
            name="kind"
            required
            defaultValue={experience?.kind ?? "employment"}
            disabled={pending}
            className={fieldClass}
          >
            <option value="employment">Employment</option>
            <option value="consulting">Consulting</option>
            <option value="additional">Additional</option>
            <option value="leadership">Leadership</option>
          </select>
        </label>
        <label className={labelClass}>
          Sort order
          <input
            name="sort_order"
            type="number"
            min={0}
            max={9999}
            defaultValue={experience?.sort_order ?? 0}
            disabled={pending}
            className={fieldClass}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Start date
          <input
            name="start_date"
            type="date"
            required
            defaultValue={experience?.start_date}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          End date
          <input
            name="end_date"
            type="date"
            defaultValue={experience?.end_date ?? ""}
            disabled={pending}
            className={fieldClass}
          />
        </label>
      </div>

      <label className={labelClass}>
        Summary
        <textarea
          name="summary"
          maxLength={2000}
          rows={4}
          defaultValue={experience?.summary ?? ""}
          disabled={pending}
          className={`${fieldClass} py-2`}
        />
      </label>

      <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
        <input
          type="checkbox"
          name="is_current"
          defaultChecked={experience?.is_current}
          disabled={pending}
          className="size-4 accent-[var(--accent)]"
        />
        Current role
      </label>

      <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
        <input
          type="checkbox"
          name="is_featured"
          defaultChecked={experience?.is_featured}
          disabled={pending}
          className="size-4 accent-[var(--accent)]"
        />
        Featured experience
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
        {experience ? (
          <>
            <button
              type="submit"
              name="intent"
              value="unpublish"
              disabled={pending}
              className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-5 text-sm font-medium text-ink disabled:opacity-60"
            >
              Unpublish
            </button>
            <button
              type="submit"
              name="intent"
              value="archive"
              disabled={pending}
              className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-5 text-sm font-medium text-ink-soft disabled:opacity-60"
            >
              Archive
            </button>
          </>
        ) : null}
      </div>
    </form>
  );
}

export function DeleteExperienceButton({
  experienceId,
  title,
}: {
  experienceId: string;
  title: string;
}) {
  return (
    <form
      action={deleteExperienceAction}
      className="border-t border-line pt-5"
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete the experience “${title}” and its items? This cannot be undone from the admin UI.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={experienceId} />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center text-sm font-medium text-danger hover:underline"
      >
        Delete experience
      </button>
    </form>
  );
}
