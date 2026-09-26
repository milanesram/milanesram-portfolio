export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_HOME_PATH = "/admin";
export const ADMIN_ENROLL_PATH = "/admin/mfa/enroll";
export const ADMIN_CHALLENGE_PATH = "/admin/mfa/challenge";

export const MFA_CODE_REJECTED = "That code was not accepted.";
export const MFA_UNAVAILABLE = "Sign-in could not be completed. Try again.";

export type AdminFactor = {
  id: string;
  factor_type: string;
  status: string;
};

export type AdminGate =
  | "anonymous"
  | "denied"
  | "enroll"
  | "challenge"
  | "ready"
  | "blocked";

export function acceptAuthenticatorCode(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const code = value.trim();

  if (!/^[0-9]{6}$/.test(code)) {
    return null;
  }

  return code;
}

export function safeAdminNext(value: unknown): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 200) {
    return ADMIN_HOME_PATH;
  }

  let path = value;

  try {
    path = decodeURIComponent(value);
  } catch {
    return ADMIN_HOME_PATH;
  }

  if (path !== value && /%[0-9a-f]/i.test(path)) {
    return ADMIN_HOME_PATH;
  }

  if (!path.startsWith("/admin")) {
    return ADMIN_HOME_PATH;
  }

  if (
    path.startsWith("//") ||
    path.startsWith("/\\") ||
    path.includes("\\") ||
    path.includes("://") ||
    path.includes("..") ||
    /[\u0000-\u001f\u007f]/.test(path)
  ) {
    return ADMIN_HOME_PATH;
  }

  const pathname = path.split("#")[0]?.split("?")[0] ?? "";

  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) {
    return ADMIN_HOME_PATH;
  }

  if (
    pathname === ADMIN_LOGIN_PATH ||
    pathname.startsWith(`${ADMIN_LOGIN_PATH}/`) ||
    pathname === ADMIN_ENROLL_PATH ||
    pathname.startsWith(`${ADMIN_ENROLL_PATH}/`) ||
    pathname === ADMIN_CHALLENGE_PATH ||
    pathname.startsWith(`${ADMIN_CHALLENGE_PATH}/`)
  ) {
    return ADMIN_HOME_PATH;
  }

  return pathname;
}

export function adminGate(input: {
  signedIn: boolean;
  isAdmin: boolean;
  factors: AdminFactor[];
  currentLevel: string | null;
}): AdminGate {
  if (!input.signedIn) {
    return "anonymous";
  }

  if (!input.isAdmin) {
    return "denied";
  }

  const verified = input.factors.filter((factor) => factor.status === "verified");
  const verifiedTotp = verified.filter((factor) => factor.factor_type === "totp");
  const verifiedOther = verified.filter((factor) => factor.factor_type !== "totp");

  if (verifiedTotp.length > 1 || verifiedOther.length > 0) {
    return "blocked";
  }

  if (verifiedTotp.length === 0) {
    return "enroll";
  }

  if (input.currentLevel !== "aal2") {
    return "challenge";
  }

  return "ready";
}

export function enrollmentPlan(factors: AdminFactor[]):
  | { action: "enroll"; removeIds: string[] }
  | { action: "challenge" | "blocked" } {
  const gate = adminGate({
    signedIn: true,
    isAdmin: true,
    factors,
    currentLevel: "aal1",
  });

  if (gate === "blocked") {
    return { action: "blocked" };
  }

  if (gate === "challenge") {
    return { action: "challenge" };
  }

  return {
    action: "enroll",
    removeIds: factors
      .filter((factor) => factor.status === "unverified")
      .map((factor) => factor.id),
  };
}

export function verifiedTotpFactorId(factors: AdminFactor[]): string | null {
  const gate = adminGate({
    signedIn: true,
    isAdmin: true,
    factors,
    currentLevel: "aal1",
  });

  if (gate !== "challenge") {
    return null;
  }

  const match = factors.find(
    (factor) => factor.status === "verified" && factor.factor_type === "totp",
  );

  return match?.id ?? null;
}

export function adminRedirectFor(
  gate: AdminGate,
  nextPath: string | null,
): string {
  const next = safeAdminNext(nextPath);

  if (gate === "ready") {
    return next;
  }

  if (gate === "enroll") {
    return ADMIN_ENROLL_PATH;
  }

  if (gate === "challenge") {
    if (next === ADMIN_HOME_PATH) {
      return ADMIN_CHALLENGE_PATH;
    }

    return `${ADMIN_CHALLENGE_PATH}?next=${encodeURIComponent(next)}`;
  }

  if (gate === "blocked") {
    return ADMIN_CHALLENGE_PATH;
  }

  return ADMIN_LOGIN_PATH;
}
