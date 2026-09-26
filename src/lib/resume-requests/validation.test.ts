import { describe, expect, it } from "vitest";
import {
  parseResumeRequestQuery,
  resumeRequestChoiceForSlug,
  resumeRequestHref,
} from "./choices";
import { classifyResumeRequestFailure } from "./errors";
import { isAllowedResumeRequestOrigin } from "./origin";
import {
  parsePublicResumeRequest,
  resumeRequestFieldMessage,
} from "./validation";

const validBody = {
  fullName: "  Portfolio   UAT Recruiter  ",
  email: " UAT.Recruiter@Example.com ",
  organization: "  Portfolio   UAT ",
  resumeChoice: "grc_it_risk",
  message: "  Synthetic test.  ",
};

describe("resume request validation", () => {
  it("accepts a minimal professional request and normalizes whitespace", () => {
    const parsed = parsePublicResumeRequest(validBody);

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value).toEqual({
      fullName: "Portfolio UAT Recruiter",
      email: "uat.recruiter@example.com",
      organization: "Portfolio UAT",
      resumeChoice: "grc_it_risk",
      message: "Synthetic test.",
    });
  });

  it("accepts a common mail provider and an empty optional message", () => {
    const parsed = parsePublicResumeRequest({
      ...validBody,
      email: "recruiter@gmail.com",
      message: "   ",
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.email).toBe("recruiter@gmail.com");
    expect(parsed.value.message).toBeNull();
  });

  it("rejects a blank name", () => {
    const parsed = parsePublicResumeRequest({ ...validBody, fullName: "  " });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.fields.fullName).toBe("required");
  });

  it("rejects a one-character name", () => {
    const parsed = parsePublicResumeRequest({ ...validBody, fullName: "A" });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.fields.fullName).toBe("invalid");
  });

  it("rejects a blank email", () => {
    const parsed = parsePublicResumeRequest({ ...validBody, email: " " });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.fields.email).toBe("required");
    expect(resumeRequestFieldMessage("email", "required")).toContain("professional email");
  });

  it("rejects an invalid email without requiring a corporate domain", () => {
    const parsed = parsePublicResumeRequest({
      ...validBody,
      email: "not-an-email",
    });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.fields.email).toBe("invalid");
  });

  it("rejects a blank organization", () => {
    const parsed = parsePublicResumeRequest({ ...validBody, organization: "" });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.fields.organization).toBe("required");
  });

  it("rejects an invalid resume option", () => {
    const parsed = parsePublicResumeRequest({
      ...validBody,
      resumeChoice: "Resume A — GRC, IT Risk & Security Compliance",
    });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.fields.resumeChoice).toBe("invalid");
  });

  it("rejects a message over 1,500 characters", () => {
    const parsed = parsePublicResumeRequest({
      ...validBody,
      message: "a".repeat(1501),
    });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.fields.message).toBe("too_long");
  });

  it("accepts a 1,500 character message", () => {
    const parsed = parsePublicResumeRequest({
      ...validBody,
      message: "a".repeat(1500),
    });
    expect(parsed.ok).toBe(true);
  });
});

describe("resume request query preselection", () => {
  it("honors a valid request query", () => {
    expect(parseResumeRequestQuery("grc_it_risk")).toBe("grc_it_risk");
    expect(parseResumeRequestQuery("privacy_compliance")).toBe(
      "privacy_compliance",
    );
    expect(parseResumeRequestQuery(["not_sure"])).toBe("not_sure");
  });

  it("falls back when the query is missing or invalid", () => {
    expect(parseResumeRequestQuery(undefined)).toBe("not_sure");
    expect(parseResumeRequestQuery("public_file")).toBe("not_sure");
    expect(parseResumeRequestQuery("")).toBe("not_sure");
  });

  it("maps the two stable slugs to request links", () => {
    expect(resumeRequestChoiceForSlug("cybersecurity-grc")).toBe("grc_it_risk");
    expect(resumeRequestHref("cybersecurity-grc")).toBe(
      "/contact?request=grc_it_risk",
    );
    expect(resumeRequestChoiceForSlug("privacy-ai-governance")).toBe(
      "privacy_compliance",
    );
    expect(resumeRequestHref("privacy-ai-governance")).toBe(
      "/contact?request=privacy_compliance",
    );
    expect(resumeRequestHref("technology-risk")).toBe(
      "/contact?request=not_sure",
    );
  });
});

describe("resume request failure classification", () => {
  it("classifies duplicate, rate limit, and invalid database results", () => {
    expect(classifyResumeRequestFailure("duplicate_request", "P0001")).toBe(
      "duplicate",
    );
    expect(classifyResumeRequestFailure("rate_limited", "P0001")).toBe(
      "rate_limited",
    );
    expect(classifyResumeRequestFailure("invalid_input", "22023")).toBe(
      "invalid",
    );
    expect(classifyResumeRequestFailure("connection reset")).toBe("unavailable");
  });
});

describe("resume request origin check", () => {
  it("allows the canonical site and the deployment origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://milanesram.com";
    const request = new Request("https://preview.example/api/resume-request", {
      headers: { origin: "https://preview.example" },
    });
    expect(isAllowedResumeRequestOrigin(request)).toBe(true);
  });

  it("rejects an unrelated origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://milanesram.com";
    delete process.env.VERCEL_URL;
    const request = new Request("https://milanesram.com/api/resume-request", {
      headers: { origin: "https://evil.example" },
    });
    expect(isAllowedResumeRequestOrigin(request)).toBe(false);
  });
});
