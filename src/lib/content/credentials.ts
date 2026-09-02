import { cache } from "react";
import {
  sortEligible,
  type CredentialRow,
  type PublishedCredential,
} from "@/lib/content/credential-map";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

/**
 * Public credential reads from hosted `credentials`.
 * Eligibility is published + needs_verification = false everywhere.
 * Public identity is the hosted UUID. There is no static fallback.
 */

export const CREDENTIALS_PAGE_SINGLETON_KEY = "default" as const;

export type {
  CredentialRow,
  PublishedCredential,
} from "@/lib/content/credential-map";
export {
  formatCredentialExpiry,
  isPubliclyEligibleCredential,
  mapCredential,
  mapTrack,
  toPresentationCredential,
} from "@/lib/content/credential-map";

export type PublicCredentialsPage = {
  kicker: string;
  headline: string;
  lede: string;
  seoTitle: string;
  seoDescription: string;
};

export type PublishedCredentialsResult =
  | { ok: true; credentials: PublishedCredential[] }
  | { ok: false };

export type PublishedCredentialsPageResult =
  | { ok: true; page: PublicCredentialsPage }
  | { ok: true; page: null }
  | { ok: false };

const CREDENTIAL_COLUMNS =
  "id, kind, name, issuer, year_label, details, track, highlight, needs_verification, status, sort_order, verification_url, expires_on";

async function loadPublishedCredentials(): Promise<PublishedCredentialsResult> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("credentials")
    .select(CREDENTIAL_COLUMNS)
    .eq("status", "published")
    .eq("needs_verification", false)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) {
    return { ok: false };
  }

  return {
    ok: true,
    credentials: sortEligible(data as CredentialRow[]),
  };
}

async function loadPublishedCredentialsByIds(
  ids: string[],
): Promise<PublishedCredentialsResult> {
  if (ids.length === 0) {
    return { ok: true, credentials: [] };
  }

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("credentials")
    .select(CREDENTIAL_COLUMNS)
    .in("id", ids)
    .eq("status", "published")
    .eq("needs_verification", false);

  if (error || !data) {
    return { ok: false };
  }

  const byId = new Map(
    sortEligible(data as CredentialRow[]).map((row) => [row.id, row]),
  );

  return {
    ok: true,
    credentials: ids
      .map((id) => byId.get(id))
      .filter((row): row is PublishedCredential => Boolean(row)),
  };
}

async function loadPublishedCredentialsPage(): Promise<PublishedCredentialsPageResult> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("credentials_page")
    .select("status, kicker, headline, lede, seo_title, seo_description")
    .eq("singleton_key", CREDENTIALS_PAGE_SINGLETON_KEY)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    return { ok: false };
  }

  if (!data) {
    return { ok: true, page: null };
  }

  return {
    ok: true,
    page: {
      kicker: data.kicker,
      headline: data.headline,
      lede: data.lede,
      seoTitle: data.seo_title,
      seoDescription: data.seo_description,
    },
  };
}

export const getPublishedCredentials = cache(loadPublishedCredentials);
export const getPublishedCredentialsByIds = cache(loadPublishedCredentialsByIds);
export const getPublishedCredentialsPage = cache(loadPublishedCredentialsPage);
