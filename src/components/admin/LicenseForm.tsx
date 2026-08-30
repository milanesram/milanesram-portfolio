"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  deleteLicenseAction,
  saveLicenseAction,
  type MutationState,
} from "@/app/admin/licenses/actions";
import type { AdminLicense } from "@/lib/admin/licenses/queries";

const initialState: MutationState = { error: null, message: null };

const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

type LicenseFormProps = {
  license?: AdminLicense;
};

export function LicenseForm({ license }: LicenseFormProps) {
  const [state, formAction, pending] = useActionState(
    saveLicenseAction,
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
      {license ? (
        <input type="hidden" name="id" value={license.id} />
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
          maxLength={200}
          defaultValue={license?.name}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Issuer
        <input
          name="issuer"
          required
          maxLength={160}
          defaultValue={license?.issuer}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Year label
        <input
          name="year_label"
          maxLength={40}
          defaultValue={license?.year_label ?? ""}
          disabled={pending}
          className={fieldClass}
          aria-describedby="year-hint"
        />
        <span
          id="year-hint"
          className="mt-1 block text-xs font-normal text-ink-faint"
        >
          Display string only. The schema has no issue date, expiration,
          license number, license state, or verification URL.
        </span>
      </label>

      <label className={labelClass}>
        Details
        <textarea
          name="details"
          maxLength={2000}
          rows={4}
          defaultValue={license?.details ?? ""}
          disabled={pending}
          className={`${fieldClass} py-2`}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Career track
          <select
            name="track"
            defaultValue={license?.track ?? "all"}
            disabled={pending}
            className={fieldClass}
          >
            <option value="all">All</option>
            <option value="cybersecurity_grc">Cybersecurity / GRC</option>
            <option value="privacy_ai">Privacy / AI</option>
          </select>
        </label>
        <label className={labelClass}>
          Sort order
          <input
            name="sort_order"
            type="number"
            min={0}
            max={9999}
            defaultValue={license?.sort_order ?? 0}
            disabled={pending}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
        <input
          type="checkbox"
          name="highlight"
          defaultChecked={license?.highlight}
          disabled={pending}
          className="size-4 accent-[var(--accent)]"
        />
        Highlight
      </label>

      <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
        <input
          type="checkbox"
          name="needs_verification"
          defaultChecked={license?.needs_verification}
          disabled={pending}
          className="size-4 accent-[var(--accent)]"
        />
        Needs verification
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
        {license ? (
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

export function DeleteLicenseButton({
  licenseId,
  name,
}: {
  licenseId: string;
  name: string;
}) {
  return (
    <form
      action={deleteLicenseAction}
      className="border-t border-line pt-5"
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete the license “${name}”? This cannot be undone from the admin UI.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={licenseId} />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center text-sm font-medium text-danger hover:underline"
      >
        Delete license
      </button>
    </form>
  );
}
