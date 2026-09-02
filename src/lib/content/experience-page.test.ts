import { describe, expect, it } from "vitest";
import {
  formatExperienceDateRange,
  interpretPublishedExperiencesResponse,
  toPublicExperience,
  toPublicExperiences,
  type PublishedExperienceItemRow,
  type PublishedExperienceRow,
} from "./experience-page";

const RAM: PublishedExperienceRow = {
  id: "982e5fae-ec27-49c5-9d7f-b88873bc33ec",
  organization: "RAM Privacy & Security",
  title: "Principal Consultant",
  title_secondary: null,
  location_display: "Remote",
  kind: "consulting",
  start_date: "2024-10-01",
  end_date: null,
  date_precision: "month",
  start_year: null,
  end_year: null,
  is_current: true,
  is_featured: true,
  summary: null,
  status: "published",
  sort_order: 10,
};

const SCIONETRADE: PublishedExperienceRow = {
  id: "c52e0001-0000-4000-8000-000000000001",
  organization: "Scionetrade Corporation",
  title: "Legal Consultant — Cybersecurity & Data Privacy Advisory",
  title_secondary: null,
  location_display: "Philippines",
  kind: "additional",
  start_date: null,
  end_date: null,
  date_precision: "year",
  start_year: 2018,
  end_year: 2020,
  is_current: false,
  is_featured: false,
  summary: null,
  status: "published",
  sort_order: 70,
};

const SCIONETRADE_ITEM: PublishedExperienceItemRow = {
  id: "c52e0001-0000-4000-8000-000000000011",
  experience_id: SCIONETRADE.id,
  body: "Advised a security and technology solutions provider on cybersecurity, data privacy, and vendor-facing technology engagements.",
  track: "all",
  is_metric: false,
  metric_context: null,
  status: "published",
  sort_order: 10,
};

const RAM_ITEM: PublishedExperienceItemRow = {
  id: "4fcf85b9-f34d-41c5-8ebd-ff37be9534ad",
  experience_id: RAM.id,
  body: "Assess cybersecurity, privacy, and technology-risk issues.",
  track: "all",
  is_metric: false,
  metric_context: null,
  status: "published",
  sort_order: 10,
};

describe("formatExperienceDateRange", () => {
  it("preserves month-level current roles", () => {
    expect(formatExperienceDateRange(RAM)).toEqual({
      startLabel: "October 2024",
      endLabel: "Present",
    });
  });

  it("preserves month-level closed roles", () => {
    expect(
      formatExperienceDateRange({
        date_precision: "month",
        start_date: "2021-03-01",
        end_date: "2024-09-01",
        start_year: null,
        end_year: null,
        is_current: false,
      }),
    ).toEqual({
      startLabel: "March 2021",
      endLabel: "September 2024",
    });
  });

  it("renders year-only Scionetrade as 2018–2020 without a month or day", () => {
    const range = formatExperienceDateRange(SCIONETRADE);

    expect(range).toEqual({
      startLabel: "2018",
      endLabel: "2020",
    });
    expect(`${range.startLabel}–${range.endLabel}`).toBe("2018–2020");
    expect(`${range.startLabel} ${range.endLabel}`).not.toMatch(
      /January|February|March|April|May|June|July|August|September|October|November|December|\d{4}-\d{2}-\d{2}/,
    );
  });
});

describe("hosted-only Experience mapping", () => {
  it("uses hosted UUIDs and does not match organization or title", () => {
    const page = toPublicExperience(
      {
        ...RAM,
        organization: "Renamed Firm",
        title: "Renamed Title",
      },
      [{ ...RAM_ITEM, body: "Edited bullet text does not break selection." }],
    );

    expect(page.id).toBe(RAM.id);
    expect(page.organization).toBe("Renamed Firm");
    expect(page.title).toBe("Renamed Title");
    expect(page.bullets[0]?.body).toBe(
      "Edited bullet text does not break selection.",
    );
    expect(toPublicExperience.toString()).not.toMatch(
      /organization ===|title ===|staticExperiences|scionetrade/,
    );
  });

  it("maps Scionetrade from hosted year-only fields without a static merge", () => {
    const experiences = toPublicExperiences(
      [RAM, SCIONETRADE],
      [RAM_ITEM, SCIONETRADE_ITEM],
    );

    expect(experiences.map((item) => item.id)).toEqual([RAM.id, SCIONETRADE.id]);
    expect(experiences[1]).toEqual(
      expect.objectContaining({
        id: SCIONETRADE.id,
        organization: "Scionetrade Corporation",
        title: "Legal Consultant — Cybersecurity & Data Privacy Advisory",
        startLabel: "2018",
        endLabel: "2020",
        kind: "additional",
      }),
    );
  });

  it("omits unpublished items and does not fall back to static copy", () => {
    const page = toPublicExperience(RAM, [
      { ...RAM_ITEM, status: "draft" },
    ]);

    expect(page.bullets).toEqual([]);
  });
});

describe("published Experience response", () => {
  it("returns ok false on query failure", () => {
    expect(
      interpretPublishedExperiencesResponse({
        error: { message: "network" },
        data: [RAM],
      }),
    ).toEqual({ ok: false });
  });

  it("returns empty rows when no published content exists", () => {
    expect(
      interpretPublishedExperiencesResponse({
        error: null,
        data: [],
      }),
    ).toEqual({ ok: true, rows: [] });
  });
});
