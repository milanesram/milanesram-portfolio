import Link from "next/link";
import type { Project } from "@/content";

export function ProjectCard({
  project,
  featured = false,
}: {
  project: Project;
  featured?: boolean;
}) {
  const href =
    project.slug === "privai-guard"
      ? "/projects/privai-guard"
      : `/projects#${project.slug}`;

  return (
    <article
      id={project.slug}
      className={`rounded-xl border border-line bg-paper-elevated p-6 shadow-[var(--shadow)] ${featured ? "lg:p-8" : ""}`}
    >
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
        {featured ? "Featured project" : project.yearLabel}
      </p>
      <h3 className="mt-3 font-serif text-2xl font-medium text-ink">{project.name}</h3>
      <p className="mt-1 text-sm text-ink-faint">
        {project.tagline}
        {featured ? ` · ${project.yearLabel}` : null}
      </p>
      <p className="mt-4 text-base leading-7 text-ink-soft">{project.summary}</p>
      <p className="mt-4 text-sm leading-6 text-ink">{project.limits}</p>
      {project.slug === "privai-guard" ? (
        <Link
          href={href}
          className="mt-6 inline-flex text-sm font-medium text-accent hover:underline"
        >
          Read the PrivAI Guard case study
        </Link>
      ) : null}
    </article>
  );
}
