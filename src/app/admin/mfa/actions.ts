"use server";

import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin/authorization";
import {
  acceptAuthenticatorCode,
  ADMIN_CHALLENGE_PATH,
  ADMIN_HOME_PATH,
  enrollmentPlan,
  MFA_CODE_REJECTED,
  MFA_UNAVAILABLE,
  safeAdminNext,
  verifiedTotpFactorId,
  type AdminFactor,
} from "@/lib/admin/mfa-policy";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MfaEnrollState = {
  error: string | null;
  factorId: string | null;
  qrCode: string | null;
  secret: string | null;
};

export type MfaChallengeState = {
  error: string | null;
};

const EMPTY_ENROLL: MfaEnrollState = {
  error: null,
  factorId: null,
  qrCode: null,
  secret: null,
};

async function listFactors(): Promise<AdminFactor[] | null> {
  const supabase = await createSupabaseServerClient();
  const listed = await supabase.auth.mfa.listFactors();

  if (listed.error || !listed.data) {
    return null;
  }

  return listed.data.all as AdminFactor[];
}

export async function enrollMfaAction(
  previous: MfaEnrollState,
  formData: FormData,
): Promise<MfaEnrollState> {
  const context = await getAdminContext();

  if (context.gate === "anonymous" || context.gate === "denied") {
    redirect(context.redirectTo);
  }

  if (context.gate === "ready") {
    redirect(ADMIN_HOME_PATH);
  }

  if (context.gate === "challenge") {
    redirect(ADMIN_CHALLENGE_PATH);
  }

  if (context.gate === "blocked") {
    return { ...EMPTY_ENROLL, error: MFA_UNAVAILABLE };
  }

  const intent = formData.get("intent");
  const supabase = await createSupabaseServerClient();

  if (intent === "verify") {
    const code = acceptAuthenticatorCode(formData.get("code"));
    const factorId = formData.get("factorId");

    if (!code || typeof factorId !== "string" || factorId.length === 0) {
      return {
        ...previous,
        error: MFA_CODE_REJECTED,
      };
    }

    const verified = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });

    if (verified.error) {
      return {
        ...previous,
        error: MFA_CODE_REJECTED,
      };
    }

    const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (assurance.error || assurance.data?.currentLevel !== "aal2") {
      return { ...EMPTY_ENROLL, error: MFA_UNAVAILABLE };
    }

    redirect(ADMIN_HOME_PATH);
  }

  const factors = await listFactors();

  if (!factors) {
    return { ...EMPTY_ENROLL, error: MFA_UNAVAILABLE };
  }

  const plan = enrollmentPlan(factors);

  if (plan.action === "blocked") {
    return { ...EMPTY_ENROLL, error: MFA_UNAVAILABLE };
  }

  if (plan.action === "challenge") {
    redirect(ADMIN_CHALLENGE_PATH);
  }

  if (plan.action !== "enroll") {
    return { ...EMPTY_ENROLL, error: MFA_UNAVAILABLE };
  }

  for (const factorId of plan.removeIds) {
    const removed = await supabase.auth.mfa.unenroll({ factorId });

    if (removed.error) {
      return { ...EMPTY_ENROLL, error: MFA_UNAVAILABLE };
    }
  }

  const enrolled = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Portfolio admin",
    issuer: "milanesram.com",
  });

  if (enrolled.error || enrolled.data.type !== "totp") {
    return { ...EMPTY_ENROLL, error: MFA_UNAVAILABLE };
  }

  return {
    error: null,
    factorId: enrolled.data.id,
    qrCode: enrolled.data.totp.qr_code,
    secret: enrolled.data.totp.secret,
  };
}

export async function challengeMfaAction(
  _previous: MfaChallengeState,
  formData: FormData,
): Promise<MfaChallengeState> {
  const context = await getAdminContext();

  if (context.gate !== "challenge") {
    redirect(context.redirectTo);
  }

  const code = acceptAuthenticatorCode(formData.get("code"));
  const factors = await listFactors();
  const factorId = factors ? verifiedTotpFactorId(factors) : null;

  if (!code || !factorId) {
    return { error: MFA_CODE_REJECTED };
  }

  const supabase = await createSupabaseServerClient();
  const verified = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code,
  });

  if (verified.error) {
    return { error: MFA_CODE_REJECTED };
  }

  const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (assurance.error || assurance.data?.currentLevel !== "aal2") {
    return { error: MFA_UNAVAILABLE };
  }

  redirect(safeAdminNext(formData.get("next")));
}
