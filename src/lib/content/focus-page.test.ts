import { describe, expect, it } from "vitest";
import {
  interpretPublishedFocusPageResponse,
  interpretPublishedFocusPagesResponse,
  mapFocusFeaturedProject,
  mapFocusFeaturedPublication,
  toPublicFocusPage,
  type FocusPageRow,
  type FocusPublicationRecord,
} from "./focus-page";
import type {
  HomeCredentialRecord,
  HomeExperienceItemRecord,
  HomeExperienceParentRecord,
  HomeProjectRecord,
} from "./home-page";

const CYBER_ROW: FocusPageRow = {
  id: "40170d44-acc6-4f1c-b6fd-a6fbee19c02a",
  slug: "cybersecurity-grc",
  nav_label: "Cybersecurity / GRC",
  headline: "Cybersecurity, GRC, and IT risk",
  summary: "Cybersecurity governance summary.",
  competencies: ["GRC", "IT risk assessment"],
  featured_project_id: "0002fb1b-5c40-41ea-98a9-e62de9dac37e",
  featured_publication_id: "93bc6513-f2e8-436c-9639-0eb59288aca7",
  featured_project_lede: "Control design and audit evidence.",
  card_summary: "For cybersecurity, GRC, and IT-risk work.",
  card_chips: ["IT risk", "GRC"],
  status: "published",
  sort_order: 10,
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
  id: "4fcf85b9-f34d-41c5-8ebd-ff37be9534ad",
  experience_id: PARENT.id,
  body: "First selected bullet.",
  status: "published",
  track: "all",
};

