import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const header = readFileSync(
  resolve(import.meta.dirname, "../../components/layout/SiteHeader.tsx"),
  "utf8",
);
const shell = readFileSync(
  resolve(import.meta.dirname, "../../components/layout/SiteShell.tsx"),
  "utf8",
);

describe("keyboard disclosure", () => {
  it("keeps the mobile menu as an unmounted disclosure with Escape dismissal", () => {
    expect(header).toContain('aria-expanded={open}');
    expect(header).toContain("event.key !== \"Escape\"");
    expect(header).toContain("menuButtonRef.current?.focus({ focusVisible: true } as FocusOptions)");
    expect(header).toContain("{open ? (");
    expect(header).not.toMatch(/tabIndex=\{\s*[1-9]/);
    expect(header).not.toContain("inert");
  });

  it("lets the skip link move focus to main without adding it to the tab order", () => {
    expect(shell).toContain('href="#main"');
    expect(shell).toContain('id="main"');
    expect(shell).toContain("tabIndex={-1}");
    expect(shell).not.toMatch(/tabIndex=\{\s*[1-9]/);
  });
});
