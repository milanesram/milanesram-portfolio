import { createPublicSupabaseClient } from "@/lib/supabase/public";
import {
  isPublishedStatus,
  mapProject,
  mapPublishedProjectMedia,
  type ProjectMediaRow,
  type PublishedProject,
  type PublishedProjectDetail,
} from "@/lib/content/project-map";

export type {
  PublishedProject,
  PublishedProjectDetail,
  PublishedProjectMedia,
  PublishedProjectSection,
} from "@/lib/content/project-map";
export {
  mapPublishedProjectMedia,
  toPresentationProject,
  toPresentationSection,
} from "@/lib/content/project-map";

/**
 * Public project reads from Supabase.
 *
 * `/projects` and `/projects/privai-guard` read published rows through the
 * anonymous publishable client. RLS remains the publication boundary.
 * Project screenshots come from `project_media` + `media_assets`, never
 * from hard-coded image imports.
 *
 * Query count for project detail: two parallel reads (project core +
 * nested sections, and project-media + media_assets). Media failure
 * omits screenshots and keeps the text case study.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type PublishedProjectsResult =
  | { ok: true; projects: PublishedProject[] }
  | { ok: false };

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
  const [projectResult, mediaResult] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, slug, name, tagline, year_label, role, summary, limits, stack, is_featured, status, sort_order, sections:project_sections(id, heading, body, track, status, sort_order)",
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle(),
    supabase
      .from("project_media")
      .select(
        "id, project_id, display_role, caption, sort_order, status, media_assets(id, bucket_path, kind, purpose, title, alt_text, mime_type, byte_size, status, is_public)",
      )
      .eq("status", "published")
      .order("sort_order", { ascending: true }),
  ]);

  const project = projectResult.data;

  if (projectResult.error || !project || !isPublishedStatus(project.status)) {
    return null;
  }

  const sectionRows = Array.isArray(project.sections) ? project.sections : [];

  return {
    ...mapProject(project),
    sections: sectionRows
      .filter((section) => isPublishedStatus(section.status))
      .sort((left, right) => left.sort_order - right.sort_order)
      .map((section) => ({
        id: section.id,
        heading: section.heading,
        body: section.body,
        track: section.track,
        sortOrder: section.sort_order,
      })),
    media: mediaResult.error
      ? []
      : mapPublishedProjectMedia(
          (mediaResult.data ?? []) as ProjectMediaRow[],
          project.id,
        ),
  };
}
