import type { AdminClient } from "@/lib/admin/authorization";
import type {
  ContentStatus,
  TrackTag,
} from "@/lib/supabase/database.types";

export const TRAINING_KIND = "training" as const;

export type AdminTraining = {
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

const TRAINING_COLUMNS =
  "id, name, issuer, year_label, details, needs_verification, track, highlight, status, sort_order, verification_url, expires_on, updated_at";

export async function listAdminTraining(supabase: AdminClient) {
  return supabase
    .from("credentials")
    .select(TRAINING_COLUMNS)
    .eq("kind", TRAINING_KIND)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
}

export async function getAdminTraining(supabase: AdminClient, id: string) {
  return supabase
    .from("credentials")
    .select(TRAINING_COLUMNS)
    .eq("id", id)
    .eq("kind", TRAINING_KIND)
    .maybeSingle();
}
