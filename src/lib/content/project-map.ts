import type { CaseStudySection, Project } from "@/content/types";
import { publicMediaObjectUrl } from "@/lib/content/media-bucket";
import type {
  ContentStatus,
  ProjectMediaDisplayRole,
  TrackTag,
} from "@/lib/supabase/database.types";

const SECTION_PRESENTATION_IDS: Record<string, string> = {
  Problem: "problem",
  Solution: "solution",
  Workflow: "workflow",
  "Implemented capabilities": "capabilities",
  "Technical foundation": "architecture",
  "What this project demonstrates": "professional-evidence",
  "MVP boundary": "boundary",
  "Current Development — Production-Oriented Re-engineering":
    "current-development",
  "Planned / developing capabilities — not yet released": "planned-capabilities",
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

export type PublishedProjectMediaAsset = {
  id: string;
  title: string;
  altText: string;
  publicUrl: string;
  mimeType: string;
  byteSize: number | null;
};

export type PublishedProjectMedia = {
  id: string;
  role: ProjectMediaDisplayRole;
  caption: string;
  sortOrder: number;
  media: PublishedProjectMediaAsset;
};

export type PublishedProjectDetail = PublishedProject & {
  sections: PublishedProjectSection[];
  media: PublishedProjectMedia[];
};

export type ProjectMediaAssetRow = {
  id: string;
  bucket_path: string;
  kind: string;
  purpose: string | null;
  title: string;
  alt_text: string | null;
  mime_type: string | null;
  byte_size: number | null;
  status: ContentStatus;
  is_public: boolean;
};

export type ProjectMediaRow = {
  id: string;
  project_id: string;
  display_role: ProjectMediaDisplayRole;
  caption: string;
  sort_order: number;
  status: ContentStatus;
  media_assets: ProjectMediaAssetRow | ProjectMediaAssetRow[] | null;
};

function isPublishedStatus(status: ContentStatus): boolean {
  return status === "published";
}

function isSupportedProjectImageMime(mimeType: string | null): boolean {
  return (
    mimeType === "image/jpeg" ||
    mimeType === "image/png" ||
    mimeType === "image/webp" ||
    mimeType === "image/avif"
  );
}

function unwrapAsset(
  value: ProjectMediaAssetRow | ProjectMediaAssetRow[] | null,
): ProjectMediaAssetRow | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function mapProject(row: {
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

export function mapPublishedProjectMedia(
  rows: ProjectMediaRow[],
  projectId: string,
): PublishedProjectMedia[] {
  return [...rows]
    .filter((row) => row.project_id === projectId && isPublishedStatus(row.status))
    .sort((left, right) => {
      if (left.sort_order !== right.sort_order) {
        return left.sort_order - right.sort_order;
      }

      return left.id.localeCompare(right.id);
    })
    .flatMap((row) => {
      const asset = unwrapAsset(row.media_assets);
      const caption = row.caption.trim();
      const altText = asset?.alt_text?.trim() ?? "";

      if (!asset || !caption || !altText) {
        return [];
      }

      if (
        asset.kind !== "image" ||
        asset.purpose !== "project" ||
        !isPublishedStatus(asset.status) ||
        !asset.is_public ||
        !isSupportedProjectImageMime(asset.mime_type)
      ) {
        return [];
      }

      const publicUrl = publicMediaObjectUrl(asset.bucket_path);

      if (!publicUrl) {
        return [];
      }

      return [
        {
          id: row.id,
          role: row.display_role,
          caption,
          sortOrder: row.sort_order,
          media: {
            id: asset.id,
            title: asset.title,
            altText,
            publicUrl,
            mimeType: asset.mime_type ?? "image/webp",
            byteSize: asset.byte_size,
          },
        },
      ];
    });
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

export { isPublishedStatus };
