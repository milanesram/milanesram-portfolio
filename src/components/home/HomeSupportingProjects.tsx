import Link from "next/link";
import { ProjectLeadVisual } from "@/components/projects/ProjectLeadVisual";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EditorialKicker } from "@/components/ui/EditorialKicker";
import type { PublishedProjectMedia } from "@/lib/content/project-map";
import {
  HOME_ALL_PROJECTS_CTA,
  HOME_SUPPORTING_SECTION_KICKER,
  type HomeSupportingProject,
} from "@/lib/content/home-supporting-projects";

export function HomeSupportingProjects({
  projects,
}: {
  projects: Array<
    HomeSupportingProject & { leadMedia?: PublishedProjectMedia | null }
  >;
}) {
  return (
    <div className={projects.length > 0 ? "mt-10" : "mt-8"}>
      {projects.length > 0 ? (
        <>
          <EditorialKicker>{HOME_SUPPORTING_SECTION_KICKER}</EditorialKicker>
          <ul className="mt-6 grid gap-6 lg:grid-cols-2">
            {projects.map((project) => (
              <li key={project.slug} className="min-w-0">
                <article className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-paper-elevated shadow-[var(--shadow)]">
                  <ProjectLeadVisual
                    media={project.leadMedia ?? null}
                    fallback="motif"
                    bleed
                  />
                  <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-serif text-xl font-medium leading-snug text-ink">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink-faint">{project.tagline}</p>
                  {project.contribution ? (
                    <p className="mt-4 text-sm leading-6 text-ink">
                      <span className="font-medium">Role / contribution.</span>{" "}
                      {project.contribution}
                    </p>
                  ) : null}
                  {project.tags.length > 0 ? (
                    <ul
                      className="mt-4 flex flex-wrap gap-2"
                      aria-label={`${project.name} capabilities`}
                    >
                      {project.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-line px-3 py-1 font-mono text-xs text-ink-soft"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <Link
                    href={project.href}
                    className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline"
                  >
                    {project.ctaLabel}
                  </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <div className={projects.length > 0 ? "mt-8" : undefined}>
        <ButtonLink href={HOME_ALL_PROJECTS_CTA.href} variant="text">
          {HOME_ALL_PROJECTS_CTA.label}
        </ButtonLink>
      </div>
    </div>
  );
}
