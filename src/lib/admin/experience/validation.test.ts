import { describe, expect, it } from "vitest";
import { parseExperienceFormData } from "./validation";

function form(entries: Array<[string, string]>) {
  const data = new FormData();
  for (const [name, value] of entries) {
    data.append(name, value);
  }
  return data;
}

const required = [
  ["organization", "Scionetrade Corporation"],
  ["title", "Legal Consultant — Cybersecurity & Data Privacy Advisory"],
  ["location_display", "Philippines"],
  ["kind", "additional"],
  ["sort_order", "70"],
  ["intent", "publish"],
] as Array<[string, string]>;

describe("experience date-precision validation", () => {
  it("accepts a year-only record", () => {
    const parsed = parseExperienceFormData(
      form([
        ...required,
        ["date_precision", "year"],
        ["start_year", "2018"],
        ["end_year", "2020"],
      ]),
    );

    expect(parsed).toEqual({
      ok: true,
      value: expect.objectContaining({
        datePrecision: "year",
        startYear: 2018,
        endYear: 2020,
        startDate: null,
        endDate: null,
      }),
    });
  });

  it("rejects an inverted year range", () => {
    expect(
      parseExperienceFormData(
        form([
          ...required,
          ["date_precision", "year"],
          ["start_year", "2020"],
          ["end_year", "2018"],
        ]),
      ),
    ).toEqual({
      ok: false,
      error: "End year cannot be earlier than start year.",
    });
  });

  it("rejects month/day values when precision is year-only", () => {
    expect(
      parseExperienceFormData(
        form([
          ...required,
          ["date_precision", "year"],
          ["start_year", "2018"],
          ["end_year", "2020"],
          ["start_date", "2018-01-01"],
        ]),
      ),
    ).toEqual({
      ok: false,
      error: "Year-only records cannot store a month or day.",
    });
  });

  it("accepts an existing month-precision record", () => {
    const parsed = parseExperienceFormData(
      form([
        ["organization", "RAM Privacy & Security"],
        ["title", "Principal Consultant"],
        ["location_display", "Remote"],
        ["kind", "consulting"],
        ["sort_order", "10"],
        ["intent", "publish"],
        ["date_precision", "month"],
        ["start_date", "2024-10-01"],
        ["is_current", "on"],
      ]),
    );

    expect(parsed).toEqual({
      ok: true,
      value: expect.objectContaining({
        datePrecision: "month",
        startDate: "2024-10-01",
        endDate: null,
        startYear: null,
        endYear: null,
        isCurrent: true,
      }),
    });
  });
});
