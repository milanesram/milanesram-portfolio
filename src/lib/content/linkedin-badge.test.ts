import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  LINKEDIN_BADGE_PROFILE_HREF,
  LINKEDIN_BADGE_SCRIPT_SRC,
  LINKEDIN_PROFILE_VANITY,
} from "./linkedin-badge";

const CONTACT_PAGE_SOURCE = readFileSync(
  resolve(import.meta.dirname, "../../app/contact/page.tsx"),
  "utf8",
);
const ROOT_LAYOUT_SOURCE = readFileSync(
  resolve(import.meta.dirname, "../../app/layout.tsx"),
  "utf8",
);
const BADGE_SOURCE = readFileSync(
  resolve(
    import.meta.dirname,
    "../../components/contact/LinkedInProfileBadge.tsx",
  ),
  "utf8",
);

describe("LinkedIn public profile badge", () => {
  it("targets the official vanity, badge href, and script origin", () => {
    expect(LINKEDIN_PROFILE_VANITY).toBe("milanesram");
    expect(LINKEDIN_BADGE_PROFILE_HREF).toBe(
      "https://www.linkedin.com/in/milanesram?trk=profile-badge",
    );
    expect(LINKEDIN_BADGE_SCRIPT_SRC).toBe(
      "https://platform.linkedin.com/badges/js/profile.js",
    );
  });

  it("is scoped to Contact and keeps the native LinkedIn channel link", () => {
    expect(CONTACT_PAGE_SOURCE).toContain("LinkedInProfileBadge");
    expect(CONTACT_PAGE_SOURCE).toContain("channels.linkedin");
    expect(CONTACT_PAGE_SOURCE).toContain("channel.href");
    expect(CONTACT_PAGE_SOURCE).toContain("channel.text");
    expect(ROOT_LAYOUT_SOURCE).not.toContain("platform.linkedin.com");
    expect(ROOT_LAYOUT_SOURCE).not.toContain("LinkedInProfileBadge");
  });

  it("loads the LinkedIn badge script once through next/script", () => {
    expect(BADGE_SOURCE).toContain('from "next/script"');
    expect(BADGE_SOURCE).toContain("src={LINKEDIN_BADGE_SCRIPT_SRC}");
    expect(BADGE_SOURCE).toContain('strategy="afterInteractive"');
    expect(BADGE_SOURCE.match(/next\/script/g)?.length).toBe(1);
  });
});
