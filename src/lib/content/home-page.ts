import type { Credential, Experience, ExperienceBullet, Project } from "@/content/types";
import type {
  ContentStatus,
  CredentialKind,
  ExperienceDatePrecision,
  ExperienceKind,
  TrackTag,
} from "@/lib/supabase/database.types";
import { isPubliclyEligibleCredential } from "@/lib/content/credential-map";
import { formatExperienceDateRange } from "@/lib/content/experience-page";

export type HomeCta = {
  label: string;
  href: string;
};

export type HomeChip = {
  id: string;
  label: string;
};

export type HomeProofItem = {
  id: string;
  label: string;
  supporting: string;
  href?: string;
};

export type HomeFlagship = {
  kicker: string;
  heading: string;
  problem: string;
  whatIBuilt: string;
  proofPoints: string[];
  cta: HomeCta;
  project: Project;
};

export type HomeSectionCopy = {
  kicker: string;
  title: string;
  lede: string;
  cta: HomeCta;
};

export type HomeFocusSection = {
  kicker: string;
  title: string;
  lede: string;
};

export type HomeClosing = {
  heading: string;
  body: string;
  primaryCta: HomeCta;
  secondaryCta: HomeCta;
};

export type PublicHomePage = {
  headline: string;
  lede: string;
  chips: HomeChip[];
  primaryCta: HomeCta;
  secondaryCta: HomeCta;
  proofItems: HomeProofItem[];
  featuredProject: HomeFlagship | null;
  experiences: Experience[];
  credentials: Credential[];
  experienceSection: HomeSectionCopy;
  credentialsSection: HomeSectionCopy;
  focusSection: HomeFocusSection;
  closing: HomeClosing;
};

export type PublishedHomePageResult =
  | { ok: true; page: PublicHomePage }
  | { ok: true; page: null }
  | { ok: false };

export type HomePageRow = {
  id: string;
  status: ContentStatus;
  featured_project_id: string | null;
  headline: string;
  lede: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string;
  secondary_cta_href: string;
  project_kicker: string;
  project_heading: string;
  project_problem: string;
  project_body: string;
  project_cta_label: string;
  project_cta_href: string;
  project_proof_points: string[];
  experience_kicker: string;
  experience_heading: string;
  experience_lede: string;
  experience_cta_label: string;
  experience_cta_href: string;
  credentials_kicker: string;
  credentials_heading: string;
  credentials_lede: string;
  credentials_cta_label: string;
  credentials_cta_href: string;
  focus_kicker: string;
  focus_heading: string;
  focus_lede: string;
  closing_heading: string;
  closing_body: string;
  closing_primary_cta_label: string;
  closing_primary_cta_href: string;
  closing_secondary_cta_label: string;
  closing_secondary_cta_href: string;
};

export type HomeChipRow = {
  id: string;
  label: string;
  sort_order: number;
};

export type HomeProofRow = {
  id: string;
  label: string;
  supporting: string;
  href: string | null;
  credential_id: string | null;
  project_id: string | null;
  sort_order: number;
};

export type HomeExperienceLinkRow = {
  experience_item_id: string;
  sort_order: number;
};

export type HomeExperienceItemRecord = {
  id: string;
  experience_id: string;
  body: string;
  status: ContentStatus;
  track: TrackTag;
};

export type HomeExperienceParentRecord = {
  id: string;
  organization: string;
  title: string;
  title_secondary: string | null;
  location_display: string;
  kind: ExperienceKind;
  start_date: string | null;
  end_date: string | null;
  date_precision?: ExperienceDatePrecision | null;
  start_year?: number | null;
  end_year?: number | null;
  is_current: boolean;
  status: ContentStatus;
};

export type HomeCredentialLinkRow = {
  credential_id: string;
  sort_order: number;
};

export type HomeCredentialRecord = {
  id: string;
  kind: CredentialKind;
  name: string;
  issuer: string;
  year_label: string | null;
  details: string | null;
  track: TrackTag;
  highlight: boolean;
  status: ContentStatus;
  needs_verification: boolean;
};

export type HomeProjectRecord = {
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
  status: ContentStatus;
};

export function isPublishedStatus(status: ContentStatus): boolean {
  return status === "published";
}

export function isPublicCredential(row: HomeCredentialRecord): boolean {
  return isPubliclyEligibleCredential(row);
}

