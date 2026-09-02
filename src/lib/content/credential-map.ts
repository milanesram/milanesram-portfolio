import type { Credential, CredentialKind, TrackId } from "@/content/types";
import { formatMonthYear } from "@/lib/content/experience-page";
import type { ContentStatus, TrackTag } from "@/lib/supabase/database.types";

export type PublishedCredential = {
  id: string;
  kind: CredentialKind;
  name: string;
  issuer: string;
  yearLabel: string | null;
  details: string | null;
  track: TrackTag;
  highlight: boolean;
  sortOrder: number;
  verificationUrl: string | null;
  expiresOn: string | null;
};

export type CredentialRow = {
  id: string;
  kind: CredentialKind;
  name: string;
  issuer: string;
  year_label: string | null;
  details: string | null;
  track: TrackTag;
  highlight: boolean;
  needs_verification: boolean;
  status: ContentStatus;
  sort_order: number;
  verification_url: string | null;
  expires_on: string | null;
};

export function isPubliclyEligibleCredential(row: {
  status: ContentStatus;
  needs_verification: boolean;
}): boolean {
  return row.status === "published" && row.needs_verification === false;
}

export function mapTrack(track: TrackTag): Array<TrackId | "all"> {
  if (track === "cybersecurity_grc") {
    return ["cyber"];
  }

  if (track === "privacy_ai") {
    return ["privacy"];
  }

  return ["all"];
}

export function mapCredential(row: CredentialRow): PublishedCredential {
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    issuer: row.issuer,
    yearLabel: row.year_label,
    details: row.details,
    track: row.track,
    highlight: row.highlight,
    sortOrder: row.sort_order,
    verificationUrl: row.verification_url,
    expiresOn: row.expires_on,
  };
}

export function toPresentationCredential(
  credential: PublishedCredential,
): Credential {
  return {
    id: credential.id,
    kind: credential.kind,
    name: credential.name,
    issuer: credential.issuer,
    ...(credential.yearLabel ? { yearLabel: credential.yearLabel } : {}),
    ...(credential.details ? { details: credential.details } : {}),
    ...(credential.highlight ? { highlight: true } : {}),
    tracks: mapTrack(credential.track),
    ...(credential.verificationUrl
      ? { verificationUrl: credential.verificationUrl }
      : {}),
    ...(credential.expiresOn ? { expiresOn: credential.expiresOn } : {}),
  };
}

export function formatCredentialExpiry(isoDate: string): string {
  return `Expires ${formatMonthYear(isoDate)}`;
}

export function sortEligible(rows: CredentialRow[]): PublishedCredential[] {
  return [...rows]
    .filter((row) => isPubliclyEligibleCredential(row))
    .sort((left, right) => {
      if (left.sort_order !== right.sort_order) {
        return left.sort_order - right.sort_order;
      }

      return left.name.localeCompare(right.name);
    })
    .map(mapCredential);
}
