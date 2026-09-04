"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { readUuid } from "@/lib/admin/ids";
import {
  getAdminMediaAsset,
  getMediaUsageCounts,
  mediaUsageTotal,
} from "@/lib/admin/media/queries";
import {
  parseMediaFormData,
  statusFromIntent,
} from "@/lib/admin/media/validation";
import {
  assertMediaNotReferenced,
  mediaStoragePath,
  rollbackUploadedObjectIfInsertFailed,
  validateUploadFile,
} from "@/lib/admin/media/upload";
import { PUBLIC_MEDIA_BUCKET } from "@/lib/content/media-bucket";
import type { MediaKind, MediaPurpose } from "@/lib/supabase/database.types";
import { completePublicCmsMutation } from "@/lib/indexnow";
import { isPublishedStatus, mediaPaths } from "@/lib/indexnow-content-map";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const SAVE_FAILED = "The media record could not be saved.";
const UPLOAD_FAILED = "The file could not be uploaded.";
const KINDS = new Set<MediaKind>(["resume_pdf", "image", "document"]);
const PURPOSES = new Set<MediaPurpose>([
  "portrait",
  "journey",
  "project",
  "publication",
  "resume",
]);

function mapWriteError(code: string | undefined): string {
  if (code === "23514") {
    return "One or more fields did not meet the required format.";
  }

  if (code === "23503") {
    return "Remove this asset from related records before deleting it.";
  }

  return SAVE_FAILED;
}

function revalidateAdminMedia(id?: string) {
  revalidatePath("/admin/media");

  if (id) {
    revalidatePath(`/admin/media/${id}`);
  }
}

function readString(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" ? value : null;
}

export async function saveMediaAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseMediaFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  const existing = await getAdminMediaAsset(auth.supabase, input.id);

  if (existing.error || !existing.data) {
    return { error: SAVE_FAILED, message: null };
  }

  const { error } = await auth.supabase
    .from("media_assets")
    .update({
      title: input.title,
      alt_text: input.altText,
      kind: input.kind,
      is_public: input.isPublic,
      status: statusFromIntent(input.intent, existing.data.status),
    })
    .eq("id", existing.data.id);

  if (error) {
    return { error: mapWriteError(error.code), message: null };
  }

  const usage = await getMediaUsageCounts(
    auth.supabase,
    existing.data.id,
    existing.data.purpose,
  );
  const nextStatus = statusFromIntent(input.intent, existing.data.status);

  await completePublicCmsMutation({
    revalidate: () => revalidateAdminMedia(existing.data?.id),
    paths: mediaPaths({
      wasPublic:
        isPublishedStatus(existing.data.status) && existing.data.is_public,
      isPublic: isPublishedStatus(nextStatus) && input.isPublic,
      purpose: existing.data.purpose,
      usage,
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

export async function uploadMediaAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const kindRaw = (readString(formData, "kind") ?? "").trim();
  const purposeRaw = (readString(formData, "purpose") ?? "").trim();

  if (!KINDS.has(kindRaw as MediaKind) || !PURPOSES.has(purposeRaw as MediaPurpose)) {
    return { error: "Choose a valid kind and purpose.", message: null };
  }

  const kind = kindRaw as MediaKind;
  const purpose = purposeRaw as MediaPurpose;
  const title = readString(formData, "title")?.trim() ?? "";

  if (!title || title.length > 200) {
    return { error: "Title is required.", message: null };
  }

  const altText = readString(formData, "alt_text")?.trim() || null;

  if (kind === "image" && !altText) {
    return { error: "Images require alt text.", message: null };
  }

  if (altText && altText.length > 300) {
    return { error: "Alt text is too long.", message: null };
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { error: "Choose a file to upload.", message: null };
  }

  const validated = validateUploadFile({
    kind,
    purpose,
    filename: file.name,
    mimeType: file.type,
    byteSize: file.size,
  });

  if (!validated.ok) {
    return { error: validated.error, message: null };
  }

  const id = randomUUID();
  const bucketPath = mediaStoragePath(purpose, id, validated.value.safeFilename);
  const bytes = Buffer.from(await file.arrayBuffer());

  const upload = await auth.supabase.storage
    .from(PUBLIC_MEDIA_BUCKET)
    .upload(bucketPath, bytes, {
      contentType: validated.value.mimeType,
      upsert: false,
    });

  if (upload.error) {
    return { error: UPLOAD_FAILED, message: null };
  }

  const inserted = await auth.supabase.from("media_assets").insert({
    id,
    bucket_path: bucketPath,
    kind,
    purpose,
    title,
    alt_text: altText,
    mime_type: validated.value.mimeType,
    byte_size: file.size,
    is_public: formData.get("is_public") === "on",
    status: "draft",
    sort_order: 100,
  });

  const rolledBack = await rollbackUploadedObjectIfInsertFailed({
    insertError: inserted.error,
    removeObject: () =>
      auth.supabase.storage.from(PUBLIC_MEDIA_BUCKET).remove([bucketPath]),
  });

  if (!rolledBack.ok) {
    return { error: rolledBack.error, message: null };
  }

  revalidateAdminMedia(id);
  redirect(`/admin/media/${id}`);
}

export async function deleteMediaAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const id = readUuid(formData.get("id"));

  if (!id) {
    return { error: SAVE_FAILED, message: null };
  }

  const existing = await getAdminMediaAsset(auth.supabase, id);

  if (existing.error || !existing.data) {
    return { error: SAVE_FAILED, message: null };
  }

  const usage = await getMediaUsageCounts(
    auth.supabase,
    id,
    existing.data.purpose,
  );
  const referenced = assertMediaNotReferenced(mediaUsageTotal(usage));

  if (!referenced.ok) {
    return { error: referenced.error, message: null };
  }

  const { error } = await auth.supabase.from("media_assets").delete().eq("id", id);

  if (error) {
    return { error: mapWriteError(error.code), message: null };
  }

  revalidateAdminMedia(id);
  redirect("/admin/media");
}
