import "server-only";

import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import type { FulfillmentDocumentKey } from "./policy";
import { PRIVATE_RESUME_BUCKET, SIGNED_LINK_TTL_SECONDS, signedLinkExpiresAt } from "./policy";

export type ActivePrivateDocument = {
  documentKey: FulfillmentDocumentKey;
  objectPath: string;
  byteSize: number;
};

export async function readActivePrivateDocument(
  document: FulfillmentDocumentKey,
): Promise<ActivePrivateDocument | null> {
  const supabase = createPrivilegedSupabaseClient();
  const { data, error } = await supabase
    .from("private_document_assets")
    .select("document_key, object_path, byte_size, active, storage_bucket")
    .eq("document_key", document)
    .eq("active", true)
    .eq("storage_bucket", PRIVATE_RESUME_BUCKET)
    .maybeSingle();

  if (error || !data?.active || data.storage_bucket !== PRIVATE_RESUME_BUCKET) {
    return null;
  }

  const objectPath = data.object_path.trim();

  if (!objectPath || objectPath.includes("..") || objectPath.startsWith("/")) {
    return null;
  }

  return {
    documentKey: document,
    objectPath,
    byteSize: data.byte_size,
  };
}

export async function createPrivateSignedUrl(objectPath: string, now = new Date()) {
  const expiresAt = signedLinkExpiresAt(now, SIGNED_LINK_TTL_SECONDS);
  const supabase = createPrivilegedSupabaseClient();
  const { data, error } = await supabase.storage
    .from(PRIVATE_RESUME_BUCKET)
    .createSignedUrl(objectPath, SIGNED_LINK_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return null;
  }

  return {
    url: data.signedUrl,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function downloadPrivateDocument(objectPath: string) {
  const supabase = createPrivilegedSupabaseClient();
  const { data, error } = await supabase.storage
    .from(PRIVATE_RESUME_BUCKET)
    .download(objectPath);

  if (error || !data) {
    return null;
  }

  return new Uint8Array(await data.arrayBuffer());
}
