"use server";

import { redirect } from "next/navigation";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { readUuid } from "@/lib/admin/ids";
import { parseIndexChromeFormData } from "@/lib/admin/page-chrome/validation";
import {
  getAdminPublication,
  getAdminWritingPage,
  listFocusPagesFeaturingPublication,
} from "@/lib/admin/writing/queries";
import {
  assertDeliberateFileChange,
  assertImmutablePublishedSlug,
  assertPublicationPublishReady,
  parsePublicationFormData,
  statusFromIntent,
} from "@/lib/admin/writing/validation";
import {
  revalidateWritingFocusSurfaces,
  revalidateWritingSurfaces,
} from "@/lib/admin/writing/revalidate";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const PAGE_FAILED = "The Writing page could not be saved.";
const SAVE_FAILED = "That publication could not be saved.";

export async function saveWritingPageAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseIndexChromeFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  const existing = await getAdminWritingPage(auth.supabase);

  if (existing.error) {
    return { error: PAGE_FAILED, message: null };
  }

  if (input.id && (!existing.data || existing.data.id !== input.id)) {
    return { error: PAGE_FAILED, message: null };
  }

  const values = {
    kicker: input.kicker,
    headline: input.headline,
    lede: input.lede,
    status: statusFromIntent(input.intent, existing.data?.status ?? null),
  };

  if (!existing.data) {
    const { error } = await auth.supabase.from("writing_page").insert({
      ...values,
      singleton_key: "default",
    });

    if (error) {
      return { error: PAGE_FAILED, message: null };
    }
  } else {
    const { error } = await auth.supabase
      .from("writing_page")
      .update(values)
      .eq("id", existing.data.id);

    if (error) {
      return { error: PAGE_FAILED, message: null };
    }
  }

  revalidateWritingSurfaces();

  const messages: Record<typeof input.intent, string> = {
    draft: "Saved as draft.",
    publish: "Published.",
    unpublish: "Unpublished and saved as draft.",
    archive: "Archived.",
    keep: "Saved.",
  };

  return { error: null, message: messages[input.intent] };
}

export async function savePublicationAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parsePublicationFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  const ready = assertPublicationPublishReady(input);

  if (!ready.ok) {
    return { error: ready.error, message: null };
  }

  let currentStatus: "draft" | "published" | "archived" | null = null;
  let currentSlug: string | null = null;
  let currentMediaId: string | null = null;
  let currentRights: typeof input.rightsStatus | null = null;

  if (input.id) {
    const existing = await getAdminPublication(auth.supabase, input.id);

    if (existing.error || !existing.data) {
      return { error: SAVE_FAILED, message: null };
    }

    currentStatus = existing.data.status;
    currentSlug = existing.data.slug;
    currentMediaId = existing.data.media_id;
    currentRights = existing.data.rights_status;
  }

  const slugLock = assertImmutablePublishedSlug({
    currentStatus,
    currentSlug,
    nextSlug: input.slug,
  });

  if (!slugLock.ok) {
    return { error: slugLock.error, message: null };
  }

  const fileChange = assertDeliberateFileChange({
    currentStatus,
    currentRights,
    currentMediaId,
    nextMediaId: input.mediaId,
    confirmReplaceFile: input.confirmReplaceFile,
  });

  if (!fileChange.ok) {
    return { error: fileChange.error, message: null };
  }

  if (input.rightsStatus === "host_pdf" && input.mediaId) {
    const media = await auth.supabase
      .from("media_assets")
      .select("id, kind, purpose, mime_type")
      .eq("id", input.mediaId)
      .maybeSingle();

    if (
      media.error ||
      !media.data ||
      media.data.kind !== "document" ||
      media.data.purpose !== "publication" ||
      (media.data.mime_type !== "application/pdf" &&
        media.data.mime_type !== "application/x-pdf")
    ) {
      return {
        error: "Choose an existing publication PDF. Files are not rewritten here.",
        message: null,
      };
    }
  }

  const values = {
    slug: input.slug,
    title: input.title,
    seo_title: input.seoTitle,
    document_kind: input.documentKind,
    rights_status: input.rightsStatus,
    author: input.author,
    publisher: input.publisher,
    published_on: input.publishedOn,
    year_label: input.yearLabel,
    abstract: input.abstract,
    external_url: input.externalUrl,
    track: input.track,
    media_id: input.mediaId,
    sort_order: input.sortOrder,
    status: statusFromIntent(input.intent, currentStatus),
  };

  if (!input.id) {
    const { data, error } = await auth.supabase
      .from("publications")
      .insert(values)
      .select("id")
      .single();

    if (error || !data) {
      if (error?.code === "23505") {
        return { error: "That slug is already in use.", message: null };
      }

      return { error: SAVE_FAILED, message: null };
    }

    revalidateWritingSurfaces(values.slug);
    redirect(`/admin/writing/${data.id}`);
  }

  const { error } = await auth.supabase
    .from("publications")
    .update(values)
    .eq("id", input.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "That slug is already in use.", message: null };
    }

    return { error: SAVE_FAILED, message: null };
  }

  const featured = await listFocusPagesFeaturingPublication(
    auth.supabase,
    input.id,
  );
  revalidateWritingSurfaces(values.slug);
  if (currentSlug && currentSlug !== values.slug) {
    revalidateWritingSurfaces(currentSlug);
  }
  revalidateWritingFocusSurfaces(
    (featured.data ?? []).map((row) => row.slug).filter(Boolean),
  );

  const messages: Record<typeof input.intent, string> = {
    draft: "Saved as draft.",
    publish: "Published.",
    unpublish: "Unpublished and saved as draft.",
    archive: "Archived.",
    keep: "Saved.",
  };

  return { error: null, message: messages[input.intent] };
}

export async function deletePublicationAction(formData: FormData) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const id = readUuid(formData.get("id"));

  if (!id) {
    return;
  }

  const existing = await getAdminPublication(auth.supabase, id);

  if (existing.error || !existing.data) {
    return;
  }

  const featured = await listFocusPagesFeaturingPublication(auth.supabase, id);
  const { error } = await auth.supabase.from("publications").delete().eq("id", id);

  if (error) {
    return;
  }

  revalidateWritingSurfaces(existing.data.slug);
  revalidateWritingFocusSurfaces(
    (featured.data ?? []).map((row) => row.slug).filter(Boolean),
  );
  redirect("/admin/writing");
}
