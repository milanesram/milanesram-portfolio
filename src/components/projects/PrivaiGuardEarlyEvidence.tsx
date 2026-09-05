import { ProjectScreenshotFigure } from "@/components/projects/ProjectWorkflowGallery";
import type { PublishedProjectMedia } from "@/lib/content/project-map";
import { PRIVAI_VISUAL_EVIDENCE_HEADING_ID } from "@/lib/content/privai-evidence";

export function PrivaiGuardEarlyEvidence({
  capabilities,
  stack,
  preview,
}: {
  capabilities: string[];
  stack: string[];
  preview: PublishedProjectMedia | null;
}) {
  return (
    <>
      {capabilities.length > 0 ? (
        <section
          className="mt-0"
          aria-labelledby="implemented-controls-heading"
        >
          <h2
            id="implemented-controls-heading"
            className="scroll-mt-24 font-serif text-2xl font-medium text-ink"
          >
            Implemented controls
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-ink-soft">
            {capabilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {stack.length > 0 ? (
        <section className="mt-12" aria-labelledby="stack-heading">
          <h2
            id="stack-heading"
            className="scroll-mt-24 font-serif text-2xl font-medium text-ink"
          >
            Stack
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technical stack">
            {stack.map((item) => (
              <li
                key={item}
                className="rounded-full border border-line px-3 py-1 font-mono text-xs text-ink-soft"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {preview ? (
        <section className="mt-12" aria-labelledby="working-product-heading">
          <h2
            id="working-product-heading"
            className="scroll-mt-24 font-serif text-2xl font-medium text-ink"
          >
            Working product
          </h2>
          <p className="mt-4 leading-8 text-ink-soft">
            First screenshot from the working capstone MVP.{" "}
            <a
              href={`#${PRIVAI_VISUAL_EVIDENCE_HEADING_ID}`}
              className="font-medium text-accent hover:underline"
            >
              View the full visual workflow
            </a>
          </p>
          <div className="mt-6">
            <ProjectScreenshotFigure
              item={preview}
              preload
              announcement="decorative-preview"
            />
          </div>
        </section>
      ) : null}
    </>
  );
}
