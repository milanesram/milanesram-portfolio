import type { HomeFlagship } from "@/lib/content/home-page";
import type { PublishedProjectMedia } from "@/lib/content/project-map";
import { ProjectLeadVisual } from "@/components/projects/ProjectLeadVisual";
import { EditorialKicker } from "@/components/ui/EditorialKicker";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function HomeFlagshipProject({
  flagship,
  leadMedia = null,
}: {
  flagship: HomeFlagship;
  leadMedia?: PublishedProjectMedia | null;
}) {
  return (
    <article className="rounded-lg border border-line bg-paper-elevated p-6 shadow-[var(--shadow)] lg:p-10">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,22rem)]">
        <div>
          <EditorialKicker>{flagship.kicker}</EditorialKicker>
          <h2 className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            {flagship.heading}
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-ink-soft">
            {flagship.problem}
          </p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-ink">
            {flagship.whatIBuilt}
          </p>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-base leading-7 text-ink-soft">
            {flagship.proofPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          {flagship.project.stack.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Stack">
              {flagship.project.stack.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-line px-3 py-1 font-mono text-xs text-ink-soft"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          {flagship.project.limits ? (
            <p className="mt-6 max-w-3xl text-sm leading-6 text-ink">
              {flagship.project.limits}
            </p>
          ) : null}
          <div className="mt-8">
            <ButtonLink href={flagship.cta.href} variant="secondary">
              {flagship.cta.label}
            </ButtonLink>
          </div>
        </div>
        <ProjectLeadVisual media={leadMedia} fallback="motif" />
      </div>
    </article>
  );
}
