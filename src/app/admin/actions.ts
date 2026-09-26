"use server";

import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin/authorization";
import { parseLoginFormData } from "@/lib/admin/login-input";
import { adminRedirectFor, safeAdminNext } from "@/lib/admin/mfa-policy";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState = {
  error: string | null;
};

const GENERIC_AUTH_ERROR = "Invalid email or password.";

export async function signInAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = parseLoginFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password,
  });

  if (error) {
    return { error: GENERIC_AUTH_ERROR };
  }

  const context = await getAdminContext();
  const next = safeAdminNext(formData.get("next"));

  if (context.gate === "ready" || context.gate === "challenge") {
    redirect(adminRedirectFor(context.gate, next));
  }

  redirect(context.redirectTo);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
