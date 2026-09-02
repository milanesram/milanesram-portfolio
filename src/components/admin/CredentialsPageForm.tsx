"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  saveCredentialsPageAction,
  type MutationState,
} from "@/app/admin/credentials/actions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { AdminCredentialsPage } from "@/lib/admin/credentials/queries";

const initialState: MutationState = { error: null, message: null };
const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

export function CredentialsPageForm({
  page,
}: {
  page?: AdminCredentialsPage | null;
}) {
  const [state, formAction, pending] = useActionState(
    saveCredentialsPageAction,
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

      {page ? (
        <p className="text-sm text-ink-soft">
          Status: <StatusBadge status={page.status} />
        </p>
      ) : (
        <p className="text-sm text-ink-soft">
          No Credentials page row yet. The first save creates the singleton.
        </p>
      )}

      <label className={labelClass}>
        Kicker
        <input
          name="kicker"
          required
          defaultValue={page?.kicker}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Headline
        <input
          name="headline"
          required
          defaultValue={page?.headline}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Lede
        <textarea
          name="lede"
          required
          rows={4}
          defaultValue={page?.lede}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <p className="text-sm leading-6 text-ink-soft">
        Public title and description are managed in{" "}
        <Link href="/admin/seo" className="text-accent hover:underline">
          SEO
        </Link>
        .
      </p>

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
