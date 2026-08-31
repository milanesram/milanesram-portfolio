import { ButtonLink } from "@/components/ui/ButtonLink";
import { CallToAction } from "@/components/ui/CallToAction";
import { Container } from "@/components/layout/Container";
import type { PublishedPublication } from "@/lib/content/publications";

function AvailabilityCta({ publication }: { publication: PublishedPublication }) {
  if (publication.availability === "pdf" && publication.pdfUrl) {
    return (
      <p className="mt-8">
        <ButtonLink href={publication.pdfUrl} variant="accent" external>
          Open PDF
        </ButtonLink>
      </p>
    );
  }

  if (publication.availability === "external" && publication.externalUrl) {
    return (
      <p className="mt-8">
        <ButtonLink href={publication.externalUrl} variant="accent" external>
          View on publisher site
        </ButtonLink>
      </p>
    );
  }

  return null;
}

export function WritingDetail({
  publication,
}: {
  publication: PublishedPublication;
}) {
  return (
    <>
      <header className="border-b border-line bg-paper-elevated py-16 sm:py-20">
        <div className="mx-auto max-w-[72rem] px-5 sm:px-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-copper">
            {publication.documentKindLabel} · {publication.yearLabel}
          </p>
          <h1 className="max-w-3xl font-serif text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            {publication.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-soft">
            {publication.publisher}
          </p>
          <p className="mt-2 max-w-2xl text-sm text-ink-faint">
            {publication.author}
          </p>
        </div>
      </header>
      <Container narrow className="py-16">
        <p className="text-base leading-8 text-ink-soft">{publication.abstract}</p>
        <p className="mt-8 text-sm text-ink-faint">{publication.trackRelevance}</p>
        <AvailabilityCta publication={publication} />
        {publication.availability === "pdf" ? (
          <p className="mt-6 text-sm text-ink-faint">
            Presented in the form originally published.
          </p>
        ) : null}
        {publication.availability === "external" && publication.externalUrl ? (
          <p className="mt-6 text-sm text-ink-faint">
            Original source:{" "}
            <a
              href={publication.externalUrl}
              className="font-medium text-accent hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {publication.publisher}
            </a>
          </p>
        ) : null}
        {publication.relatedFocus ? (
          <p className="mt-8 text-sm text-ink-soft">
            Related focus:{" "}
            <ButtonLink href={publication.relatedFocus.href} variant="text">
              {publication.relatedFocus.label}
            </ButtonLink>
          </p>
        ) : null}
        <div className="mt-16">
          <CallToAction />
        </div>
      </Container>
    </>
  );
}
