import Image from "next/image";
import type { PublishedProjectMedia } from "@/lib/content/project-map";

const SCREENSHOT_WIDTH = 1200;
const SCREENSHOT_HEIGHT = 766;

function ProjectMotif() {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-[2/1] overflow-hidden bg-[linear-gradient(165deg,var(--paper-elevated)_0%,var(--accent-soft)_100%)]"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 320 204"
        fill="none"
        focusable="false"
      >
        <circle cx="46" cy="58" r="18" stroke="var(--accent)" strokeWidth="1.25" />
        <circle cx="46" cy="58" r="3" fill="var(--accent)" />
        <path d="M64 58H128" stroke="var(--copper-decorative)" strokeWidth="1.25" />
        <circle cx="146" cy="58" r="8" stroke="var(--copper-decorative)" strokeWidth="1.25" />
        <path d="M146 66V112" stroke="var(--accent)" strokeWidth="1.25" />
        <rect
          x="118"
          y="112"
          width="92"
          height="52"
          stroke="var(--accent)"
          strokeWidth="1.25"
        />
        <path d="M210 138H248" stroke="var(--copper-decorative)" strokeWidth="1.25" />
        <circle cx="266" cy="138" r="14" stroke="var(--copper-decorative)" strokeWidth="1.25" />
        <circle cx="266" cy="138" r="3" fill="var(--copper-decorative)" />
        <path d="M46 76V130" stroke="var(--accent)" strokeWidth="1.25" opacity="0.8" />
        <circle cx="46" cy="146" r="6" stroke="var(--copper-decorative)" strokeWidth="1.25" />
      </svg>
    </div>
  );
}

export function ProjectLeadVisual({
  media,
  fallback = "none",
  bleed = false,
}: {
  media: PublishedProjectMedia | null;
  fallback?: "motif" | "none";
  bleed?: boolean;
}) {
  if (!media) {
    return fallback === "motif" ? <ProjectMotif /> : null;
  }

  return (
    <figure>
      <div className={`overflow-hidden bg-paper ${bleed ? "" : "border border-line"}`}>
        <Image
          src={media.media.publicUrl}
          alt={media.media.altText}
          width={SCREENSHOT_WIDTH}
          height={SCREENSHOT_HEIGHT}
          className="h-auto w-full"
          sizes="(min-width: 1024px) 22rem, calc(100vw - 2.5rem)"
        />
      </div>
      <figcaption
        className={`text-sm leading-6 text-ink-soft ${bleed ? "px-6 pt-3" : "mt-3"}`}
      >
        {media.caption}
      </figcaption>
    </figure>
  );
}
