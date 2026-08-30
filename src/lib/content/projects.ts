import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentStatus, TrackTag } from "@/lib/supabase/database.types";

/**
 * Public project reads from Supabase.
 *
 * Cutover: do not use these from `src/app/projects/**` until the reviewed
 * PrivAI Guard content script has been applied in an explicit later step.
 * Public pages still render from `src/content/projects.ts` so the site stays
 * populated.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

function isPublishedStatus(status: ContentStatus): boolean {
  return status === "published";
}

export async function getPublishedProjects(): Promise<PublishedProject[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, slug, name, tagline, year_label, role, summary, limits, stack, is_featured, status, sort_order",
    )
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data
    .filter((row) => isPublishedStatus(row.status))
    .map((row) => ({
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
    }));
}

export async function getPublishedProjectBySlug(
  slug: string,
): Promise<PublishedProjectDetail | null> {
  if (!SLUG_PATTERN.test(slug) || slug.length > 80) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
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
    id: project.id,
    slug: project.slug,
    name: project.name,
    tagline: project.tagline,
    yearLabel: project.year_label,
    role: project.role,
    summary: project.summary,
    limits: project.limits,
    stack: project.stack,
    featured: project.is_featured,
    sortOrder: project.sort_order,
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
