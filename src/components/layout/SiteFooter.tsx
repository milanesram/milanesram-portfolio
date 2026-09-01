import Link from "next/link";
import { focusPages, navPrimary, siteProfile } from "@/content";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-paper-elevated">
      <div className="mx-auto grid max-w-[72rem] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-4">
        <div>
          <p className="font-serif text-xl text-ink">{siteProfile.displayName}</p>
          <p className="mt-3 text-sm leading-6 text-ink-soft">{siteProfile.headline}</p>
          {siteProfile.workAuthorization ? (
            <p className="mt-4 text-sm text-ink-faint">{siteProfile.workAuthorization}</p>
          ) : null}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
            Explore
          </p>
          <ul className="mt-3 space-y-2">
            {navPrimary.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-ink-soft hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/resume" className="text-sm text-ink-soft hover:text-ink">
                Resume
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
            Focus areas
          </p>
          <ul className="mt-3 space-y-2">
            {focusPages.map((track) => (
              <li key={track.id}>
                <Link
                  href={`/focus/${track.slug}`}
                  className="text-sm text-ink-soft hover:text-ink"
                >
                  {track.navLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
            Contact
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <a
                href={`mailto:${siteProfile.email}`}
                className="text-sm text-ink-soft hover:text-ink"
              >
                {siteProfile.email}
              </a>
            </li>
            <li>
              <a
                href={siteProfile.linkedinUrl}
                className="text-sm text-ink-soft hover:text-ink"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            </li>
          </ul>
          <p className="mt-6 text-xs leading-5 text-ink-faint">
            Licensed to Practice Law in the Philippines. Not licensed to practice law
            in the United States.
          </p>
        </div>
      </div>
    </footer>
  );
}
