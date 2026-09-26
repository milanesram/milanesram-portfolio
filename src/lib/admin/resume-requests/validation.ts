import { readUuid } from "@/lib/admin/ids";
import { safeMailtoHref } from "@/lib/admin/inquiries/validation";
import type { ResumeRequestStatus } from "@/lib/supabase/database.types";

const STATUSES = new Set<ResumeRequestStatus>(["new", "reviewed", "closed"]);

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export type ParsedResumeRequestStatus = {
  id: string;
  status: ResumeRequestStatus;
};

function readString(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" ? value : null;
}

export function parseResumeRequestStatusForm(
  formData: FormData,
): ParseResult<ParsedResumeRequestStatus> {
  const id = readUuid(formData.get("id"));

  if (!id) {
    return { ok: false, error: "That record could not be saved." };
  }

  const status = (readString(formData, "status") ?? "").trim();

  if (!STATUSES.has(status as ResumeRequestStatus)) {
    return { ok: false, error: "Choose a valid status." };
  }

  return {
    ok: true,
    value: {
      id,
      status: status as ResumeRequestStatus,
    },
  };
}

export function resumeRequestMailto(email: string): string | null {
  return safeMailtoHref(email);
}
