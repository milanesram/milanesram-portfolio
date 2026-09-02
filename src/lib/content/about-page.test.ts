import { describe, expect, it } from "vitest";
import {
  canPublishJourneyMilestone,
  interpretPublishedAboutPageResponse,
  mapAboutEducationCredentials,
  mapAboutListItems,
  mapAboutParagraphs,
  mapPublicJourneyMilestones,
  toPublicAboutPage,
  type AboutPageRow,
  type JourneyMilestoneRow,
} from "./about-page";
import type { CredentialRow } from "./credential-map";

const ABOUT_ROW: AboutPageRow = {
  id: "c52c0001-0000-4000-8000-000000000001",
  status: "published",
  kicker: "About",
  headline: "From privacy and governance work to cybersecurity and risk.",
  lede: "An earned Northwestern MSIS sits on a foundation of privacy practice.",
  journey_heading: "Professional journey",
  education_heading: "Education at a glance",
  speaking_heading: "Speaking and advisory",
  speaking_body: "I have spoken and advised on data privacy and cybersecurity.",
  boundaries_heading: "Professional boundaries",
};

const GPA: JourneyMilestoneRow = {
  id: "c52c0001-0000-4000-8000-000000000043",
  title: "Global privacy assembly session",
  year: 2025,
  caption: "Speaking on global privacy from the lectern.",
  media_asset_id: "d2f89c64-e6de-42bc-b697-952ad6791d36",
  sort_order: 30,
  status: "published",
};

const GRADUATION: JourneyMilestoneRow = {
  id: "c52c0001-0000-4000-8000-000000000046",
  title: "Northwestern University — MSIS Graduation",
  year: 2026,
  caption: "Completed the Master of Science in Information Systems.",
  media_asset_id: null,
  sort_order: 60,
  status: "draft",
};

describe("about singleton mapping", () => {
  it("maps hosted About copy and ordered paragraphs", () => {
    const page = toPublicAboutPage({
      row: ABOUT_ROW,
      paragraphs: [
        { id: "p2", body: "Second paragraph.", sort_order: 20 },
        { id: "p1", body: "First paragraph.", sort_order: 10 },
      ],
      listItems: [
        { id: "s1", kind: "speaking", body: "Academic audiences", sort_order: 10 },
        { id: "b1", kind: "boundary", body: "Licensed in the Philippines.", sort_order: 10 },
      ],
      milestones: [],
      mediaById: new Map(),
    });

    expect(page.headline).toBe(ABOUT_ROW.headline);
    expect(page.paragraphs.map((item) => item.body)).toEqual([
      "First paragraph.",
      "Second paragraph.",
    ]);
    expect(page.speakingItems).toEqual([{ id: "s1", body: "Academic audiences" }]);
    expect(page.boundaryItems[0]?.body).toContain("Philippines");
    expect(page.educationCredentials).toEqual([]);
  });
});

const MSIS: CredentialRow = {
  id: "bda3ebf4-4601-4a34-bfe5-9bb5b595d599",
  kind: "degree",
  name: "Master of Science in Information Systems, Security Specialization",
  issuer: "Northwestern University",
  year_label: "2026",
  details: null,
  track: "all",
  highlight: true,
  needs_verification: false,
  status: "published",
  sort_order: 10,
  verification_url: null,
  expires_on: null,
};

const JD: CredentialRow = {
  ...MSIS,
  id: "7e8b86b6-b5cd-4824-b72c-94bb585d491e",
  name: "Juris Doctor",
  issuer: "San Sebastian College – Recoletos",
  year_label: null,
  highlight: false,
  sort_order: 20,
};

const GOOGLE_AI: CredentialRow = {
  ...MSIS,
  id: "ddad349b-5faf-4f92-b12d-005ace591d4c",
  kind: "certification",
  name: "Google AI Professional Certificate",
  issuer: "Google",
  year_label: null,
  highlight: false,
  needs_verification: true,
  status: "draft",
  sort_order: 90,
};

describe("About Education UUID relationships", () => {
  it("keeps selection after a name or issuer change", () => {
    const selected = mapAboutEducationCredentials({
      links: [
        { credential_id: MSIS.id, sort_order: 10 },
        { credential_id: JD.id, sort_order: 20 },
      ],
      credentials: [
        { ...MSIS, name: "Renamed MSIS", issuer: "Renamed issuer" },
        JD,
      ],
    });

    expect(selected.map((item) => item.id)).toEqual([MSIS.id, JD.id]);
    expect(selected[0]?.name).toBe("Renamed MSIS");
    expect(selected[0]?.issuer).toBe("Renamed issuer");
  });

  it("omits an ineligible related credential without falling back to static data", () => {
    const selected = mapAboutEducationCredentials({
      links: [
        { credential_id: MSIS.id, sort_order: 10 },
        { credential_id: GOOGLE_AI.id, sort_order: 20 },
        { credential_id: JD.id, sort_order: 30 },
      ],
      credentials: [MSIS, GOOGLE_AI, { ...JD, status: "draft" }],
    });

    expect(selected.map((item) => item.id)).toEqual([MSIS.id]);
    expect(selected.some((item) => /google/i.test(item.name))).toBe(false);
  });

  it("restores a previously selected credential when eligibility returns", () => {
    const links = [{ credential_id: MSIS.id, sort_order: 10 }];
    const hidden = mapAboutEducationCredentials({
      links,
      credentials: [{ ...MSIS, status: "draft" }],
    });
    const restored = mapAboutEducationCredentials({
      links,
      credentials: [MSIS],
    });

    expect(hidden).toEqual([]);
    expect(restored.map((item) => item.id)).toEqual([MSIS.id]);
  });

  it("does not compare credential names at runtime", () => {
    expect(mapAboutEducationCredentials.toString()).not.toMatch(
      /name ===|issuer ===|year_label ===/,
    );
  });
});

