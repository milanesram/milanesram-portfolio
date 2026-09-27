import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  REQUEST_RESUME_CTA_LABEL,
} from "@/lib/resume-requests/choices";
import {
  isEligibleResumeMedia,
  mapResumeTrack,
  resumeTracksHavePublicFiles,
  PUBLIC_RESUME_CTA_LABEL,
  UNAVAILABLE_RESUME_LABEL,
} from "./resume-page";
import type { ResumeMediaRow, ResumeTrackRow } from "./resume-page";

const ASSET: ResumeMediaRow = {
  id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  kind: "document",
  purpose: "public_resume",
  title: "Resume A",
  mime_type: "application/pdf",
  bucket_path:
    "public_resume/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee/rainier-milanes-grc-it-risk-security-compliance-resume.pdf",
  status: "published",
  is_public: true,
};

const PRIVACY_ASSET: ResumeMediaRow = {
  id: "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff",
  kind: "document",
  purpose: "public_resume",
  title: "Resume B",
  mime_type: "application/pdf",
  bucket_path:
    "public_resume/bbbbbbbb-cccc-4ddd-8eee-ffffffffffff/rainier-milanes-privacy-compliance-assurance-resume.pdf",
  status: "published",
  is_public: true,
};

const LEGACY_V4_ASSET: ResumeMediaRow = {
  id: "f4739fe2-8d6b-4b13-ad5c-f611e3ab97a5",
  kind: "resume_pdf",
  purpose: "resume",
  title: "Resume A V4.0",
  mime_type: "application/pdf",
  bucket_path:
    "resume/f4739fe2-8d6b-4b13-ad5c-f611e3ab97a5/ramilanes_resume_grc_it_risk_v4.pdf",
  status: "published",
  is_public: true,
};

function track(overrides: Partial<ResumeTrackRow> = {}): ResumeTrackRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "cybersecurity-grc",
    title: "Resume A — GRC, IT Risk & Security Compliance",
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

const publicUrlFor = (bucketPath: string) =>
  `https://example.supabase.co/storage/v1/object/public/public-media/${bucketPath}`;