export function interpretPublishedHomePageResponse(args: {
  error: { message: string } | null;
  data: HomePageRow | null;
}): { ok: true; row: HomePageRow } | { ok: true; row: null } | { ok: false } {
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

export function mapHomeChips(rows: HomeChipRow[]): HomeChip[] {
  return sortByOrder(rows).map((row) => ({
    id: row.id,
    label: row.label,
  }));
}

export function mapHomeProofItems(rows: HomeProofRow[]): HomeProofItem[] {
  return sortByOrder(rows).map((row) => ({
    id: row.id,
    label: row.label,
    supporting: row.supporting,
    ...(row.href ? { href: row.href } : {}),
  }));
}

function mapTrack(track: TrackTag): Array<"cyber" | "privacy" | "all"> {
  if (track === "cybersecurity_grc") {
    return ["cyber"];
  }

  if (track === "privacy_ai") {
    return ["privacy"];
  }

  return ["all"];
}

export function mapHomeExperiences(args: {
  links: HomeExperienceLinkRow[];
  items: HomeExperienceItemRecord[];
  parents: HomeExperienceParentRecord[];
}): Experience[] {
  const itemsById = new Map(args.items.map((item) => [item.id, item]));
  const parentsById = new Map(args.parents.map((parent) => [parent.id, parent]));
  const groups = new Map<string, Experience>();
  const order: string[] = [];

  for (const link of sortByOrder(args.links)) {
    const item = itemsById.get(link.experience_item_id);

    if (!item || !isPublishedStatus(item.status)) {
      continue;
    }

    const parent = parentsById.get(item.experience_id);

    if (!parent || !isPublishedStatus(parent.status)) {
      continue;
    }

    const bullet: ExperienceBullet = {
      body: item.body,
      tracks: mapTrack(item.track),
    };

    const existing = groups.get(parent.id);

    if (existing) {
      existing.bullets.push(bullet);
      continue;
    }

    const dates = formatExperienceDateRange(parent);

    groups.set(parent.id, {
      id: parent.id,
      organization: parent.organization,
      title: parent.title,
      ...(parent.title_secondary ? { titleSecondary: parent.title_secondary } : {}),
      location: parent.location_display,
      kind: parent.kind,
      startLabel: dates.startLabel,
      endLabel: dates.endLabel,
      ...(parent.is_current ? { isCurrent: true } : {}),
      bullets: [bullet],
      tracks: ["all"],
    });
    order.push(parent.id);
  }

  return order.map((id) => groups.get(id)!);
}

export function mapHomeCredentials(args: {
  links: HomeCredentialLinkRow[];
  credentials: HomeCredentialRecord[];
}): Credential[] {
  const byId = new Map(args.credentials.map((row) => [row.id, row]));
  const selected: Credential[] = [];

  for (const link of sortByOrder(args.links)) {
    const row = byId.get(link.credential_id);

    if (!row || !isPublicCredential(row)) {
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

export function mapFeaturedProject(
  row: HomePageRow,
  project: HomeProjectRecord | null,
): HomeFlagship | null {
  if (
    !project ||
    !isPublishedStatus(project.status) ||
    row.featured_project_id !== project.id
  ) {
    return null;
  }

  return {
    kicker: row.project_kicker,
    heading: row.project_heading,
    problem: row.project_problem,
    whatIBuilt: row.project_body,
    proofPoints: row.project_proof_points,
    cta: {
      label: row.project_cta_label,
      href: row.project_cta_href,
    },
    project: {
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
    },
  };
}

export function toPublicHomePage(args: {
  row: HomePageRow;
  chips: HomeChipRow[];
  proofItems: HomeProofRow[];
  experienceLinks: HomeExperienceLinkRow[];
  experienceItems: HomeExperienceItemRecord[];
  experienceParents: HomeExperienceParentRecord[];
  credentialLinks: HomeCredentialLinkRow[];
  credentials: HomeCredentialRecord[];
  featuredProject: HomeProjectRecord | null;
}): PublicHomePage {
  return {
    headline: args.row.headline,
    lede: args.row.lede,
    chips: mapHomeChips(args.chips),
    primaryCta: {
      label: args.row.primary_cta_label,
      href: args.row.primary_cta_href,
    },
    secondaryCta: {
      label: args.row.secondary_cta_label,
      href: args.row.secondary_cta_href,
    },
    proofItems: mapHomeProofItems(args.proofItems),
    featuredProject: mapFeaturedProject(args.row, args.featuredProject),
    experiences: mapHomeExperiences({
      links: args.experienceLinks,
      items: args.experienceItems,
      parents: args.experienceParents,
    }),
    credentials: mapHomeCredentials({
      links: args.credentialLinks,
      credentials: args.credentials,
    }),
    experienceSection: {
      kicker: args.row.experience_kicker,
      title: args.row.experience_heading,
      lede: args.row.experience_lede,
      cta: {
        label: args.row.experience_cta_label,
        href: args.row.experience_cta_href,
      },
    },
    credentialsSection: {
      kicker: args.row.credentials_kicker,
      title: args.row.credentials_heading,
      lede: args.row.credentials_lede,
      cta: {
        label: args.row.credentials_cta_label,
        href: args.row.credentials_cta_href,
      },
    },
    focusSection: {
      kicker: args.row.focus_kicker,
      title: args.row.focus_heading,
      lede: args.row.focus_lede,
    },
    closing: {
      heading: args.row.closing_heading,
      body: args.row.closing_body,
      primaryCta: {
        label: args.row.closing_primary_cta_label,
        href: args.row.closing_primary_cta_href,
      },
      secondaryCta: {
        label: args.row.closing_secondary_cta_label,
        href: args.row.closing_secondary_cta_href,
      },
    },
  };
}
