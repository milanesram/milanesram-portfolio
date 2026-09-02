import Image from "next/image";
import type { PublicJourneyMilestone } from "@/lib/content/about-page";
import { journeyObjectPosition } from "@/lib/content/journey-crop";

type AboutJourneyProps = {
  heading: string;
  items: PublicJourneyMilestone[];
};

function hasVisibleText(value: string | null): value is string {
  return Boolean(value && value.trim());
}

export function AboutJourney({ heading, items }: AboutJourneyProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-14" aria-labelledby="professional-journey-heading">
      <h2
        id="professional-journey-heading"
        className="font-serif text-2xl font-medium text-ink"
      >
        {heading}
      </h2>
      <ol className="mt-8 space-y-12">
        {items.map((item) => {
          const caption = hasVisibleText(item.caption) ? item.caption.trim() : null;
          const yearLabel =
            item.year !== null ? String(item.year) : null;
          const credit = hasVisibleText(item.media.credit)
            ? item.media.credit.trim()
            : null;
          const showCaption = Boolean(caption || yearLabel || credit);

          return (
            <li key={item.id}>
              <figure>
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-line bg-paper">
                  <Image
                    src={item.media.publicUrl}
                    alt={item.media.altText}
                    fill
                    sizes="(min-width: 672px) 42rem, calc(100vw - 2.5rem)"
                    className={`object-cover ${journeyObjectPosition(item.media.id)}`}
                  />
                </div>
                {showCaption ? (
                  <figcaption className="mt-3 text-sm leading-6 text-ink-soft">
                    {yearLabel ? (
                      <span className="block font-medium text-ink">{yearLabel}</span>
                    ) : null}
                    {caption ? <span className="mt-1 block">{caption}</span> : null}
                    {credit ? (
                      <span className="mt-1 block text-ink-faint">{credit}</span>
                    ) : null}
                  </figcaption>
                ) : null}
              </figure>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
