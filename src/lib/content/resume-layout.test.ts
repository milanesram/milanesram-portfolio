import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { resumeTracksLayoutClass } from "./resume-layout";

const RESUME_PAGE_SOURCE = readFileSync(
  resolve(import.meta.dirname, "../../app/resume/page.tsx"),
  "utf8",
);

describe("resumeTracksLayoutClass", () => {
  it("constrains a single track to an editorial width", () => {
    expect(resumeTracksLayoutClass(1)).toContain("max-w-xl");
    expect(resumeTracksLayoutClass(1)).not.toMatch(/grid-cols-2/);
  });

  it("uses a balanced two-column desktop treatment for two tracks", () => {
    expect(resumeTracksLayoutClass(2)).toContain("md:grid-cols-2");
    expect(resumeTracksLayoutClass(2)).not.toContain("max-w-xl");
  });

  it("uses an equal three-column treatment for three tracks", () => {
    expect(resumeTracksLayoutClass(3)).toContain("md:grid-cols-3");
    expect(resumeTracksLayoutClass(3)).not.toContain("lg:grid-cols-2");
  });

  it("keeps four or more tracks on a wrapping responsive grid", () => {
    expect(resumeTracksLayoutClass(4)).toContain("sm:grid-cols-2");
    expect(resumeTracksLayoutClass(4)).toContain("xl:grid-cols-3");
  });
});

describe("resume page copy assumptions", () => {
  it("does not hardcode a two-track identity", () => {
    expect(RESUME_PAGE_SOURCE).not.toMatch(/TWO TRACKS/i);
    expect(RESUME_PAGE_SOURCE).not.toMatch(/Two recruiter packets/i);
    expect(RESUME_PAGE_SOURCE).not.toMatch(/Resume A|Resume B/);
    expect(RESUME_PAGE_SOURCE).toContain("ResumeTracks");
  });
});
