import { signOutAction } from "@/app/admin/actions";

export function AdminMfaBlocked() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16 sm:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
        Administration
      </p>
      <h1 className="mt-3 font-serif text-3xl text-ink">Sign-in stopped</h1>
      <p className="mt-3 text-base leading-7 text-ink-soft">
        This account has an unexpected authenticator setup. No administration
        tools are available until that is resolved.
      </p>
      <form action={signOutAction} className="mt-8">
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/20 px-5 text-sm font-medium text-ink"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
