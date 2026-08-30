"use client";

import { useActionState } from "react";
import {
  deleteProjectSectionAction,
  moveProjectSectionAction,
  saveProjectSectionAction,
  type MutationState,
} from "@/app/admin/projects/actions";
import type { AdminProjectSection } from "@/lib/admin/projects/queries";
import { StatusBadge } from "./StatusBadge";

const initialState: MutationState = { error: null, message: null };

const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";

function SectionForm({
  projectId,
  section,
  defaultSortOrder = 0,
}: {
  projectId: string;
  section?: AdminProjectSection;
  defaultSortOrder?: number;
}) {
  const [state, formAction, pending] = useActionState(
    saveProjectSectionAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="project_id" value={projectId} />
      {section ? <input type="hidden" name="id" value={section.id} /> : null}

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

      <label className="block text-sm font-medium text-ink">
        Heading
        <input
          name="heading"
          required
          maxLength={160}
          defaultValue={section?.heading}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Content
        <textarea
          name="body"
          required
          maxLength={8000}
          rows={5}
          defaultValue={section?.body}
          disabled={pending}
          className={`${fieldClass} py-2`}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-medium text-ink">
          Career track
          <select
            name="track"
            defaultValue={section?.track ?? "all"}
            disabled={pending}
            className={fieldClass}
          >
            <option value="all">All</option>
            <option value="cybersecurity_grc">Cybersecurity / GRC</option>
            <option value="privacy_ai">Privacy / AI</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-ink">
          Status
          <select
            name="status"
            defaultValue={section?.status ?? "draft"}
            disabled={pending}
            className={fieldClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-ink">
          Sort order
          <input
            name="sort_order"
            type="number"
            min={0}
            max={9999}
            defaultValue={section?.sort_order ?? defaultSortOrder}
            disabled={pending}
            className={fieldClass}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-medium text-paper-elevated disabled:opacity-60"
      >
        {section ? "Save section" : "Add section"}
      </button>
    </form>
  );
}

function ConfirmDeleteButton({
  projectId,
  sectionId,
  heading,
}: {
  projectId: string;
  sectionId: string;
  heading: string;
}) {
  return (
    <form
      action={deleteProjectSectionAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete the section “${heading}”? This cannot be undone from the admin UI.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="section_id" value={sectionId} />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center text-sm font-medium text-danger hover:underline"
      >
        Delete
      </button>
    </form>
  );
}

export function ProjectSectionEditor({
  projectId,
  sections,
}: {
  projectId: string;
  sections: AdminProjectSection[];
}) {
  return (
    <div className="space-y-8">
      <ol className="space-y-6">
        {sections.map((section, index) => (
          <li
            key={section.id}
            className="rounded-xl border border-line bg-paper-elevated p-5"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={section.status} />
                <span className="text-xs text-ink-faint">
                  {index + 1} of {sections.length}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <form action={moveProjectSectionAction}>
                  <input type="hidden" name="project_id" value={projectId} />
                  <input type="hidden" name="section_id" value={section.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    disabled={index === 0}
                    className="text-sm font-medium text-ink-soft hover:text-ink disabled:opacity-40"
                  >
                    Move up
                  </button>
                </form>
                <form action={moveProjectSectionAction}>
                  <input type="hidden" name="project_id" value={projectId} />
                  <input type="hidden" name="section_id" value={section.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={index === sections.length - 1}
                    className="text-sm font-medium text-ink-soft hover:text-ink disabled:opacity-40"
                  >
                    Move down
                  </button>
                </form>
                <ConfirmDeleteButton
                  projectId={projectId}
                  sectionId={section.id}
                  heading={section.heading}
                />
              </div>
            </div>
            <SectionForm projectId={projectId} section={section} />
          </li>
        ))}
      </ol>

      <section className="rounded-xl border border-dashed border-line bg-paper-elevated p-5">
        <h3 className="font-serif text-xl text-ink">Add section</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Career-track classification lives on sections, not on the project row.
        </p>
        <div className="mt-5">
          <SectionForm
            projectId={projectId}
            defaultSortOrder={sections.length}
          />
        </div>
      </section>
    </div>
  );
}
