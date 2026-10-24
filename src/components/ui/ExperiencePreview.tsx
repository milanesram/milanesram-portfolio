import type { Experience } from "@/content";
import { bulletsForTrack } from "@/content";

export function ExperiencePreview({
  experience,
  track,
  showTitleSecondary = true,
  maxBullets = 2,
}: {
  experience: Experience;
  track?: "cyber" | "privacy";
  showTitleSecondary?: boolean;
  maxBullets?: number;
}) {
  const bullets = (
    track ? bulletsForTrack(experience, track) : experience.bullets
  ).slice(0, maxBullets);

  return (
    <article className="border-t border-line py-8 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0">
          <h3 className="font-serif text-2xl font-medium leading-snug tracking-tight text-ink">
            {experience.organization}
          </h3>
          <p className="mt-2 text-base font-medium leading-6 text-ink">
            {experience.title}
          </p>
          {showTitleSecondary && experience.titleSecondary ? (
            <p className="mt-1 text-sm leading-6 text-ink-soft">
              {experience.titleSecondary}
            </p>
          ) : null}
        </div>
        <p className="shrink-0 text-sm font-medium leading-6 text-ink-soft sm:pt-1 sm:text-right">
          {experience.startLabel} – {experience.endLabel}
        </p>
      </div>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-soft">
        {bullets.map((bullet) => (
          <li key={bullet.body}>{bullet.body}</li>
        ))}
      </ul>
    </article>
  );
}
