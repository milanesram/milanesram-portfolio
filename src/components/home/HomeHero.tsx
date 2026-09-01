import { homeHeroCopy } from "@/lib/content/home";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { HomePortrait } from "@/components/home/HomePortrait";
import { PortraitSlot } from "@/components/ui/PortraitSlot";
import type { PublicImageMedia } from "@/lib/content/media";
import { visibleWorkAuthorization } from "@/lib/content/site-profile";

type HomeHeroProps = {
  portrait?: PublicImageMedia | null;
  workAuthorization?: string;
  initials?: string;
};

export function HomeHero({
  portrait = null,
  workAuthorization = "",
  initials = "",
}: HomeHeroProps) {
  const authorization = visibleWorkAuthorization(workAuthorization);
  return (
    <section className="border-b border-line bg-paper-elevated">
      <div className="mx-auto grid max-w-[72rem] items-start gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1.2fr)_16rem] lg:py-24">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-copper">
            {homeHeroCopy.eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-medium leading-tight tracking-tight text-ink sm:text-5xl">
            {homeHeroCopy.headline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-soft">
            {homeHeroCopy.summary}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Practice areas">
            {homeHeroCopy.chips.map((domain) => (
              <li
                key={domain}
                className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-ink-soft"
              >
                {domain}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={homeHeroCopy.primaryCta.href} variant="primary">
              {homeHeroCopy.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={homeHeroCopy.secondaryCta.href} variant="secondary">
              {homeHeroCopy.secondaryCta.label}
            </ButtonLink>
          </div>
          {authorization ? (
            <p className="mt-6 text-sm text-ink-faint">{authorization}</p>
          ) : null}
        </div>
        {portrait ? <HomePortrait portrait={portrait} /> : <PortraitSlot initials={initials} />}
      </div>
    </section>
  );
}
