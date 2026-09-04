const PRIVAI_GUARD_SLUG = "privai-guard";

/**
 * Allowlisted public source links. The `projects` table has no external URL
 * column; do not read a GitHub address from summary, tagline, or stack.
 */
export const PUBLIC_PROJECT_SOURCE_LINKS = {
  "milanesram-portfolio": {
    href: "https://github.com/milanesram/milanesram-portfolio",
    label: "View public source on GitHub",
  },
} as const;

export type ProjectCardSourceLink = {
  href: string;
  label: string;
};

export type ProjectCardEvidence = {
  contribution: string | null;
  stack: string[];
  href: string;
  caseStudyCta: boolean;
  source: ProjectCardSourceLink | null;
};

type ProjectCardEvidenceInput = {
  slug: string;
  role: string;
  stack: string[];
};

function sourceLinkForSlug(slug: string): ProjectCardSourceLink | null {
  if (slug === "milanesram-portfolio") {
    return PUBLIC_PROJECT_SOURCE_LINKS["milanesram-portfolio"];
  }

  return null;
}

export function projectCardEvidence(
  project: ProjectCardEvidenceInput,
): ProjectCardEvidence {
  const contribution = project.role.trim();
  const stack = project.stack
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return {
    contribution: contribution.length > 0 ? contribution : null,
    stack,
    href:
      project.slug === PRIVAI_GUARD_SLUG
        ? "/projects/privai-guard"
        : `/projects#${project.slug}`,
    caseStudyCta: project.slug === PRIVAI_GUARD_SLUG,
    source: sourceLinkForSlug(project.slug),
  };
}
