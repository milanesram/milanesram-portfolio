export type TrackId = "cyber" | "privacy";

export type ContentStatus = "published";

export type ExperienceKind = "employment" | "consulting" | "additional" | "leadership";

export type CredentialKind = "degree" | "certification" | "training" | "license";

export type VerificationState = "pending";

export type ExperienceBullet = {
  body: string;
  tracks: Array<TrackId | "all">;
};

export type Experience = {
  id: string;
  organization: string;
  title: string;
  titleSecondary?: string;
  location: string;
  kind: ExperienceKind;
  startLabel: string;
  endLabel: string;
  isCurrent?: boolean;
  summary?: string;
  bullets: ExperienceBullet[];
  featuredOnHome?: boolean;
  tracks: Array<TrackId | "all">;
};

export type Metric = {
  id: string;
  value: string;
  label: string;
  context: string;
};

export type Project = {
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
  tracks: Array<TrackId | "all">;
};

export type CaseStudySection = {
  id: string;
  heading: string;
  body: string;
};

export type Credential = {
  id: string;
  kind: CredentialKind;
  name: string;
  issuer: string;
  yearLabel?: string;
  details?: string;
  highlight?: boolean;
  tracks: Array<TrackId | "all">;
  /** Internal only. Never render in the UI. */
  verification?: VerificationState;
};

export type FocusRouteCard = {
  slug: string;
  navLabel: string;
  summary: string;
};
