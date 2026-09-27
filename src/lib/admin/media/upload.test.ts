import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertResumePdfStaysNonPublic,
  mediaStoragePath,
  RESUME_PDF_PUBLIC_ERROR,
  RESUME_PDF_UPLOAD_ERROR,
  resolveMediaUploadBucket,
  rollbackUploadedObjectIfInsertFailed,
  sanitizeUploadFilename,
  UPLOAD_CONTENT_MISMATCH,
  UPLOAD_FILE_ACCEPT,
  validateUploadFile,
} from "./upload";

const PNG = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]);
const JPEG = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const WEBP = Uint8Array.from([
  0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);
const AVIF = Uint8Array.from([
  0x00, 0x00, 0x00, 0x10, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66, 0x00,
  0x00, 0x00, 0x00,
]);
const PDF = new TextEncoder().encode("%PDF-1.4\n");

describe("media upload validation", () => {
  it("accepts an allowed image and PDF whose bytes match", () => {
    expect(
      validateUploadFile({
        kind: "image",
        purpose: "project",
        filename: "PrivAI Guard hero.PNG",
        mimeType: "image/png",
        byteSize: PNG.byteLength,
        bytes: PNG,
      }),
    ).toMatchObject({
      ok: true,
      value: { safeFilename: "privai-guard-hero.png", mimeType: "image/png" },
    });

    expect(
      validateUploadFile({
        kind: "document",
        purpose: "publication",
        filename: "paper.pdf",
        mimeType: "application/pdf",
        byteSize: PDF.byteLength,
        bytes: PDF,
      }).ok,
    ).toBe(true);
  });

  it("rejects disallowed MIME, oversized files, and unsafe names", () => {
    expect(
      validateUploadFile({
        kind: "image",
        purpose: "project",
        filename: "note.txt",
        mimeType: "text/plain",
        byteSize: 12,
        bytes: new TextEncoder().encode("hello world\n"),
      }).ok,
    ).toBe(false);

    expect(
      validateUploadFile({
        kind: "image",
        purpose: "project",
        filename: "huge.png",
        mimeType: "image/png",
        byteSize: 9 * 1024 * 1024,
        bytes: PNG,
      }),
    ).toEqual({ ok: false, error: "Images must be 8 MB or smaller." });

    expect(sanitizeUploadFilename("../secret.pdf")).toBeNull();
    expect(sanitizeUploadFilename("My Paper.PDF")).toBe("my-paper.pdf");
    expect(mediaStoragePath("project", "11111111-1111-4111-8111-111111111111", "hero.png")).toBe(
      "project/11111111-1111-4111-8111-111111111111/hero.png",
    );
  });

  it("keeps UUID-based storage paths", () => {
    expect(
      mediaStoragePath(
        "publication",
        "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        "paper.pdf",
      ),
    ).toBe("publication/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee/paper.pdf");
  });

  it("removes the Storage object when metadata insert fails", async () => {
    const removeObject = vi.fn(async () => undefined);
    const failed = await rollbackUploadedObjectIfInsertFailed({
      insertError: { message: "db" },
      removeObject,
    });
    expect(failed.ok).toBe(false);
    expect(removeObject).toHaveBeenCalledOnce();

    const ok = await rollbackUploadedObjectIfInsertFailed({
      insertError: null,
      removeObject,
    });
    expect(ok.ok).toBe(true);
    expect(removeObject).toHaveBeenCalledOnce();
  });

  it("accepts a sanitized public resume PDF and rejects unsafe resume uploads", () => {
    expect(
      validateUploadFile({
        kind: "document",
        purpose: "public_resume",
        filename: "rainier-milanes-grc-it-risk-security-compliance-resume.pdf",
        mimeType: "application/pdf",
        byteSize: PDF.byteLength,
        bytes: PDF,
      }),
    ).toMatchObject({
      ok: true,
      value: {
        safeFilename: "rainier-milanes-grc-it-risk-security-compliance-resume.pdf",
        mimeType: "application/pdf",
      },
    });

    expect(
      validateUploadFile({
        kind: "resume_pdf",
        purpose: "public_resume",
        filename: "resume.pdf",
        mimeType: "application/pdf",
        byteSize: PDF.byteLength,
        bytes: PDF,
      }).ok,
    ).toBe(false);

    expect(
      validateUploadFile({
        kind: "document",
        purpose: "public_resume",
        filename: "resume.pdf",
        mimeType: "image/png",
        byteSize: PDF.byteLength,
        bytes: PDF,
      }).ok,
    ).toBe(false);

    expect(
      validateUploadFile({
        kind: "document",
        purpose: "public_resume",
        filename: "resume.pdf",
        mimeType: "application/pdf",
        byteSize: PNG.byteLength,
        bytes: PNG,
      }),
    ).toEqual({ ok: false, error: UPLOAD_CONTENT_MISMATCH });

    expect(
      validateUploadFile({
        kind: "document",
        purpose: "public_resume",
        filename: "resume.pdf",
        mimeType: "application/pdf",
        byteSize: new TextEncoder().encode("not a pdf").byteLength,
        bytes: new TextEncoder().encode("not a pdf"),
      }),
    ).toEqual({ ok: false, error: UPLOAD_CONTENT_MISMATCH });

    expect(
      validateUploadFile({
        kind: "document",
        purpose: "public_resume",
        filename: "resume.pdf",
        mimeType: "application/pdf",
        byteSize: 12 * 1024 * 1024 + 1,
        bytes: PDF,
      }),
    ).toEqual({ ok: false, error: "PDFs must be 12 MB or smaller." });

    expect(
      validateUploadFile({
        kind: "document",
        purpose: "public_resume",
        filename: "../resume.pdf",
        mimeType: "application/pdf",
        byteSize: PDF.byteLength,
        bytes: PDF,
      }).ok,
    ).toBe(false);

    expect(
      resolveMediaUploadBucket({ kind: "resume_pdf", isPublic: true }),
    ).toEqual({ ok: false, error: RESUME_PDF_UPLOAD_ERROR });
    expect(
      resolveMediaUploadBucket({ kind: "document", isPublic: true }),
    ).toEqual({ ok: true, value: { bucket: "public-media" } });
  });

  it("rejects resume PDFs before they can enter public media", () => {
    const privateResume = resolveMediaUploadBucket({
      kind: "resume_pdf",
      isPublic: false,
    });
    const publicResume = resolveMediaUploadBucket({
      kind: "resume_pdf",
      isPublic: true,
    });

    expect(privateResume).toEqual({ ok: false, error: RESUME_PDF_UPLOAD_ERROR });
    expect(publicResume).toEqual({ ok: false, error: RESUME_PDF_UPLOAD_ERROR });
    expect(RESUME_PDF_UPLOAD_ERROR).toContain("private document workflow");
    expect(RESUME_PDF_UPLOAD_ERROR).toContain("public media");
    expect(resolveMediaUploadBucket({ kind: "image", isPublic: false })).toEqual({
      ok: true,
      value: { bucket: "public-media" },
    });
    expect(
      resolveMediaUploadBucket({ kind: "document", isPublic: true }),
    ).toEqual({
      ok: true,
      value: { bucket: "public-media" },
    });
    expect(
      assertResumePdfStaysNonPublic({ kind: "resume_pdf", isPublic: true }),
    ).toEqual({ ok: false, error: RESUME_PDF_PUBLIC_ERROR });
    expect(
      assertResumePdfStaysNonPublic({ kind: "resume_pdf", isPublic: false }).ok,
    ).toBe(true);
    expect(assertResumePdfStaysNonPublic({ kind: "image", isPublic: true }).ok).toBe(
      true,
    );
  });

  it("does not describe a public-bucket upload as private", () => {
    const root = resolve(import.meta.dirname, "../../../..");
    const form = readFileSync(
      resolve(root, "src/components/admin/MediaUploadForm.tsx"),
      "utf8",
    );
    const page = readFileSync(
      resolve(root, "src/app/admin/media/new/page.tsx"),
      "utf8",
    );
    const actions = readFileSync(
      resolve(root, "src/app/admin/media/actions.ts"),
      "utf8",
    );

    expect(form).not.toContain("resume_pdf");
    expect(form).not.toContain("draft and private");
    expect(form).toContain("UPLOAD_FILE_ACCEPT");
    expect(form).toContain("public media bucket");
    expect(form).toContain("Resume and CV documents are not uploaded here");
    expect(page).toContain("public media bucket");
    expect(actions.indexOf("requireAdminMutation")).toBeLessThan(
      actions.indexOf("arrayBuffer"),
    );
    expect(actions.indexOf("arrayBuffer")).toBeLessThan(
      actions.indexOf("validateUploadFile({"),
    );
    expect(actions.indexOf("validateUploadFile({")).toBeLessThan(
      actions.indexOf(".upload("),
    );
    expect(actions.indexOf("if (!validated.ok)")).toBeLessThan(
      actions.indexOf(".upload("),
    );
    expect(actions.indexOf(".upload(")).toBeLessThan(actions.indexOf(".insert("));
    expect(UPLOAD_FILE_ACCEPT).toContain("image/jpeg");
    expect(UPLOAD_FILE_ACCEPT).toContain("application/pdf");
    expect(UPLOAD_FILE_ACCEPT).not.toContain("image/svg");
    expect(actions).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(actions).toContain("upsert: false");
  });

  it("rejects extension, MIME, and content mismatches before accepting a file", () => {
    const text = new TextEncoder().encode("not an image");

    expect(
      validateUploadFile({
        kind: "image",
        purpose: "portrait",
        filename: "photo.gif",
        mimeType: "image/jpeg",
        byteSize: JPEG.byteLength,
        bytes: JPEG,
      }).ok,
    ).toBe(false);

    expect(
      validateUploadFile({
        kind: "image",
        purpose: "project",
        filename: "photo.png",
        mimeType: "image/jpeg",
        byteSize: PNG.byteLength,
        bytes: PNG,
      }).ok,
    ).toBe(false);

    expect(
      validateUploadFile({
        kind: "image",
        purpose: "project",
        filename: "photo.png",
        mimeType: "image/png",
        byteSize: text.byteLength,
        bytes: text,
      }),
    ).toEqual({ ok: false, error: UPLOAD_CONTENT_MISMATCH });

    expect(
      validateUploadFile({
        kind: "document",
        purpose: "publication",
        filename: "paper.pdf",
        mimeType: "application/pdf",
        byteSize: text.byteLength,
        bytes: text,
      }),
    ).toEqual({ ok: false, error: UPLOAD_CONTENT_MISMATCH });

    expect(
      validateUploadFile({
        kind: "image",
        purpose: "project",
        filename: "photo.png",
        mimeType: "image/png",
        byteSize: PDF.byteLength,
        bytes: PDF,
      }),
    ).toEqual({ ok: false, error: UPLOAD_CONTENT_MISMATCH });

    expect(
      validateUploadFile({
        kind: "image",
        purpose: "project",
        filename: "empty.png",
        mimeType: "image/png",
        byteSize: 0,
        bytes: new Uint8Array(),
      }),
    ).toEqual({ ok: false, error: "The file is empty." });

    expect(
      validateUploadFile({
        kind: "image",
        purpose: "project",
        filename: "short.png",
        mimeType: "image/png",
        byteSize: 8,
        bytes: PNG.slice(0, 8),
      }),
    ).toEqual({ ok: false, error: UPLOAD_CONTENT_MISMATCH });

    expect(
      validateUploadFile({
        kind: "document",
        purpose: "publication",
        filename: "short.pdf",
        mimeType: "application/pdf",
        byteSize: 5,
        bytes: PDF.slice(0, 5),
      }),
    ).toEqual({ ok: false, error: UPLOAD_CONTENT_MISMATCH });

    expect(
      validateUploadFile({
        kind: "image",
        purpose: "journey",
        filename: "tile.WEBP",
        mimeType: "image/webp",
        byteSize: WEBP.byteLength,
        bytes: WEBP,
      }),
    ).toMatchObject({ ok: true, value: { safeFilename: "tile.webp", mimeType: "image/webp" } });

    expect(
      validateUploadFile({
        kind: "image",
        purpose: "portrait",
        filename: "tile.avif",
        mimeType: "image/avif",
        byteSize: AVIF.byteLength,
        bytes: AVIF,
      }).ok,
    ).toBe(true);

    expect(
      validateUploadFile({
        kind: "image",
        purpose: "portrait",
        filename: "photo.jpg",
        mimeType: "image/jpeg",
        byteSize: JPEG.byteLength,
        bytes: JPEG,
      }).ok,
    ).toBe(true);

    expect(
      validateUploadFile({
        kind: "document",
        purpose: "publication",
        filename: "Paper.PDF",
        mimeType: "application/x-pdf",
        byteSize: PDF.byteLength,
        bytes: PDF,
      }),
    ).toMatchObject({ ok: true, value: { mimeType: "application/x-pdf" } });

    expect(
      validateUploadFile({
        kind: "image",
        purpose: "project",
        filename: "photo.png",
        mimeType: "",
        byteSize: PNG.byteLength,
        bytes: PNG,
      }).ok,
    ).toBe(false);

    expect(
      validateUploadFile({
        kind: "image",
        purpose: "project",
        filename: "photo.png",
        mimeType: "image/png",
        byteSize: JPEG.byteLength,
        bytes: JPEG,
      }),
    ).toEqual({ ok: false, error: UPLOAD_CONTENT_MISMATCH });

    expect(
      validateUploadFile({
        kind: "image",
        purpose: "project",
        filename: "photo.avif",
        mimeType: "image/avif",
        byteSize: 16,
        bytes: Uint8Array.from([
          0x00, 0x00, 0x00, 0x10, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63,
          0x00, 0x00, 0x00, 0x00,
        ]),
      }),
    ).toEqual({ ok: false, error: UPLOAD_CONTENT_MISMATCH });
  });

  it("refuses deletion while the asset is referenced", async () => {
    const { assertMediaNotReferenced } = await import("./upload");
    expect(assertMediaNotReferenced(2).ok).toBe(false);
    expect(assertMediaNotReferenced(0).ok).toBe(true);
  });
});
