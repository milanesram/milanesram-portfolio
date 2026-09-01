import type { HomeFlagship } from "@/lib/content/home-page";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function HomeFlagshipProject({ flagship }: { flagship: HomeFlagship }) {
  return (
    <article className="rounded-xl border border-line bg-paper-elevated p-6 shadow-[var(--shadow)] lg:p-10">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
        {flagship.kicker}
      </p>
      <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
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
    </article>
  );
}
