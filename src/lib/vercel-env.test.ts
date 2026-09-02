import { describe, expect, it } from "vitest";
import { isVercelPreviewDeployment } from "./vercel-env";

describe("preview deployment detection", () => {
  it("treats only Vercel preview as a noindex environment", () => {
    expect(isVercelPreviewDeployment({ VERCEL_ENV: "preview" })).toBe(true);
    expect(isVercelPreviewDeployment({ VERCEL_ENV: "production" })).toBe(false);
    expect(isVercelPreviewDeployment({ VERCEL_ENV: "development" })).toBe(
      false,
    );
    expect(isVercelPreviewDeployment({})).toBe(false);
  });
});
