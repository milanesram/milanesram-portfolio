import { ButtonLink } from "@/components/ui/ButtonLink";
import { HomePortrait } from "@/components/home/HomePortrait";
import { PortraitSlot } from "@/components/ui/PortraitSlot";
import type { PublicImageMedia } from "@/lib/content/media";
import type { HomeChip, HomeCta } from "@/lib/content/home-page";
import { visibleWorkAuthorization } from "@/lib/content/site-profile";

type HomeHeroProps = {
  eyebrow?: string;
  headline: string;
  lede: string;
  chips: HomeChip[];
  primaryCta: HomeCta;
  secondaryCta: HomeCta;
  portrait?: PublicImageMedia | null;
  workAuthorization?: string;
  initials?: string;
};

export function HomeHero({
  eyebrow,
  headline,
  lede,
  chips,
  primaryCta,
  secondaryCta,
  portrait = null,
  workAuthorization = "",
  initials = "",
}: HomeHeroProps) {
  const authorization = visibleWorkAuthorization(workAuthorization);
  return (
    <section className="border-b border-line bg-paper-elevated">
      <div className="mx-auto grid max-w-[72rem] items-start gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1.2fr)_16rem] lg:py-24">
        <div>
          {eyebrow ? (
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-copper">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-medium leading-tight tracking-tight text-ink sm:text-5xl">
            {headline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-soft">
            {lede}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Practice areas">
            {chips.map((chip) => (
              <li
                key={chip.id}
                className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-ink-soft"
              >
                {chip.label}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={primaryCta.href} variant="primary">
              {primaryCta.label}
            </ButtonLink>
            <ButtonLink href={secondaryCta.href} variant="secondary">
              {secondaryCta.label}
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
