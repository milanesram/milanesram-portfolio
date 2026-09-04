/**
 * Pure IndexNow helpers: path validation, canonical URLs, and result types.
 *
 * This module must not read INDEXNOW_KEY or perform network requests.
 */

import { CANONICAL_SITE_URL, getSiteUrl } from "./site-url";

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

export type IndexNowSkipReason =
  | "no-valid-paths"
  | "not-production"
  | "missing-key"
  | "empty-paths";

export function skipped(
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

export function buildIndexNowPayload(key: string, urls: string[]) {
  return {
    host: INDEXNOW_HOST,
    key,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urls,
  };
}

export function indexNowSkipReason(args: {
  urlCount: number;
  isProduction: boolean;
  hasKey: boolean;
}): IndexNowSkipReason | null {
  if (args.urlCount === 0) {
    return "no-valid-paths";
  }

  if (!args.isProduction) {
    return "not-production";
  }

  if (!args.hasKey) {
    return "missing-key";
  }

  return null;
}

export function indexNowResultFromHttpStatus(
  status: number,
  urlCount: number,
): IndexNowResult {
  if (status === 200) {
    return {
      ok: true,
      submitted: true,
      skipped: false,
      status: 200,
      reason: "success",
      urlCount,
    };
  }

  return {
    ok: false,
    submitted: false,
    skipped: false,
    status,
    reason: `http-${status}`,
    urlCount,
  };
}

export function indexNowNetworkFailure(urlCount: number): IndexNowResult {
  return {
    ok: false,
    submitted: false,
    skipped: false,
    status: null,
    reason: "network-error",
    urlCount,
  };
}

export function indexNowKeyTextParts(key: string | null): {
  status: number;
  body: string | null;
} {
  if (!key) {
    return { status: 404, body: null };
  }

  return { status: 200, body: `${key}\n` };
}

export async function runBestEffortIndexNowNotify(
  paths: readonly string[],
  submit: (paths: string[]) => Promise<IndexNowResult>,
): Promise<IndexNowResult> {
  const normalized = normalizeIndexNowPaths([...paths]);

  if (normalized.length === 0) {
    return skipped("empty-paths");
  }

  try {
    return await submit(normalized);
  } catch {
    return skipped("notify-error");
  }
}
