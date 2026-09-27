import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContactForm } from "@/components/contact/ContactForm";
import { InquiryUnavailable } from "@/components/contact/InquiryUnavailable";
import { ContactPageSections } from "@/components/contact/ContactPageSections";
import {
  inquiryFallbackSubject,
  isInquiryTrack,
  mailtoWithInquirySubject,
  parseInquiryLaneQuery,
} from "./inquiry-prefill";

describe("inquiry lane preselection", () => {
  it("maps the GRC lane query to the existing track value", () => {
    expect(parseInquiryLaneQuery("grc_it_risk")).toBe("cybersecurity_grc");
  });

  it("maps the privacy lane query to the existing track value", () => {
    expect(parseInquiryLaneQuery("privacy_compliance")).toBe("privacy_ai");
  });

  it("ignores an unknown query without copying it into the track", () => {
    const injected = "privacy_ai'><script>";
    const parsed = parseInquiryLaneQuery(injected);

    expect(parsed).toBe("either");
    expect(parsed).not.toBe(injected);
    expect(isInquiryTrack(parsed)).toBe(true);
  });

  it("defaults when the query is missing", () => {
    expect(parseInquiryLaneQuery(undefined)).toBe("either");
    expect(parseInquiryLaneQuery("")).toBe("either");
    expect(parseInquiryLaneQuery(["grc_it_risk", "privacy_compliance"])).toBe(
      "cybersecurity_grc",
    );
  });

  it("renders the current lane labels and the preselected value", () => {
    const html = renderToStaticMarkup(
      createElement(ContactForm, {
        token: "token",
        initialTrack: "privacy_ai",
      }),
    );

    expect(html).toContain("GRC, IT Risk &amp; Security Compliance");
    expect(html).toContain("Privacy, Compliance &amp; Assurance");
    expect(html).not.toContain("Cybersecurity / GRC");
    expect(html).not.toContain("Privacy / AI");
    expect(html).toContain('value="privacy_ai" selected=""');
    expect(html).not.toContain("privacy_ai'&gt;&lt;script&gt;");
  });

  it("builds a lane subject without putting the address or message in the query", () => {
    expect(inquiryFallbackSubject("cybersecurity_grc")).toBe(
      "Inquiry — GRC, IT Risk & Security Compliance",
    );
    expect(inquiryFallbackSubject("privacy_ai")).toBe(
      "Inquiry — Privacy, Compliance & Assurance",
    );
    expect(inquiryFallbackSubject("either")).toBeNull();

    const href = mailtoWithInquirySubject(
      "mailto:milanesram@gmail.com",
      "cybersecurity_grc",
    );
    expect(href.startsWith("mailto:milanesram@gmail.com?subject=")).toBe(true);
    expect(href).toContain(
      encodeURIComponent("Inquiry — GRC, IT Risk & Security Compliance"),
    );
    expect(href).not.toContain("body=");
    expect(mailtoWithInquirySubject("mailto:milanesram@gmail.com", "either")).toBe(
      "mailto:milanesram@gmail.com",
    );
  });
});

describe("contact hierarchy", () => {
  const channels = {
    email: {
      label: "Email",
      href: "mailto:milanesram@gmail.com",
      text: "milanesram@gmail.com",
      external: false,
    },
    linkedin: {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/milanesram",
      text: "linkedin.com/in/milanesram",
      external: true,
    },
  };

  it("renders direct contact, then inquiry, then the professional CV request", () => {
    const html = renderToStaticMarkup(
      createElement(ContactPageSections, {
        channels,
        inquiryToken: "inquiry-token",
        inquiryTrack: "cybersecurity_grc",
        cvToken: "cv-token",
        workAuthorization: "Authorized to work in the United States.",
      }),
    );
    const direct = html.indexOf('id="direct-contact-heading"');
    const inquiry = html.indexOf('id="send-inquiry-heading"');
    const cv = html.indexOf('id="cv-request-heading"');

    expect(direct).toBeGreaterThan(-1);
    expect(inquiry).toBeGreaterThan(direct);
    expect(cv).toBeGreaterThan(inquiry);
    expect(html).toContain("Prefer a direct conversation?");
    expect(html).toContain("mailto:milanesram@gmail.com");
    expect(html).toContain("https://www.linkedin.com/in/milanesram");
    expect(html).toContain("Request Professional CV");
    expect(html).toContain('value="cybersecurity_grc" selected=""');
    expect(html).toContain("Send inquiry");
    expect(html.indexOf("Authorized to work")).toBeGreaterThan(cv);
  });

  it("hides structured inquiry when intake is disabled", () => {
    const html = renderToStaticMarkup(
      createElement(ContactPageSections, {
        channels,
        inquiryToken: null,
        inquiryTrack: "privacy_ai",
        cvToken: "cv-token",
        workAuthorization: null,
      }),
    );

    expect(html).toContain("mailto:milanesram@gmail.com");
    expect(html).toContain("https://www.linkedin.com/in/milanesram");
    expect(html).not.toContain("temporarily unavailable");
    expect(html).not.toContain("Email about this inquiry");
    expect(html).not.toContain("subject=");
    expect(html).not.toContain('name="track"');
    expect(html).not.toContain("Send inquiry");
    expect(html).toContain('value="professional_cv"');
    expect(html).not.toContain('value="grc_it_risk"');
  });

  it("does not invent a lane for an unknown inquiry query", () => {
    const html = renderToStaticMarkup(
      createElement(InquiryUnavailable, {
        track: "either",
        emailHref: "mailto:milanesram@gmail.com",
      }),
    );

    expect(html).toContain("Structured inquiry is temporarily unavailable.");
    expect(html).not.toContain("Email about this inquiry");
    expect(html).not.toContain("subject=");
    expect(html).not.toContain("error");
  });

  it("renders the inquiry form for Lane A when a token exists", () => {
    const html = renderToStaticMarkup(
      createElement(ContactPageSections, {
        channels,
        inquiryToken: "inquiry-token",
        inquiryTrack: "privacy_ai",
        cvToken: null,
        workAuthorization: null,
      }),
    );

    expect(html).toContain('value="privacy_ai" selected=""');
    expect(html).toContain("Send inquiry");
    expect(html).toContain("Request Professional CV by Email");
    expect(html).toContain("mailto:milanesram@gmail.com");
    expect(html).not.toContain("temporarily unavailable");
    expect(html).not.toContain("professional CV request form");
  });
});
