import type { AdminClient } from "@/lib/admin/authorization";
import type {
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
};

const REQUEST_COLUMNS =
  "id, created_at, full_name, email, organization, resume_choice, message, status";

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
