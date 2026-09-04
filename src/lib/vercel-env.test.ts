import { describe, expect, it } from "vitest";
import { isVercelPreviewDeployment, isVercelProductionDeployment } from "./vercel-env";

describe("preview deployment detection", () => {
  it("treats only Vercel preview as a noindex environment", () => {
    expect(isVercelPreviewDeployment({ VERCEL_ENV: "preview" })).toBe(true);
    expect(isVercelPreviewDeployment({ VERCEL_ENV: "production" })).toBe(false);
    expect(isVercelPreviewDeployment({ VERCEL_ENV: "development" })).toBe(
      false,
    );
    expect(isVercelPreviewDeployment({})).toBe(false);
  });

  it("treats only Vercel production as eligible for IndexNow submission", () => {
    expect(isVercelProductionDeployment({ VERCEL_ENV: "production" })).toBe(
      true,
    );
    expect(isVercelProductionDeployment({ VERCEL_ENV: "preview" })).toBe(false);
    expect(isVercelProductionDeployment({ VERCEL_ENV: "development" })).toBe(
      false,
    );
    expect(isVercelProductionDeployment({})).toBe(false);
  });
});
