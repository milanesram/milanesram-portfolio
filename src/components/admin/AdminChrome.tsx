import Link from "next/link";
import { signOutAction } from "@/app/admin/actions";

type AdminChromeProps = {
  email?: string | null;
  title: string;
  children: React.ReactNode;
};

export function AdminChrome({ email, title, children }: AdminChromeProps) {
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
            <p className="mt-1 font-serif text-2xl text-ink">
              <Link href="/admin" className="hover:underline">
                Portfolio Administration
              </Link>
            </p>
            <h1 className="mt-1 text-base font-medium text-ink-soft">{title}</h1>
            {email ? (
              <p className="mt-1 text-sm text-ink-faint">{email}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/projects"
              className="text-sm font-medium text-ink-soft hover:text-ink"
            >
              Projects
            </Link>
            <Link
              href="/admin/experience"
              className="text-sm font-medium text-ink-soft hover:text-ink"
            >
              Experience
            </Link>
            <Link
              href="/admin/education"
              className="text-sm font-medium text-ink-soft hover:text-ink"
            >
              Education
            </Link>
            <Link
              href="/admin/certifications"
              className="text-sm font-medium text-ink-soft hover:text-ink"
            >
              Certifications
            </Link>
            <Link
              href="/admin/training"
              className="text-sm font-medium text-ink-soft hover:text-ink"
            >
              Training
            </Link>
            <Link
              href="/admin/licenses"
              className="text-sm font-medium text-ink-soft hover:text-ink"
            >
              Licenses
            </Link>
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
      <div id="admin-main" className="mx-auto w-full max-w-[72rem] flex-1 px-5 py-10 sm:px-8">
        {children}
      </div>
    </div>
  );
}
