import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();

vi.mock("@/lib/supabase/privileged", () => ({
  createPrivilegedSupabaseClient: () => ({
    rpc,
  }),
}));

import { submitPublicResumeRequest } from "./submit";

const input = {
  fullName: "Portfolio UAT Recruiter",
  email: "uat.recruiter@example.com",
  organization: "Portfolio UAT",
  resumeChoice: "grc_it_risk" as const,
  message: "Synthetic production-readiness test. No response required.",
};

describe("resume request storage", () => {
  beforeEach(() => {
    rpc.mockReset();
  });

  it("stores a valid request through the privileged RPC", async () => {
    rpc.mockResolvedValue({ error: null });

    const result = await submitPublicResumeRequest(input, "a".repeat(64), "b".repeat(64));

    expect(result).toEqual({ ok: true });
    expect(rpc).toHaveBeenCalledWith("submit_public_resume_request", {
      p_full_name: input.fullName,
      p_email: input.email,
      p_organization: input.organization,
      p_resume_choice: "grc_it_risk",
      p_message: input.message,
      p_fingerprint_hash: "a".repeat(64),
      p_email_hash: "b".repeat(64),
    });
  });

  it("treats a short-window duplicate as success without a second error", async () => {
    rpc.mockResolvedValue({
      error: { message: "duplicate_request", code: "P0001" },
    });

    await expect(
      submitPublicResumeRequest(input, "a".repeat(64), "b".repeat(64)),
    ).resolves.toEqual({ ok: true });
  });

  it("returns a generic rate-limit result", async () => {
    rpc.mockResolvedValue({
      error: { message: "rate_limited", code: "P0001" },
    });

    await expect(
      submitPublicResumeRequest(input, "a".repeat(64), "b".repeat(64)),
    ).resolves.toEqual({ ok: false, kind: "rate_limited" });
  });

  it("hides database failures", async () => {
    rpc.mockResolvedValue({
      error: { message: "relation resume_requests does not exist", code: "42P01" },
    });

    await expect(
      submitPublicResumeRequest(input, "a".repeat(64), "b".repeat(64)),
    ).resolves.toEqual({ ok: false, kind: "unavailable" });
  });
});
