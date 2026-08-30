import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type AdminContext = {
  signedIn: boolean;
  email: string | null;
  isAdmin: boolean;
};

export type AdminClient = SupabaseClient<Database>;

export async function getAdminContext(): Promise<AdminContext> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { signedIn: false, email: null, isAdmin: false };
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

  return {
    signedIn: true,
    email: data.user.email ?? null,
    isAdmin: adminError == null && isAdmin === true,
  };
}

export async function requireAdminPage(): Promise<{ email: string | null }> {
  const context = await getAdminContext();

  if (!context.signedIn) {
    redirect("/admin/login");
  }

  if (!context.isAdmin) {
    redirect("/admin");
  }

  return { email: context.email };
}

export async function requireAdminMutation(): Promise<
  { ok: true; supabase: AdminClient } | { ok: false; error: string }
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { ok: false, error: "Sign in required." };
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    return { ok: false, error: "Not authorized." };
  }

  return { ok: true, supabase };
}
