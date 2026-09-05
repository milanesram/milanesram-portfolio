import { projectCardEvidence } from "@/lib/content/project-card-evidence";
import {
  getPublishedProjects,
  type PublishedProject,
} from "@/lib/content/projects";

/**
 * Home supporting-project selection is presentation-only.
 *
 * Home CMS can feature one project (`home_page.featured_project_id`).
 * Selecting additional Home proof without a migration uses this slug
 * allowlist against already published project rows. Do not invent copy,
 * tags, or detail routes here.
 */
export const HOME_SUPPORTING_PROJECT_SPECS = [
  {
    slug: "milanesram-portfolio",
    ctaLabel: "View the production CMS on Projects",
    preferredTags: [
      "Supabase Auth",
      "Row-Level Security",
      "Supabase/PostgreSQL",
      "Vercel",
    ],
  },
  {
    slug: "dbnms",
    ctaLabel: "View the breach-notification system on Projects",
    preferredTags: [
      "Breach notification",
      "Incident reporting",
      "Privacy operations",
      "Regulatory implementation",
    ],
  },
] as const;

export const HOME_ALL_PROJECTS_CTA = {
  label: "View all projects",
  href: "/projects",
} as const;

export const HOME_SUPPORTING_SECTION_KICKER = "Supporting evidence";

export type HomeSupportingProjectSpec =
  (typeof HOME_SUPPORTING_PROJECT_SPECS)[number];

export type HomeSupportingProject = {
  slug: string;
  name: string;
  tagline: string;
  contribution: string | null;
  tags: string[];
  href: string;
  ctaLabel: string;
};

function specForSlug(slug: string): HomeSupportingProjectSpec | null {
  return (
    HOME_SUPPORTING_PROJECT_SPECS.find((spec) => spec.slug === slug) ?? null
  );
}

export function selectPreferredTags(
  stack: string[],
  preferredTags: readonly string[],
): string[] {
  const present = new Set(
    stack.map((item) => item.trim()).filter((item) => item.length > 0),
  );

  return preferredTags.filter((tag) => present.has(tag));
}

export function mapHomeSupportingProject(
  project: Pick<PublishedProject, "slug" | "name" | "tagline" | "role" | "stack">,
): HomeSupportingProject | null {
  const spec = specForSlug(project.slug);

  if (!spec) {
    return null;
  }

  const evidence = projectCardEvidence({
    slug: project.slug,
    role: project.role,
    stack: project.stack,
  });

  if (evidence.caseStudyCta || evidence.href.startsWith("/projects/")) {
    return null;
  }

  return {
    slug: project.slug,
    name: project.name.trim(),
    tagline: project.tagline.trim(),
    contribution: evidence.contribution,
    tags: selectPreferredTags(project.stack, spec.preferredTags),
    href: evidence.href,
    ctaLabel: spec.ctaLabel,
  };
}

export function mapHomeSupportingProjects(
  projects: Array<
    Pick<PublishedProject, "slug" | "name" | "tagline" | "role" | "stack">
  >,
): HomeSupportingProject[] {
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  const selected: HomeSupportingProject[] = [];

  for (const spec of HOME_SUPPORTING_PROJECT_SPECS) {
    const project = bySlug.get(spec.slug);

    if (!project) {
      continue;
    }

    const mapped = mapHomeSupportingProject(project);

    if (mapped) {
      selected.push(mapped);
    }
  }

  return selected;
}

export async function getPublishedHomeSupportingProjects(): Promise<
  HomeSupportingProject[]
> {
  const result = await getPublishedProjects();

  if (!result.ok) {
    return [];
  }

  return mapHomeSupportingProjects(result.projects);
}
