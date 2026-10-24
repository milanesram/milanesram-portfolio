import Link from "next/link";
import type { Project } from "@/content";
import { projectCardEvidence } from "@/lib/content/project-card-evidence";
import type { PublishedProjectMedia } from "@/lib/content/project-map";
import { ProjectLeadVisual } from "@/components/projects/ProjectLeadVisual";
import { EditorialKicker } from "@/components/ui/EditorialKicker";

export function ProjectCard({
  project,
  featured = false,
  leadMedia = null,
  headingLevel = "h3",
  layout = "stacked",
}: {
  project: Project;
  featured?: boolean;
  leadMedia?: PublishedProjectMedia | null;
  headingLevel?: "h2" | "h3";
  layout?: "stacked" | "alongside";
}) {
  const evidence = projectCardEvidence(project);
  const Title = headingLevel;
  const alongside = layout === "alongside";

  return (
    <article
      id={project.slug}
      className={`min-w-0 overflow-hidden rounded-lg border border-line bg-paper-elevated shadow-[var(--shadow)] ${
        alongside ? "lg:grid lg:grid-cols-2 lg:items-start" : ""
      }`}
    >
      {leadMedia ? (
        <ProjectLeadVisual
          media={leadMedia}
          bleed
          sizes={
            alongside
              ? "(min-width: 1024px) 36rem, calc(100vw - 2.5rem)"
              : undefined
          }
          captionClassName={alongside ? "px-6 py-4 lg:pb-8" : undefined}
        />
      ) : null}
      <div className={`min-w-0 p-6 ${featured || alongside ? "lg:p-8" : ""}`}>
      <EditorialKicker>
        {featured ? "Featured project" : project.yearLabel}
      </EditorialKicker>
      <Title className="font-serif text-2xl font-medium leading-snug break-words text-ink">{project.name}</Title>
      <p className="mt-1 text-sm text-ink-faint">
        {project.tagline}
        {featured ? ` · ${project.yearLabel}` : null}
      </p>
      <p className="mt-4 text-base leading-7 text-ink-soft">{project.summary}</p>
      {evidence.contribution ? (
        <p className="mt-4 text-sm leading-6 text-ink">
          <span className="font-medium">Role / contribution.</span>{" "}
          {evidence.contribution}
        </p>
      ) : null}
      {evidence.stack.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Stack">
          {evidence.stack.map((item) => (
            <li
              key={item}
              className="rounded-full border border-line px-3 py-1 font-mono text-xs text-ink-soft"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-4 text-sm leading-6 text-ink">{project.limits}</p>
      {evidence.caseStudyCta ? (
        <Link
          href={evidence.href}
          className="mt-6 inline-flex text-sm font-medium text-accent hover:underline"
        >
          Read the PrivAI Guard case study
        </Link>
      ) : null}
      {evidence.sources.length > 0 ? (
        <ul className="mt-6 flex list-none flex-col items-start gap-3 p-0">
          {evidence.sources.map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                className="inline-flex text-sm font-medium text-accent hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      </div>
    </article>
  );
}
