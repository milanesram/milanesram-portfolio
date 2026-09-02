import { cache } from "react";
import {
  interpretPublishedAboutPageResponse,
  toPublicAboutPage,
  type AboutEducationLinkRow,
  type AboutListItemRow,
  type AboutPageRow,
  type AboutParagraphRow,
  type JourneyMilestoneRow,
  type PublishedAboutPageResult,
} from "@/lib/content/about-page";
import type { CredentialRow } from "@/lib/content/credential-map";
import {
  mapEligiblePublicJourneyMedia,
  type EligiblePublicImageRow,
} from "@/lib/content/media";
import type { PublicJourneyMedia } from "@/lib/content/media-types";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

/**
 * Public About reads hosted `about_page`, published Journey
 * milestones, and selected Education credentials by UUID.
 */

export type { PublishedAboutPageResult };

export const ABOUT_PAGE_SINGLETON_KEY = "default" as const;

const ABOUT_COLUMNS =
  "id, status, kicker, headline, lede, journey_heading, education_heading, speaking_heading, speaking_body, boundaries_heading, seo_title, seo_description";

const MEDIA_COLUMNS =
  "id, kind, alt_text, credit, mime_type, bucket_path, status, is_public";

const CREDENTIAL_COLUMNS =
  "id, kind, name, issuer, year_label, details, track, highlight, needs_verification, status, sort_order, verification_url, expires_on";

async function loadPublishedAboutPage(): Promise<PublishedAboutPageResult> {
  const supabase = createPublicSupabaseClient();
  const [aboutResult, milestoneResult] = await Promise.all([
    supabase
      .from("about_page")
      .select(
        `${ABOUT_COLUMNS}, paragraphs:about_page_paragraphs(id, body, sort_order), list_items:about_page_list_items(id, kind, body, sort_order), education:about_education_credentials(credential_id, sort_order)`,
      )
      .eq("singleton_key", ABOUT_PAGE_SINGLETON_KEY)
      .eq("status", "published")
      .maybeSingle(),
    supabase
      .from("journey_milestones")
      .select("id, title, year, caption, media_asset_id, sort_order, status")
      .eq("status", "published")
      .order("sort_order", { ascending: true }),
  ]);

  const interpreted = interpretPublishedAboutPageResponse({
    error: aboutResult.error,
    data: (aboutResult.data as AboutPageRow | null) ?? null,
  });

  if (!interpreted.ok || milestoneResult.error) {
    return { ok: false };
  }

  if (!interpreted.row) {
    return { ok: true, page: null };
  }

  const embedded = aboutResult.data as typeof aboutResult.data & {
    paragraphs?: AboutParagraphRow[];
    list_items?: AboutListItemRow[];
    education?: AboutEducationLinkRow[];
  };
  const milestones = (milestoneResult.data ?? []) as JourneyMilestoneRow[];
  const educationLinks = embedded.education ?? [];
  const mediaIds = [
    ...new Set(
      milestones
        .map((row) => row.media_asset_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const credentialIds = [
    ...new Set(educationLinks.map((link) => link.credential_id)),
  ];

  const [mediaResult, credentialResult] = await Promise.all([
    mediaIds.length > 0
      ? supabase.from("media_assets").select(MEDIA_COLUMNS).in("id", mediaIds)
      : Promise.resolve({ data: [], error: null }),
    credentialIds.length > 0
      ? supabase
          .from("credentials")
          .select(CREDENTIAL_COLUMNS)
          .in("id", credentialIds)
          .eq("status", "published")
          .eq("needs_verification", false)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (mediaResult.error || credentialResult.error) {
    return { ok: false };
  }

  const mediaById = new Map<string, PublicJourneyMedia>();

  for (const row of (mediaResult.data ?? []) as EligiblePublicImageRow[]) {
    const mapped = mapEligiblePublicJourneyMedia(row);
    if (mapped) {
      mediaById.set(mapped.id, mapped);
    }
  }

  return {
    ok: true,
    page: toPublicAboutPage({
      row: interpreted.row,
      paragraphs: embedded.paragraphs ?? [],
      listItems: embedded.list_items ?? [],
      milestones,
      mediaById,
      educationLinks,
      educationCredentials: (credentialResult.data ?? []) as CredentialRow[],
    }),
  };
}

export const getPublishedAboutPage = cache(loadPublishedAboutPage);
