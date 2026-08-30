import Link from "next/link";
import { signOutAction } from "@/app/admin/actions";

const futureSections = [
  "Profile",
  "Experience",
  "Projects",
  "Publications",
  "Credentials",
  "Media",
  "Resume Assets",
  "Messages",
  "Site Settings",
] as const;

type AdminShellProps = {
  email: string | null;
};

export function AdminShell({ email }: AdminShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <a href="#admin-main" className="skip-link">
        Skip to admin content
      </a>
      <header className="border-b border-line bg-paper-elevated">
        <div className="mx-auto flex max-w-[72rem] flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
              Administration
            </p>
            <h1 className="mt-1 font-serif text-2xl text-ink">
              Portfolio Administration
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-ink-soft hover:text-ink"
            >
              View public site
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/20 px-4 text-sm font-medium text-ink hover:border-ink/50"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main id="admin-main" className="mx-auto w-full max-w-[72rem] flex-1 px-5 py-10 sm:px-8">
        <section
          aria-labelledby="admin-identity-heading"
          className="rounded-xl border border-line bg-paper-elevated p-6"
        >
          <h2 id="admin-identity-heading" className="font-serif text-xl text-ink">
            Session
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-copper">
                Signed in as
              </dt>
              <dd className="mt-1 text-ink">{email ?? "Authenticated account"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-copper">
                Authorization
              </dt>
              <dd className="mt-1 text-ink">Authorized administrator</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="admin-modules-heading" className="mt-10">
          <h2 id="admin-modules-heading" className="font-serif text-xl text-ink">
            Content management
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            These modules are placeholders. Creating, editing, and publishing
            portfolio content is not implemented yet.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {futureSections.map((label) => (
              <li
                key={label}
                className="rounded-xl border border-dashed border-line bg-paper-elevated p-5"
              >
                <h3 className="text-base font-medium text-ink">{label}</h3>
                <p className="mt-2 text-sm text-ink-faint">Not implemented yet</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
