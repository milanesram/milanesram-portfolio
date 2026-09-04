/**
 * Server-only IndexNow submission and CMS notification.
 *
 * Do not import from client components. Submits only from Vercel Production
 * through explicit calls after a successful CMS write.
 */

import "server-only";

import { isVercelProductionDeployment } from "./vercel-env";
import {
  INDEXNOW_ENDPOINT,
  INDEXNOW_REQUEST_TIMEOUT_MS,
  buildIndexNowPayload,
  canonicalIndexNowUrls,
  indexNowKeyTextParts,
  indexNowNetworkFailure,
  indexNowResultFromHttpStatus,
  indexNowSkipReason,
  normalizeIndexNowPaths,
  runBestEffortIndexNowNotify,
  skipped,
  type IndexNowResult,
} from "./indexnow-core";

export {
  INDEXNOW_ENDPOINT,
  INDEXNOW_HOST,
  INDEXNOW_KEY_LOCATION,
  INDEXNOW_KEY_PATH,
  INDEXNOW_MAX_URLS,
  INDEXNOW_REQUEST_TIMEOUT_MS,
  canonicalIndexNowUrls,
  normalizeIndexNowPath,
  normalizeIndexNowPaths,
  type IndexNowResult,
} from "./indexnow-core";

export type IndexNowSubmitOptions = {
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
};

export function readIndexNowKey(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): string | null {
  const value = env.INDEXNOW_KEY?.trim() ?? "";
  return value.length > 0 ? value : null;
}

export function indexNowKeyTextResponse(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): Response {
  const parts = indexNowKeyTextParts(readIndexNowKey(env));

  if (parts.status !== 200 || parts.body == null) {
    return new Response(null, { status: 404 });
  }

  return new Response(parts.body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function submitIndexNowPaths(
  paths: string[],
  options: IndexNowSubmitOptions = {},
): Promise<IndexNowResult> {
  const env = options.env ?? process.env;
  const urls = canonicalIndexNowUrls(normalizeIndexNowPaths(paths));
  const key = readIndexNowKey(env);
  const skip = indexNowSkipReason({
    urlCount: urls.length,
    isProduction: isVercelProductionDeployment(env),
    hasKey: Boolean(key),
  });

  if (skip) {
    return skipped(skip, urls.length);
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    INDEXNOW_REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetchImpl(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(buildIndexNowPayload(key as string, urls)),
      signal: controller.signal,
      redirect: "error",
      cache: "no-store",
    });

    return indexNowResultFromHttpStatus(response.status, urls.length);
  } catch {
    return indexNowNetworkFailure(urls.length);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Best-effort IndexNow notification for authenticated CMS mutations.
 * Never throws. Never logs the key. Call only after a successful write
 * and existing path revalidation.
 */
export async function notifyIndexNowAfterCmsMutation(
  paths: readonly string[],
  options: IndexNowSubmitOptions = {},
): Promise<IndexNowResult> {
  return runBestEffortIndexNowNotify(paths, (normalized) =>
    submitIndexNowPaths(normalized, options),
  );
}

export async function completePublicCmsMutation(args: {
  revalidate: () => void;
  paths: readonly string[];
  notify?: (
    paths: readonly string[],
    options?: IndexNowSubmitOptions,
  ) => Promise<unknown>;
  notifyOptions?: IndexNowSubmitOptions;
}): Promise<void> {
  args.revalidate();

  const notify = args.notify ?? notifyIndexNowAfterCmsMutation;

  try {
    await notify(args.paths, args.notifyOptions);
  } catch {
    // Isolate unexpected notifier failures from the CMS result.
  }
}
