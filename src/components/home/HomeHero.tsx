import { focusPages, siteProfile, umbrellaDomains } from "@/content";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PortraitSlot } from "@/components/ui/PortraitSlot";

export function HomeHero() {
  return (
    <section className="border-b border-line bg-paper-elevated">
      <div className="mx-auto grid max-w-[72rem] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1.2fr)_18rem] lg:py-24">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-copper">
            {siteProfile.displayName}
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-medium leading-tight tracking-tight text-ink sm:text-5xl">
            {siteProfile.headline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-soft">
            {siteProfile.summary}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Practice areas">
            {umbrellaDomains.map((domain) => (
              <li
                key={domain}
                className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-ink-soft"
              >
                {domain}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            {focusPages.map((track) => (
              <ButtonLink
                key={track.id}
                href={`/focus/${track.slug}`}
                variant={track.id === "cyber" ? "primary" : "secondary"}
              >
                {track.navLabel}
              </ButtonLink>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink-faint">{siteProfile.workAuthorization}</p>
        </div>
        <PortraitSlot />
      </div>
    </section>
  );
}
