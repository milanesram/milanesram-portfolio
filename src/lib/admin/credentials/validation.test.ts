import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  parseOptionalDate,
  parseOptionalHttpsUrl,
} from "./fields";
import {
  parseCredentialFormData,
  parseCredentialsPageFormData,
} from "./validation";

function form(entries: Array<[string, string]>) {
  const data = new FormData();
  for (const [name, value] of entries) {
    data.append(name, value);
  }
  return data;
}

const required = [
  ["kind", "degree"],
  ["name", "Master of Science in Information Systems, Security Specialization"],
  ["issuer", "Northwestern University"],
  ["year_label", "2026"],
  ["details", "Coursework includes Information Security Management."],
  ["track", "all"],
  ["sort_order", "10"],
  ["intent", "publish"],
] as Array<[string, string]>;

describe("verification URL validation", () => {
  it("allows a blank URL", () => {
    expect(parseOptionalHttpsUrl("", "Verification URL")).toEqual({
      ok: true,
      value: null,
    });
    expect(parseOptionalHttpsUrl(null, "Verification URL")).toEqual({
      ok: true,
      value: null,
    });
  });

  it("accepts ordinary secure URLs and preserves the submitted value", () => {
    const cases = [
      "https://verify.example.com/credential",
      "https://verify.example.com/credential?id=1",
      "https://verify.example.com/credential#section",
      "HTTPS://verify.example.com/credential",
    ];

    for (const input of cases) {
      expect(parseOptionalHttpsUrl(input, "Verification URL")).toEqual({
        ok: true,
        value: input,
      });
    }
  });

  it("rejects every scheme other than https", () => {
    const rejected = [
      "javascript:alert(1)",
      "JAVASCRIPT:alert(1)",
      " javascript:alert(1)",
      "data:text/html,hi",
      "DATA:text/html,hi",
      "vbscript:msgbox(1)",
      "VBSCRIPT:msgbox(1)",
      " vbscript:msgbox(1)",
      "http://example.com",
      "//example.com",
      "file:///tmp/example",
      "ftp://example.com/file",
      "custom:thing",
      "not-a-url",
    ];

    for (const input of rejected) {
      const parsed = parseOptionalHttpsUrl(input, "Verification URL");
      expect(parsed.ok, input).toBe(false);
    }
  });

  it("renders a verification link as an href, not as HTML", () => {
    const card = readFileSync(
      resolve(import.meta.dirname, "../../../components/ui/CredentialCard.tsx"),
      "utf8",
    );

    expect(card).toContain("href={credential.verificationUrl}");
    expect(card).not.toContain("dangerouslySetInnerHTML");
  });
});

describe("expiration validation", () => {
  it("allows a blank date", () => {
    expect(parseOptionalDate("", "Expiration date")).toEqual({
      ok: true,
      value: null,
    });
  });

  it("accepts a valid calendar date", () => {
    expect(parseOptionalDate("2028-06-15", "Expiration date")).toEqual({
      ok: true,
      value: "2028-06-15",
    });
  });

  it("rejects an invalid date", () => {
    expect(parseOptionalDate("2028-13-40", "Expiration date").ok).toBe(false);
    expect(parseOptionalDate("June 2028", "Expiration date").ok).toBe(false);
  });
});

describe("credential form validation", () => {
  it("accepts a complete hosted credential payload", () => {
    const parsed = parseCredentialFormData(form(required));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.name).toContain("Information Systems");
      expect(parsed.value.verificationUrl).toBeNull();
      expect(parsed.value.expiresOn).toBeNull();
      expect(parsed.value.needsVerification).toBe(false);
    }
  });

  it("rejects an invalid kind", () => {
    expect(
      parseCredentialFormData(form([["kind", "badge"], ...required.slice(1)]))
        .ok,
    ).toBe(false);
  });

  it("accepts verification URL and expiry together", () => {
    const parsed = parseCredentialFormData(
      form([
        ...required,
        ["verification_url", "https://verify.example.com/cc"],
        ["expires_on", "2028-06-01"],
        ["highlight", "on"],
        ["needs_verification", "on"],
      ]),
    );
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.verificationUrl).toBe(
        "https://verify.example.com/cc",
      );
      expect(parsed.value.expiresOn).toBe("2028-06-01");
      expect(parsed.value.highlight).toBe(true);
      expect(parsed.value.needsVerification).toBe(true);
    }
  });
});

describe("credentials page validation", () => {
  it("requires headline and lede", () => {
    expect(
      parseCredentialsPageFormData(
        form([
          ["kicker", "Credentials"],
          ["lede", "Lede"],
          ["intent", "publish"],
        ]),
      ).ok,
    ).toBe(false);
  });

  it("accepts the hosted page framing payload", () => {
    const parsed = parseCredentialsPageFormData(
      form([
        ["kicker", "Credentials"],
        ["headline", "Education, certifications, and licensure"],
        [
          "lede",
          "Selected verified credentials that support cybersecurity governance.",
        ],
        ["intent", "publish"],
      ]),
    );
    expect(parsed.ok).toBe(true);
  });
});
