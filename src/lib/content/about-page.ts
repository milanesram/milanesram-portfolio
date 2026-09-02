import type { Credential } from "@/content/types";
import {
  isPubliclyEligibleCredential,
  mapTrack,
  type CredentialRow,
} from "@/lib/content/credential-map";
import type { PublicJourneyMedia } from "@/lib/content/media-types";
import type { ContentStatus, MediaKind } from "@/lib/supabase/database.types";

export type AboutListKind = "speaking" | "boundary";

export type AboutParagraph = {
  id: string;
  body: string;
};

export type AboutListItem = {
  id: string;
  body: string;
};

export type PublicJourneyMilestone = {
  id: string;
  title: string;
  year: number | null;
  caption: string;
  media: PublicJourneyMedia;
  sortOrder: number;
};

export type PublicAboutPage = {
  kicker: string;
  headline: string;
  lede: string;
  paragraphs: AboutParagraph[];
  journeyHeading: string;
  journeyItems: PublicJourneyMilestone[];
  educationHeading: string;
  educationCredentials: Credential[];
  speakingHeading: string;
  speakingBody: string;
  speakingItems: AboutListItem[];
  boundariesHeading: string;
  boundaryItems: AboutListItem[];
  seoTitle: string;
  seoDescription: string;
};

export type PublishedAboutPageResult =
  | { ok: true; page: PublicAboutPage }
  | { ok: true; page: null }
  | { ok: false };

export type AboutPageRow = {
  id: string;
  status: ContentStatus;
  kicker: string;
  headline: string;
  lede: string;
  journey_heading: string;
  education_heading: string;
  speaking_heading: string;
  speaking_body: string;
  boundaries_heading: string;
  seo_title: string;
  seo_description: string;
};

export type AboutParagraphRow = {
  id: string;
  body: string;
  sort_order: number;
};

export type AboutListItemRow = {
  id: string;
  kind: AboutListKind;
  body: string;
  sort_order: number;
};

export type AboutEducationLinkRow = {
  credential_id: string;
  sort_order: number;
};

export type JourneyMilestoneRow = {
  id: string;
  title: string;
  year: number | null;
  caption: string;
  media_asset_id: string | null;
  sort_order: number;
  status: ContentStatus;
};

export type EligiblePublicImageRow = {
  id: string;
  kind: MediaKind;
  alt_text: string | null;
  mime_type: string | null;
  status: ContentStatus;
  is_public: boolean;
};

const PUBLIC_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export function isPublishedStatus(status: ContentStatus): boolean {
  return status === "published";
}

export function interpretPublishedAboutPageResponse(args: {
  error: { message: string } | null;
  data: AboutPageRow | null;
}): { ok: true; row: AboutPageRow } | { ok: true; row: null } | { ok: false } {
  if (args.error) {
    return { ok: false };
  }

  if (!args.data || !isPublishedStatus(args.data.status)) {
    return { ok: true, row: null };
  }

  return { ok: true, row: args.data };
}

export function sortByOrder<T extends { sort_order: number }>(rows: T[]): T[] {
  return [...rows].sort((left, right) => left.sort_order - right.sort_order);
}

export function mapAboutParagraphs(rows: AboutParagraphRow[]): AboutParagraph[] {
  return sortByOrder(rows).map((row) => ({
    id: row.id,
    body: row.body,
  }));
}

export function mapAboutListItems(
  rows: AboutListItemRow[],
  kind: AboutListKind,
): AboutListItem[] {
  return sortByOrder(rows)
    .filter((row) => row.kind === kind)
    .map((row) => ({
      id: row.id,
      body: row.body,
    }));
}

export function isEligibleJourneyMedia(row: EligiblePublicImageRow | null): boolean {
  if (!row) {
    return false;
  }

  return (
    row.kind === "image" &&
    isPublishedStatus(row.status) &&
    row.is_public &&
    Boolean(row.alt_text?.trim()) &&
    PUBLIC_IMAGE_MIMES.has(row.mime_type ?? "")
  );
}

export function canPublishJourneyMilestone(args: {
  intentStatus: ContentStatus;
  media: EligiblePublicImageRow | null;
}): boolean {
  if (args.intentStatus !== "published") {
    return true;
  }

  return isEligibleJourneyMedia(args.media);
}

export function mapPublicJourneyMilestones(args: {
  milestones: JourneyMilestoneRow[];
  mediaById: Map<string, PublicJourneyMedia>;
}): PublicJourneyMilestone[] {
  const items: PublicJourneyMilestone[] = [];

  for (const row of sortByOrder(args.milestones)) {
    if (!isPublishedStatus(row.status) || !row.media_asset_id) {
      continue;
    }

    const media = args.mediaById.get(row.media_asset_id);

    if (!media) {
      continue;
    }

    items.push({
      id: row.id,
      title: row.title,
      year: row.year,
      caption: row.caption,
      media,
      sortOrder: row.sort_order,
    });
  }

  return items;
}

export function mapAboutEducationCredentials(args: {
  links: AboutEducationLinkRow[];
  credentials: CredentialRow[];
}): Credential[] {
  const byId = new Map(args.credentials.map((row) => [row.id, row]));
  const selected: Credential[] = [];

  for (const link of sortByOrder(args.links)) {
    const row = byId.get(link.credential_id);

    if (!row || !isPubliclyEligibleCredential(row)) {
      continue;
    }

    selected.push({
      id: row.id,
      kind: row.kind,
      name: row.name,
      issuer: row.issuer,
      ...(row.year_label ? { yearLabel: row.year_label } : {}),
      ...(row.details ? { details: row.details } : {}),
      ...(row.highlight ? { highlight: true } : {}),
      tracks: mapTrack(row.track),
    });
  }

  return selected;
}

export function toPublicAboutPage(args: {
  row: AboutPageRow;
  paragraphs: AboutParagraphRow[];
  listItems: AboutListItemRow[];
  milestones: JourneyMilestoneRow[];
  mediaById: Map<string, PublicJourneyMedia>;
  educationLinks?: AboutEducationLinkRow[];
  educationCredentials?: CredentialRow[];
}): PublicAboutPage {
  return {
    kicker: args.row.kicker,
    headline: args.row.headline,
    lede: args.row.lede,
    paragraphs: mapAboutParagraphs(args.paragraphs),
    journeyHeading: args.row.journey_heading,
    journeyItems: mapPublicJourneyMilestones({
      milestones: args.milestones,
      mediaById: args.mediaById,
    }),
    educationHeading: args.row.education_heading,
    educationCredentials: mapAboutEducationCredentials({
      links: args.educationLinks ?? [],
      credentials: args.educationCredentials ?? [],
    }),
    speakingHeading: args.row.speaking_heading,
    speakingBody: args.row.speaking_body,
    speakingItems: mapAboutListItems(args.listItems, "speaking"),
    boundariesHeading: args.row.boundaries_heading,
    boundaryItems: mapAboutListItems(args.listItems, "boundary"),
    seoTitle: args.row.seo_title,
    seoDescription: args.row.seo_description,
  };
}
