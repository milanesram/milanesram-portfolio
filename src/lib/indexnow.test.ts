import { afterEach, describe, expect, it, vi } from "vitest";
import {
  INDEXNOW_ENDPOINT,
  INDEXNOW_HOST,
  INDEXNOW_KEY_LOCATION,
  INDEXNOW_MAX_URLS,
  canonicalIndexNowUrls,
  indexNowKeyTextResponse,
  normalizeIndexNowPath,
  normalizeIndexNowPaths,
  submitIndexNowPaths,
} from "./indexnow";

const ORIGINAL = {
  INDEXNOW_KEY: process.env.INDEXNOW_KEY,
  VERCEL_ENV: process.env.VERCEL_ENV,
};

afterEach(() => {
  if (ORIGINAL.INDEXNOW_KEY === undefined) {
    delete process.env.INDEXNOW_KEY;
  } else {
    process.env.INDEXNOW_KEY = ORIGINAL.INDEXNOW_KEY;
  }

  if (ORIGINAL.VERCEL_ENV === undefined) {
    delete process.env.VERCEL_ENV;
  } else {
    process.env.VERCEL_ENV = ORIGINAL.VERCEL_ENV;
  }
});

describe("IndexNow key verification response", () => {
  it("returns the configured key as UTF-8 plain text", async () => {
    const response = indexNowKeyTextResponse({
      INDEXNOW_KEY: "test-indexnow-key-0001",
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
    expect(await response.text()).toBe("test-indexnow-key-0001\n");
  });

  it("returns 404 when the key is absent", async () => {
    const response = indexNowKeyTextResponse({});

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("");
  });

  it("treats a whitespace-only key as absent", async () => {
    const response = indexNowKeyTextResponse({ INDEXNOW_KEY: "   " });

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("");
  });
});

describe("IndexNow path normalization", () => {
  it("accepts canonical site paths", () => {
    expect(normalizeIndexNowPath("/")).toBe("/");
    expect(normalizeIndexNowPath("/about")).toBe("/about");
    expect(normalizeIndexNowPath("/writing/example")).toBe("/writing/example");
    expect(normalizeIndexNowPath("  /about  ")).toBe("/about");
  });

  it("removes duplicates and builds milanesram.com URLs", () => {
    const paths = normalizeIndexNowPaths([
      "/about",
      "/about/",
      "/about",
      "/writing/example",
    ]);

    expect(paths).toEqual(["/about", "/writing/example"]);
    expect(canonicalIndexNowUrls(paths)).toEqual([
      "https://milanesram.com/about",
      "https://milanesram.com/writing/example",
    ]);
  });

  it("rejects blank, absolute, protocol-relative, and malformed values", () => {
    expect(normalizeIndexNowPath("")).toBeNull();
    expect(normalizeIndexNowPath("   ")).toBeNull();
    expect(normalizeIndexNowPath("about")).toBeNull();
    expect(normalizeIndexNowPath("https://evil.example/about")).toBeNull();
    expect(normalizeIndexNowPath("http://milanesram.com/about")).toBeNull();
    expect(normalizeIndexNowPath("//evil.example")).toBeNull();
    expect(normalizeIndexNowPath("/../secret")).toBeNull();
    expect(normalizeIndexNowPath("/about?utm=1")).toBe("/about");
    expect(canonicalIndexNowUrls(["/"])).toEqual(["https://milanesram.com"]);
  });

  it("caps the path list at INDEXNOW_MAX_URLS", () => {
    const paths = Array.from(
      { length: INDEXNOW_MAX_URLS + 5 },
      (_, i) => `/${i}`,
    );
    expect(normalizeIndexNowPaths(paths)).toHaveLength(INDEXNOW_MAX_URLS);
  });
});

describe("IndexNow production guard", () => {
  it("does not fetch outside Vercel Production", async () => {
    const fetchImpl = vi.fn();

    const preview = await submitIndexNowPaths(["/about"], {
      env: { VERCEL_ENV: "preview", INDEXNOW_KEY: "test-indexnow-key-0001" },
      fetchImpl,
    });
    const local = await submitIndexNowPaths(["/about"], {
      env: { INDEXNOW_KEY: "test-indexnow-key-0001" },
      fetchImpl,
    });
    const localProductionBuild = await submitIndexNowPaths(["/about"], {
      env: {
        NODE_ENV: "production",
        INDEXNOW_KEY: "test-indexnow-key-0001",
      },
      fetchImpl,
    });

    expect(preview).toMatchObject({
      ok: true,
      skipped: true,
      submitted: false,
      reason: "not-production",
    });
    expect(local).toMatchObject({
      ok: true,
      skipped: true,
      submitted: false,
      reason: "not-production",
    });
    expect(localProductionBuild).toMatchObject({
      ok: true,
      skipped: true,
      submitted: false,
      reason: "not-production",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("does not fetch in Production when the key is missing", async () => {
    const fetchImpl = vi.fn();
    const result = await submitIndexNowPaths(["/about"], {
      env: { VERCEL_ENV: "production" },
      fetchImpl,
    });

    expect(result).toMatchObject({
      ok: true,
      skipped: true,
      submitted: false,
      reason: "missing-key",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts canonical URLs once in Vercel Production", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));

    const result = await submitIndexNowPaths(
      ["/", "/about", "/about", "https://evil.example/x"],
      {
        env: { VERCEL_ENV: "production", INDEXNOW_KEY: "test-indexnow-key-0001" },
        fetchImpl,
      },
    );

    expect(result).toEqual({
      ok: true,
      submitted: true,
      skipped: false,
      status: 200,
      reason: "success",
      urlCount: 2,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    const [endpoint, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(endpoint).toBe(INDEXNOW_ENDPOINT);
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({
      "Content-Type": "application/json; charset=utf-8",
    });
    expect(JSON.parse(String(init.body))).toEqual({
      host: INDEXNOW_HOST,
      key: "test-indexnow-key-0001",
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList: ["https://milanesram.com", "https://milanesram.com/about"],
    });
    expect(INDEXNOW_HOST).toBe("milanesram.com");
    expect(INDEXNOW_KEY_LOCATION).toBe(
      "https://milanesram.com/indexnow-key.txt",
    );
    expect(INDEXNOW_MAX_URLS).toBe(100);
  });
});

describe("IndexNow response handling", () => {
  const production = {
    VERCEL_ENV: "production",
    INDEXNOW_KEY: "test-indexnow-key-0001",
  };

  it("returns a safe failure for 403, 422, 429, and network errors", async () => {
    const forbidden = await submitIndexNowPaths(["/about"], {
      env: production,
      fetchImpl: vi.fn().mockResolvedValue(new Response(null, { status: 403 })),
    });
    const unprocessable = await submitIndexNowPaths(["/about"], {
      env: production,
      fetchImpl: vi.fn().mockResolvedValue(new Response(null, { status: 422 })),
    });
    const limited = await submitIndexNowPaths(["/about"], {
      env: production,
      fetchImpl: vi.fn().mockResolvedValue(new Response(null, { status: 429 })),
    });
    const network = await submitIndexNowPaths(["/about"], {
      env: production,
      fetchImpl: vi.fn().mockRejectedValue(new Error("offline")),
    });

    for (const result of [forbidden, unprocessable, limited, network]) {
      expect(result.ok).toBe(false);
      expect(result.submitted).toBe(false);
      expect(result.skipped).toBe(false);
    }

    expect(forbidden).toMatchObject({ status: 403, reason: "http-403" });
    expect(unprocessable).toMatchObject({ status: 422, reason: "http-422" });
    expect(limited).toMatchObject({ status: 429, reason: "http-429" });
    expect(network).toMatchObject({ status: null, reason: "network-error" });
  });

  it("does not throw when IndexNow fails", async () => {
    await expect(
      submitIndexNowPaths(["/about"], {
        env: production,
        fetchImpl: vi.fn().mockRejectedValue(new Error("offline")),
      }),
    ).resolves.toMatchObject({ ok: false, reason: "network-error" });
  });
});
