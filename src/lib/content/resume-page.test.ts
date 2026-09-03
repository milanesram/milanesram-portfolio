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

  it("maps one, two, or three hosted tracks without assuming a pair", () => {
    const first = mapResumeTrack(track(), () => null);
    const second = mapResumeTrack(
      track({
        id: "22222222-2222-4222-8222-222222222222",
        slug: "privacy-ai-governance",
        title: "Privacy / AI Governance",
        focus_pages: { slug: "privacy-ai-governance", status: "published" },
      }),
      () => null,
    );
    const third = mapResumeTrack(
      track({
        id: "33333333-3333-4333-8333-333333333333",
        slug: "technology-risk",
        title: "Technology / IT Risk",
        focus_pages: { slug: "technology-risk", status: "published" },
      }),
      () => null,
    );

    const tracks = [first, second, third].filter(
      (item): item is NonNullable<typeof item> => item !== null,
    );

    expect(tracks).toHaveLength(3);
    expect(tracks.map((item) => item.slug)).toEqual([
      "cybersecurity-grc",
      "privacy-ai-governance",
      "technology-risk",
    ]);
    expect(tracks.every((item) => item.deliveryMode === "request")).toBe(true);
    expect(tracks.every((item) => item.media === null)).toBe(true);
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
