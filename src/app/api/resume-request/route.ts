import { NextResponse } from "next/server";
import {
  hashClientFingerprint,
  hashNormalizedEmail,
  readClientIpSignal,
  verifyContactFormToken,
} from "@/lib/contact/crypto";
import { readBoundedText } from "@/lib/contact/body";
import { isAllowedResumeRequestOrigin } from "@/lib/resume-requests/origin";
import { isResumeRequestIntakeConfigured } from "@/lib/resume-requests/intake";
import { submitPublicResumeRequest } from "@/lib/resume-requests/submit";
import {
  isHoneypotEmpty,
  parsePublicResumeRequest,
  RESUME_REQUEST_LIMITS,
} from "@/lib/resume-requests/validation";

const GENERIC_UNAVAILABLE = { ok: false as const, error: "unavailable" };
const GENERIC_INVALID = { ok: false as const, error: "invalid" };
const GENERIC_RATE = { ok: false as const, error: "rate_limited" };

export async function POST(request: Request) {
  const bounded = await readBoundedText(request, RESUME_REQUEST_LIMITS.bodyMax);

  if (!bounded.ok) {
    return NextResponse.json(GENERIC_INVALID, { status: bounded.status });
  }

  if (!isResumeRequestIntakeConfigured()) {
    return NextResponse.json(GENERIC_UNAVAILABLE, { status: 503 });
  }

  if (!isAllowedResumeRequestOrigin(request)) {
    return NextResponse.json(GENERIC_INVALID, { status: 400 });
  }

  let body: Record<string, unknown>;

  try {
    const parsed: unknown = JSON.parse(bounded.text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json(GENERIC_INVALID, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(GENERIC_INVALID, { status: 400 });
  }

  if (!isHoneypotEmpty(body.company_website)) {
    return NextResponse.json(GENERIC_INVALID, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";

  if (!token || !verifyContactFormToken(token)) {
    return NextResponse.json(GENERIC_INVALID, { status: 400 });
  }

  const fields = parsePublicResumeRequest(body);

  if (!fields.ok) {
    return NextResponse.json(
      { ok: false, error: "invalid", fields: fields.fields },
      { status: 400 },
    );
  }

  const fingerprintHash = hashClientFingerprint(
    readClientIpSignal(request.headers),
    request.headers.get("user-agent") ?? "",
  );
  const emailHash = hashNormalizedEmail(fields.value.email);
  const result = await submitPublicResumeRequest(
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
