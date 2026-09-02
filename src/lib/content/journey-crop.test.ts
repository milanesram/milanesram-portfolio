import { describe, expect, it } from "vitest";
import { journeyObjectPosition } from "./journey-crop";

describe("journey crop config", () => {
  it("keys approved crops off media asset UUIDs, not captions", () => {
    expect(journeyObjectPosition("21cc6ca2-a169-4d81-9e9f-c2b28142926f")).toBe(
      "object-[center_28%]",
    );
    expect(journeyObjectPosition("7e8a240a-d83f-47e5-9986-7882509b5a63")).toBe(
      "object-[center_32%]",
    );
    expect(journeyObjectPosition.toString()).not.toMatch(/ANU|APEC|caption/);
  });

  it("defaults unknown media IDs to object-center", () => {
    expect(journeyObjectPosition("00000000-0000-4000-8000-000000000099")).toBe(
      "object-center",
    );
  });
});
