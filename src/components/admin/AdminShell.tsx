import Link from "next/link";
import { AdminChrome } from "./AdminChrome";

const upcomingModules = [
  "Profile",
  "Experience",
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
    <AdminChrome email={email} title="Dashboard">
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
          Projects is the first CMS module. Other types are not implemented yet.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li>
            <Link
              href="/admin/projects"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Projects</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Create, draft, publish, and edit case-study sections.
              </p>
            </Link>
          </li>
          {upcomingModules.map((label) => (
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
    </AdminChrome>
  );
}
