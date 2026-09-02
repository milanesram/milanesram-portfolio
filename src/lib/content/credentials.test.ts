import { describe, expect, it } from "vitest";
import {
  formatCredentialExpiry,
  isPubliclyEligibleCredential,
  mapCredential,
  toPresentationCredential,
  type CredentialRow,
} from "./credential-map";

const MSIS: CredentialRow = {
  id: "bda3ebf4-4601-4a34-bfe5-9bb5b595d599",
  kind: "degree",
  name: "Master of Science in Information Systems, Security Specialization",
  issuer: "Northwestern University",
  year_label: "2026",
  details: "Coursework includes Information Security Management.",
  track: "all",
  highlight: true,
  needs_verification: false,
  status: "published",
  sort_order: 10,
  verification_url: null,
  expires_on: null,
};

const GOOGLE_AI: CredentialRow = {
  id: "ddad349b-5faf-4f92-b12d-005ace591d4c",
  kind: "certification",
  name: "Google AI Professional Certificate",
  issuer: "Google",
  year_label: null,
  details: null,
  track: "privacy_ai",
  highlight: false,
  needs_verification: true,
  status: "draft",
  sort_order: 90,
  verification_url: null,
  expires_on: null,
};

describe("credential public eligibility", () => {
  it("accepts published and verified credentials", () => {
    expect(isPubliclyEligibleCredential(MSIS)).toBe(true);
  });

  it("hides draft credentials", () => {
    expect(
      isPubliclyEligibleCredential({ ...MSIS, status: "draft" }),
    ).toBe(false);
  });

  it("hides needs-verification credentials even when published", () => {
    expect(
      isPubliclyEligibleCredential({
        ...MSIS,
        needs_verification: true,
      }),
    ).toBe(false);
  });

  it("keeps Google AI hidden", () => {
    expect(isPubliclyEligibleCredential(GOOGLE_AI)).toBe(false);
  });
});

describe("credential UUID identity", () => {
  it("uses the hosted UUID as the public id after a rename", () => {
    const mapped = toPresentationCredential(
      mapCredential({ ...MSIS, name: "Renamed MSIS" }),
    );

    expect(mapped.id).toBe(MSIS.id);
    expect(mapped.name).toBe("Renamed MSIS");
    expect(mapped.id).not.toMatch(/renamed|msis/i);
  });

  it("does not select by official name or issuer", () => {
    expect(toPresentationCredential.toString()).not.toMatch(
      /presentationId|toLowerCase\(\)\.replace/,
    );
  });
});

describe("verification URL and expiry presentation", () => {
  it("omits verification and expiry when null", () => {
    const mapped = toPresentationCredential(mapCredential(MSIS));
    expect(mapped.verificationUrl).toBeUndefined();
    expect(mapped.expiresOn).toBeUndefined();
  });

  it("passes through an approved HTTPS verification URL", () => {
    const mapped = toPresentationCredential(
      mapCredential({
        ...MSIS,
        verification_url: "https://verify.example.com/msis",
      }),
    );
    expect(mapped.verificationUrl).toBe("https://verify.example.com/msis");
  });

  it("formats expiry as a month-year line", () => {
    expect(formatCredentialExpiry("2028-06-15")).toBe("Expires June 2028");
  });
});
