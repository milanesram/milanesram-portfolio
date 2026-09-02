"use client";

import { useActionState } from "react";
import {
  deleteProjectMediaAction,
  moveProjectMediaAction,
  saveProjectMediaAction,
  type MutationState,
} from "@/app/admin/projects/actions";
import type {
  AdminProjectMedia,
  AdminProjectMediaChoice,
} from "@/lib/admin/projects/queries";
import { StatusBadge } from "./StatusBadge";

const initialState: MutationState = { error: null, message: null };

const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";

function MediaForm({
  projectId,
  item,
  choices,
  defaultSortOrder = 10,
}: {
  projectId: string;
  item?: AdminProjectMedia;
  choices: AdminProjectMediaChoice[];
  defaultSortOrder?: number;
}) {
  const [state, formAction, pending] = useActionState(
    saveProjectMediaAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="project_id" value={projectId} />
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

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
        Screenshot
        <select
          name="media_asset_id"
          required
          defaultValue={item?.media_asset_id ?? ""}
          disabled={pending || Boolean(item)}
          className={fieldClass}
        >
          <option value="">Select a project screenshot</option>
          {choices.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {choice.title}
              {choice.status === "published" && choice.is_public
                ? " · public"
                : ` · ${choice.status}`}
            </option>
          ))}
        </select>
      </label>
      {item ? (
        <input type="hidden" name="media_asset_id" value={item.media_asset_id} />
      ) : null}

      <label className="block text-sm font-medium text-ink">
        Caption
        <textarea
          name="caption"
          required
          maxLength={400}
          rows={3}
          defaultValue={item?.caption}
          disabled={pending}
          className={`${fieldClass} py-2`}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-medium text-ink">
          Display role
          <select
            name="display_role"
            defaultValue={item?.display_role ?? "workflow"}
            disabled={pending}
            className={fieldClass}
          >
            <option value="hero">Hero</option>
            <option value="workflow">Workflow</option>
            <option value="gallery">Gallery</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-ink">
          Status
          <select
            name="status"
            defaultValue={item?.status ?? "draft"}
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
            defaultValue={item?.sort_order ?? defaultSortOrder}
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
        {item ? "Save screenshot" : "Attach screenshot"}
      </button>
    </form>
  );
}

function ConfirmRemoveButton({
  projectId,
  relationshipId,
  title,
}: {
  projectId: string;
  relationshipId: string;
  title: string;
}) {
  return (
    <form
      action={deleteProjectMediaAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Remove “${title}” from this project? The media file itself is kept.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="relationship_id" value={relationshipId} />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center text-sm font-medium text-danger hover:underline"
      >
        Remove
      </button>
    </form>
  );
}

export function ProjectMediaEditor({
  projectId,
  items,
  choices,
}: {
  projectId: string;
  items: AdminProjectMedia[];
  choices: AdminProjectMediaChoice[];
}) {
  const attachedIds = new Set(items.map((item) => item.media_asset_id));
  const availableChoices = choices.filter((choice) => !attachedIds.has(choice.id));
  const nextSort =
    items.length > 0 ? Math.max(...items.map((item) => item.sort_order)) + 10 : 10;

  return (
    <div className="space-y-8">
      <ol className="space-y-6">
        {items.map((item, index) => {
          const thumbnailUrl = item.public_url;

          return (
            <li
              key={item.id}
              className="rounded-xl border border-line bg-paper-elevated p-5"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  {thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbnailUrl}
                      alt=""
                      width={160}
                      height={102}
                      className="h-auto w-28 rounded-lg border border-line object-contain"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={item.status} />
                      <span className="text-xs uppercase tracking-[0.14em] text-ink-faint">
                        {item.display_role}
                      </span>
                    </div>
                    <p className="mt-2 font-medium text-ink">{item.title}</p>
                    <p className="mt-1 text-sm text-ink-soft">{item.caption}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <form action={moveProjectMediaAction}>
                    <input type="hidden" name="project_id" value={projectId} />
                    <input type="hidden" name="relationship_id" value={item.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={index === 0}
                      className="text-sm font-medium text-ink-soft hover:text-ink disabled:opacity-40"
                    >
                      Move up
                    </button>
                  </form>
                  <form action={moveProjectMediaAction}>
                    <input type="hidden" name="project_id" value={projectId} />
                    <input type="hidden" name="relationship_id" value={item.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={index === items.length - 1}
                      className="text-sm font-medium text-ink-soft hover:text-ink disabled:opacity-40"
                    >
                      Move down
                    </button>
                  </form>
                  <ConfirmRemoveButton
                    projectId={projectId}
                    relationshipId={item.id}
                    title={item.title}
                  />
                </div>
              </div>
              <MediaForm projectId={projectId} item={item} choices={choices} />
            </li>
          );
        })}
      </ol>

      <section className="rounded-xl border border-dashed border-line bg-paper-elevated p-5">
        <h3 className="font-serif text-xl text-ink">Attach screenshot</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Attach an existing project screenshot, then set caption, role, order, and
          publication. Removing a relationship does not delete the media file.
        </p>
        <div className="mt-5">
          {availableChoices.length === 0 ? (
            <p className="text-sm text-ink-soft">
              No additional project screenshots are available to attach.
            </p>
          ) : (
            <MediaForm
              projectId={projectId}
              choices={availableChoices}
              defaultSortOrder={nextSort}
            />
          )}
        </div>
      </section>
    </div>
  );
}
