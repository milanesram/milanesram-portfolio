import Image from "next/image";
import type { PublicImageMedia } from "@/lib/content/media";

type AboutJourneyProps = {
  items: PublicImageMedia[];
};

const JOURNEY_INTRINSIC: Record<string, { width: number; height: number }> = {
  "21cc6ca2-a169-4d81-9e9f-c2b28142926f": { width: 1200, height: 1600 },
  "a9c3d301-8e83-490f-97f2-077b16f98844": { width: 1600, height: 1580 },
  "d2f89c64-e6de-42bc-b697-952ad6791d36": { width: 2000, height: 1500 },
  "7e8a240a-d83f-47e5-9986-7882509b5a63": { width: 1140, height: 2000 },
  "c524fb45-e73e-4a1d-917c-a0287f07fedb": { width: 1500, height: 2000 },
};

const FALLBACK_INTRINSIC = { width: 1600, height: 1200 };

function journeyIntrinsic(id: string): { width: number; height: number } {
  return JOURNEY_INTRINSIC[id] ?? FALLBACK_INTRINSIC;
}

function hasVisibleText(value: string | null): value is string {
  return Boolean(value && value.trim());
}

export function AboutJourney({ items }: AboutJourneyProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-14" aria-labelledby="professional-journey-heading">
      <h2
        id="professional-journey-heading"
        className="font-serif text-2xl font-medium text-ink"
      >
        Professional journey
      </h2>
      <ol className="mt-8 space-y-12">
        {items.map((item) => {
          const dims = journeyIntrinsic(item.id);
          const caption = hasVisibleText(item.caption) ? item.caption.trim() : null;
          const yearLabel = hasVisibleText(item.yearLabel) ? item.yearLabel.trim() : null;
          const credit = hasVisibleText(item.credit) ? item.credit.trim() : null;
          const showCaption = Boolean(caption || yearLabel || credit);

          return (
            <li key={item.id}>
              <figure>
                <Image
                  src={item.publicUrl}
                  alt={item.altText}
                  width={dims.width}
                  height={dims.height}
                  sizes="(min-width: 672px) 42rem, calc(100vw - 2.5rem)"
                  className="h-auto w-full rounded-xl border border-line bg-paper"
                />
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
