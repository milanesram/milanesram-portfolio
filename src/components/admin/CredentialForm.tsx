"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  deleteCredentialAction,
  saveCredentialAction,
  type MutationState,
} from "@/app/admin/credentials/actions";
import { CredentialEligibilityNote } from "@/components/admin/CredentialEligibilityNote";
import type { AdminCredential } from "@/lib/admin/credentials/queries";

const initialState: MutationState = { error: null, message: null };

const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

type CredentialFormProps = {
  credential?: AdminCredential;
};

export function CredentialForm({ credential }: CredentialFormProps) {
  const [state, formAction, pending] = useActionState(
    saveCredentialAction,
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
      {credential ? <input type="hidden" name="id" value={credential.id} /> : null}

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

      {credential ? (
        <CredentialEligibilityNote
          status={credential.status}
          needsVerification={credential.needs_verification}
        />
      ) : (
        <p className="text-sm text-ink-soft">
          New credentials default to draft. They stay off public pages until
          published and cleared of the verification hold.
        </p>
      )}

      <label className={labelClass}>
        Kind
        <select
          name="kind"
          required
          defaultValue={credential?.kind ?? "degree"}
          disabled={pending}
          className={fieldClass}
        >
          <option value="degree">Education</option>
          <option value="certification">Certification</option>
          <option value="training">Training</option>
          <option value="license">License</option>
        </select>
      </label>

      <label className={labelClass}>
        Official name
        <input
          name="name"
          required
          maxLength={200}
          defaultValue={credential?.name}
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
          defaultValue={credential?.issuer}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Year label
        <input
          name="year_label"
          maxLength={40}
          defaultValue={credential?.year_label ?? ""}
          disabled={pending}
          className={fieldClass}
          aria-describedby="year-hint"
        />
        <span
          id="year-hint"
          className="mt-1 block text-xs font-normal text-ink-faint"
        >
          Display string only. Do not invent completion or issue dates.
        </span>
      </label>

      <label className={labelClass}>
        Public description
        <textarea
          name="details"
          maxLength={2000}
          rows={4}
          defaultValue={credential?.details ?? ""}
          disabled={pending}
          className={`${fieldClass} py-2`}
        />
      </label>

      <label className={labelClass}>
        Verification URL
        <input
          name="verification_url"
          type="url"
          inputMode="url"
          defaultValue={credential?.verification_url ?? ""}
          disabled={pending}
          className={fieldClass}
          aria-describedby="verification-hint"
        />
        <span
          id="verification-hint"
          className="mt-1 block text-xs font-normal text-ink-faint"
        >
          Optional. HTTPS only. Leave blank unless an approved public
          verification page exists. Do not store membership or certificate
          numbers.
        </span>
      </label>

      <label className={labelClass}>
        Expires on
        <input
          name="expires_on"
          type="date"
          defaultValue={credential?.expires_on ?? ""}
          disabled={pending}
          className={fieldClass}
          aria-describedby="expires-hint"
        />
        <span
          id="expires-hint"
          className="mt-1 block text-xs font-normal text-ink-faint"
        >
          Optional. Use only when the credential has real expiry semantics.
          Expiration does not unpublish the record.
        </span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Career track
          <select
            name="track"
            defaultValue={credential?.track ?? "all"}
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
            defaultValue={credential?.sort_order ?? 0}
            disabled={pending}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
        <input
          type="checkbox"
          name="highlight"
          defaultChecked={credential?.highlight}
          disabled={pending}
          className="size-4 accent-[var(--accent)]"
        />
        Highlight on the Credentials page
      </label>

      <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
        <input
          type="checkbox"
          name="needs_verification"
          defaultChecked={credential?.needs_verification}
          disabled={pending}
          className="size-4 accent-[var(--accent)]"
        />
        Needs verification
      </label>
      <p className="text-xs text-ink-faint">
        Held credentials stay off Home, Focus, About, and /credentials even if
        a relationship still exists.
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
        {credential ? (
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

export function DeleteCredentialButton({
  credentialId,
  name,
}: {
  credentialId: string;
  name: string;
}) {
  return (
    <form
      action={deleteCredentialAction}
      className="border-t border-line pt-5"
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete the credential “${name}”? Relationships on Home, Focus, and About will also be removed. This cannot be undone from the admin UI.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={credentialId} />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center text-sm font-medium text-danger hover:underline"
      >
        Delete credential
      </button>
    </form>
  );
}
