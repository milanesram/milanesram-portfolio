import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const styles = readFileSync(resolve(import.meta.dirname, "./globals.css"), "utf8");
const resumePage = readFileSync(resolve(import.meta.dirname, "./resume/page.tsx"), "utf8");

function transitionColorsProperties(css: string): string[] {
  const block = css.match(/\.transition-colors\s*\{([^}]+)\}/);
  if (!block) return [];
  const property = block[1].match(/transition-property:\s*([^;]+);/);
  if (!property) return [];
  return property[1]
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

describe("focus indicator timing", () => {
  it("keeps color transitions and does not animate the focus outline", () => {
    const properties = transitionColorsProperties(styles);
    expect(properties).toEqual([
      "color",
      "background-color",
      "border-color",
      "text-decoration-color",
      "fill",
      "stroke",
      "--tw-gradient-from",
      "--tw-gradient-via",
      "--tw-gradient-to",
    ]);
    expect(properties).not.toContain("outline-color");
    expect(styles).toContain("outline: 2px solid var(--focus)");
    expect(styles).toContain("outline-offset: 2px");
  });
});

describe("resume footnote links", () => {
  it("underlines the email and LinkedIn text links in both footnote branches", () => {
    const links = [
      ...resumePage.matchAll(/<a\s+className="([^"]+)"[\s\S]*?>\s*(?:\{contact\.email\}|LinkedIn)/g),
    ].map((match) => match[1]);

    expect(links).toHaveLength(4);
    for (const className of links) {
      expect(className.split(/\s+/)).toContain("underline");
      expect(className).not.toContain("hover:underline");
    }
  });
});
