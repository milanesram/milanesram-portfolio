import type { AdminClient } from "@/lib/admin/authorization";
import type {
  ContentStatus,
  DocumentKind,
  PublicationRightsStatus,
  TrackTag,
} from "@/lib/supabase/database.types";

export type AdminWritingPage = {
  id: string;
  status: ContentStatus;
  kicker: string;
  headline: string;
  lede: string;
  updated_at: string;
};

export type AdminPublication = {
  id: string;
  slug: string;
  title: string;
  document_kind: DocumentKind;
  rights_status: PublicationRightsStatus;
  author: string | null;
  publisher: string;
  published_on: string | null;
  year_label: string;
  abstract: string;
  external_url: string | null;
  track: TrackTag;
  status: ContentStatus;
  sort_order: number;
  media_id: string | null;
  updated_at: string;
};

export type AdminPublicationMediaChoice = {
  id: string;
  title: string;
  status: ContentStatus;
  is_public: boolean;
  mime_type: string | null;
  kind: string;
  purpose: string | null;
};

const PAGE_COLUMNS = "id, status, kicker, headline, lede, updated_at";
const PUBLICATION_COLUMNS =
  "id, slug, title, document_kind, rights_status, author, publisher, published_on, year_label, abstract, external_url, track, status, sort_order, media_id, updated_at";

export async function getAdminWritingPage(client: AdminClient) {
  return client
    .from("writing_page")
    .select(PAGE_COLUMNS)
    .eq("singleton_key", "default")
    .maybeSingle();
}

export async function listAdminPublications(client: AdminClient) {
  return client
    .from("publications")
    .select(PUBLICATION_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });
}

export async function getAdminPublication(client: AdminClient, id: string) {
  return client
    .from("publications")
    .select(PUBLICATION_COLUMNS)
    .eq("id", id)
    .maybeSingle();
}

export async function listAdminPublicationMediaChoices(client: AdminClient) {
  return client
    .from("media_assets")
    .select("id, title, status, is_public, mime_type, kind, purpose")
    .eq("kind", "document")
    .eq("purpose", "publication")
    .order("title", { ascending: true });
}

export async function listFocusPagesFeaturingPublication(
  client: AdminClient,
  publicationId: string,
) {
  return client
    .from("focus_pages")
    .select("slug")
    .eq("featured_publication_id", publicationId);
}
