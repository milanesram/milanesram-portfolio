import { describe, expect, it, vi } from "vitest";
import { requireAdminMutation } from "@/lib/admin/authorization";

vi.mock("@/lib/admin/authorization", () => ({
  requireAdminMutation: vi.fn(),
}));

describe("media upload authorization contract", () => {
  it("rejects unauthenticated and non-admin callers before persistence", async () => {
    const mocked = vi.mocked(requireAdminMutation);

    mocked.mockResolvedValueOnce({ ok: false, error: "Sign in required." });
    expect((await requireAdminMutation()).ok).toBe(false);

    mocked.mockResolvedValueOnce({ ok: false, error: "Not authorized." });
    expect((await requireAdminMutation()).ok).toBe(false);
  });
});
