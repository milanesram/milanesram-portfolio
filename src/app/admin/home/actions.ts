"use server";

import { revalidatePath } from "next/cache";
import { requireAdminMutation } from "@/lib/admin/authorization";
import {
  getAdminHomePage,
  HOME_PAGE_SINGLETON_KEY,
} from "@/lib/admin/home/queries";
import {
  parseHomePageFormData,
  statusFromIntent,
} from "@/lib/admin/home/validation";
import { completePublicCmsMutation } from "@/lib/indexnow";
import { isPublishedStatus, singletonPagePaths } from "@/lib/indexnow-content-map";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const SAVE_FAILED = "The Home page could not be saved.";

function revalidateHome() {
  revalidatePath("/admin/home");
  revalidatePath("/");
}

export async function saveHomePageAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseHomePageFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  const existing = await getAdminHomePage(auth.supabase);

  if (existing.error) {
    return { error: SAVE_FAILED, message: null };
  }

  if (input.id && (!existing.data || existing.data.id !== input.id)) {
    return { error: SAVE_FAILED, message: null };
  }

  const experienceIds = input.experienceLinks.map((link) => link.experienceItemId);
  const credentialIds = [
    ...input.credentialLinks.map((link) => link.credentialId),
    ...input.proofItems
      .map((item) => item.credentialId)
      .filter((id): id is string => Boolean(id)),
  ];
  const projectIds = [
    ...input.proofItems
      .map((item) => item.projectId)
      .filter((id): id is string => Boolean(id)),
    ...(input.featuredProjectId ? [input.featuredProjectId] : []),
  ];

  if (experienceIds.length > 0) {
    const found = await auth.supabase
      .from("experience_items")
      .select("id")
      .in("id", experienceIds);

    if (found.error || (found.data ?? []).length !== experienceIds.length) {
      return { error: "An experience selection does not exist.", message: null };
    }
  }

  if (credentialIds.length > 0) {
    const unique = [...new Set(credentialIds)];
    const found = await auth.supabase
      .from("credentials")
      .select("id")
      .in("id", unique);

    if (found.error || (found.data ?? []).length !== unique.length) {
      return { error: "A credential selection does not exist.", message: null };
    }
  }

  if (projectIds.length > 0) {
    const unique = [...new Set(projectIds)];
    const found = await auth.supabase
      .from("projects")
      .select("id")
      .in("id", unique);

    if (found.error || (found.data ?? []).length !== unique.length) {
      return { error: "A project selection does not exist.", message: null };
    }
  }

  const values = {
    headline: input.headline,
    lede: input.lede,
    primary_cta_label: input.primaryCtaLabel,
    primary_cta_href: input.primaryCtaHref,
    secondary_cta_label: input.secondaryCtaLabel,
    secondary_cta_href: input.secondaryCtaHref,
    featured_project_id: input.featuredProjectId,
    project_kicker: input.projectKicker,
    project_heading: input.projectHeading,
    project_problem: input.projectProblem,
    project_body: input.projectBody,
    project_cta_label: input.projectCtaLabel,
    project_cta_href: input.projectCtaHref,
    project_proof_points: input.projectProofPoints,
    experience_kicker: input.experienceKicker,
    experience_heading: input.experienceHeading,
    experience_lede: input.experienceLede,
    experience_cta_label: input.experienceCtaLabel,
    experience_cta_href: input.experienceCtaHref,
    credentials_kicker: input.credentialsKicker,
    credentials_heading: input.credentialsHeading,
    credentials_lede: input.credentialsLede,
    credentials_cta_label: input.credentialsCtaLabel,
    credentials_cta_href: input.credentialsCtaHref,
    focus_kicker: input.focusKicker,
    focus_heading: input.focusHeading,
    focus_lede: input.focusLede,
    closing_heading: input.closingHeading,
    closing_body: input.closingBody,
    closing_primary_cta_label: input.closingPrimaryCtaLabel,
    closing_primary_cta_href: input.closingPrimaryCtaHref,
    closing_secondary_cta_label: input.closingSecondaryCtaLabel,
    closing_secondary_cta_href: input.closingSecondaryCtaHref,
    status: statusFromIntent(input.intent, existing.data?.status ?? null),
  };

  let homePageId = existing.data?.id ?? null;

  if (!existing.data) {
    const inserted = await auth.supabase
      .from("home_page")
      .insert({
        ...values,
        singleton_key: HOME_PAGE_SINGLETON_KEY,
      })
      .select("id")
      .maybeSingle();

    if (inserted.error || !inserted.data) {
      return { error: SAVE_FAILED, message: null };
    }

    homePageId = inserted.data.id;
  } else {
    const { error } = await auth.supabase
      .from("home_page")
      .update(values)
      .eq("id", existing.data.id)
      .eq("singleton_key", HOME_PAGE_SINGLETON_KEY);

    if (error) {
      return { error: SAVE_FAILED, message: null };
    }
  }

  if (!homePageId) {
    return { error: SAVE_FAILED, message: null };
  }

  const [chipsDelete, proofDelete, experienceDelete, credentialsDelete] =
    await Promise.all([
      auth.supabase.from("home_page_chips").delete().eq("home_page_id", homePageId),
      auth.supabase.from("home_proof_items").delete().eq("home_page_id", homePageId),
      auth.supabase.from("home_experience_items").delete().eq("home_page_id", homePageId),
      auth.supabase.from("home_credentials").delete().eq("home_page_id", homePageId),
    ]);

  if (
    chipsDelete.error ||
    proofDelete.error ||
    experienceDelete.error ||
    credentialsDelete.error
  ) {
    return { error: SAVE_FAILED, message: null };
  }

  if (input.chips.length > 0) {
    const { error } = await auth.supabase.from("home_page_chips").insert(
      input.chips.map((chip) => ({
        home_page_id: homePageId,
        label: chip.label,
        sort_order: chip.sortOrder,
      })),
    );

    if (error) {
      return { error: SAVE_FAILED, message: null };
    }
  }

  if (input.proofItems.length > 0) {
    const { error } = await auth.supabase.from("home_proof_items").insert(
      input.proofItems.map((item) => ({
        home_page_id: homePageId,
        label: item.label,
        supporting: item.supporting,
        href: item.href,
        credential_id: item.credentialId,
        project_id: item.projectId,
        sort_order: item.sortOrder,
      })),
    );

    if (error) {
      return { error: SAVE_FAILED, message: null };
    }
  }

  if (input.experienceLinks.length > 0) {
    const { error } = await auth.supabase.from("home_experience_items").insert(
      input.experienceLinks.map((link) => ({
        home_page_id: homePageId,
        experience_item_id: link.experienceItemId,
        sort_order: link.sortOrder,
      })),
    );

    if (error) {
      return { error: SAVE_FAILED, message: null };
    }
  }

  if (input.credentialLinks.length > 0) {
    const { error } = await auth.supabase.from("home_credentials").insert(
      input.credentialLinks.map((link) => ({
        home_page_id: homePageId,
        credential_id: link.credentialId,
        sort_order: link.sortOrder,
      })),
    );

    if (error) {
      return { error: SAVE_FAILED, message: null };
    }
  }

  await completePublicCmsMutation({
    revalidate: () => revalidateHome(),
    paths: singletonPagePaths({
      wasPublished: isPublishedStatus(existing.data?.status),
      isPublished: isPublishedStatus(values.status),
      path: "/",
    }),
  });

  const messages: Record<typeof input.intent, string> = {
    draft: "Saved as draft.",
    publish: "Published.",
    unpublish: "Unpublished and saved as draft.",
    archive: "Archived.",
    keep: "Saved.",
  };

  return { error: null, message: messages[input.intent] };
}
