import type { AdminClient } from "@/lib/admin/authorization";
import type {
  ContentStatus,
  CredentialKind,
  TrackTag,
} from "@/lib/supabase/database.types";

export const CREDENTIALS_PAGE_SINGLETON_KEY = "default" as const;

export type AdminCredential = {
  id: string;
  kind: CredentialKind;
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

export type AdminCredentialsPage = {
  id: string;
  status: ContentStatus;
  kicker: string;
  headline: string;
  lede: string;
  seo_title: string;
  seo_description: string;
  updated_at: string;
};

export type AdminCredentialChoice = {
  id: string;
  name: string;
  issuer: string;
  year_label: string | null;
  kind: CredentialKind;
  status: ContentStatus;
  needs_verification: boolean;
};

export const CREDENTIAL_COLUMNS =
  "id, kind, name, issuer, year_label, details, needs_verification, track, highlight, status, sort_order, verification_url, expires_on, updated_at";

const PAGE_COLUMNS =
  "id, status, kicker, headline, lede, seo_title, seo_description, updated_at";

export async function listAdminCredentials(supabase: AdminClient) {
  return supabase
    .from("credentials")
    .select(CREDENTIAL_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
}

export async function getAdminCredential(supabase: AdminClient, id: string) {
  return supabase
    .from("credentials")
    .select(CREDENTIAL_COLUMNS)
    .eq("id", id)
    .maybeSingle();
}

export async function listAdminCredentialChoices(supabase: AdminClient) {
  return supabase
    .from("credentials")
    .select("id, name, issuer, year_label, kind, status, needs_verification")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
}

export async function getAdminCredentialsPage(supabase: AdminClient) {
  return supabase
    .from("credentials_page")
    .select(PAGE_COLUMNS)
    .eq("singleton_key", CREDENTIALS_PAGE_SINGLETON_KEY)
    .maybeSingle();
}
