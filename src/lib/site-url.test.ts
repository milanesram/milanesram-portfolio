import { afterEach, describe, expect, it } from "vitest";
import { CANONICAL_SITE_URL, getSiteUrl } from "./site-url";

const ORIGINAL = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  VERCEL_URL: process.env.VERCEL_URL,
};

afterEach(() => {
  if (ORIGINAL.NEXT_PUBLIC_SITE_URL === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL.NEXT_PUBLIC_SITE_URL;
  }

  if (ORIGINAL.VERCEL_URL === undefined) {
    delete process.env.VERCEL_URL;
  } else {
    process.env.VERCEL_URL = ORIGINAL.VERCEL_URL;
  }
});

describe("canonical site URL", () => {
  it("always uses the production hostname", () => {
    expect(CANONICAL_SITE_URL).toBe("https://milanesram.com");
    expect(getSiteUrl()).toBe("https://milanesram.com");
  });

  it("does not use a Vercel Preview hostname", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_URL =
      "rainier-portfolio-example.vercel.app";

    expect(getSiteUrl()).toBe("https://milanesram.com");
  });

  it("does not follow a Preview-assigned NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL =
      "https://rainier-portfolio-example.vercel.app";
    process.env.VERCEL_URL =
      "rainier-portfolio-g4aq9x49u-milanesrams-projects.vercel.app";

    expect(getSiteUrl()).toBe("https://milanesram.com");
  });
});
