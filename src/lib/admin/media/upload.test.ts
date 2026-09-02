import { describe, expect, it, vi } from "vitest";
import {
  mediaStoragePath,
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

  it("refuses deletion while the asset is referenced", async () => {
    const { assertMediaNotReferenced } = await import("./upload");
    expect(assertMediaNotReferenced(2).ok).toBe(false);
    expect(assertMediaNotReferenced(0).ok).toBe(true);
  });
});
