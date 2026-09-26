import { NextResponse } from "next/server";
import { requireAdminMutation } from "@/lib/admin/authorization";
import { isUuid } from "@/lib/admin/ids";
import { getAdminResumeRequest } from "@/lib/admin/resume-requests/queries";
import {
  fulfillmentAssetError,
  fulfillmentAuditFields,
  privateDownloadHeaders,
  resolveFulfillmentDocument,
} from "@/lib/admin/resume-fulfillment/policy";
import {
  downloadPrivateDocument,
  readActivePrivateDocument,
} from "@/lib/admin/resume-fulfillment/storage";

const FAILED = { error: "That document is not available." };

export async function POST(request: Request) {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(FAILED, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(FAILED, { status: 400 });
  }

  const record = body as { documentKey?: unknown; requestId?: unknown };
  const requestId = typeof record.requestId === "string" ? record.requestId : "";

  if (!isUuid(requestId)) {
    return NextResponse.json(FAILED, { status: 400 });
  }

  const existing = await getAdminResumeRequest(auth.supabase, requestId);

  if (existing.error || !existing.data) {
    return NextResponse.json(FAILED, { status: 404 });
  }

  const resolved = resolveFulfillmentDocument(
    existing.data.resume_choice,
    typeof record.documentKey === "string" ? record.documentKey : null,
  );

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }

  const asset = await readActivePrivateDocument(resolved.document);
  const unavailable = fulfillmentAssetError(resolved.document, {
    [resolved.document]: asset ? { active: true } : { active: false },
  });

  if (unavailable || !asset) {
    return NextResponse.json(
      { error: unavailable ?? FAILED.error },
      { status: 409 },
    );
  }

  const bytes = await downloadPrivateDocument(asset.objectPath);

  if (!bytes) {
    return NextResponse.json(FAILED, { status: 404 });
  }

  const user = await auth.supabase.auth.getUser();
  const userId = user.data.user?.id;

  if (userId) {
    const now = new Date();
    await auth.supabase
      .from("resume_requests")
      .update(fulfillmentAuditFields(resolved.document, userId, now))
      .eq("id", existing.data.id);
  }

  return new NextResponse(bytes, {
    status: 200,
    headers: privateDownloadHeaders(resolved.document),
  });
}
