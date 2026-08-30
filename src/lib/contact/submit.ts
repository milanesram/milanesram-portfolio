import "server-only";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import type { PublicInquiryInput } from "./validation";

export type IntakeRpcResult =
  | { ok: true }
  | { ok: false; kind: "rate_limited" | "invalid" | "unavailable" };

export async function submitPublicInquiryRpc(
  input: PublicInquiryInput,
  fingerprintHash: string,
  emailHash: string,
): Promise<IntakeRpcResult> {
  try {
    const supabase = createPrivilegedSupabaseClient();
    const { error } = await supabase.rpc("submit_public_inquiry", {
      p_name: input.name,
      p_email: input.email,
      p_organization: input.organization,
      p_context: input.context,
      p_track: input.track,
      p_message: input.message,
      p_fingerprint_hash: fingerprintHash,
      p_email_hash: emailHash,
    });

    if (!error) {
      return { ok: true };
    }

    if (error.message.includes("rate_limited")) {
      return { ok: false, kind: "rate_limited" };
    }

    if (error.message.includes("invalid_input") || error.code === "22023") {
      return { ok: false, kind: "invalid" };
    }

    return { ok: false, kind: "unavailable" };
  } catch {
    return { ok: false, kind: "unavailable" };
  }
}
