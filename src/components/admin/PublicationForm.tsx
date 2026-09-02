"use client";

import { useActionState } from "react";
import {
  deletePublicationAction,
  savePublicationAction,
  type MutationState,
} from "@/app/admin/writing/actions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type {
  AdminPublication,
  AdminPublicationMediaChoice,
} from "@/lib/admin/writing/queries";

const initialState: MutationState = { error: null, message: null };
const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

export function PublicationForm({
  publication,
  mediaChoices,
}: {
  publication?: AdminPublication | null;
  mediaChoices: AdminPublicationMediaChoice[];
}) {
  const [state, formAction, pending] = useActionState(
    savePublicationAction,
    initialState,
  );
  const slugLocked = publication?.status === "published";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {publication ? <input type="hidden" name="id" value={publication.id} /> : null}
      {slugLocked ? (
        <input type="hidden" name="slug" value={publication.slug} />
      ) : null}
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
      {publication ? (
        <p className="text-sm text-ink-soft">
          Status: <StatusBadge status={publication.status} />
        </p>
      ) : null}
      <label className={labelClass}>
        Title
        <input
          name="title"
          required
          defaultValue={publication?.title}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Slug
        <input
          name={slugLocked ? undefined : "slug"}
          required={!slugLocked}
          defaultValue={publication?.slug}
          disabled={pending || slugLocked}
          className={fieldClass}
        />
      </label>
      {slugLocked ? (
        <p className="text-sm leading-6 text-ink-soft">
          Published slugs are locked because they are public URLs. Version 1.0
          does not create silent redirects.
        </p>
      ) : (
        <p className="text-sm leading-6 text-ink-soft">
          Changing a slug after publication would change the public URL. Keep
          drafts until the slug is final.
        </p>
      )}
      <label className={labelClass}>
        Type
        <select
          name="document_kind"
          required
          defaultValue={publication?.document_kind ?? "publication"}
          disabled={pending}
          className={fieldClass}
        >
          <option value="publication">Publication</option>
          <option value="white_paper">White paper</option>
          <option value="editorial">Editorial</option>
          <option value="feature">Feature</option>
          <option value="four_minute_read">4 Minute Read</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className={labelClass}>
        Delivery
        <select
          name="rights_status"
          required
          defaultValue={publication?.rights_status ?? "host_pdf"}
          disabled={pending}
          className={fieldClass}
        >
          <option value="host_pdf">Hosted PDF</option>
          <option value="link_only">External link only</option>
          <option value="review_required">Review required</option>
        </select>
      </label>
      <label className={labelClass}>
        Publisher
        <input
          name="publisher"
          required
          defaultValue={publication?.publisher}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Year label
        <input
          name="year_label"
          required
          defaultValue={publication?.year_label}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Published on
        <input
          name="published_on"
          type="date"
          defaultValue={publication?.published_on ?? ""}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Summary
        <textarea
          name="abstract"
          required
          rows={5}
          defaultValue={publication?.abstract}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Author (optional)
        <input
          name="author"
          defaultValue={publication?.author ?? ""}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <p className="text-sm leading-6 text-ink-soft">
        Leave author blank to keep the existing public byline. Do not invent
        credits.
      </p>
      <label className={labelClass}>
        Track
        <select
          name="track"
          required
          defaultValue={publication?.track ?? "all"}
          disabled={pending}
          className={fieldClass}
        >
          <option value="all">Both tracks</option>
          <option value="cybersecurity_grc">Cybersecurity / GRC</option>
          <option value="privacy_ai">Privacy / AI Governance</option>
        </select>
      </label>
      <label className={labelClass}>
        Hosted PDF
        <select
          name="media_id"
          defaultValue={publication?.media_id ?? ""}
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
      {publication?.status === "published" &&
      publication.rights_status === "host_pdf" ? (
        <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
          <input
            type="checkbox"
            name="confirm_replace_file"
            disabled={pending}
            className="size-4 accent-[var(--accent)]"
          />
          Confirm changing the related PDF. This does not rewrite the existing
          file.
        </label>
      ) : null}
      <label className={labelClass}>
        External URL
        <input
          name="external_url"
          defaultValue={publication?.external_url ?? ""}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <p className="text-sm leading-6 text-ink-soft">
        Required for link-only works. Must be HTTPS. Do not attach a fake local
        PDF.
      </p>
      <label className={labelClass}>
        Sort order
        <input
          name="sort_order"
          required
          inputMode="numeric"
          defaultValue={publication?.sort_order ?? 100}
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
        {publication ? (
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
      {publication ? (
        <div className="border-t border-line pt-5">
          <p className="text-sm text-ink-soft">
            Deleting metadata does not delete the PDF in Storage.
          </p>
          <button
            formAction={deletePublicationAction}
            type="submit"
            name="id"
            value={publication.id}
            disabled={pending}
            className="mt-3 inline-flex min-h-11 items-center rounded-full border border-danger/30 px-5 text-sm font-medium text-danger disabled:opacity-60"
          >
            Delete publication
          </button>
        </div>
      ) : null}
    </form>
  );
}
