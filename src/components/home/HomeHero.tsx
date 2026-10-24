import { ButtonLink } from "@/components/ui/ButtonLink";
import { EditorialKicker } from "@/components/ui/EditorialKicker";
import { HeroPortraitFrame } from "@/components/home/HeroPortraitFrame";
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
    <section className="overflow-x-clip border-b border-line bg-paper-elevated">
      <div className="mx-auto grid max-w-[72rem] items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(17rem,23rem)] lg:gap-14 lg:py-12">
        <div>
          {eyebrow ? (
            <EditorialKicker ruleClassName="w-16 sm:w-24">{eyebrow}</EditorialKicker>
          ) : null}
          <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.12] tracking-tight text-ink sm:text-5xl xl:text-[3.25rem] xl:leading-[1.08]">
            {headline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-soft">{lede}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Practice areas">
            {chips.map((chip) => (
              <li
                key={chip.id}
                className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft"
              >
                {chip.label}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={primaryCta.href} variant="accent">
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
        <HeroPortraitFrame>
          {portrait ? <HomePortrait portrait={portrait} /> : <PortraitSlot initials={initials} />}
        </HeroPortraitFrame>
      </div>
    </section>
  );
}
