import type { CaseStudySection, Project } from "@/content/types";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { ContentStatus, TrackTag } from "@/lib/supabase/database.types";

/**
 * Public project reads from Supabase.
 *
 * `/projects` and `/projects/privai-guard` read published rows through the
 * anonymous publishable client. RLS remains the publication boundary.
 * `src/content/projects.ts` is retained as rollback/reference and as the
 * static source for routes that are not yet cut over.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const SECTION_PRESENTATION_IDS: Record<string, string> = {
  Problem: "problem",
  Risk: "risk",
  Guardrail: "guardrail",
  Implementation: "implementation",
  "Governance workflow": "workflow",
  "Business value": "value",
  "MVP boundary": "boundary",
};

export type PublishedProject = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  yearLabel: string;
  role: string;
  summary: string;
  limits: string;
  stack: string[];
  featured: boolean;
  sortOrder: number;
};

export type PublishedProjectSection = {
  id: string;
  heading: string;
  body: string;
  track: TrackTag;
  sortOrder: number;
};

export type PublishedProjectDetail = PublishedProject & {
  sections: PublishedProjectSection[];
};

export type PublishedProjectsResult =
  | { ok: true; projects: PublishedProject[] }
  | { ok: false };

function isPublishedStatus(status: ContentStatus): boolean {
  return status === "published";
}

function mapProject(row: {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  year_label: string;
  role: string;
  summary: string;
  limits: string;
  stack: string[];
  is_featured: boolean;
  sort_order: number;
}): PublishedProject {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    yearLabel: row.year_label,
    role: row.role,
    summary: row.summary,
    limits: row.limits,
    stack: row.stack,
    featured: row.is_featured,
    sortOrder: row.sort_order,
  };
}

export function toPresentationProject(project: PublishedProject): Project {
  return {
    id: project.slug,
    slug: project.slug,
    name: project.name,
    tagline: project.tagline,
    yearLabel: project.yearLabel,
    role: project.role,
    summary: project.summary,
    limits: project.limits,
    stack: project.stack,
    featured: project.featured,
    tracks: ["all"],
  };
}

export function toPresentationSection(
  section: PublishedProjectSection,
): CaseStudySection {
  return {
    id: SECTION_PRESENTATION_IDS[section.heading] ?? section.heading,
    heading: section.heading,
    body: section.body,
  };
}

export async function getPublishedProjects(): Promise<PublishedProjectsResult> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, slug, name, tagline, year_label, role, summary, limits, stack, is_featured, status, sort_order",
    )
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) {
    return { ok: false };
  }

  return {
    ok: true,
    projects: data
      .filter((row) => isPublishedStatus(row.status))
      .map(mapProject),
  };
}

export async function getPublishedProjectBySlug(
  slug: string,
): Promise<PublishedProjectDetail | null> {
  if (!SLUG_PATTERN.test(slug) || slug.length > 80) {
    return null;
  }

  const supabase = createPublicSupabaseClient();
  const { data: project, error } = await supabase
    .from("projects")
    .select(
      "id, slug, name, tagline, year_label, role, summary, limits, stack, is_featured, status, sort_order",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !project || !isPublishedStatus(project.status)) {
    return null;
  }

  const { data: sections, error: sectionError } = await supabase
    .from("project_sections")
    .select("id, heading, body, track, status, sort_order")
    .eq("project_id", project.id)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (sectionError) {
    return null;
  }

  return {
    ...mapProject(project),
    sections: (sections ?? [])
      .filter((section) => isPublishedStatus(section.status))
      .map((section) => ({
        id: section.id,
        heading: section.heading,
        body: section.body,
        track: section.track,
        sortOrder: section.sort_order,
      })),
  };
}
