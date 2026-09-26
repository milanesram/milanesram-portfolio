import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { requireAdminMutation } from "@/lib/admin/authorization";

vi.mock("@/lib/admin/authorization", () => ({
  requireAdminMutation: vi.fn(),
}));

describe("media upload authorization contract", () => {
  it("rejects unauthenticated and non-admin callers before persistence", async () => {
    const mocked = vi.mocked(requireAdminMutation);

    mocked.mockResolvedValueOnce({
      ok: false,
      error: "Sign in required.",
      redirectTo: "/admin/login",
    });
    expect((await requireAdminMutation()).ok).toBe(false);

    mocked.mockResolvedValueOnce({
      ok: false,
      error: "Not authorized.",
      redirectTo: "/admin/login",
    });
    expect((await requireAdminMutation()).ok).toBe(false);
  });

  it("keeps media upload behind the ready admin gate", () => {
    const root = resolve(import.meta.dirname, "../../../..");
    const actions = readFileSync(resolve(root, "src/app/admin/media/actions.ts"), "utf8");
    const authorization = readFileSync(
      resolve(root, "src/lib/admin/authorization.ts"),
      "utf8",
    );

    expect(actions.indexOf("requireAdminMutation")).toBeLessThan(
      actions.indexOf("arrayBuffer"),
    );
    expect(authorization).toContain('context.gate !== "ready"');
  });
});