describe("journey UUID relationships", () => {
  it("uses milestone caption and year, not media metadata", () => {
    const items = mapPublicJourneyMilestones({
      milestones: [GPA],
      mediaById: new Map([
        [
          GPA.media_asset_id!,
          {
            id: GPA.media_asset_id!,
            altText: "Alt from media",
            publicUrl: "https://example.com/gpa.webp",
            credit: null,
          },
        ],
      ]),
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.year).toBe(2025);
    expect(items[0]?.caption).toBe(GPA.caption);
    expect(items[0]?.media.id).toBe(GPA.media_asset_id);
  });

  it("keeps GPA at 2025 and hides draft graduation", () => {
    const items = mapPublicJourneyMilestones({
      milestones: [
        { ...GPA, sort_order: 30 },
        GRADUATION,
      ],
      mediaById: new Map([
        [
          GPA.media_asset_id!,
          {
            id: GPA.media_asset_id!,
            altText: "GPA",
            publicUrl: "https://example.com/gpa.webp",
            credit: null,
          },
        ],
      ]),
    });

    expect(items.map((item) => item.id)).toEqual([GPA.id]);
    expect(items.some((item) => item.year === 2026)).toBe(false);
  });

  it("omits published milestones without eligible media", () => {
    expect(
      mapPublicJourneyMilestones({
        milestones: [GPA],
        mediaById: new Map(),
      }),
    ).toEqual([]);
  });

  it("reorders by milestone sort_order", () => {
    const second = {
      ...GPA,
      id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      media_asset_id: "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff",
      sort_order: 10,
    };
    const items = mapPublicJourneyMilestones({
      milestones: [GPA, second],
      mediaById: new Map([
        [
          GPA.media_asset_id!,
          {
            id: GPA.media_asset_id!,
            altText: "GPA",
            publicUrl: "https://example.com/gpa.webp",
            credit: null,
          },
        ],
        [
          second.media_asset_id!,
          {
            id: second.media_asset_id!,
            altText: "ANU",
            publicUrl: "https://example.com/anu.webp",
            credit: null,
          },
        ],
      ]),
    });

    expect(items.map((item) => item.id)).toEqual([second.id, GPA.id]);
  });
});

describe("graduation publication guard", () => {
  it("allows a draft milestone with null media", () => {
    expect(
      canPublishJourneyMilestone({
        intentStatus: "draft",
        media: null,
      }),
    ).toBe(true);
  });

  it("blocks publishing without eligible media", () => {
    expect(
      canPublishJourneyMilestone({
        intentStatus: "published",
        media: null,
      }),
    ).toBe(false);
  });

  it("allows publishing when eligible public media is attached", () => {
    expect(
      canPublishJourneyMilestone({
        intentStatus: "published",
        media: {
          id: "00000000-0000-4000-8000-000000000099",
          kind: "image",
          alt_text: "Graduation",
          mime_type: "image/webp",
          status: "published",
          is_public: true,
        },
      }),
    ).toBe(true);
  });
});

describe("about publication and failure", () => {
  it("returns a published row", () => {
    expect(
      interpretPublishedAboutPageResponse({ error: null, data: ABOUT_ROW }),
    ).toEqual({ ok: true, row: ABOUT_ROW });
  });

  it("treats a missing or unpublished singleton as null", () => {
    expect(
      interpretPublishedAboutPageResponse({ error: null, data: null }),
    ).toEqual({ ok: true, row: null });
    expect(
      interpretPublishedAboutPageResponse({
        error: null,
        data: { ...ABOUT_ROW, status: "draft" },
      }),
    ).toEqual({ ok: true, row: null });
  });

  it("returns ok:false on query failure", () => {
    expect(
      interpretPublishedAboutPageResponse({
        error: { message: "network" },
        data: ABOUT_ROW,
      }),
    ).toEqual({ ok: false });
  });
});

describe("paragraph and list ordering", () => {
  it("orders paragraphs and speaking items by sort_order", () => {
    expect(
      mapAboutParagraphs([
        { id: "b", body: "B", sort_order: 20 },
        { id: "a", body: "A", sort_order: 10 },
      ]).map((item) => item.body),
    ).toEqual(["A", "B"]);
    expect(
      mapAboutListItems(
        [
          { id: "2", kind: "speaking", body: "Forums", sort_order: 20 },
          { id: "1", kind: "speaking", body: "Public-sector", sort_order: 10 },
          { id: "3", kind: "boundary", body: "Disclaimer", sort_order: 10 },
        ],
        "speaking",
      ).map((item) => item.body),
    ).toEqual(["Public-sector", "Forums"]);
  });
});
