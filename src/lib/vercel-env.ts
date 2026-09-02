/**
 * Deployment-environment helpers.
 *
 * Vercel sets VERCEL_ENV to "production" | "preview" | "development".
 * Preview URLs must not be indexed even when hosted site_indexable is true.
 */

export function isVercelPreviewDeployment(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): boolean {
  return env.VERCEL_ENV === "preview";
}
