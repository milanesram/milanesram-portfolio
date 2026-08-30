import type { AdminClient } from "@/lib/admin/authorization";
import type { InquiryContext, InquiryTrack } from "@/lib/supabase/database.types";

export type AdminInquiry = {
  id: string;
  name: string;
  email: string;
  organization: string | null;
  context: InquiryContext;
  track: InquiryTrack;
  message: string;
  created_at: string;
  read_at: string | null;
};

const INQUIRY_COLUMNS =
  "id, name, email, organization, context, track, message, created_at, read_at";

export async function listAdminInquiries(supabase: AdminClient) {
  return supabase
    .from("inquiries")
    .select(INQUIRY_COLUMNS)
    .order("created_at", { ascending: false });
}

export async function getAdminInquiry(supabase: AdminClient, id: string) {
  return supabase
    .from("inquiries")
    .select(INQUIRY_COLUMNS)
    .eq("id", id)
    .maybeSingle();
}
