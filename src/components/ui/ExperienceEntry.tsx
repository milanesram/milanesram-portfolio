import type { Experience } from "@/content";
import { bulletsForTrack } from "@/content";

export function ExperienceEntry({
  experience,
  track,
}: {
  experience: Experience;
  track?: "cyber" | "privacy";
}) {
  const bullets = bulletsForTrack(experience, track);

  return (
    <article className="border-t border-line py-8 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[14rem_1fr] lg:gap-10">
        <div>
          <p className="text-sm text-ink-faint">
            {experience.startLabel} – {experience.endLabel}
          </p>
          <p className="mt-1 text-sm text-ink-faint">{experience.location}</p>
        </div>
        <div>
          <h3 className="font-serif text-2xl font-medium text-ink">
            {experience.organization}
          </h3>
          <p className="mt-1 font-medium text-ink">{experience.title}</p>
          {experience.titleSecondary ? (
            <p className="text-ink-soft">{experience.titleSecondary}</p>
          ) : null}
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-ink-soft">
            {bullets.map((bullet) => (
              <li key={bullet.body}>{bullet.body}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
