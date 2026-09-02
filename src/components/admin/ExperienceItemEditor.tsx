"use client";

import { useActionState } from "react";
import {
  deleteExperienceItemAction,
  moveExperienceItemAction,
  saveExperienceItemAction,
  type MutationState,
} from "@/app/admin/experience/actions";
import type { AdminExperienceItem } from "@/lib/admin/experience/queries";
import { StatusBadge } from "./StatusBadge";

const initialState: MutationState = { error: null, message: null };

const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";

function ItemForm({
  experienceId,
  item,
  defaultSortOrder = 0,
}: {
  experienceId: string;
  item?: AdminExperienceItem;
  defaultSortOrder?: number;
}) {
  const [state, formAction, pending] = useActionState(
    saveExperienceItemAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="experience_id" value={experienceId} />
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
        Item text
        <textarea
          name="body"
          required
          maxLength={2000}
          rows={4}
          defaultValue={item?.body}
          disabled={pending}
          className={`${fieldClass} py-2`}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-medium text-ink">
          Career track
          <select
            name="track"
            defaultValue={item?.track ?? "all"}
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
      <label className="block text-sm font-medium text-ink">
        Metric context
        <input
          name="metric_context"
          maxLength={400}
          defaultValue={item?.metric_context ?? ""}
          disabled={pending}
          className={fieldClass}
          aria-describedby={item ? undefined : "metric-hint"}
        />
        {!item ? (
          <span
            id="metric-hint"
            className="mt-1 block text-xs font-normal text-ink-faint"
          >
            Required when this item is marked as a metric.
          </span>
        ) : null}
      </label>
      <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
        <input
          type="checkbox"
          name="is_metric"
          defaultChecked={item?.is_metric}
          disabled={pending}
          className="size-4 accent-[var(--accent)]"
        />
        Metric item
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-medium text-paper-elevated disabled:opacity-60"
      >
        {item ? "Save item" : "Add item"}
      </button>
    </form>
  );
}

function ConfirmDeleteButton({
  experienceId,
  itemId,
  preview,
}: {
  experienceId: string;
  itemId: string;
  preview: string;
}) {
  return (
    <form
      action={deleteExperienceItemAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete the item “${preview}”? This cannot be undone from the admin UI.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="experience_id" value={experienceId} />
      <input type="hidden" name="item_id" value={itemId} />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center text-sm font-medium text-danger hover:underline"
      >
        Delete
      </button>
    </form>
  );
}

function itemPreview(body: string) {
  const compact = body.trim().replace(/\s+/g, " ");
  return compact.length > 72 ? `${compact.slice(0, 69)}…` : compact;
}

export function ExperienceItemEditor({
  experienceId,
  items,
}: {
  experienceId: string;
  items: AdminExperienceItem[];
}) {
  return (
    <div className="space-y-8">
      <ol className="space-y-6">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="rounded-xl border border-line bg-paper-elevated p-5"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={item.status} />
                <span className="text-xs text-ink-faint">
                  {index + 1} of {items.length}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <form action={moveExperienceItemAction}>
                  <input type="hidden" name="experience_id" value={experienceId} />
                  <input type="hidden" name="item_id" value={item.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    disabled={index === 0}
                    className="text-sm font-medium text-ink-soft hover:text-ink disabled:opacity-40"
                  >
                    Move up
                  </button>
                </form>
                <form action={moveExperienceItemAction}>
                  <input type="hidden" name="experience_id" value={experienceId} />
                  <input type="hidden" name="item_id" value={item.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={index === items.length - 1}
                    className="text-sm font-medium text-ink-soft hover:text-ink disabled:opacity-40"
                  >
                    Move down
                  </button>
                </form>
                <ConfirmDeleteButton
                  experienceId={experienceId}
                  itemId={item.id}
                  preview={itemPreview(item.body)}
                />
              </div>
            </div>
            <ItemForm experienceId={experienceId} item={item} />
          </li>
        ))}
      </ol>

      <section className="rounded-xl border border-dashed border-line bg-paper-elevated p-5">
        <h3 className="font-serif text-xl text-ink">Add item</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Career-track classification lives on items, not on the experience row.
        </p>
        <div className="mt-5">
          <ItemForm
            experienceId={experienceId}
            defaultSortOrder={items.length}
          />
        </div>
      </section>
    </div>
  );
}
