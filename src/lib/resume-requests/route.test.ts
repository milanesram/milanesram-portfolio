import { beforeEach, describe, expect, it, vi } from "vitest";
import { issueContactFormToken } from "@/lib/contact/crypto";
import { submitPublicResumeRequest } from "@/lib/resume-requests/submit";
import { POST } from "@/app/api/resume-request/route";

vi.mock("@/lib/resume-requests/submit", () => ({
  submitPublicResumeRequest: vi.fn(),
}));

const mockedSubmit = vi.mocked(submitPublicResumeRequest);

function token() {
  return issueContactFormToken(Date.now() - 5_000);
}

function post(
  body: Record<string, unknown>,
  origin = "https://milanesram.com",
) {
  return POST(
    new Request("https://milanesram.com/api/resume-request", {
      method: "POST",
      headers: {
        origin,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    }),
  );
}

const valid = {
  fullName: "Portfolio UAT Recruiter",
  email: "uat.recruiter@example.com",
  organization: "Portfolio UAT",
  resumeChoice: "professional_cv",
  message: "Synthetic production-readiness test. No response required.",
};

describe("resume request route", () => {
  beforeEach(() => {
    process.env.CONTACT_RATE_LIMIT_SECRET = "resume-request-test-secret-value-32";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-not-a-real-key";
    process.env.NEXT_PUBLIC_SITE_URL = "https://milanesram.com";
    mockedSubmit.mockReset();
    mockedSubmit.mockResolvedValue({ ok: true });
  });

  it("accepts a valid request", async () => {
    const response = await post({ ...valid, token: token(), company_website: "" });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mockedSubmit).toHaveBeenCalledOnce();
  });

  it("rejects a honeypot submission before storage", async () => {
    const response = await post({
      ...valid,
      token: token(),
      company_website: "https://spam.example",
    });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "invalid" });
    expect(mockedSubmit).not.toHaveBeenCalled();
  });

  it("rejects an invalid email with a field error and no database text", async () => {
    const response = await post({
      ...valid,
      email: "not-an-email",
      token: token(),
    });
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body).toEqual({
      ok: false,
      error: "invalid",
      fields: { email: "invalid" },
    });
    expect(JSON.stringify(body)).not.toMatch(/stack|postgres|resume_requests/i);
    expect(mockedSubmit).not.toHaveBeenCalled();
  });

  it("rejects an invalid resume option", async () => {
    const response = await post({
      ...valid,
      resumeChoice: "executive",
      token: token(),
    });
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.fields.resumeChoice).toBe("invalid");
    expect(mockedSubmit).not.toHaveBeenCalled();
  });

  it("rejects a public resume lane that is no longer a request choice", async () => {
    const response = await post({
      ...valid,
      resumeChoice: "grc_it_risk",
      token: token(),
    });
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.fields.resumeChoice).toBe("invalid");
    expect(mockedSubmit).not.toHaveBeenCalled();
  });

  it("returns a generic failure when storage is unavailable", async () => {
    mockedSubmit.mockResolvedValue({ ok: false, kind: "unavailable" });
    const response = await post({ ...valid, token: token() });
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "unavailable",
    });
  });

  it("returns the rate-limit response without request details", async () => {
    mockedSubmit.mockResolvedValue({ ok: false, kind: "rate_limited" });
    const response = await post({ ...valid, token: token() });
    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "rate_limited",
    });
  });

  it("rejects a token that is too new", async () => {
    const response = await post({
      ...valid,
      token: issueContactFormToken(Date.now()),
    });
    expect(response.status).toBe(400);
    expect(mockedSubmit).not.toHaveBeenCalled();
  });
});
