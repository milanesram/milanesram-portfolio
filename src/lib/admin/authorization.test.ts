import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminContext, requireAdminMutation } from "./authorization";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: () => "/admin/resume-requests",
  })),
}));

type Factor = { id: string; factor_type: string; status: string };

function mockClient(input: {
  user?: boolean;
  admin?: boolean;
  factors?: Factor[];
  level?: string | null;
  factorError?: boolean;
}) {
  const factors = input.factors ?? [];
  const verifiedTotp = factors.filter(
    (factor) => factor.factor_type === "totp" && factor.status === "verified",
  );

  vi.mocked(createSupabaseServerClient).mockResolvedValue({
    auth: {
      getUser: async () =>
        input.user === false
          ? { data: { user: null }, error: { message: "missing" } }
          : { data: { user: { email: "owner@example.com" } }, error: null },
      mfa: {
        listFactors: async () =>
          input.factorError
            ? { data: null, error: { message: "unavailable" } }
            : {
                data: { all: factors, totp: verifiedTotp, phone: [], webauthn: [] },
                error: null,
              },
        getAuthenticatorAssuranceLevel: async () => ({
          data: {
            currentLevel: input.level ?? "aal1",
            nextLevel: verifiedTotp.length > 0 ? "aal2" : "aal1",
            currentAuthenticationMethods: [],
          },
          error: null,
        }),
      },
    },
    rpc: async () => ({ data: input.admin !== false, error: null }),
  } as never);
}

describe("admin mutation assurance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies an anonymous admin API caller", async () => {
    mockClient({ user: false });

    const result = await requireAdminMutation();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.redirectTo).toBe("/admin/login");
    }
  });

  it("denies an AAL1 administrator after a verified factor exists", async () => {
    mockClient({
      factors: [{ id: "factor-1", factor_type: "totp", status: "verified" }],
      level: "aal1",
    });

    const result = await requireAdminMutation();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.redirectTo).toContain("/admin/mfa/challenge");
      expect(result.redirectTo).toContain("resume-requests");
    }
  });

  it("allows an AAL2 administrator", async () => {
    mockClient({
      factors: [{ id: "factor-1", factor_type: "totp", status: "verified" }],
      level: "aal2",
    });

    const result = await requireAdminMutation();

    expect(result.ok).toBe(true);
  });

  it("still requires the administrator role at AAL2", async () => {
    mockClient({
      admin: false,
      factors: [{ id: "factor-1", factor_type: "totp", status: "verified" }],
      level: "aal2",
    });

    expect((await getAdminContext()).gate).toBe("denied");
    expect((await requireAdminMutation()).ok).toBe(false);
  });

  it("routes a password-only administrator to enrollment", async () => {
    mockClient({ factors: [], level: "aal1" });

    const context = await getAdminContext();

    expect(context.gate).toBe("enroll");
    expect(context.redirectTo).toBe("/admin/mfa/enroll");
  });
});
