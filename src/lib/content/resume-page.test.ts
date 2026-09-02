import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { isEligibleResumeMedia, mapResumeTrack } from "./resume-page";
import type { ResumeTrackRow } from "./resume-page";

const ASSET = {
  id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  kind: "resume_pdf",
  purpose: "resume",
  title: "Resume A",
  mime_type: "application/pdf",
  bucket_path: "resume/a/resume-a.pdf",
  status: "published" as const,
  is_public: true,
};

function track(overrides: Partial<ResumeTrackRow> = {}): ResumeTrackRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "cybersecurity-grc",
    title: "Cybersecurity / GRC",
    summary: "Controls and IT risk.",
    delivery_mode: "request",
    request_cta_label: "View this profile",
    home_kicker: "Resume A",
    sort_order: 10,
    status: "published",
    focus_pages: { slug: "cybersecurity-grc", status: "published" },
    media_assets: null,
    ...overrides,
  };
}

describe("resume track mapping", () => {
  const previous = process.env.NEXT_PUBLIC_SUPABASE_URL;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = previous;
  });

  it("keeps request tracks on the Focus href without a download", () => {
    const mapped = mapResumeTrack(track(), () => "https://example.test/file.pdf");

    expect(mapped?.deliveryMode).toBe("request");
    expect(mapped?.href).toBe("/focus/cybersecurity-grc");
    expect(mapped?.media).toBeNull();
    expect(mapped?.homeKicker).toBe("Resume A");
    expect(mapped?.focusSlug).toBe("cybersecurity-grc");
  });

  it("does not create a public download without eligible media", () => {
    const mapped = mapResumeTrack(
      track({
        delivery_mode: "public_file",
        media_assets: { ...ASSET, is_public: false },
      }),
      () => "https://example.test/file.pdf",
    );

    expect(mapped?.media).toBeNull();
    expect(mapped?.href).toBe("/focus/cybersecurity-grc");
  });

  it("requires published public resume PDFs", () => {
    expect(
      isEligibleResumeMedia(ASSET, "https://example.test/file.pdf"),
    ).toBe(true);
    expect(
      isEligibleResumeMedia(
        { ...ASSET, kind: "image", purpose: "project" },
        "https://example.test/file.pdf",
      ),
    ).toBe(false);
  });
});
