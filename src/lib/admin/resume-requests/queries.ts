import type { AdminClient } from "@/lib/admin/authorization";
import {
  availabilityLabel,
  FULFILLMENT_DOCUMENT_KEYS,
  type FulfillmentDocumentKey,
} from "@/lib/admin/resume-fulfillment/policy";
import type {
  FulfillmentDocumentKey as StoredFulfillmentDocumentKey,
  ResumeRequestChoice,
  ResumeRequestStatus,
} from "@/lib/supabase/database.types";

export type AdminResumeRequest = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  organization: string;
  resume_choice: ResumeRequestChoice;
  message: string | null;
  status: ResumeRequestStatus;
  reviewed_at: string | null;
  closed_at: string | null;
  fulfilled_at: string | null;
  fulfilled_document: StoredFulfillmentDocumentKey | null;
  fulfilled_by: string | null;
};

export type DocumentAvailability = {
  key: FulfillmentDocumentKey;
  availabilityLabel: string;
  available: boolean;
};

const REQUEST_COLUMNS =
  "id, created_at, full_name, email, organization, resume_choice, message, status, reviewed_at, closed_at, fulfilled_at, fulfilled_document, fulfilled_by";

export async function listAdminResumeRequests(supabase: AdminClient) {
  return supabase
    .from("resume_requests")
    .select(REQUEST_COLUMNS)
    .order("created_at", { ascending: false });
}

export async function getAdminResumeRequest(supabase: AdminClient, id: string) {
  return supabase
    .from("resume_requests")
    .select(REQUEST_COLUMNS)
    .eq("id", id)
    .maybeSingle();
}

export async function listDocumentAvailability(
  supabase: AdminClient,
): Promise<DocumentAvailability[]> {
  const { data, error } = await supabase
    .from("private_document_assets")
    .select("document_key, active")
    .eq("active", true);

  const active = new Set<string>();

  if (!error && data) {
    for (const row of data) {
      if (row.active) {
        active.add(row.document_key);
      }
    }
  }

  return FULFILLMENT_DOCUMENT_KEYS.map((key) => {
    const available = active.has(key);

    return {
      key,
      available,
      availabilityLabel: availabilityLabel(key, available),
    };
  });
}
