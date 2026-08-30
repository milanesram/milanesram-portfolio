"use client";

import { useActionState } from "react";
import { signInAction, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = { error: null };

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <label className="block text-sm">
        <span className="font-medium text-ink">Email</span>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          maxLength={254}
          disabled={pending}
          className="mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-ink">Password</span>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
          disabled={pending}
          className="mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
