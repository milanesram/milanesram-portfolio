import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ADMIN_CHALLENGE_PATH,
  ADMIN_ENROLL_PATH,
  ADMIN_HOME_PATH,
  ADMIN_LOGIN_PATH,
  acceptAuthenticatorCode,
  adminGate,
  adminRedirectFor,
  enrollmentPlan,
  MFA_CODE_REJECTED,
  safeAdminNext,
  verifiedTotpFactorId,
} from "./mfa-policy";

const root = resolve(import.meta.dirname, "../../..");

function source(path: string): string {
  return readFileSync(resolve(root, path), "utf8");
}

const totp = (id: string, status: "verified" | "unverified") => ({
  id,
  factor_type: "totp",
  status,
});

describe("admin MFA routing", () => {
  it("sends an anonymous session to login", () => {
    expect(
      adminGate({
        signedIn: false,
        isAdmin: false,
        factors: [],
        currentLevel: null,
      }),
    ).toBe("anonymous");
    expect(adminRedirectFor("anonymous", "/admin")).toBe(ADMIN_LOGIN_PATH);
    expect(adminRedirectFor("anonymous", "/admin/resume-requests")).toBe(
      ADMIN_LOGIN_PATH,
    );
  });

  it("sends a password-authenticated admin with no verified factor to enrollment", () => {
    expect(
      adminGate({
        signedIn: true,
        isAdmin: true,
        factors: [],
        currentLevel: "aal1",
      }),
    ).toBe("enroll");
    expect(adminRedirectFor("enroll", "/admin/resume-requests")).toBe(
      ADMIN_ENROLL_PATH,
    );
  });

  it("sends an admin with a verified factor and AAL1 to the challenge", () => {
    expect(
      adminGate({
        signedIn: true,
        isAdmin: true,
        factors: [totp("factor-1", "verified")],
        currentLevel: "aal1",
      }),
    ).toBe("challenge");
    expect(adminRedirectFor("challenge", "/admin/resume-requests")).toBe(
      `${ADMIN_CHALLENGE_PATH}?next=${encodeURIComponent("/admin/resume-requests")}`,
    );
  });

  it("allows an AAL2 admin into admin destinations", () => {
    expect(
      adminGate({
        signedIn: true,
        isAdmin: true,
        factors: [totp("factor-1", "verified")],
        currentLevel: "aal2",
      }),
    ).toBe("ready");
    expect(adminRedirectFor("ready", "/admin")).toBe(ADMIN_HOME_PATH);
    expect(adminRedirectFor("ready", "/admin/resume-requests")).toBe(
      "/admin/resume-requests",
    );
  });

  it("denies a signed-in account that is not an administrator", () => {
    expect(
      adminGate({
        signedIn: true,
        isAdmin: false,
        factors: [totp("factor-1", "verified")],
        currentLevel: "aal2",
      }),
    ).toBe("denied");
    expect(adminRedirectFor("denied", "/admin")).toBe(ADMIN_LOGIN_PATH);
  });

  it("stops when more than one verified factor or a non-TOTP factor is present", () => {
    expect(
      adminGate({
        signedIn: true,
        isAdmin: true,
        factors: [totp("a", "verified"), totp("b", "verified")],
        currentLevel: "aal2",
      }),
    ).toBe("blocked");
    expect(
      adminGate({
        signedIn: true,
        isAdmin: true,
        factors: [{ id: "phone", factor_type: "phone", status: "verified" }],
        currentLevel: "aal1",
      }),
    ).toBe("blocked");
  });
});

describe("admin MFA enrollment plan", () => {
  it("does not enroll when the route is only classifying factors", () => {
    const page = source("src/app/admin/mfa/enroll/page.tsx");

    expect(page).not.toContain("mfa.enroll");
    expect(page).not.toContain("console.");
  });

  it("replaces interrupted unverified factors before one new enrollment", () => {
    expect(
      enrollmentPlan([
        totp("old-a", "unverified"),
        totp("old-b", "unverified"),
      ]),
    ).toEqual({ action: "enroll", removeIds: ["old-a", "old-b"] });

    const actions = source("src/app/admin/mfa/actions.ts");

    expect(actions.indexOf("mfa.unenroll")).toBeGreaterThan(-1);
    expect(actions.indexOf("mfa.unenroll")).toBeLessThan(
      actions.indexOf("mfa.enroll"),
    );
    expect(actions).not.toContain("console.");
    expect(actions).not.toContain("SUPABASE_SERVICE_ROLE");
  });

  it("does not remove a verified factor from the enrollment plan", () => {
    expect(enrollmentPlan([totp("keep", "verified")])).toEqual({
      action: "challenge",
    });
  });

  it("rejects an authenticator code that is not six digits", () => {
    expect(acceptAuthenticatorCode("12345")).toBeNull();
    expect(acceptAuthenticatorCode("1234567")).toBeNull();
    expect(acceptAuthenticatorCode("12 456")).toBeNull();
    expect(acceptAuthenticatorCode("abcdef")).toBeNull();
    expect(acceptAuthenticatorCode("123456")).toBe("123456");
    expect(MFA_CODE_REJECTED).not.toContain("123456");
  });

  it("selects the single verified TOTP factor for a challenge", () => {
    expect(verifiedTotpFactorId([totp("factor-1", "verified")])).toBe(
      "factor-1",
    );
    expect(verifiedTotpFactorId([])).toBeNull();
    expect(
      verifiedTotpFactorId([totp("a", "verified"), totp("b", "verified")]),
    ).toBeNull();
  });
});

describe("admin return paths", () => {
  it("keeps a safe internal admin path", () => {
    expect(safeAdminNext("/admin/resume-requests")).toBe(
      "/admin/resume-requests",
    );
    expect(safeAdminNext("/admin")).toBe("/admin");
  });

  it("rejects external and non-admin targets", () => {
    expect(safeAdminNext("https://evil.example/admin")).toBe(ADMIN_HOME_PATH);
    expect(safeAdminNext("//evil.example")).toBe(ADMIN_HOME_PATH);
    expect(safeAdminNext("javascript:alert(1)")).toBe(ADMIN_HOME_PATH);
    expect(safeAdminNext("/admin/../secret")).toBe(ADMIN_HOME_PATH);
    expect(safeAdminNext("/resume")).toBe(ADMIN_HOME_PATH);
    expect(safeAdminNext("/admin/login")).toBe(ADMIN_HOME_PATH);
    expect(safeAdminNext("/admin/mfa/enroll")).toBe(ADMIN_HOME_PATH);
  });
});

describe("admin MFA does not replace the existing sign-out path", () => {
  it("keeps sign-out on the admin actions module", () => {
    expect(source("src/app/admin/actions.ts")).toContain("auth.signOut");
  });
});
