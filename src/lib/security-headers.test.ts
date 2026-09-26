import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, securityHeaders } from "./security-headers";

const SUPABASE = "https://itoctveqrtozdehoofoq.supabase.co";

describe("content security policy", () => {
  it("frames nothing and avoids wildcard sources", () => {
    const policy = contentSecurityPolicy(SUPABASE);

    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).not.toMatch(/(?:src|uri|action) [^;]*\*/);
  });

  it("allows the contact-page LinkedIn badge and Supabase media", () => {
    const policy = contentSecurityPolicy(SUPABASE);

    expect(policy).toContain("https://platform.linkedin.com");
    expect(policy).toContain("https://badges.linkedin.com");
    expect(policy).toContain(
      "frame-src https://www.linkedin.com https://badges.linkedin.com",
    );
    expect(policy).toContain("https://itoctveqrtozdehoofoq.supabase.co");
    expect(policy).toContain("wss://itoctveqrtozdehoofoq.supabase.co");
  });

  it("omits a Supabase origin when the URL is not https", () => {
    const policy = contentSecurityPolicy("http://localhost:54321");

    expect(policy).not.toContain("localhost");
    expect(policy).toContain("connect-src 'self' https://www.linkedin.com");
  });
});

describe("security headers", () => {
  it("sets nosniff, referrer policy, framing, and CSP", () => {
    const headers = securityHeaders(SUPABASE);
    const keys = headers.map((header) => header.key);

    expect(keys).toEqual([
      "X-Content-Type-Options",
      "Referrer-Policy",
      "X-Frame-Options",
      "Content-Security-Policy",
    ]);
    expect(headers.find((header) => header.key === "X-Frame-Options")?.value).toBe(
      "DENY",
    );
  });
});
