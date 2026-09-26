"use client";

import { useActionState } from "react";
import { signOutAction } from "@/app/admin/actions";
import {
  challengeMfaAction,
  type MfaChallengeState,
} from "@/app/admin/mfa/actions";

const initialState: MfaChallengeState = { error: null };

export function AdminMfaChallengeForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(
    challengeMfaAction,
    initialState,
  );

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

      <input type="hidden" name="next" value={next} />
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
