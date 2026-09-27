import type { InquiryTrack } from "@/lib/supabase/database.types";

export const INQUIRY_TRACK_LABELS: Record<InquiryTrack, string> = {
  cybersecurity_grc: "GRC, IT Risk & Security Compliance",
  privacy_ai: "Privacy, Compliance & Assurance",
  either: "Either",
};

const LANE_TO_TRACK = {
  grc_it_risk: "cybersecurity_grc",
  privacy_compliance: "privacy_ai",
} as const;

const TRACKS = new Set<InquiryTrack>([
  "cybersecurity_grc",
  "privacy_ai",
  "either",
]);

export function parseInquiryLaneQuery(
  value: string | string[] | undefined,
): InquiryTrack {
  const raw = Array.isArray(value) ? value[0] : value;

  if (raw === "grc_it_risk" || raw === "privacy_compliance") {
    return LANE_TO_TRACK[raw];
  }

  return "either";
}

export function isInquiryTrack(value: string): value is InquiryTrack {
  return TRACKS.has(value as InquiryTrack);
}

export function inquiryFallbackSubject(track: InquiryTrack): string | null {
  if (track === "cybersecurity_grc") {
    return "Inquiry — GRC, IT Risk & Security Compliance";
  }

  if (track === "privacy_ai") {
    return "Inquiry — Privacy, Compliance & Assurance";
  }

  return null;
}

export function mailtoWithInquirySubject(
  emailHref: string,
  track: InquiryTrack,
): string {
  const subject = inquiryFallbackSubject(track);

  if (!subject || !emailHref.toLowerCase().startsWith("mailto:")) {
    return emailHref;
  }

  const separator = emailHref.includes("?") ? "&" : "?";
  return `${emailHref}${separator}subject=${encodeURIComponent(subject)}`;
}
