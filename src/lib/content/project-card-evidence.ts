const PRIVAI_GUARD_SLUG = "privai-guard";

/**
 * Allowlisted public links. The `projects` table has no external URL column;
 * do not read an address from summary, tagline, or stack.
 */
export const PUBLIC_PROJECT_LINKS = {
  "milanesram-portfolio": [
    {
      href: "https://github.com/milanesram/milanesram-portfolio",
      label: "View public source on GitHub",
    },
  ],
  tuloy: [
    {
      href: "https://tuloy-career.creamykite256.chatgpt.site/about/",
      label: "About Tuloy",
    },
    {
      href: "https://github.com/milanesram/tuloy",
      label: "View on GitHub",
    },
  ],
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
  sources: readonly ProjectCardSourceLink[];
};

type ProjectCardEvidenceInput = {
  slug: string;
  role: string;
  stack: string[];
};

function linksForSlug(slug: string): readonly ProjectCardSourceLink[] {
  if (slug === "milanesram-portfolio") {
    return PUBLIC_PROJECT_LINKS["milanesram-portfolio"];
  }

  if (slug === "tuloy") {
    return PUBLIC_PROJECT_LINKS.tuloy;
  }

  return [];
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
    sources: linksForSlug(project.slug),
  };
}
