import type { Credential, CredentialKind, TrackId } from "@/content/types";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { ContentStatus, TrackTag } from "@/lib/supabase/database.types";

/**
 * Public credential reads from Supabase.
 *
 * `/credentials` reads published, verified rows through the anonymous
 * publishable client. RLS remains the publication boundary.
 * `src/content/credentials.ts` is retained as rollback/reference and as
 * the static source for routes that are not yet cut over.
 */

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
};

export type PublishedCredentialsResult =
  | { ok: true; credentials: PublishedCredential[] }
  | { ok: false };

function isPubliclyEligible(
  status: ContentStatus,
  needsVerification: boolean,
): boolean {
  return status === "published" && needsVerification === false;
}

function mapTrack(track: TrackTag): Array<TrackId | "all"> {
  if (track === "cybersecurity_grc") {
    return ["cyber"];
  }

  if (track === "privacy_ai") {
    return ["privacy"];
  }

  return ["all"];
}

function presentationId(kind: CredentialKind, name: string): string {
  return `${kind}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapCredential(row: {
  id: string;
  kind: CredentialKind;
  name: string;
  issuer: string;
  year_label: string | null;
  details: string | null;
  track: TrackTag;
  highlight: boolean;
  sort_order: number;
}): PublishedCredential {
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
  };
}

export function toPresentationCredential(
  credential: PublishedCredential,
): Credential {
  return {
    id: presentationId(credential.kind, credential.name),
    kind: credential.kind,
    name: credential.name,
    issuer: credential.issuer,
    ...(credential.yearLabel ? { yearLabel: credential.yearLabel } : {}),
    ...(credential.details ? { details: credential.details } : {}),
    ...(credential.highlight ? { highlight: true } : {}),
    tracks: mapTrack(credential.track),
  };
}

export async function getPublishedCredentials(): Promise<PublishedCredentialsResult> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("credentials")
    .select(
      "id, kind, name, issuer, year_label, details, track, highlight, needs_verification, status, sort_order",
    )
    .eq("status", "published")
    .eq("needs_verification", false)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) {
    return { ok: false };
  }

  return {
    ok: true,
    credentials: data
      .filter((row) => isPubliclyEligible(row.status, row.needs_verification))
      .map(mapCredential),
  };
}