const ITEM_B: HomeExperienceItemRecord = {
  id: "b74f1a93-4c9c-47a2-9389-2a4590716fea",
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
  id: "ddad349b-5faf-4f92-b12d-005ace591d4c",
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

const EGOV: FocusPublicationRecord = {
  id: "93bc6513-f2e8-436c-9639-0eb59288aca7",
  slug: "egov-ph-architectural-fragility-bcdr",
  title: "Architectural Fragility",
  document_kind: "white_paper",
  year_label: "2026",
  abstract: "eGov analysis.",
  status: "published",
};

describe("focus publication and failure", () => {
  it("returns a published row", () => {
    expect(
      interpretPublishedFocusPageResponse({ error: null, data: CYBER_ROW }),
    ).toEqual({ ok: true, row: CYBER_ROW });
  });

  it("treats missing or unpublished Focus as null, not a query failure", () => {
    expect(
      interpretPublishedFocusPageResponse({ error: null, data: null }),
    ).toEqual({ ok: true, row: null });
    expect(
      interpretPublishedFocusPageResponse({
        error: null,
        data: { ...CYBER_ROW, status: "draft" },
      }),
    ).toEqual({ ok: true, row: null });
  });

  it("returns ok:false on query failure", () => {
    expect(
      interpretPublishedFocusPageResponse({
        error: { message: "network" },
        data: CYBER_ROW,
      }),
    ).toEqual({ ok: false });
  });

  it("lists published Focus rows and fails closed on transport errors", () => {
    expect(
      interpretPublishedFocusPagesResponse({
        error: null,
        data: [CYBER_ROW, { ...CYBER_ROW, status: "draft" }],
      }).ok,
    ).toBe(true);
    expect(
      interpretPublishedFocusPagesResponse({
        error: { message: "network" },
        data: [CYBER_ROW],
      }),
    ).toEqual({ ok: false });
  });
});

describe("experience UUID relationships", () => {
  it("selects by experience_item UUID, not bullet text or org/title", () => {
    const page = toPublicFocusPage({
      row: CYBER_ROW,
      experienceLinks: [
        { experience_item_id: ITEM_B.id, sort_order: 20 },
        { experience_item_id: ITEM_A.id, sort_order: 10 },
      ],
      experienceItems: [
        { ...ITEM_A, body: "Edited bullet text does not break selection." },
        ITEM_B,
      ],
      experienceParents: [
        { ...PARENT, organization: "Renamed Firm", title: "Renamed Title" },
      ],
      credentialLinks: [],
      credentials: [],
      featuredProject: null,
      featuredPublication: null,
    });

    expect(page.experience).toHaveLength(1);
    expect(page.experience[0]?.id).toBe(PARENT.id);
    expect(page.experience[0]?.organization).toBe("Renamed Firm");
    expect(page.experience[0]?.title).toBe("Renamed Title");
    expect(page.experience[0]?.bullets.map((bullet) => bullet.body)).toEqual([
      "Edited bullet text does not break selection.",
      "Second selected bullet.",
    ]);
  });

  it("omits unpublished items and does not match bodies at runtime", () => {
    const page = toPublicFocusPage({
      row: CYBER_ROW,
      experienceLinks: [
        { experience_item_id: ITEM_B.id, sort_order: 20 },
        { experience_item_id: ITEM_A.id, sort_order: 10 },
      ],
      experienceItems: [{ ...ITEM_A, status: "draft" }, ITEM_B],
      experienceParents: [PARENT],
      credentialLinks: [],
      credentials: [],
      featuredProject: null,
      featuredPublication: null,
    });

    expect(page.experience[0]?.bullets).toEqual([
      { body: "Second selected bullet.", tracks: ["all"] },
    ]);
    expect(toPublicFocusPage.toString()).not.toMatch(/bulletBodies|=== body/);
  });
});

describe("credential UUID relationships", () => {
  it("selects by credential UUID and ignores rename", () => {
    const page = toPublicFocusPage({
      row: CYBER_ROW,
      experienceLinks: [],
      experienceItems: [],
      experienceParents: [],
      credentialLinks: [{ credential_id: MSIS.id, sort_order: 10 }],
      credentials: [{ ...MSIS, name: "Renamed MSIS" }],
      featuredProject: null,
      featuredPublication: null,
    });

    expect(page.credentials).toEqual([
      expect.objectContaining({ id: MSIS.id, name: "Renamed MSIS" }),
    ]);
  });

  it("omits draft or needs-verification credentials including Google AI", () => {
    const page = toPublicFocusPage({
      row: CYBER_ROW,
      experienceLinks: [],
      experienceItems: [],
      experienceParents: [],
      credentialLinks: [
        { credential_id: MSIS.id, sort_order: 10 },
        { credential_id: GOOGLE_AI.id, sort_order: 20 },
      ],
      credentials: [MSIS, GOOGLE_AI],
      featuredProject: null,
      featuredPublication: null,
    });

    expect(page.credentials.map((item) => item.id)).toEqual([MSIS.id]);
    expect(page.credentials.some((item) => /google/i.test(item.name))).toBe(
      false,
    );
  });
});

describe("project UUID relationship", () => {
  it("selects PrivAI by UUID and keeps core project facts", () => {
    const project = mapFocusFeaturedProject(CYBER_ROW, {
      ...PRIVAI,
      name: "Renamed PrivAI",
      slug: "renamed-privai",
    });

    expect(project?.id).toBe(PRIVAI.id);
    expect(project?.name).toBe("Renamed PrivAI");
    expect(project?.slug).toBe("renamed-privai");
    expect(project?.limits).toContain("Non-production");
  });

  it("omits an unpublished featured project", () => {
    expect(
      mapFocusFeaturedProject(CYBER_ROW, { ...PRIVAI, status: "draft" }),
    ).toBeNull();
  });
});

describe("publication UUID relationship", () => {
  it("selects writing by UUID and ignores title/slug changes", () => {
    const publication = mapFocusFeaturedPublication(CYBER_ROW, {
      ...EGOV,
      slug: "renamed-egov",
      title: "Renamed eGov",
    });

    expect(publication).toEqual({
      slug: "renamed-egov",
      title: "Renamed eGov",
      documentKindLabel: "White paper",
      yearLabel: "2026",
      abstract: "eGov analysis.",
    });
  });

  it("omits an unpublished publication", () => {
    expect(
      mapFocusFeaturedPublication(CYBER_ROW, { ...EGOV, status: "draft" }),
    ).toBeNull();
  });
});
