import { signOutAction } from "@/app/admin/actions";

type AdminAccessDeniedProps = {
  email: string | null;
};

export function AdminAccessDenied({ email }: AdminAccessDeniedProps) {
  return (
    <div className="mx-auto w-full max-w-lg px-5 py-16 sm:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
        Administration
      </p>
      <h1 className="mt-3 font-serif text-3xl text-ink">Access denied</h1>
      <p className="mt-4 text-base leading-7 text-ink-soft">
        This signed-in account is not authorized to administer the portfolio.
      </p>
      {email ? (
        <p className="mt-3 text-sm text-ink-faint">Signed in as {email}</p>
      ) : null}
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
