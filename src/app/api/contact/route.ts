import { NextResponse } from "next/server";
import { isContactIntakeConfigured } from "@/lib/contact/config";
import {
  hashClientFingerprint,
  hashNormalizedEmail,
  readClientIpSignal,
  verifyContactFormToken,
} from "@/lib/contact/crypto";
import { getPublicSiteSettings } from "@/lib/content/settings";
import { submitPublicInquiryRpc } from "@/lib/contact/submit";
import { readBoundedText } from "@/lib/contact/body";
import {
  CONTACT_LIMITS,
  isHoneypotEmpty,
  parsePublicInquiryFields,
} from "@/lib/contact/validation";

const GENERIC_UNAVAILABLE = { ok: false as const, error: "unavailable" };
const GENERIC_INVALID = { ok: false as const, error: "invalid" };
const GENERIC_RATE = { ok: false as const, error: "rate_limited" };

function expectedOrigin(request: Request): string | null {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  if (configured) {
    return configured;
  }

  try {
    return new URL(request.url).origin;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const bounded = await readBoundedText(request, CONTACT_LIMITS.bodyMax);

  if (!bounded.ok) {
    return NextResponse.json(GENERIC_INVALID, { status: bounded.status });
  }

  if (!isContactIntakeConfigured()) {
    return NextResponse.json(GENERIC_UNAVAILABLE, { status: 503 });
  }

  const settings = await getPublicSiteSettings();

  if (!settings?.contactFormEnabled) {
    return NextResponse.json(GENERIC_UNAVAILABLE, { status: 503 });
  }

  const origin = request.headers.get("origin");
  const expected = expectedOrigin(request);

  if (origin && expected && origin.replace(/\/$/, "") !== expected) {
    return NextResponse.json(GENERIC_INVALID, { status: 400 });
  }

  const raw = bounded.text;

  let body: Record<string, unknown>;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json(GENERIC_INVALID, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(GENERIC_INVALID, { status: 400 });
  }

  if (!isHoneypotEmpty(body.website)) {
    return NextResponse.json(GENERIC_INVALID, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";

  if (!token || !verifyContactFormToken(token)) {
    return NextResponse.json(GENERIC_INVALID, { status: 400 });
  }

  const fields = parsePublicInquiryFields(body);

  if (!fields.ok) {
    return NextResponse.json(GENERIC_INVALID, { status: 400 });
  }

  const fingerprintHash = hashClientFingerprint(
    readClientIpSignal(request.headers),
    request.headers.get("user-agent") ?? "",
  );
  const emailHash = hashNormalizedEmail(fields.value.email);
  const result = await submitPublicInquiryRpc(
    fields.value,
    fingerprintHash,
    emailHash,
  );

  if (result.ok) {
    return NextResponse.json({ ok: true });
  }

  if (result.kind === "rate_limited") {
    return NextResponse.json(GENERIC_RATE, { status: 429 });
  }

  if (result.kind === "invalid") {
    return NextResponse.json(GENERIC_INVALID, { status: 400 });
  }

  return NextResponse.json(GENERIC_UNAVAILABLE, { status: 503 });
}
