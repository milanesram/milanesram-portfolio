import type { Experience } from "@/content";
import { bulletsForTrack } from "@/content";

export function ExperiencePreview({
  experience,
  track,
  showTitleSecondary = true,
}: {
  experience: Experience;
  track?: "cyber" | "privacy";
  showTitleSecondary?: boolean;
}) {
  const bullets = track
    ? bulletsForTrack(experience, track).slice(0, 2)
    : experience.bullets.slice(0, 2);

  return (
    <article className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h3 className="font-serif text-xl font-medium text-ink">
          {experience.organization}
        </h3>
        <p className="text-sm text-ink-faint">
          {experience.startLabel} – {experience.endLabel}
        </p>
      </div>
      <p className="mt-1 text-sm font-medium text-ink-soft">{experience.title}</p>
      {showTitleSecondary && experience.titleSecondary ? (
        <p className="text-sm text-ink-soft">{experience.titleSecondary}</p>
      ) : null}
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-soft">
        {bullets.map((bullet) => (
          <li key={bullet.body}>{bullet.body}</li>
        ))}
      </ul>
    </article>
  );
}
