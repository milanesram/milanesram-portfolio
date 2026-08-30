import type { NextRequest } from "next/server";
import { assertPublicSupabaseEnv } from "@/lib/supabase/env";
import { updateSession } from "@/lib/supabase/update-session";

export async function proxy(request: NextRequest) {
  assertPublicSupabaseEnv();
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
