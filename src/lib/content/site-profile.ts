import type { ContentStatus } from "@/lib/supabase/database.types";

/**
 * Public site-profile view model.
 *
 * Exposes only fields public chrome and shared contact surfaces need.
 * `shortName`, `initials`, and `linkedinLabel` are derived — the hosted
 * row has no matching columns. Blank work authorization stays empty and
 * must not render.
 */
export type PublicSiteProfile = {
  displayName: string;
  shortName: string;
  initials: string;
  headline: string;
  summary: string;
  email: string;
  linkedinUrl: string;
  linkedinLabel: string;
  workAuthorization: string;
};

export type PublishedSiteProfileResult =
  | { ok: true; profile: PublicSiteProfile }
  | { ok: true; profile: null }
  | { ok: false };

export type HostedSiteProfileFields = {
  display_name: string;
  headline: string;
  summary: string;
  work_authorization: string;
  linkedin_url: string;
  public_email: string;
  status: ContentStatus;
};

/** Structural chrome only. Never a career-content fallback. */
export const SITE_CHROME_FALLBACK = {
  displayName: "Portfolio",
  shortName: "Portfolio",
  initials: "",
} as const;

export function isPublishedStatus(status: ContentStatus): boolean {
  return status === "published";
}

export function shortNameFromDisplayName(displayName: string): string {
  const match = /^(.+?)\s+\(([^)]+)\)\s+(.+)$/.exec(displayName.trim());

  if (match) {
    return `${match[2]} ${match[3]}`.trim();
  }

  return displayName.trim();
}

export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function linkedinLabelFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname.replace(/\/$/, "");
    return `${host}${path}`;
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
  }
}

export function visibleWorkAuthorization(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function toPublicSiteProfile(
  row: HostedSiteProfileFields,
): PublicSiteProfile {
  const displayName = row.display_name.trim();
  const shortName = shortNameFromDisplayName(displayName);

  return {
    displayName,
    shortName,
    initials: initialsFromName(shortName),
    headline: row.headline.trim(),
    summary: row.summary.trim(),
    email: row.public_email.trim(),
    linkedinUrl: row.linkedin_url.trim(),
    linkedinLabel: linkedinLabelFromUrl(row.linkedin_url.trim()),
    workAuthorization: row.work_authorization.trim(),
  };
}

export function interpretPublishedSiteProfileResponse(args: {
  error: { message: string } | null;
  data: HostedSiteProfileFields | null;
}): PublishedSiteProfileResult {
  if (args.error) {
    return { ok: false };
  }

  if (!args.data || !isPublishedStatus(args.data.status)) {
    return { ok: true, profile: null };
  }

  return { ok: true, profile: toPublicSiteProfile(args.data) };
}

export function profileFromPublishedResult(
  result: PublishedSiteProfileResult,
): PublicSiteProfile | null {
  return result.ok ? result.profile : null;
}

export const HEADER_HOME_HREF = "/" as const;

export function selectHeaderIdentity(profile: PublicSiteProfile | null) {
  return {
    displayName: profile?.displayName ?? SITE_CHROME_FALLBACK.displayName,
    href: HEADER_HOME_HREF,
  };
}

export function selectPublicContactChannels(profile: PublicSiteProfile | null) {
  if (!profile) {
    return null;
  }

  return {
    email: profile.email,
    mailtoHref: `mailto:${profile.email}`,
    linkedinUrl: profile.linkedinUrl,
    linkedinLabel: profile.linkedinLabel,
  };
}

export function selectFooterIdentity(profile: PublicSiteProfile | null) {
  return {
    displayName: profile?.displayName ?? SITE_CHROME_FALLBACK.displayName,
    headline: profile?.headline ?? null,
    workAuthorization: visibleWorkAuthorization(profile?.workAuthorization),
    contact: selectPublicContactChannels(profile),
  };
}
