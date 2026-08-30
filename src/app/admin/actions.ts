"use server";

import { redirect } from "next/navigation";
import { parseLoginFormData } from "@/lib/admin/login-input";
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

  redirect("/admin");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
