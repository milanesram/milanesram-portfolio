import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContactForm } from "@/components/contact/ContactForm";
import {
  isInquiryTrack,
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
});
