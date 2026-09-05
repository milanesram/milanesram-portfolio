import Image from "next/image";
import type { PublishedProjectMedia } from "@/lib/content/project-map";
import {
  PRIVAI_VISUAL_EVIDENCE_HEADING_ID,
  projectScreenshotPresentation,
  type ProjectScreenshotAnnouncement,
} from "@/lib/content/privai-evidence";

const SCREENSHOT_WIDTH = 1200;
const SCREENSHOT_HEIGHT = 766;

export function ProjectScreenshotFigure({
  item,
  preload = false,
  announcement = "canonical",
}: {
  item: PublishedProjectMedia;
  preload?: boolean;
  announcement?: ProjectScreenshotAnnouncement;
}) {
  const presentation = projectScreenshotPresentation(announcement, item);
  const image = (
    <Image
      src={item.media.publicUrl}
      alt={presentation.imageAlt}
      width={SCREENSHOT_WIDTH}
      height={SCREENSHOT_HEIGHT}
      className="h-auto w-full"
      sizes="(min-width: 672px) 42rem, calc(100vw - 2.5rem)"
      preload={preload ? true : undefined}
      loading={preload ? "eager" : "lazy"}
    />
  );
  const frameClassName =
    "block overflow-hidden rounded-xl border border-line bg-paper";

  return (
    <figure aria-hidden={presentation.figureAriaHidden ? true : undefined}>
      {presentation.linkHref ? (
        <a
          href={presentation.linkHref}
          target="_blank"
          rel="noreferrer"
          aria-label={presentation.linkAriaLabel ?? undefined}
          className={`${frameClassName} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
        >
          {image}
        </a>
      ) : (
        <div className={frameClassName}>{image}</div>
      )}
      <figcaption className="mt-3 text-sm leading-6 text-ink-soft">
        {presentation.caption}
      </figcaption>
    </figure>
  );
}

export function ProjectWorkflowGallery({
  items,
  preloadFirst = true,
}: {
  items: PublishedProjectMedia[];
  preloadFirst?: boolean;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-12" aria-labelledby={PRIVAI_VISUAL_EVIDENCE_HEADING_ID}>
      <h2
        id={PRIVAI_VISUAL_EVIDENCE_HEADING_ID}
        className="scroll-mt-24 font-serif text-2xl font-medium text-ink"
      >
        Visual workflow evidence
      </h2>
      <p className="mt-4 leading-8 text-ink-soft">
        Screenshots from the working capstone MVP, in workflow order: employee
        control, governance review, remediation, audit evidence, and management
        visibility.
      </p>
      <ol className="mt-8 space-y-10">
        {items.map((item, index) => (
          <li key={item.id}>
            <ProjectScreenshotFigure
              item={item}
              preload={preloadFirst && index === 0}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
