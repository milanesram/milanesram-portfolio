"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  deleteMediaAction,
  saveMediaAction,
  type MutationState,
} from "@/app/admin/media/actions";
import type { AdminMediaAsset } from "@/lib/admin/media/queries";

const initialState: MutationState = { error: null, message: null };

const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

type MediaFormProps = {
  media: AdminMediaAsset;
};

export function MediaForm({ media }: MediaFormProps) {
  const [state, formAction, pending] = useActionState(
    saveMediaAction,
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
      <input type="hidden" name="id" value={media.id} />

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

      <div>
        <p className={labelClass}>Storage path</p>
        <p className="mt-2 break-all rounded-lg border border-line bg-paper px-3 py-3 text-sm text-ink-soft">
          {media.bucket_path}
        </p>
        <p className="mt-1 text-xs text-ink-faint">
          Immutable storage identity. Not editable and not a public URL.
        </p>
      </div>

      <label className={labelClass}>
        Title
        <input
          name="title"
          required
          maxLength={200}
          defaultValue={media.title}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Alt text
        <input
          name="alt_text"
          maxLength={300}
          defaultValue={media.alt_text ?? ""}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Kind
        <select
          name="kind"
          defaultValue={media.kind}
          disabled={pending}
          className={fieldClass}
        >
          <option value="resume_pdf">Resume PDF</option>
          <option value="image">Image</option>
          <option value="document">Document</option>
        </select>
      </label>

      <label className="flex items-start gap-3 text-sm font-medium text-ink">
        <input
          name="is_public"
          type="checkbox"
          defaultChecked={media.is_public}
          disabled={pending}
          className="mt-1 h-4 w-4"
        />
        <span>
          Public
          <span className="mt-1 block font-normal text-ink-faint">
            Anonymous visitors can read this row only when it is also
            published.
          </span>
        </span>
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
      </div>
    </form>
  );
}

export function DeleteMediaButton({
  mediaId,
  title,
  referenceCount,
}: {
  mediaId: string;
  title: string;
  referenceCount: number;
}) {
  const [state, formAction, pending] = useActionState(
    deleteMediaAction,
    initialState,
  );

  return (
    <form action={formAction} className="border-t border-line pt-5">
      <input type="hidden" name="id" value={mediaId} />
      {state.error ? (
        <p
          role="alert"
          className="mb-3 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}
      {referenceCount > 0 ? (
        <p className="text-sm leading-6 text-ink-soft">
          This asset is referenced by {referenceCount} record
          {referenceCount === 1 ? "" : "s"}. Remove those relationships before
          deleting.
        </p>
      ) : (
        <p className="text-sm leading-6 text-ink-soft">
          Deletion removes the metadata row. Storage objects are not deleted
          automatically.
        </p>
      )}
      <button
        type="submit"
        disabled={pending || referenceCount > 0}
        onClick={(event) => {
          if (
            !window.confirm(
              `Delete the media record “${title}”? This does not silently rewrite related pages.`,
            )
          ) {
            event.preventDefault();
          }
        }}
        className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-danger hover:underline disabled:opacity-60"
      >
        Delete media metadata
      </button>
    </form>
  );
}
