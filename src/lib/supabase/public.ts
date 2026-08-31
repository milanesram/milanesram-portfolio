import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabasePublishableKey, getSupabaseUrl } from "./env";

/**
 * Anonymous public Supabase client for published RLS reads.
 *
 * Uses the publishable key only. Does not attach cookies or an owner
 * session, so admin ALL policies cannot surface draft rows on public routes.
 */
export function createPublicSupabaseClient() {
  return createClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
