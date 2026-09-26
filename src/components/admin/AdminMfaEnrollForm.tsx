"use client";

import { useActionState } from "react";
import {
  enrollMfaAction,
  type MfaEnrollState,
} from "@/app/admin/mfa/actions";
import { signOutAction } from "@/app/admin/actions";

const initialState: MfaEnrollState = {
  error: null,
  factorId: null,
  qrCode: null,
  secret: null,
};

export function AdminMfaEnrollForm() {
  const [state, formAction, pending] = useActionState(
    enrollMfaAction,
    initialState,
  );
  const qrSrc = state.qrCode
    ? `data:image/svg+xml;utf-8,${encodeURIComponent(state.qrCode)}`
    : null;

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      {qrSrc && state.factorId ? (
        <>
          {/* This QR is a one-time data URL and must not go through the image optimizer. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Authenticator setup code"
            src={qrSrc}
            width={180}
            height={180}
            className="rounded-lg border border-line bg-paper p-2"
          />
          {state.secret ? (
            <label className="block text-sm">
              <span className="font-medium text-ink">
                Setup key, if you cannot scan the code
              </span>
              <input
                readOnly
                value={state.secret}
                autoComplete="off"
                spellCheck={false}
                className="mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 font-mono text-sm text-ink"
              />
            </label>
          ) : null}
          <input type="hidden" name="factorId" value={state.factorId} />
          <input type="hidden" name="intent" value="verify" />
          <label className="block text-sm">
            <span className="font-medium text-ink">Authenticator code</span>
            <input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              minLength={6}
              maxLength={6}
              required
              disabled={pending}
              className="mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated disabled:opacity-60 sm:w-auto"
          >
            {pending ? "Verifying…" : "Verify"}
          </button>
        </>
      ) : (
        <>
          <input type="hidden" name="intent" value="begin" />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated disabled:opacity-60 sm:w-auto"
          >
            {pending ? "Preparing…" : "Set up authenticator"}
          </button>
        </>
      )}

      <button
        type="submit"
        formAction={signOutAction}
        className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-ink-soft underline-offset-4 hover:underline"
      >
        Sign out
      </button>
    </form>
  );
}
