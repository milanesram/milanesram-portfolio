import Link from "next/link";
import { AdminChrome } from "./AdminChrome";

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
          Site Profile, Home, About, Journey, Focus, Experience, Projects,
          Writing, Credentials, Resume, Contact, SEO, Media, and Inquiries are
          operational. Public-file Resume delivery remains intentionally unused
          in Version 1.0.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li>
            <Link
              href="/admin/settings"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Site Profile</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Brand, contact values, and public website flags.
              </p>
            </Link>
          </li>
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
              href="/admin/about"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">About</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Edit About narrative, speaking, boundaries, and section framing.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/journey"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Journey</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Manage Professional Journey milestones and media relationships.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/skills"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Focus</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Edit Focus pages and selected evidence relationships.
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
                Page framing plus timeline roles and items.
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
                Index framing, case studies, and screenshot relationships.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/writing"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Writing</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Index framing and publication metadata. PDFs are not rewritten.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/credentials"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Credentials</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Credential facts, verification URLs, and page framing.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/resume"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Resume</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Page copy, tracks, Home kickers, and request-only delivery.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/contact"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">Contact</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Contact copy, channel visibility, and shared CTA text.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/seo"
              className="block rounded-xl border border-line bg-paper-elevated p-5 hover:border-ink/30"
            >
              <h3 className="text-base font-medium text-ink">SEO</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Hosted title, description, Open Graph text, and page
                indexability.
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
                Upload approved images and PDFs, then attach them from the
                owning module.
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
                Owner-only inbox. Public submission remains unpublished.
              </p>
            </Link>
          </li>
        </ul>
      </section>
    </AdminChrome>
  );
}
