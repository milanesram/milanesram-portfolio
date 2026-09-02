"use client";

import { useActionState } from "react";
import {
  savePageSeoAction,
  type MutationState,
} from "@/app/admin/seo/actions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PAGE_SEO_LABELS, PAGE_SEO_PATHS } from "@/lib/content/page-seo";
import type { AdminPageSeo } from "@/lib/admin/seo/queries";

const initialState: MutationState = { error: null, message: null };
const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

export function PageSeoForm({ record }: { record: AdminPageSeo }) {
  const [state, formAction, pending] = useActionState(
    savePageSeoAction,
    initialState,
  );
  const path = PAGE_SEO_PATHS[record.page_key] || "/";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="id" value={record.id} />
      <input type="hidden" name="page_key" value={record.page_key} />
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
      <p className="text-sm text-ink-soft">
        {PAGE_SEO_LABELS[record.page_key]} · <code>{path || "/"}</code> ·{" "}
        <StatusBadge status={record.status} />
      </p>
      <p className="text-sm leading-6 text-ink-faint">
        Conventional SEO length is a guide only. Values are not truncated on
        save. Leave OG fields blank to reuse the title and description.
      </p>
      <label className={labelClass}>
        Title
        <input
          name="title"
          required
          defaultValue={record.title}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Description
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={record.description}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Open Graph title
        <input
          name="og_title"
          defaultValue={record.og_title ?? ""}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Open Graph description
        <textarea
          name="og_description"
          rows={3}
          defaultValue={record.og_description ?? ""}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className="flex min-h-11 items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          name="indexable"
          defaultChecked={record.indexable}
          disabled={pending}
        />
        Page is indexable when the global site-indexable flag is also on
      </label>
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          name="intent"
          value="keep"
          disabled={pending}
          className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated disabled:opacity-60"
        >
          Save
        </button>
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={pending}
          className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-5 text-sm font-medium text-ink disabled:opacity-60"
        >
          Publish
        </button>
        <button
          type="submit"
          name="intent"
          value="unpublish"
          disabled={pending}
          className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-5 text-sm font-medium text-ink disabled:opacity-60"
        >
          Unpublish
        </button>
      </div>
    </form>
  );
}