describe("resume track mapping", () => {
  const previous = process.env.NEXT_PUBLIC_SUPABASE_URL;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = previous;
  });

  it("does not publish an attached PDF while delivery remains request", () => {
    const mapped = mapResumeTrack(
      track({ media_assets: ASSET }),
      publicUrlFor,
    );

    expect(mapped?.title).toBe("Resume A — GRC, IT Risk & Security Compliance");
    expect(mapped?.slug).toBe("cybersecurity-grc");
    expect(mapped?.media).toBeNull();
    expect(mapped?.href).toBe("/contact?request=grc_it_risk");
    expect(mapped?.ctaLabel).toBe(REQUEST_RESUME_CTA_LABEL);
    expect(mapped?.inquiryHref).toBe("/contact?inquiry=grc_it_risk");
    expect(mapped?.href).not.toContain("ramilanes_resume_grc_it_risk_v4.pdf");
  });

  it("routes a request track to the contact form without a download", () => {
    const mapped = mapResumeTrack(track(), () => "https://example.test/file.pdf");

    expect(mapped?.deliveryMode).toBe("request");
    expect(mapped?.href).toBe("/contact?request=grc_it_risk");
    expect(mapped?.ctaLabel).toBe(REQUEST_RESUME_CTA_LABEL);
    expect(mapped?.media).toBeNull();
    expect(mapped?.unavailable).toBe(false);
    expect(mapped?.homeKicker).toBe("Resume A");
    expect(mapped?.focusSlug).toBe("cybersecurity-grc");
  });

  it("routes Resume B requests to the privacy choice", () => {
    const mapped = mapResumeTrack(
      track({
        slug: "privacy-ai-governance",
        title: "Resume B — Privacy, Compliance & Assurance",
        media_assets: {
          ...PRIVACY_ASSET,
          bucket_path:
            "resume/29a9954b-5169-45dc-9b82-be04e041ba78/ramilanes_resume_privacy_compliance_v4.pdf",
        },
      }),
      publicUrlFor,
    );

    expect(mapped?.deliveryMode).toBe("request");
    expect(mapped?.href).toBe("/contact?request=privacy_compliance");
    expect(mapped?.ctaLabel).toBe(REQUEST_RESUME_CTA_LABEL);
    expect(mapped?.media).toBeNull();
    expect(mapped?.href).not.toContain("ramilanes_resume_privacy_compliance_v4.pdf");
  });

  it("does not publish a private resume path as a public file", () => {
    const mapped = mapResumeTrack(
      track({
        delivery_mode: "public_file",
        media_assets: {
          ...ASSET,
          bucket_path: "resume/v4/resume-a/ramilanes_resume_grc_it_risk_v4.pdf",
        },
      }),
      publicUrlFor,
    );

    expect(mapped?.media).toBeNull();
    expect(mapped?.href).toBeNull();
    expect(mapped?.ctaLabel).toBe(UNAVAILABLE_RESUME_LABEL);
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
    expect(mapped?.href).toBeNull();
    expect(mapped?.unavailable).toBe(true);
    expect(mapped?.ctaLabel).toBe(UNAVAILABLE_RESUME_LABEL);
  });

  it("maps a public-file GRC track to its resume PDF without renaming the route", () => {
    const mapped = mapResumeTrack(
      track({
        delivery_mode: "public_file",
        media_assets: ASSET,
      }),
      publicUrlFor,
    );

    expect(mapped?.slug).toBe("cybersecurity-grc");
    expect(mapped?.ctaLabel).toBe(PUBLIC_RESUME_CTA_LABEL);
    expect(mapped?.unavailable).toBe(false);
    expect(mapped?.href).toBe(publicUrlFor(ASSET.bucket_path));
    expect(mapped?.inquiryHref).toBeNull();
    expect(mapped?.media).toEqual({
      id: ASSET.id,
      title: ASSET.title,
      publicUrl: publicUrlFor(ASSET.bucket_path),
      mimeType: "application/pdf",
    });
  });

  it("maps a public-file privacy track to its resume PDF without renaming the route", () => {
    const mapped = mapResumeTrack(
      track({
        id: "22222222-2222-4222-8222-222222222222",
        slug: "privacy-ai-governance",
        title: "Resume B — Privacy, Compliance & Assurance",
        home_kicker: "Resume B",
        delivery_mode: "public_file",
        focus_pages: { slug: "privacy-ai-governance", status: "published" },
        media_assets: PRIVACY_ASSET,
      }),
      publicUrlFor,
    );

    expect(mapped?.slug).toBe("privacy-ai-governance");
    expect(mapped?.ctaLabel).toBe(PUBLIC_RESUME_CTA_LABEL);
    expect(mapped?.href).toBe(publicUrlFor(PRIVACY_ASSET.bucket_path));
    expect(mapped?.inquiryHref).toBeNull();
    expect(mapped?.media?.id).toBe(PRIVACY_ASSET.id);
    expect(mapped?.href).not.toBe(publicUrlFor(ASSET.bucket_path));
  });

  it("does not return a comprehensive CV or other non-resume document", () => {
    const mapped = mapResumeTrack(
      track({
        delivery_mode: "public_file",
        media_assets: {
          ...ASSET,
          kind: "document",
          purpose: "publication",
          title: "Comprehensive CV",
          bucket_path: "private-source/RAMilanes_CV_08292026.docx",
        },
      }),
      publicUrlFor,
    );

    expect(mapped?.media).toBeNull();
    expect(mapped?.href).toBeNull();
    expect(mapped?.unavailable).toBe(true);
  });

  it("does not create a broken URL when the public URL helper returns null", () => {
    const mapped = mapResumeTrack(
      track({
        delivery_mode: "public_file",
        media_assets: ASSET,
      }),
      () => null,
    );

    expect(mapped?.media).toBeNull();
    expect(mapped?.href).toBeNull();
    expect(mapped?.ctaLabel).toBe(UNAVAILABLE_RESUME_LABEL);
    expect(mapped?.unavailable).toBe(true);
  });

  it("does not expose unpublished or private resume media as a download", () => {
    const unpublished = mapResumeTrack(
      track({
        delivery_mode: "public_file",
        media_assets: { ...ASSET, status: "draft" },
      }),
      publicUrlFor,
    );
    const privateAsset = mapResumeTrack(
      track({
        delivery_mode: "public_file",
        media_assets: { ...ASSET, is_public: false },
      }),
      publicUrlFor,
    );

    expect(unpublished?.href).toBeNull();
    expect(unpublished?.media).toBeNull();
    expect(privateAsset?.href).toBeNull();
    expect(privateAsset?.media).toBeNull();
  });

  it("maps one, two, or three hosted tracks without assuming a pair", () => {
    const first = mapResumeTrack(track(), () => null);
    const second = mapResumeTrack(
      track({
        id: "22222222-2222-4222-8222-222222222222",
        slug: "privacy-ai-governance",
        title: "Resume B — Privacy, Compliance & Assurance",
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
    expect(tracks.map((item) => item.href)).toEqual([
      "/contact?request=grc_it_risk",
      "/contact?request=privacy_compliance",
      "/contact?request=not_sure",
    ]);
    expect(resumeTracksHavePublicFiles(tracks)).toBe(false);
  });

  it("requires a published public_resume PDF and refuses legacy or private files", () => {
    expect(
      isEligibleResumeMedia(ASSET, "https://example.test/file.pdf"),
    ).toBe(true);
    expect(
      isEligibleResumeMedia(
        { ...ASSET, kind: "image", purpose: "project" },
        "https://example.test/file.pdf",
      ),
    ).toBe(false);
    expect(
      isEligibleResumeMedia(
        { ...ASSET, kind: "resume_pdf", purpose: "resume" },
        "https://example.test/file.pdf",
      ),
    ).toBe(false);
    expect(
      isEligibleResumeMedia(
        {
          ...LEGACY_V4_ASSET,
          kind: "document",
          purpose: "public_resume",
        },
        "https://example.test/file.pdf",
      ),
    ).toBe(false);
    expect(
      isEligibleResumeMedia(
        {
          ...ASSET,
          bucket_path: "cv/v2/ramilanes_professional_cv_v2.pdf",
        },
        "https://example.test/file.pdf",
      ),
    ).toBe(false);
    expect(
      isEligibleResumeMedia(
        {
          ...ASSET,
          bucket_path: "private-resumes/cv/v2/ramilanes_professional_cv_v2.pdf",
        },
        "https://example.test/file.pdf",
      ),
    ).toBe(false);
  });

  it("does not map the unsanitized V4.0 media rows to a public download", () => {
    const mapped = mapResumeTrack(
      track({
        delivery_mode: "public_file",
        media_assets: LEGACY_V4_ASSET,
      }),
      publicUrlFor,
    );

    expect(mapped?.media).toBeNull();
    expect(mapped?.href).toBeNull();
    expect(mapped?.ctaLabel).toBe(UNAVAILABLE_RESUME_LABEL);
    expect(mapped?.inquiryHref).toBe("/contact?inquiry=grc_it_risk");
  });

  it("treats tracks with a public file as recruiter-ready", () => {
    const cyber = mapResumeTrack(
      track({ delivery_mode: "public_file", media_assets: ASSET }),
      publicUrlFor,
    );
    const privacy = mapResumeTrack(
      track({
        slug: "privacy-ai-governance",
        delivery_mode: "public_file",
        media_assets: PRIVACY_ASSET,
      }),
      publicUrlFor,
    );

    expect(resumeTracksHavePublicFiles([cyber!, privacy!])).toBe(true);
  });
});
