import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "..", "..");

function readSrc(relativePath: string) {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("IndexNow server-only boundary", () => {
  it("keeps key reading and network submission behind server-only", () => {
    const server = readSrc("src/lib/indexnow.ts");
    const core = readSrc("src/lib/indexnow-core.ts");
    const map = readSrc("src/lib/indexnow-content-map.ts");
    const route = readSrc("src/app/indexnow-key.txt/route.ts");

    expect(server).toContain('import "server-only"');
    expect(server).toContain("INDEXNOW_KEY");
    expect(server).toContain("submitIndexNowPaths");
    expect(server).toContain("notifyIndexNowAfterCmsMutation");

    expect(core).not.toContain("process.env.INDEXNOW_KEY");
    expect(core).not.toContain("env.INDEXNOW_KEY");
    expect(core).not.toContain("process.env");
    expect(core).not.toContain("fetch(");

    expect(map).not.toContain("INDEXNOW_KEY");
    expect(map).not.toContain("submitIndexNowPaths");

    expect(route).toContain("@/lib/indexnow");
    expect(route).not.toContain("NEXT_PUBLIC_INDEXNOW_KEY");
  });

  it("is not imported by client components", () => {
    const sources = [
      "src/components/admin/SettingsForms.tsx",
      "src/components/admin/PublicationForm.tsx",
      "src/components/layout/AppChrome.tsx",
      "src/components/layout/SiteHeader.tsx",
    ];

    for (const file of sources) {
      expect(readSrc(file)).not.toContain("@/lib/indexnow");
      expect(readSrc(file)).not.toContain("INDEXNOW_KEY");
    }
  });
});
