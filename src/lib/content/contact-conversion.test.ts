import { createElement } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContactPageSections } from "@/components/contact/ContactPageSections";
import { ResumeCvRequest } from "@/components/resume/ResumeCvRequest";
import { ResumeTracks } from "@/components/resume/ResumeTracks";
import type { PublicResumeTrack } from "@/lib/content/resume-page";

const root = resolve(import.meta.dirname, "../../..");

function source(path: string): string {
  return readFileSync(resolve(root, path), "utf8");
}

const channels = {
  email: {
    label: "Email",
    href: "mailto:milanesram@gmail.com",
    text: "milanesram@gmail.com",
    external: false,
  },
  linkedin: {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/milanesram/",
    text: "linkedin.com/in/milanesram",
    external: true,
  },
};

function track(
  title: string,
  href: string,
  inquiryHref: string,
): PublicResumeTrack {
  return {
    id: title,
    slug: title.toLowerCase().replaceAll(" ", "-"),
    title,
    summary: `${title} summary`,
    href,
    ctaLabel: "Download Resume",
    deliveryMode: "public_file",
    media: {
      id: href,
      title,
      publicUrl: href,
      mimeType: "application/pdf",
    },
    unavailable: false,
    homeKicker: null,
    focusSlug: null,
    inquiryHref,
  };
}

describe("recruiter contact conversion", () => {
  it("shows email and LinkedIn without a disabled inquiry state", () => {
    const html = renderToStaticMarkup(
      createElement(ContactPageSections, {
        channels,
        inquiryToken: null,
        inquiryTrack: "privacy_ai",
        cvToken: null,
        workAuthorization: null,
      }),
    );

    expect(html).toContain("mailto:milanesram@gmail.com");
    expect(html).toContain("https://www.linkedin.com/in/milanesram/");
    expect(html).toContain("Request Professional CV by Email");
    expect(html).not.toContain("temporarily unavailable");
    expect(html).not.toContain("Send inquiry");
    expect(html).not.toContain("<form");
    expect(html).not.toContain("inquiry=");
    expect(html).not.toContain("subject=");
  });

  it("keeps résumé downloads direct and uses email for the secondary action", () => {
    const html = renderToStaticMarkup(
      createElement(ResumeTracks, {
        emailHref: "mailto:milanesram@gmail.com",
        tracks: [
          track(
            "Privacy, Compliance & Assurance",
            "https://example.test/privacy.pdf",
            "/contact?inquiry=privacy_compliance",
          ),
          track(
            "GRC, IT Risk & Security Compliance",
            "https://example.test/grc.pdf",
            "/contact?inquiry=grc_it_risk",
          ),
        ],
      }),
    );
    const privacy = html.indexOf("Privacy, Compliance &amp; Assurance");
    const grc = html.indexOf("GRC, IT Risk &amp; Security Compliance");

    expect(privacy).toBeGreaterThan(-1);
    expect(grc).toBeGreaterThan(privacy);
    expect(html).toContain("https://example.test/privacy.pdf");
    expect(html).toContain("https://example.test/grc.pdf");
    expect(html.match(/Email Me/g)).toHaveLength(2);
    expect(html.match(/mailto:milanesram@gmail.com/g)).toHaveLength(2);
    expect(html).not.toContain("Send Inquiry");
    expect(html).not.toContain("inquiry=");
    expect(html).not.toContain("/contact?");
  });

  it("requests the professional CV by email", () => {
    const html = renderToStaticMarkup(
      createElement(ResumeCvRequest, {
        mailtoHref: "mailto:milanesram@gmail.com",
      }),
    );

    expect(html).toContain("Request Professional CV by Email");
    expect(html).toContain('href="mailto:milanesram@gmail.com"');
    expect(html).not.toContain("/contact");
    expect(renderToStaticMarkup(createElement(ResumeCvRequest, { mailtoHref: null }))).toBe("");
  });

  it("does not point shared recruiter actions at the paused inquiry workflow", () => {
    const surfaces = [
      "src/components/resume/ResumeTracks.tsx",
      "src/components/resume/ResumeCvRequest.tsx",
      "src/components/contact/ContactPageSections.tsx",
      "src/components/layout/SiteFooter.tsx",
      "src/components/ui/CallToAction.tsx",
      "src/components/focus/FocusView.tsx",
    ].map(source);

    for (const surface of surfaces) {
      expect(surface).not.toContain("?inquiry=");
      expect(surface).not.toContain("Structured inquiry");
    }

    expect(source("src/components/resume/ResumeTracks.tsx")).toContain("EMAIL_ME_CTA_LABEL");
    expect(source("src/lib/content/resume-page.ts")).toContain('export const EMAIL_ME_CTA_LABEL = "Email Me"');
    expect(source("src/components/layout/SiteFooter.tsx")).toContain("mailtoHref");
    expect(source("src/components/ui/CallToAction.tsx")).toContain('href="/contact"');
    expect(source("src/components/ui/CallToAction.tsx")).toContain("mailtoHref");
    expect(source("src/app/contact/page.tsx")).toContain("parseInquiryLaneQuery");
  });
});
