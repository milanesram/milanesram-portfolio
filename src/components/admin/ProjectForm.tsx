"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  deleteProjectAction,
  saveProjectAction,
  type MutationState,
} from "@/app/admin/projects/actions";
import type { AdminProject } from "@/lib/admin/projects/queries";

const initialState: MutationState = { error: null, message: null };

const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

type ProjectFormProps = {
  project?: AdminProject;
};

export function ProjectForm({ project }: ProjectFormProps) {
  const [state, formAction, pending] = useActionState(
    saveProjectAction,
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
      {project ? <input type="hidden" name="id" value={project.id} /> : null}

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
        Name
        <input
          name="name"
          required
          maxLength={120}
          defaultValue={project?.name}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Slug
        <input
          name="slug"
          required
          maxLength={80}
          defaultValue={project?.slug}
          disabled={pending}
          className={fieldClass}
          aria-describedby="slug-hint"
        />
        <span id="slug-hint" className="mt-1 block text-xs font-normal text-ink-faint">
          Lowercase letters, numbers, and hyphens. Used in public URLs later.
        </span>
      </label>

      <label className={labelClass}>
        Tagline
        <input
          name="tagline"
          required
          maxLength={200}
          defaultValue={project?.tagline}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Year
          <input
            name="year_label"
            required
            maxLength={32}
            defaultValue={project?.year_label}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Sort order
          <input
            name="sort_order"
            type="number"
            min={0}
            max={9999}
            defaultValue={project?.sort_order ?? 0}
            disabled={pending}
            className={fieldClass}
          />
        </label>
      </div>

      <label className={labelClass}>
        Role
        <input
          name="role"
          required
          maxLength={200}
          defaultValue={project?.role}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Summary
        <textarea
          name="summary"
          required
          maxLength={2000}
          rows={5}
          defaultValue={project?.summary}
          disabled={pending}
          className={`${fieldClass} py-2`}
        />
      </label>

      <label className={labelClass}>
        Limits / positioning
        <textarea
          name="limits"
          required
          maxLength={2000}
          rows={4}
          defaultValue={project?.limits}
          disabled={pending}
          className={`${fieldClass} py-2`}
        />
      </label>

      <label className={labelClass}>
        Stack
        <textarea
          name="stack"
          rows={4}
          defaultValue={project?.stack.join("\n")}
          disabled={pending}
          className={`${fieldClass} py-2 font-mono text-sm`}
          aria-describedby="stack-hint"
        />
        <span id="stack-hint" className="mt-1 block text-xs font-normal text-ink-faint">
          One item per line. The schema has no project-level track, external URL,
          or SEO fields.
        </span>
      </label>

      <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
        <input
          type="checkbox"
          name="is_featured"
          defaultChecked={project?.is_featured}
          disabled={pending}
          className="size-4 accent-[var(--accent)]"
        />
        Featured project
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
        {project ? (
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

export function DeleteProjectButton({
  projectId,
  name,
}: {
  projectId: string;
  name: string;
}) {
  return (
    <form
      action={deleteProjectAction}
      className="border-t border-line pt-5"
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete the project “${name}” and its sections? This cannot be undone from the admin UI.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={projectId} />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center text-sm font-medium text-danger hover:underline"
      >
        Delete project
      </button>
    </form>
  );
}
