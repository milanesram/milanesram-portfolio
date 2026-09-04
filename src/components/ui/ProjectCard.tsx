import Link from "next/link";
import type { Project } from "@/content";
import { projectCardEvidence } from "@/lib/content/project-card-evidence";

export function ProjectCard({
  project,
  featured = false,
}: {
  project: Project;
  featured?: boolean;
}) {
  const evidence = projectCardEvidence(project);

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
      {evidence.source ? (
        <a
          href={evidence.source.href}
          className="mt-6 inline-flex text-sm font-medium text-accent hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          {evidence.source.label}
        </a>
      ) : null}
    </article>
  );
}
