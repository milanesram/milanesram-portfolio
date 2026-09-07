import { describe, expect, it } from "vitest";
import {
  initialsFromName,
  interpretPublishedSiteProfileResponse,
  linkedinLabelFromUrl,
  selectFooterIdentity,
  selectHeaderIdentity,
  selectPublicContactChannels,
  shortNameFromDisplayName,
  SITE_CHROME_FALLBACK,
  toPublicSiteProfile,
  visibleWorkAuthorization,
  type HostedSiteProfileFields,
} from "./site-profile";

const HOSTED_PUBLISHED_ROW: HostedSiteProfileFields = {
  display_name: "Rainier (Ram) Milanes",
  headline: "Cybersecurity, GRC, IT risk, data privacy, and AI governance practitioner.",
  summary:
    "Cybersecurity, GRC, IT-risk, and privacy professional. I earned a Northwestern MSIS (Security Specialization) and combine governance and privacy experience with hands-on technical development through PrivAI Guard, a non-production Shadow AI governance capstone.",
  work_authorization: "",
  linkedin_url: "https://www.linkedin.com/in/milanesram/",
  public_email: "milanesram@gmail.com",
  status: "published",
};

describe("hosted profile mapping", () => {
  it("maps the published hosted row to the public view model", () => {
    expect(toPublicSiteProfile(HOSTED_PUBLISHED_ROW)).toEqual({
      displayName: "Rainier (Ram) Milanes",
      shortName: "Ram Milanes",
      initials: "RM",
      headline: "Cybersecurity, GRC, IT risk, data privacy, and AI governance practitioner.",
      summary: HOSTED_PUBLISHED_ROW.summary,
      email: "milanesram@gmail.com",
      linkedinUrl: "https://www.linkedin.com/in/milanesram/",
      linkedinLabel: "linkedin.com/in/milanesram",
      workAuthorization: "",
    });
  });

  it("derives shortName from a parenthetical display name", () => {
    expect(shortNameFromDisplayName("Rainier (Ram) Milanes")).toBe("Ram Milanes");
  });

  it("derives initials from the short name", () => {
    expect(initialsFromName("Ram Milanes")).toBe("RM");
  });

  it("derives the LinkedIn label without protocol or www", () => {
    expect(linkedinLabelFromUrl("https://www.linkedin.com/in/milanesram/")).toBe(
      "linkedin.com/in/milanesram",
    );
  });
});

describe("blank work authorization", () => {
  it("does not render empty or whitespace-only values", () => {
    expect(visibleWorkAuthorization("")).toBeNull();
    expect(visibleWorkAuthorization("   ")).toBeNull();
    expect(visibleWorkAuthorization(null)).toBeNull();
    expect(visibleWorkAuthorization(undefined)).toBeNull();
  });

  it("maps a blank hosted column to an empty view-model field", () => {
    const profile = toPublicSiteProfile(HOSTED_PUBLISHED_ROW);
    expect(profile.workAuthorization).toBe("");
    expect(visibleWorkAuthorization(profile.workAuthorization)).toBeNull();
    expect(selectFooterIdentity(profile).workAuthorization).toBeNull();
  });

  it("does not invent employment-status wording", () => {
    const profile = toPublicSiteProfile(HOSTED_PUBLISHED_ROW);
    expect(profile.workAuthorization).not.toMatch(/sponsor|visa|authoriz/i);
    expect(SITE_CHROME_FALLBACK).not.toHaveProperty("workAuthorization");
  });
});

describe("published profile read", () => {
  it("returns the mapped profile for a published row", () => {
    const result = interpretPublishedSiteProfileResponse({
      error: null,
      data: HOSTED_PUBLISHED_ROW,
    });

    expect(result).toEqual({
      ok: true,
      profile: toPublicSiteProfile(HOSTED_PUBLISHED_ROW),
    });
  });
});

describe("missing profile behavior", () => {
  it("distinguishes a missing row from a query failure", () => {
    expect(
      interpretPublishedSiteProfileResponse({ error: null, data: null }),
    ).toEqual({ ok: true, profile: null });
  });

  it("treats an unpublished row as missing, not a transport error", () => {
    expect(
      interpretPublishedSiteProfileResponse({
        error: null,
        data: { ...HOSTED_PUBLISHED_ROW, status: "draft" },
      }),
    ).toEqual({ ok: true, profile: null });
  });
});

describe("query failure behavior", () => {
  it("returns ok:false for a transport or query error", () => {
    expect(
      interpretPublishedSiteProfileResponse({
        error: { message: "network" },
        data: HOSTED_PUBLISHED_ROW,
      }),
    ).toEqual({ ok: false });
  });

  it("does not fall back to hosted or static career copy on failure", () => {
    const result = interpretPublishedSiteProfileResponse({
      error: { message: "network" },
      data: HOSTED_PUBLISHED_ROW,
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("expected query failure");
    }
  });
});

describe("public contact rendering from hosted profile", () => {
  it("exposes hosted email and LinkedIn when a profile is present", () => {
    const profile = toPublicSiteProfile(HOSTED_PUBLISHED_ROW);

    expect(selectPublicContactChannels(profile)).toEqual({
      email: "milanesram@gmail.com",
      mailtoHref: "mailto:milanesram@gmail.com",
      linkedinUrl: "https://www.linkedin.com/in/milanesram/",
      linkedinLabel: "linkedin.com/in/milanesram",
    });
  });

  it("omits contact channels when the published profile is missing", () => {
    expect(selectPublicContactChannels(null)).toBeNull();
  });
});

describe("public footer and shared chrome", () => {
  it("renders hosted identity and contact on the footer", () => {
    const profile = toPublicSiteProfile(HOSTED_PUBLISHED_ROW);
    const footer = selectFooterIdentity(profile);

    expect(footer.displayName).toBe("Rainier (Ram) Milanes");
    expect(footer.headline).toBe(
      "Cybersecurity, GRC, IT risk, data privacy, and AI governance practitioner.",
    );
    expect(footer.workAuthorization).toBeNull();
    expect(footer.contact?.email).toBe("milanesram@gmail.com");
  });

  it("uses structural chrome only when the profile is unavailable", () => {
    const footer = selectFooterIdentity(null);
    const header = selectHeaderIdentity(null);

    expect(header.displayName).toBe(SITE_CHROME_FALLBACK.displayName);
    expect(header.href).toBe("/");
    expect(footer.displayName).toBe(SITE_CHROME_FALLBACK.displayName);
    expect(footer.headline).toBeNull();
    expect(footer.contact).toBeNull();
    expect(footer.displayName).not.toBe("Rainier (Ram) Milanes");
    expect(footer.headline).not.toBe(
      "Cybersecurity, GRC, IT risk, data privacy, and AI governance practitioner.",
    );
  });

  it("uses the hosted display name as the header Home brand", () => {
    expect(selectHeaderIdentity(toPublicSiteProfile(HOSTED_PUBLISHED_ROW))).toEqual({
      displayName: "Rainier (Ram) Milanes",
      href: "/",
    });
  });

  it("does not keep a separate hardcoded header name", () => {
    const header = selectHeaderIdentity(toPublicSiteProfile(HOSTED_PUBLISHED_ROW));
    expect(header.displayName).not.toBe("Ram Milanes");
    expect(header.href).toBe("/");
  });
});
