/**
 * IndexNow discovery notification helper.
 *
 * Do not import from client components. Submits only from Vercel Production
 * through explicit calls. CMS mutation wiring is intentionally not included.
 */

import { CANONICAL_SITE_URL, getSiteUrl } from "./site-url";
import { isVercelProductionDeployment } from "./vercel-env";

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_KEY_PATH = "/indexnow-key.txt";
export const INDEXNOW_HOST = new URL(CANONICAL_SITE_URL).host;
export const INDEXNOW_KEY_LOCATION = `${CANONICAL_SITE_URL}${INDEXNOW_KEY_PATH}`;

/**
 * IndexNow allows up to 10,000 URLs per request. This portfolio has roughly
 * two dozen indexable pages, so a much smaller explicit cap is enough.
 */
export const INDEXNOW_MAX_URLS = 100;

export const INDEXNOW_REQUEST_TIMEOUT_MS = 8_000;

const PATH_PATTERN = /^\/(?:[A-Za-z0-9._~-]+(?:\/[A-Za-z0-9._~-]+)*)?$/;

export type IndexNowResult = {
  ok: boolean;
  submitted: boolean;
  skipped: boolean;
  status: number | null;
  reason: string;
  urlCount: number;
};

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
  const key = readIndexNowKey(env);

  if (!key) {
    return new Response(null, { status: 404 });
  }

  return new Response(`${key}\n`, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export function normalizeIndexNowPath(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  if (/^[a-zA-Z][a-zA-Z+.-]*:/.test(trimmed)) {
    return null;
  }

  if (trimmed.includes("\\") || /\s/.test(trimmed)) {
    return null;
  }

  let path = trimmed.split("#")[0]?.split("?")[0] ?? "";

  if (path !== "/" && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  if (!PATH_PATTERN.test(path) || path.includes("..")) {
    return null;
  }

  return path;
}

export function normalizeIndexNowPaths(paths: unknown): string[] {
  if (!Array.isArray(paths)) {
    return [];
  }

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const value of paths) {
    const path = normalizeIndexNowPath(value);

    if (!path || seen.has(path)) {
      continue;
    }

    seen.add(path);
    normalized.push(path);

    if (normalized.length >= INDEXNOW_MAX_URLS) {
      break;
    }
  }

  return normalized;
}

export function canonicalIndexNowUrls(paths: string[]): string[] {
  const origin = getSiteUrl();
  return paths.map((path) => `${origin}${path === "/" ? "" : path}`);
}

function skipped(
  reason: string,
  urlCount = 0,
): IndexNowResult {
  return {
    ok: true,
    submitted: false,
    skipped: true,
    status: null,
    reason,
    urlCount,
  };
}

export async function submitIndexNowPaths(
  paths: string[],
  options: IndexNowSubmitOptions = {},
): Promise<IndexNowResult> {
  const env = options.env ?? process.env;
  const urls = canonicalIndexNowUrls(normalizeIndexNowPaths(paths));

  if (urls.length === 0) {
    return skipped("no-valid-paths");
  }

  if (!isVercelProductionDeployment(env)) {
    return skipped("not-production", urls.length);
  }

  const key = readIndexNowKey(env);

  if (!key) {
    return skipped("missing-key", urls.length);
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
      body: JSON.stringify({
        host: INDEXNOW_HOST,
        key,
        keyLocation: INDEXNOW_KEY_LOCATION,
        urlList: urls,
      }),
      signal: controller.signal,
      redirect: "error",
      cache: "no-store",
    });

    if (response.status === 200) {
      return {
        ok: true,
        submitted: true,
        skipped: false,
        status: 200,
        reason: "success",
        urlCount: urls.length,
      };
    }

    return {
      ok: false,
      submitted: false,
      skipped: false,
      status: response.status,
      reason: `http-${response.status}`,
      urlCount: urls.length,
    };
  } catch {
    return {
      ok: false,
      submitted: false,
      skipped: false,
      status: null,
      reason: "network-error",
      urlCount: urls.length,
    };
  } finally {
    clearTimeout(timeout);
  }
}
