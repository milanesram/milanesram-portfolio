import Image from "next/image";
import type { PublishedProjectMedia } from "@/lib/content/project-map";

const SCREENSHOT_WIDTH = 1200;
const SCREENSHOT_HEIGHT = 766;

export function ProjectWorkflowGallery({
  items,
}: {
  items: PublishedProjectMedia[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-12" aria-labelledby="project-visual-evidence-heading">
      <h2
        id="project-visual-evidence-heading"
        className="font-serif text-2xl font-medium text-ink"
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
            <figure>
              <a
                href={item.media.publicUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open full-size screenshot: ${item.media.altText}`}
                className="block overflow-hidden rounded-xl border border-line bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Image
                  src={item.media.publicUrl}
                  alt={item.media.altText}
                  width={SCREENSHOT_WIDTH}
                  height={SCREENSHOT_HEIGHT}
                  className="h-auto w-full"
                  sizes="(min-width: 672px) 42rem, calc(100vw - 2.5rem)"
                  preload={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </a>
              <figcaption className="mt-3 text-sm leading-6 text-ink-soft">
                {item.caption}
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>
    </section>
  );
}
