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

  it("accepts a valid HTTPS URL", () => {
    const parsed = parseOptionalHttpsUrl(
      "https://verify.example.com/credential",
      "Verification URL",
    );
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value).toBe("https://verify.example.com/credential");
    }
  });

  it("rejects HTTP, javascript, data, protocol-relative, and malformed URLs", () => {
    expect(parseOptionalHttpsUrl("http://example.com", "Verification URL").ok).toBe(
      false,
    );
    expect(
      parseOptionalHttpsUrl("javascript:alert(1)", "Verification URL").ok,
    ).toBe(false);
    expect(parseOptionalHttpsUrl("data:text/html,hi", "Verification URL").ok).toBe(
      false,
    );
    expect(parseOptionalHttpsUrl("//example.com", "Verification URL").ok).toBe(
      false,
    );
    expect(parseOptionalHttpsUrl("not-a-url", "Verification URL").ok).toBe(false);
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
