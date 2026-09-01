import { describe, expect, it } from "vitest";
import {
  interpretPublishedHomePageResponse,
  mapFeaturedProject,
  mapHomeChips,
  mapHomeCredentials,
  mapHomeExperiences,
  toPublicHomePage,
  type HomeCredentialRecord,
  type HomeExperienceItemRecord,
  type HomeExperienceParentRecord,
  type HomePageRow,
  type HomeProjectRecord,
} from "./home-page";

const HOME_ROW: HomePageRow = {
  id: "c52b0001-0000-4000-8000-000000000001",
  status: "published",
  featured_project_id: "0002fb1b-5c40-41ea-98a9-e62de9dac37e",
  headline: "Cybersecurity, risk, and privacy work grounded in technical practice.",
  lede: "Substantial governance and privacy experience.",
  primary_cta_label: "View experience",
  primary_cta_href: "/experience",
  secondary_cta_label: "Read the PrivAI Guard case study",
  secondary_cta_href: "/projects/privai-guard",
  project_kicker: "Featured work · 2026",
  project_heading: "PrivAI Guard",
  project_problem: "Employee use of public AI tools often outpaces controls.",
  project_body: "A non-production Shadow AI governance MVP.",
  project_cta_label: "Read the PrivAI Guard case study",
  project_cta_href: "/projects/privai-guard",
  project_proof_points: ["Human governance review."],
  experience_kicker: "Experience",
  experience_heading: "Selected recent work",
  experience_lede: "Selected examples.",
  experience_cta_label: "View full experience",
  experience_cta_href: "/experience",
  credentials_kicker: "Credentials",
  credentials_heading: "Education and certifications",
  credentials_lede: "Formal credentials.",
  credentials_cta_label: "View credentials",
  credentials_cta_href: "/credentials",
  focus_kicker: "Two tracks",
  focus_heading: "One record. Two recruiter packets.",
  focus_lede: "Choose the track that matches the role.",
  closing_heading: "Review the work or start a conversation",
  closing_body: "Explore experience, projects, and credentials.",
  closing_primary_cta_label: "View resume options",
  closing_primary_cta_href: "/resume",
  closing_secondary_cta_label: "Contact",
  closing_secondary_cta_href: "/contact",
  seo_title: "Rainier (Ram) Milanes — Cybersecurity, GRC, IT Risk & Privacy",
  seo_description: "Cybersecurity governance, GRC, technology risk, privacy, and AI governance.",
};

const PARENT: HomeExperienceParentRecord = {
  id: "982e5fae-ec27-49c5-9d7f-b88873bc33ec",
  organization: "RAM Privacy & Security",
  title: "Principal Consultant",
  title_secondary: null,
  location_display: "Remote",
  kind: "consulting",
  start_date: "2024-10-01",
  end_date: null,
  is_current: true,
  status: "published",
};

const ITEM_A: HomeExperienceItemRecord = {
  id: "b74f1a93-4c9c-47a2-9389-2a4590716fea",
  experience_id: PARENT.id,
  body: "First selected bullet.",
  status: "published",
  track: "all",
};

const ITEM_B: HomeExperienceItemRecord = {
  id: "a6685287-de72-4919-8840-94255d5fd6c2",
  experience_id: PARENT.id,
  body: "Second selected bullet.",
  status: "published",
  track: "all",
};

const MSIS: HomeCredentialRecord = {
  id: "bda3ebf4-4601-4a34-bfe5-9bb5b595d599",
  kind: "degree",
  name: "Master of Science in Information Systems, Security Specialization",
  issuer: "Northwestern University",
  year_label: "2026",
  details: null,
  track: "all",
  highlight: true,
  status: "published",
  needs_verification: false,
};

const GOOGLE_AI: HomeCredentialRecord = {
  id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  kind: "certification",
  name: "Google AI Professional Certificate",
  issuer: "Google",
  year_label: null,
  details: null,
  track: "privacy_ai",
  highlight: false,
  status: "draft",
  needs_verification: true,
};

const PRIVAI: HomeProjectRecord = {
  id: "0002fb1b-5c40-41ea-98a9-e62de9dac37e",
  slug: "privai-guard",
  name: "PrivAI Guard",
  tagline: "Shadow AI governance",
  year_label: "2026",
  role: "Designer and developer",
  summary: "Capstone MVP.",
  limits: "Non-production. Synthetic demonstration data only.",
  stack: ["Next.js"],
  is_featured: true,
  status: "published",
};

describe("home singleton mapping", () => {
  it("maps hosted Home copy and CTAs", () => {
    const page = toPublicHomePage({
      row: HOME_ROW,
      chips: [
        { id: "c2", label: "GRC", sort_order: 20 },
        { id: "c1", label: "Cybersecurity", sort_order: 10 },
      ],
      proofItems: [],
      experienceLinks: [],
      experienceItems: [],
      experienceParents: [],
      credentialLinks: [],
      credentials: [],
      featuredProject: null,
    });

    expect(page.headline).toBe(HOME_ROW.headline);
    expect(page.primaryCta).toEqual({
      label: "View experience",
      href: "/experience",
    });
    expect(page.chips.map((chip) => chip.label)).toEqual(["Cybersecurity", "GRC"]);
  });
});

