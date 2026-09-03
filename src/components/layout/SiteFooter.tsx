import Link from "next/link";
import { FOCUS_PUBLIC_ROUTES, navPrimary } from "@/content";
import {
  selectFooterIdentity,
  type PublicSiteProfile,
} from "@/lib/content/site-profile";

export function SiteFooter({
  profile,
  releaseLabel = null,
}: {
  profile: PublicSiteProfile | null;
  releaseLabel?: string | null;
}) {
  const identity = selectFooterIdentity(profile);

  return (
    <footer className="mt-auto border-t border-line bg-paper-elevated">
      <div className="mx-auto grid max-w-[72rem] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-4">
        <div>
          <p className="font-serif text-xl text-ink">{identity.displayName}</p>
          {identity.headline ? (
            <p className="mt-3 text-sm leading-6 text-ink-soft">{identity.headline}</p>
          ) : null}
          {identity.workAuthorization ? (
            <p className="mt-4 text-sm text-ink-faint">{identity.workAuthorization}</p>
          ) : null}
          {releaseLabel ? (
            <p className="mt-5 text-xs tracking-[0.08em] text-ink-faint">
              {releaseLabel}
            </p>
          ) : null}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
            Explore
          </p>
          <ul className="mt-3 space-y-2">
            {navPrimary.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/resume"
                className="text-sm text-ink-soft transition-colors hover:text-ink"
              >
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
            {FOCUS_PUBLIC_ROUTES.map((track) => (
              <li key={track.slug}>
                <Link
                  href={track.href}
                  className="text-sm text-ink-soft transition-colors hover:text-ink"
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
          {identity.contact ? (
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href={identity.contact.mailtoHref}
                  className="text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  {identity.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={identity.contact.linkedinUrl}
                  className="text-sm text-ink-soft transition-colors hover:text-ink"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">
              Public contact channels are temporarily unavailable.
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
