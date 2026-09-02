import { describe, expect, it } from "vitest";
import {
  assertDeliberateFileChange,
  assertImmutablePublishedSlug,
  parsePublicationFormData,
} from "./validation";

function form(entries: Array<[string, string]>) {
  const data = new FormData();
  for (const [name, value] of entries) {
    data.append(name, value);
  }
  return data;
}

const required = [
  ["slug", "ncsp-localization-local-government-units"],
  ["title", "NCSP Localization"],
  ["document_kind", "publication"],
  ["rights_status", "link_only"],
  ["publisher", "Friedrich Naumann Foundation"],
  ["year_label", "2023"],
  ["abstract", "External professional work."],
  ["external_url", "https://www.freiheit.org/example"],
  ["track", "all"],
  ["sort_order", "110"],
  ["intent", "publish"],
] as Array<[string, string]>;

describe("publication validation", () => {
  it("requires HTTPS for link-only works and rejects a local PDF", () => {
    const parsed = parsePublicationFormData(form(required));
    expect(parsed.ok).toBe(true);

    const http = parsePublicationFormData(
      form(
        required.map(([name, value]) =>
          name === "external_url" ? [name, "http://example.com"] : [name, value],
        ),
      ),
    );
    expect(http.ok).toBe(false);

    const withPdf = parsePublicationFormData(
      form([...required, ["media_id", "11111111-1111-4111-8111-111111111111"]]),
    );
    expect(withPdf.ok).toBe(false);
  });

  it("rejects unknown rights statuses", () => {
    const parsed = parsePublicationFormData(
      form(
        required.map(([name, value]) =>
          name === "rights_status" ? [name, "rewrite"] : [name, value],
        ),
      ),
    );
    expect(parsed.ok).toBe(false);
  });

  it("locks published slugs", () => {
    expect(
      assertImmutablePublishedSlug({
        currentStatus: "published",
        currentSlug: "kept-slug",
        nextSlug: "new-slug",
      }).ok,
    ).toBe(false);
    expect(
      assertImmutablePublishedSlug({
        currentStatus: "draft",
        currentSlug: "kept-slug",
        nextSlug: "new-slug",
      }).ok,
    ).toBe(true);
  });

  it("requires explicit confirmation to retarget a published PDF", () => {
    expect(
      assertDeliberateFileChange({
        currentStatus: "published",
        currentRights: "host_pdf",
        currentMediaId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        nextMediaId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        confirmReplaceFile: false,
      }).ok,
    ).toBe(false);
    expect(
      assertDeliberateFileChange({
        currentStatus: "published",
        currentRights: "host_pdf",
        currentMediaId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        nextMediaId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        confirmReplaceFile: true,
      }).ok,
    ).toBe(true);
  });
});
