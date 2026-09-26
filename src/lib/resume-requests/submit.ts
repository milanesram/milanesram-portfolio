import "server-only";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { classifyResumeRequestFailure, type ResumeRequestFailureKind } from "./errors";
import type { PublicResumeRequestInput } from "./validation";

export type ResumeRequestRpcResult =
  | { ok: true }
  | { ok: false; kind: ResumeRequestFailureKind };

export async function submitPublicResumeRequest(
  input: PublicResumeRequestInput,
  fingerprintHash: string,
  emailHash: string,
): Promise<ResumeRequestRpcResult> {
  try {
    const supabase = createPrivilegedSupabaseClient();
    const { error } = await supabase.rpc("submit_public_resume_request", {
      p_full_name: input.fullName,
      p_email: input.email,
      p_organization: input.organization,
      p_resume_choice: input.resumeChoice,
      p_message: input.message,
      p_fingerprint_hash: fingerprintHash,
      p_email_hash: emailHash,
    });

    if (!error) {
      return { ok: true };
    }

    const kind = classifyResumeRequestFailure(error.message, error.code);

    if (kind === "duplicate") {
      return { ok: true };
    }

    return { ok: false, kind };
  } catch {
    return { ok: false, kind: "unavailable" };
  }
}
