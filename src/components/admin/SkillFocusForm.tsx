"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  addCompetencyAction,
  deleteCompetencyAction,
  deleteFocusPageAction,
  moveCompetencyAction,
  saveCompetencyAction,
  saveFocusPageAction,
  type MutationState,
} from "@/app/admin/skills/actions";
import type {
  AdminFocusCredentialLink,
  AdminFocusExperienceLink,
  AdminFocusPage,
  AdminFocusPickerCredential,
  AdminFocusPickerItem,
  AdminFocusPickerProject,
  AdminFocusPickerPublication,
} from "@/lib/admin/skills/queries";
import { isPubliclySelectableCredential } from "@/lib/admin/skills/validation";

const initialState: MutationState = { error: null, message: null };

const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

type SkillFocusFormProps = {
  page?: AdminFocusPage;
  experienceLinks?: AdminFocusExperienceLink[];
  credentialLinks?: AdminFocusCredentialLink[];
  experienceChoices?: AdminFocusPickerItem[];
  credentialChoices?: AdminFocusPickerCredential[];
  projectChoices?: AdminFocusPickerProject[];
  publicationChoices?: AdminFocusPickerPublication[];
};

export function SkillFocusForm({
  page,
  experienceLinks = [],
  credentialLinks = [],
  experienceChoices = [],
  credentialChoices = [],
  projectChoices = [],
  publicationChoices = [],
}: SkillFocusFormProps) {
  const selectedExperience = new Map(
    experienceLinks.map((link) => [link.experience_item_id, link.sort_order]),
  );
  const selectedCredentials = new Map(
    credentialLinks.map((link) => [link.credential_id, link.sort_order]),
  );
  const [state, formAction, pending] = useActionState(
    saveFocusPageAction,
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
        <p
          role="status"
          className="rounded-lg border border-accent/20 bg-accent-soft px-3 py-2 text-sm text-ink"
        >
          {state.message}
        </p>
      ) : null}

      <label className={labelClass}>
        Nav label
        <input
          name="nav_label"
          required
          maxLength={120}
          defaultValue={page?.nav_label}
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
          defaultValue={page?.slug}
          disabled={pending}
          className={fieldClass}
          aria-describedby="slug-hint"
        />
        <span
          id="slug-hint"
          className="mt-1 block text-xs font-normal text-ink-faint"
        >
          Lowercase letters, numbers, and hyphens. Used in public URLs later.
        </span>
      </label>

      <label className={labelClass}>
        Headline
        <input
          name="headline"
          required
          maxLength={200}
          defaultValue={page?.headline}
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
          rows={4}
          defaultValue={page?.summary}
          disabled={pending}
          className={`${fieldClass} py-2`}
        />
      </label>

      <label className={labelClass}>
        Home card summary
        <textarea
          name="card_summary"
          required
          maxLength={2000}
          rows={3}
          defaultValue={page?.card_summary ?? ""}
          disabled={pending}
          className={`${fieldClass} py-2`}
        />
      </label>

      <label className={labelClass}>
        Home card chips (one per line)
        <textarea
          name="card_chips"
          rows={4}
          defaultValue={page?.card_chips.join("\n") ?? ""}
          disabled={pending}
          className={`${fieldClass} py-2`}
        />
      </label>

      <label className={labelClass}>
        Featured project
        <select
          name="featured_project_id"
          defaultValue={page?.featured_project_id ?? ""}
          disabled={pending}
          className={fieldClass}
        >
          <option value="">None</option>
          {projectChoices.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
              {project.status !== "published" ? " (unpublished)" : ""}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Featured project lede
        <textarea
          name="featured_project_lede"
          maxLength={500}
          rows={2}
          defaultValue={page?.featured_project_lede ?? ""}
          disabled={pending}
          className={`${fieldClass} py-2`}
        />
      </label>

      <label className={labelClass}>
        Featured writing
        <select
          name="featured_publication_id"
          defaultValue={page?.featured_publication_id ?? ""}
          disabled={pending}
          className={fieldClass}
        >
          <option value="">None</option>
          {publicationChoices.map((publication) => (
            <option key={publication.id} value={publication.id}>
              {publication.title} · {publication.document_kind}
              {publication.status !== "published" ? " (unpublished)" : ""}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="space-y-4">
        <legend className="font-serif text-xl text-ink">Selected experience</legend>
        <p className="text-sm text-ink-soft">
          Selection uses stable item IDs. Editing bullet text does not break Focus.
        </p>
        <ul className="space-y-3">
          {experienceChoices.map((choice, index) => {
            const sort = selectedExperience.get(choice.id) ?? (index + 1) * 10;
            return (
              <li key={choice.id} className="rounded-lg border border-line p-3">
                <label className="flex items-start gap-3 text-sm text-ink">
                  <input
                    type="checkbox"
                    name="experience_item_id"
                    value={choice.id}
                    defaultChecked={selectedExperience.has(choice.id)}
                    disabled={pending}
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    <span className="font-medium">
                      {choice.organization} · {choice.title}
                    </span>
                    <span className="mt-1 block text-ink-soft">{choice.excerpt}</span>
                    {choice.status !== "published" ? (
                      <span className="mt-1 block text-xs text-ink-faint">
                        Unpublished — omitted from the public Focus page.
                      </span>
                    ) : null}
                  </span>
                </label>
                <label className={`${labelClass} mt-3 max-w-[8rem]`}>
                  Order
                  <input
                    name={`experience_sort_${choice.id}`}
                    inputMode="numeric"
                    defaultValue={sort}
                    disabled={pending}
                    className={fieldClass}
                  />
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-serif text-xl text-ink">Selected credentials</legend>
        <p className="text-sm text-ink-soft">
          Draft, archived, and unverified credentials cannot be selected as public
          Focus evidence.
        </p>
        <ul className="space-y-3">
          {credentialChoices.map((choice, index) => {
            const eligible = isPubliclySelectableCredential({
              status: choice.status,
              needsVerification: choice.needs_verification,
            });
            const sort = selectedCredentials.get(choice.id) ?? (index + 1) * 10;
            return (
              <li key={choice.id} className="rounded-lg border border-line p-3">
                <label className="flex items-start gap-3 text-sm text-ink">
                  <input
                    type="checkbox"
                    name="credential_id"
                    value={choice.id}
                    defaultChecked={selectedCredentials.has(choice.id)}
                    disabled={pending || !eligible}
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    <span className="font-medium">{choice.name}</span>
                    <span className="mt-1 block text-ink-soft">
                      {choice.issuer}
                      {choice.year_label ? ` · ${choice.year_label}` : ""} ·{" "}
                      {choice.kind}
                    </span>
                    {!eligible ? (
                      <span className="mt-1 block text-xs text-ink-faint">
                        Not eligible for public Focus evidence.
                      </span>
                    ) : null}
                  </span>
                </label>
                <label className={`${labelClass} mt-3 max-w-[8rem]`}>
                  Order
                  <input
                    name={`credential_sort_${choice.id}`}
                    inputMode="numeric"
                    defaultValue={sort}
                    disabled={pending || !eligible}
                    className={fieldClass}
                  />
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <label className={labelClass}>
        Sort order
        <input
          name="sort_order"
          type="number"
          min={0}
          max={9999}
          defaultValue={page?.sort_order ?? 0}
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

function CompetencyRow({
  pageId,
  index,
  text,
  total,
}: {
  pageId: string;
  index: number;
  text: string;
  total: number;
}) {
  const [state, formAction, pending] = useActionState(
    saveCompetencyAction,
    initialState,
  );

  return (
    <li className="rounded-xl border border-line bg-paper p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-ink-faint">
          {index + 1} of {total}
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <form action={moveCompetencyAction}>
            <input type="hidden" name="page_id" value={pageId} />
            <input type="hidden" name="index" value={index} />
            <input type="hidden" name="direction" value="up" />
            <button
              type="submit"
              disabled={index === 0}
              className="text-sm font-medium text-ink-soft hover:text-ink disabled:opacity-40"
            >
              Move up
            </button>
          </form>
          <form action={moveCompetencyAction}>
            <input type="hidden" name="page_id" value={pageId} />
            <input type="hidden" name="index" value={index} />
            <input type="hidden" name="direction" value="down" />
            <button
              type="submit"
              disabled={index === total - 1}
              className="text-sm font-medium text-ink-soft hover:text-ink disabled:opacity-40"
            >
              Move down
            </button>
          </form>
          <form
            action={deleteCompetencyAction}
            onSubmit={(event) => {
              if (
                !window.confirm(
                  `Delete the skill “${text}”? This cannot be undone from the admin UI.`,
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="page_id" value={pageId} />
            <input type="hidden" name="index" value={index} />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center text-sm font-medium text-danger hover:underline"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="page_id" value={pageId} />
        <input type="hidden" name="index" value={index} />

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

        <label className={labelClass}>
          Skill
          <input
            name="text"
            required
            maxLength={80}
            defaultValue={text}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-medium text-paper-elevated disabled:opacity-60"
        >
          Save skill
        </button>
      </form>
    </li>
  );
}

function AddCompetencyForm({ pageId }: { pageId: string }) {
  const [state, formAction, pending] = useActionState(
    addCompetencyAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="page_id" value={pageId} />

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

      <label className={labelClass}>
        Skill
        <input
          name="text"
          required
          maxLength={80}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-medium text-paper-elevated disabled:opacity-60"
      >
        Add skill
      </button>
    </form>
  );
}

export function SkillCompetencyEditor({
  pageId,
  competencies,
}: {
  pageId: string;
  competencies: string[];
}) {
  return (
    <div className="space-y-8">
      {competencies.length === 0 ? (
        <p className="text-sm text-ink-soft">No skills on this group yet.</p>
      ) : (
        <ol className="space-y-6">
          {competencies.map((text, index) => (
            <CompetencyRow
              key={`${index}-${text}`}
              pageId={pageId}
              index={index}
              text={text}
              total={competencies.length}
            />
          ))}
        </ol>
      )}

      <section className="rounded-xl border border-dashed border-line bg-paper p-5">
        <h4 className="font-serif text-lg text-ink">Add skill</h4>
        <p className="mt-2 text-sm text-ink-soft">
          Skills are text values on this focus page. There is no separate
          skills table, track enum, or per-skill status.
        </p>
        <div className="mt-5">
          <AddCompetencyForm pageId={pageId} />
        </div>
      </section>
    </div>
  );
}

export function DeleteFocusPageButton({
  pageId,
  name,
}: {
  pageId: string;
  name: string;
}) {
  return (
    <form
      action={deleteFocusPageAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete the skill group “${name}” and its skills? This cannot be undone from the admin UI.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={pageId} />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center text-sm font-medium text-danger hover:underline"
      >
        Delete skill group
      </button>
    </form>
  );
}
