import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { PAGE_SEO_PATHS } from "@/lib/content/page-seo";
import { focusPagePath } from "@/lib/indexnow-content-map";
import { CANONICAL_SITE_URL } from "@/lib/site-url";

const root = resolve(import.meta.dirname, "../../..");
const NEW_PATH = "/focus/privacy-compliance-assurance";
const OLD_PATH = "/focus/privacy-ai-governance";

function source(path: string): string {
  return readFileSync(resolve(root, path), "utf8");
}

function walk(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    const info = statSync(full);

    if (info.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") {
        continue;
      }
      files.push(...walk(full));
      continue;
    }

    if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }

  return files;
}

describe("privacy focus canonical route", () => {
  it("serves the existing privacy page at the new route", () => {
    const page = source("src/app/focus/privacy-compliance-assurance/page.tsx");
    expect(page).toContain('getPublishedFocusPage("privacy-compliance-assurance")');
    expect(page).toContain('generateRouteMetadata("focus-privacy-ai-governance")');
    expect(page).toContain("<FocusView");
    expect(source("src/content/site.ts")).toContain(`href: "${NEW_PATH}"`);
    expect(source("src/content/site.ts")).toContain(
      'navLabel: "Privacy, Compliance & Assurance"',
    );
    expect(source("src/content/site.ts")).toContain('href: "/focus/cybersecurity-grc"');
  });

  it("permanently redirects the legacy route in one declaration", () => {
    const config = source("next.config.ts");
    expect(config).toContain(`source: "${OLD_PATH}"`);
    expect(config).toContain(`destination: "${NEW_PATH}"`);
    expect(config).toContain("permanent: true");
    expect(config.match(/source: "\/focus\/privacy-ai-governance"/g)).toHaveLength(1);
  });

  it("points canonical metadata and the sitemap at the new route only", () => {
    expect(PAGE_SEO_PATHS["focus-privacy-ai-governance"]).toBe(NEW_PATH);
    expect(PAGE_SEO_PATHS["focus-cybersecurity-grc"]).toBe("/focus/cybersecurity-grc");
    expect(`${CANONICAL_SITE_URL}${NEW_PATH}`).toBe(
      "https://milanesram.com/focus/privacy-compliance-assurance",
    );
    const sitemap = source("src/app/sitemap.ts");
    expect(sitemap).toContain(`"${NEW_PATH}"`);
    expect(sitemap).not.toContain(`"${OLD_PATH}"`);
    expect(sitemap).toContain('"/focus/cybersecurity-grc"');
    expect(focusPagePath("privacy-compliance-assurance")).toBe(NEW_PATH);
    expect(focusPagePath("privacy-ai-governance")).toBeNull();
  });

  it("keeps the legacy path out of active application links", () => {
    const allowed = new Set([
      "next.config.ts",
      "src/lib/content/privacy-focus-route.test.ts",
      "src/lib/content/global-identity.test.ts",
    ]);
    const hits = walk(resolve(root, "src"))
      .concat(resolve(root, "next.config.ts"))
      .map((file) => relative(root, file))
      .filter((file) => source(file).includes(OLD_PATH))
      .filter((file) => !allowed.has(file));

    expect(hits).toEqual([]);
  });

  it("changes only the privacy focus slug", () => {
    const migration = source(
      "supabase/migrations/20260927260000_migrate_privacy_focus_route.sql",
    );
    expect(migration).toContain("SET slug = 'privacy-compliance-assurance'");
    expect(migration).toContain("slug = 'privacy-ai-governance'");
    expect(migration).toContain("Privacy, Compliance & Assurance");
    expect(migration).not.toMatch(
      /UPDATE public\.(site_profile|home_page|page_seo|about_page|experiences|experience_items|resume_tracks|contact_page|projects)\b/,
    );
  });
});
