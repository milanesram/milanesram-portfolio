import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminContext = {
  signedIn: boolean;
  email: string | null;
  isAdmin: boolean;
};

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
