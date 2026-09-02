import type { AdminClient } from "@/lib/admin/authorization";
import type {
  ContentStatus,
  TrackTag,
} from "@/lib/supabase/database.types";

export const CERTIFICATION_KIND = "certification" as const;

export type AdminCertification = {
  id: string;
  name: string;
  issuer: string;
  year_label: string | null;
  details: string | null;
  needs_verification: boolean;
  track: TrackTag;
  highlight: boolean;
  status: ContentStatus;
  sort_order: number;
  verification_url: string | null;
  expires_on: string | null;
  updated_at: string;
};

const CERTIFICATION_COLUMNS =
  "id, name, issuer, year_label, details, needs_verification, track, highlight, status, sort_order, verification_url, expires_on, updated_at";

export async function listAdminCertifications(supabase: AdminClient) {
  return supabase
    .from("credentials")
    .select(CERTIFICATION_COLUMNS)
    .eq("kind", CERTIFICATION_KIND)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
}

export async function getAdminCertification(supabase: AdminClient, id: string) {
  return supabase
    .from("credentials")
    .select(CERTIFICATION_COLUMNS)
    .eq("id", id)
    .eq("kind", CERTIFICATION_KIND)
    .maybeSingle();
}
