import Link from "next/link";
import { AdminChrome } from "./AdminChrome";

const upcomingModules = [
  "Publications",
  "Credentials",
  "Resume Assets",
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
          Home, Projects, Experience, Education, Certifications, Training,
          Licenses, Skills, Settings, Media, and Inquiries are available.
          Other types are not implemented yet.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li>
            <Link
              href="/admin/home"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Home</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Edit Home copy, chips, and featured evidence relationships.
              </p>
            </Link>
          </li>
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
          <li>
            <Link
              href="/admin/experience"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Experience</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Create, draft, publish, and edit timeline items.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/education"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Education</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Create, draft, publish, and edit degree credentials.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/certifications"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Certifications</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Create, draft, publish, and edit certification credentials.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/training"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Training</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Create, draft, publish, and edit training credentials.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/licenses"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Licenses</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Create, draft, publish, and edit license credentials.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/skills"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Skills</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Create, draft, publish, and edit focus-page competencies.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/settings"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Settings</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Edit the site profile singleton and public website flags.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/media"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Media</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Inspect and edit existing media metadata. Upload is not
                available.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/inquiries"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Inquiries</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Review owner-only inbox rows. Public submission is not
                enabled.
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
