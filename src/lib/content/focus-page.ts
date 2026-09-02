import type { Credential, Experience, Project } from "@/content/types";
import {
  isPublicCredential,
  isPublishedStatus,
  mapHomeCredentials,
  mapHomeExperiences,
  type HomeCredentialRecord,
  type HomeExperienceItemRecord,
  type HomeExperienceParentRecord,
  type HomeProjectRecord,
} from "@/lib/content/home-page";
import type { ContentStatus, DocumentKind } from "@/lib/supabase/database.types";

export type FocusSelectedWriting = {
  slug: string;
  title: string;
  documentKindLabel: string;
  yearLabel: string;
  abstract: string;
};

export type PublicFocusPage = {
  id: string;
  slug: string;
  title: string;
  headline: string;
  summary: string;
  competencies: string[];
  cardSummary: string;
  cardChips: string[];
  featuredProjectLede: string;
  experience: Experience[];
  credentials: Credential[];
  featuredProject: Project | null;
  featuredPublication: FocusSelectedWriting | null;
};

export type PublicFocusCard = {
  id: string;
  slug: string;
  title: string;
  headline: string;
  summary: string;
  competencies: string[];
  cardSummary: string;
  cardChips: string[];
};

export type PublishedFocusPageResult =
  | { ok: true; page: PublicFocusPage }
  | { ok: true; page: null }
  | { ok: false };

export type PublishedFocusPagesResult =
  | { ok: true; pages: PublicFocusCard[] }
  | { ok: false };

export type FocusPageRow = {
  id: string;
  slug: string;
  nav_label: string;
  headline: string;
  summary: string;
  competencies: string[];
  featured_project_id: string | null;
  featured_publication_id: string | null;
  featured_project_lede: string | null;
  card_summary: string | null;
  card_chips: string[];
  status: ContentStatus;
  sort_order: number;
};

export type FocusExperienceLinkRow = {
  experience_item_id: string;
  sort_order: number;
};

export type FocusCredentialLinkRow = {
  credential_id: string;
  sort_order: number;
};

export type FocusPublicationRecord = {
  id: string;
  slug: string;
  title: string;
  document_kind: DocumentKind;
  year_label: string;
  abstract: string;
  status: ContentStatus;
};

const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  publication: "Publication",
  white_paper: "White paper",
  editorial: "Editorial",
  feature: "Feature",
  four_minute_read: "4 Minute Read",
  other: "Other",
};

export function interpretPublishedFocusPageResponse(args: {
  error: { message: string } | null;
  data: FocusPageRow | null;
}): { ok: true; row: FocusPageRow } | { ok: true; row: null } | { ok: false } {
  if (args.error) {
    return { ok: false };
  }

  if (!args.data || !isPublishedStatus(args.data.status)) {
    return { ok: true, row: null };
  }

  return { ok: true, row: args.data };
}

export function interpretPublishedFocusPagesResponse(args: {
  error: { message: string } | null;
  data: FocusPageRow[] | null;
}): { ok: true; rows: FocusPageRow[] } | { ok: false } {
  if (args.error || !args.data) {
    return { ok: false };
  }

  return {
    ok: true,
    rows: args.data.filter((row) => isPublishedStatus(row.status)),
  };
}

export function mapFocusFeaturedProject(
  row: FocusPageRow,
  project: HomeProjectRecord | null,
): Project | null {
  if (
    !project ||
    !isPublishedStatus(project.status) ||
    row.featured_project_id !== project.id
  ) {
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
    tracks: ["all"],
  };
}

export function mapFocusFeaturedPublication(
  row: FocusPageRow,
  publication: FocusPublicationRecord | null,
): FocusSelectedWriting | null {
  if (
    !publication ||
    !isPublishedStatus(publication.status) ||
    row.featured_publication_id !== publication.id
  ) {
    return null;
  }

  return {
    slug: publication.slug,
    title: publication.title,
    documentKindLabel: DOCUMENT_KIND_LABELS[publication.document_kind],
    yearLabel: publication.year_label,
    abstract: publication.abstract,
  };
}

export function mapFocusCard(row: FocusPageRow): PublicFocusCard {
  return {
    id: row.id,
    slug: row.slug,
    title: row.nav_label,
    headline: row.headline,
    summary: row.summary,
    competencies: row.competencies,
    cardSummary: row.card_summary ?? row.summary,
    cardChips: row.card_chips,
  };
}

export function toPublicFocusPage(args: {
  row: FocusPageRow;
  experienceLinks: FocusExperienceLinkRow[];
  experienceItems: HomeExperienceItemRecord[];
  experienceParents: HomeExperienceParentRecord[];
  credentialLinks: FocusCredentialLinkRow[];
  credentials: HomeCredentialRecord[];
  featuredProject: HomeProjectRecord | null;
  featuredPublication: FocusPublicationRecord | null;
}): PublicFocusPage {
  return {
    ...mapFocusCard(args.row),
    featuredProjectLede: args.row.featured_project_lede ?? "",
    experience: mapHomeExperiences({
      links: args.experienceLinks,
      items: args.experienceItems,
      parents: args.experienceParents,
    }),
    credentials: mapHomeCredentials({
      links: args.credentialLinks,
      credentials: args.credentials,
    }),
    featuredProject: mapFocusFeaturedProject(args.row, args.featuredProject),
    featuredPublication: mapFocusFeaturedPublication(
      args.row,
      args.featuredPublication,
    ),
  };
}

export { isPublicCredential, isPublishedStatus };