describe("experience UUID relationships", () => {
  it("selects by experience_item UUID, not bullet text", () => {
    const renamed = { ...ITEM_A, body: "Edited bullet text does not break selection." };
    const experiences = mapHomeExperiences({
      links: [
        { experience_item_id: ITEM_B.id, sort_order: 20 },
        { experience_item_id: ITEM_A.id, sort_order: 10 },
      ],
      items: [renamed, ITEM_B],
      parents: [{ ...PARENT, organization: "Renamed Firm", title: "Renamed Title" }],
    });

    expect(experiences).toHaveLength(1);
    expect(experiences[0]?.id).toBe(PARENT.id);
    expect(experiences[0]?.organization).toBe("Renamed Firm");
    expect(experiences[0]?.title).toBe("Renamed Title");
    expect(experiences[0]?.bullets.map((bullet) => bullet.body)).toEqual([
      "Edited bullet text does not break selection.",
      "Second selected bullet.",
    ]);
  });

  it("omits unpublished items and follows sort order", () => {
    const experiences = mapHomeExperiences({
      links: [
        { experience_item_id: ITEM_B.id, sort_order: 20 },
        { experience_item_id: ITEM_A.id, sort_order: 10 },
      ],
      items: [{ ...ITEM_A, status: "draft" }, ITEM_B],
      parents: [PARENT],
    });

    expect(experiences[0]?.bullets).toEqual([
      { body: "Second selected bullet.", tracks: ["all"] },
    ]);
  });

  it("does not compare bullet bodies at runtime", () => {
    expect(mapHomeExperiences.toString()).not.toMatch(/bulletBodies|=== body/);
  });
});

describe("credential UUID relationships", () => {
  it("selects by credential UUID and ignores rename", () => {
    const credentials = mapHomeCredentials({
      links: [{ credential_id: MSIS.id, sort_order: 10 }],
      credentials: [{ ...MSIS, name: "Renamed MSIS" }],
    });

    expect(credentials).toEqual([
      expect.objectContaining({
        id: MSIS.id,
        name: "Renamed MSIS",
      }),
    ]);
  });

  it("omits draft or needs-verification credentials including Google AI", () => {
    const credentials = mapHomeCredentials({
      links: [
        { credential_id: MSIS.id, sort_order: 10 },
        { credential_id: GOOGLE_AI.id, sort_order: 20 },
      ],
      credentials: [MSIS, GOOGLE_AI],
    });

    expect(credentials.map((item) => item.id)).toEqual([MSIS.id]);
    expect(credentials.some((item) => /google/i.test(item.name))).toBe(false);
  });
});

describe("featured project UUID relationship", () => {
  it("selects PrivAI by UUID and keeps core project facts", () => {
    const flagship = mapFeaturedProject(HOME_ROW, {
      ...PRIVAI,
      name: "Renamed PrivAI",
    });

    expect(flagship?.project.id).toBe(PRIVAI.id);
    expect(flagship?.project.name).toBe("Renamed PrivAI");
    expect(flagship?.heading).toBe("PrivAI Guard");
    expect(flagship?.project.limits).toContain("Non-production");
  });

  it("omits an unpublished featured project", () => {
    expect(
      mapFeaturedProject(HOME_ROW, { ...PRIVAI, status: "draft" }),
    ).toBeNull();
  });
});

describe("home publication and failure", () => {
  it("returns a published row", () => {
    expect(
      interpretPublishedHomePageResponse({ error: null, data: HOME_ROW }),
    ).toEqual({ ok: true, row: HOME_ROW });
  });

  it("treats a missing or unpublished singleton as null, not a query failure", () => {
    expect(
      interpretPublishedHomePageResponse({ error: null, data: null }),
    ).toEqual({ ok: true, row: null });
    expect(
      interpretPublishedHomePageResponse({
        error: null,
        data: { ...HOME_ROW, status: "draft" },
      }),
    ).toEqual({ ok: true, row: null });
  });

  it("returns ok:false on query failure", () => {
    expect(
      interpretPublishedHomePageResponse({
        error: { message: "network" },
        data: HOME_ROW,
      }),
    ).toEqual({ ok: false });
  });
});

describe("chip ordering", () => {
  it("orders chips by sort_order", () => {
    expect(
      mapHomeChips([
        { id: "3", label: "AI Governance", sort_order: 50 },
        { id: "1", label: "Cybersecurity", sort_order: 10 },
      ]).map((chip) => chip.label),
    ).toEqual(["Cybersecurity", "AI Governance"]);
  });
});
