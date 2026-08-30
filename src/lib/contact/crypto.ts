import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getContactRateLimitSecret } from "./config";

const TOKEN_MIN_AGE_MS = 3000;
const TOKEN_MAX_AGE_MS = 2 * 60 * 60 * 1000;
const MAX_IP_SIGNAL = 64;
const MAX_USER_AGENT = 256;

function clip(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max);
}

function requireSecret(): string {
  const secret = getContactRateLimitSecret();

  if (!secret) {
    throw new Error("Missing required environment variable.");
  }

  return secret;
}

export function hmacSha256Hex(value: string): string {
  return createHmac("sha256", requireSecret()).update(value).digest("hex");
}

export function hashClientFingerprint(ipSignal: string, userAgent: string): string {
  return hmacSha256Hex(
    `fp:${clip(ipSignal, MAX_IP_SIGNAL)}\0${clip(userAgent, MAX_USER_AGENT)}`,
  );
}

export function hashNormalizedEmail(email: string): string {
  return hmacSha256Hex(`email:${email.trim().toLowerCase()}`);
}

export function issueContactFormToken(now = Date.now()): string {
  const nonce = randomBytes(16).toString("hex");
  const payload = `${now}.${nonce}`;
  const signature = hmacSha256Hex(`token:${payload}`);
  return `${payload}.${signature}`;
}

export function verifyContactFormToken(
  token: string,
  now = Date.now(),
): boolean {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [issuedRaw, nonce, signature] = parts;

  if (!issuedRaw || !nonce || !signature) {
    return false;
  }

  if (!/^\d+$/.test(issuedRaw) || !/^[a-f0-9]{32}$/.test(nonce)) {
    return false;
  }

  if (!/^[a-f0-9]{64}$/.test(signature)) {
    return false;
  }

  const expected = hmacSha256Hex(`token:${issuedRaw}.${nonce}`);
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");

  if (
    expectedBuffer.length !== actualBuffer.length ||
    !timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    return false;
  }

  const issuedAt = Number(issuedRaw);
  const age = now - issuedAt;

  if (!Number.isFinite(issuedAt) || age < TOKEN_MIN_AGE_MS || age > TOKEN_MAX_AGE_MS) {
    return false;
  }

  return true;
}

// IP is an abuse-control heuristic only. It is hashed, never persisted,
// and is not treated as a verified identity.
export function readClientIpSignal(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");

  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first && first.length <= MAX_IP_SIGNAL) {
      return first;
    }
  }

  const realIp = headers.get("x-real-ip")?.trim();

  if (realIp && realIp.length <= MAX_IP_SIGNAL) {
    return realIp;
  }

  return "unknown";
}
