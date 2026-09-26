import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  ADMIN_LOGIN_PATH,
  adminGate,
  adminRedirectFor,
  type AdminFactor,
  type AdminGate,
} from "./mfa-policy";

export type AdminContext = {
  signedIn: boolean;
  email: string | null;
  isAdmin: boolean;
  gate: AdminGate;
  redirectTo: string;
};

export type AdminClient = SupabaseClient<Database>;

async function requestedAdminPath(): Promise<string | null> {
  try {
    const headerStore = await headers();
    return headerStore.get("x-pathname");
  } catch {
    return null;
  }
}

export async function getAdminContext(): Promise<AdminContext> {
  const nextPath = await requestedAdminPath();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      signedIn: false,
      email: null,
      isAdmin: false,
      gate: "anonymous",
      redirectTo: adminRedirectFor("anonymous", nextPath),
    };
  }

  const email = data.user.email ?? null;
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  const admin = adminError == null && isAdmin === true;

  if (!admin) {
    return {
      signedIn: true,
      email,
      isAdmin: false,
      gate: "denied",
      redirectTo: adminRedirectFor("denied", nextPath),
    };
  }

  const [factors, assurance] = await Promise.all([
    supabase.auth.mfa.listFactors(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);

  if (factors.error || assurance.error || !factors.data || !assurance.data) {
    return {
      signedIn: true,
      email,
      isAdmin: true,
      gate: "blocked",
      redirectTo: adminRedirectFor("blocked", nextPath),
    };
  }

  const gate = adminGate({
    signedIn: true,
    isAdmin: true,
    factors: factors.data.all as AdminFactor[],
    currentLevel: assurance.data.currentLevel,
  });

  return {
    signedIn: true,
    email,
    isAdmin: true,
    gate,
    redirectTo: adminRedirectFor(gate, nextPath),
  };
}

export async function requireAdminPage(): Promise<{ email: string | null }> {
  const context = await getAdminContext();

  if (context.gate !== "ready") {
    redirect(context.redirectTo);
  }

  return { email: context.email };
}

export async function requireAdminMutation(): Promise<
  { ok: true; supabase: AdminClient } | { ok: false; error: string; redirectTo: string }
> {
  const context = await getAdminContext();

  if (context.gate !== "ready") {
    return {
      ok: false,
      error: context.gate === "anonymous" ? "Sign in required." : "Not authorized.",
      redirectTo: context.redirectTo,
    };
  }

  return { ok: true, supabase: await createSupabaseServerClient() };
}

export function loginRedirectFor(context: AdminContext): string | null {
  if (
    context.gate === "ready" ||
    context.gate === "enroll" ||
    context.gate === "challenge" ||
    context.gate === "blocked"
  ) {
    return context.redirectTo;
  }

  return null;
}

export { ADMIN_LOGIN_PATH };
