/**
 * Projects index arrangement.
 *
 * PrivAI Guard is the published project lifted into the featured slot.
 * The remaining published projects use `year_label` when it is exactly
 * a four-digit year, the field the CMS stores as the project year.
 * Labels that are not a single year stay undated. Equal years, and
 * undated projects among themselves, keep `sort_order` and then the
 * incoming editorial order.
 */

const FEATURED_PROJECT_SLUG = "privai-guard";
const PROJECT_YEAR = /^\d{4}$/;

type ProjectsIndexRecord = {
  slug: string;
  yearLabel: string;
  sortOrder: number;
};

export type ProjectsIndexArrangement<T> = {
  featured: T | null;
  rest: T[];
};

export function projectIndexYear(yearLabel: string): number | null {
  const label = yearLabel.trim();

  if (!PROJECT_YEAR.test(label)) {
    return null;
  }

  return Number(label);
}

export function arrangeProjectsIndex<T extends ProjectsIndexRecord>(
  projects: readonly T[],
): ProjectsIndexArrangement<T> {
  const ordered = projects.map((project, index) => ({ project, index }));
  const featuredIndex = ordered.findIndex(
    (entry) => entry.project.slug === FEATURED_PROJECT_SLUG,
  );
  const featured = featuredIndex === -1 ? null : ordered[featuredIndex].project;
  const rest = ordered
    .filter((entry) => entry.project.slug !== FEATURED_PROJECT_SLUG)
    .sort((left, right) => compareProjects(left, right))
    .map((entry) => entry.project);

  return { featured, rest };
}

function compareProjects(
  left: { project: ProjectsIndexRecord; index: number },
  right: { project: ProjectsIndexRecord; index: number },
): number {
  const leftYear = projectIndexYear(left.project.yearLabel);
  const rightYear = projectIndexYear(right.project.yearLabel);

  if (leftYear !== null && rightYear !== null && leftYear !== rightYear) {
    return rightYear - leftYear;
  }

  if (leftYear !== null && rightYear === null) {
    return -1;
  }

  if (leftYear === null && rightYear !== null) {
    return 1;
  }

  if (left.project.sortOrder !== right.project.sortOrder) {
    return left.project.sortOrder - right.project.sortOrder;
  }

  return left.index - right.index;
}
