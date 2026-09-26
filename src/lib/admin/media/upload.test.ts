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
  validateUploadFile,
} from "./upload";

describe("media upload validation", () => {
  it("accepts an allowed image and PDF", () => {
    expect(
      validateUploadFile({
        kind: "image",
        purpose: "project",
        filename: "PrivAI Guard hero.PNG",
        mimeType: "image/png",
        byteSize: 120_000,
      }).ok,
    ).toBe(true);

    expect(
      validateUploadFile({
        kind: "document",
        purpose: "publication",
        filename: "paper.pdf",
        mimeType: "application/pdf",
        byteSize: 400_000,
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
      }).ok,
    ).toBe(false);

    expect(
      validateUploadFile({
        kind: "image",
        purpose: "project",
        filename: "huge.png",
        mimeType: "image/png",
        byteSize: 9 * 1024 * 1024,
      }).ok,
    ).toBe(false);

    expect(sanitizeUploadFilename("../secret.pdf")).toBeNull();
    expect(sanitizeUploadFilename("My Paper.PDF")).toBe("my-paper.pdf");
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
    expect(form).toContain("public media bucket");
    expect(form).toContain("Resume and CV documents are not uploaded here");
    expect(page).toContain("public media bucket");
    expect(actions.indexOf("resolveMediaUploadBucket")).toBeGreaterThan(0);
    expect(actions.indexOf("resolveMediaUploadBucket")).toBeLessThan(
      actions.indexOf(".upload("),
    );
    expect(actions).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(actions).toContain("upsert: false");
  });

  it("refuses deletion while the asset is referenced", async () => {
    const { assertMediaNotReferenced } = await import("./upload");
    expect(assertMediaNotReferenced(2).ok).toBe(false);
    expect(assertMediaNotReferenced(0).ok).toBe(true);
  });
});
