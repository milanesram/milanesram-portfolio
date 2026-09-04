"use server";

import { redirect } from "next/navigation";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { readUuid } from "@/lib/admin/ids";
import {
  CREDENTIALS_PAGE_SINGLETON_KEY,
  getAdminCredential,
  getAdminCredentialsPage,
} from "@/lib/admin/credentials/queries";
import {
  parseCredentialFormData,
  parseCredentialsPageFormData,
  statusFromIntent,
} from "@/lib/admin/credentials/validation";
import {
  revalidateCredentialSurfaces,
  revalidateCredentialsPageSurfaces,
} from "@/lib/admin/credentials/revalidate";
import { completePublicCmsMutation } from "@/lib/indexnow";
import {
  credentialPaths,
  isPublicCredential,
  isPublishedStatus,
  singletonPagePaths,
} from "@/lib/indexnow-content-map";

export type MutationState = {
  error: string | null;
  message: string | null;
};

const SAVE_FAILED = "The credential could not be saved.";
const PAGE_FAILED = "The Credentials page could not be saved.";

function mapWriteError(code: string | undefined): string {
  if (code === "23514") {
    return "One or more fields did not meet the required format.";
  }

  return SAVE_FAILED;
}

export async function saveCredentialAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseCredentialFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  let currentStatus: "draft" | "published" | "archived" | null = null;
  let currentNeedsVerification = false;

  if (input.id) {
    const existing = await getAdminCredential(auth.supabase, input.id);

    if (existing.error || !existing.data) {
      return { error: SAVE_FAILED, message: null };
    }

    currentStatus = existing.data.status;
    currentNeedsVerification = existing.data.needs_verification;
  }

  const values = {
    kind: input.kind,
    name: input.name,
    issuer: input.issuer,
    year_label: input.yearLabel,
    details: input.details,
    needs_verification: input.needsVerification,
    track: input.track,
    highlight: input.highlight,
    sort_order: input.sortOrder,
    verification_url: input.verificationUrl,
    expires_on: input.expiresOn,
    status: statusFromIntent(input.intent, currentStatus),
  };

  if (!input.id) {
    const { data, error } = await auth.supabase
      .from("credentials")
      .insert(values)
      .select("id")
      .single();

    if (error || !data) {
      return { error: mapWriteError(error?.code), message: null };
    }

    await completePublicCmsMutation({
      revalidate: () => revalidateCredentialSurfaces(data.id),
      paths: credentialPaths({
        wasPublic: false,
        isPublic: isPublicCredential({
          status: values.status,
          needsVerification: values.needs_verification,
        }),
        affectsAbout: input.kind === "degree",
      }),
    });
    redirect(`/admin/credentials/${data.id}`);
  }

  const { error } = await auth.supabase
    .from("credentials")
    .update(values)
    .eq("id", input.id);

  if (error) {
    return { error: mapWriteError(error.code), message: null };
  }

  await completePublicCmsMutation({
    revalidate: () => revalidateCredentialSurfaces(input.id ?? undefined),
    paths: credentialPaths({
      wasPublic: isPublicCredential({
        status: currentStatus,
        needsVerification: currentNeedsVerification,
      }),
      isPublic: isPublicCredential({
        status: values.status,
        needsVerification: values.needs_verification,
      }),
      affectsAbout: input.kind === "degree",
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

export async function deleteCredentialAction(formData: FormData) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const id = readUuid(formData.get("id"));

  if (!id) {
    return;
  }

  const existing = await getAdminCredential(auth.supabase, id);

  if (existing.error || !existing.data) {
    return;
  }

  const { error } = await auth.supabase.from("credentials").delete().eq("id", id);

  if (error) {
    return;
  }

  await completePublicCmsMutation({
    revalidate: () => revalidateCredentialSurfaces(id),
    paths: credentialPaths({
      wasPublic: isPublicCredential({
        status: existing.data.status,
        needsVerification: existing.data.needs_verification,
      }),
      isPublic: false,
      affectsAbout: existing.data.kind === "degree",
    }),
  });
  redirect("/admin/credentials");
}

export async function saveCredentialsPageAction(
  _previous: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return { error: auth.error, message: null };
  }

  const parsed = parseCredentialsPageFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error, message: null };
  }

  const input = parsed.value;
  const existing = await getAdminCredentialsPage(auth.supabase);

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
    const inserted = await auth.supabase
      .from("credentials_page")
      .insert({
        ...values,
        singleton_key: CREDENTIALS_PAGE_SINGLETON_KEY,
      })
      .select("id")
      .maybeSingle();

    if (inserted.error || !inserted.data) {
      return { error: PAGE_FAILED, message: null };
    }
  } else {
    const { error } = await auth.supabase
      .from("credentials_page")
      .update(values)
      .eq("id", existing.data.id)
      .eq("singleton_key", CREDENTIALS_PAGE_SINGLETON_KEY);

    if (error) {
      return { error: PAGE_FAILED, message: null };
    }
  }

  await completePublicCmsMutation({
    revalidate: () => revalidateCredentialsPageSurfaces(),
    paths: singletonPagePaths({
      wasPublished: isPublishedStatus(existing.data?.status),
      isPublished: isPublishedStatus(values.status),
      path: "/credentials",
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
