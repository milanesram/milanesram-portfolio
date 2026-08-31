import { ButtonLink } from "@/components/ui/ButtonLink";
import {
  getAvailabilityLabel,
  type PublishedPublication,
} from "@/lib/content/publications";

export function WritingIndexCard({
  publication,
  featured = false,
}: {
  publication: PublishedPublication;
  featured?: boolean;
}) {
  const Heading = featured ? "h2" : "h3";

  return (
    <article
      className={`rounded-xl border border-line bg-paper-elevated p-6 shadow-[var(--shadow)] ${featured ? "sm:p-8" : ""}`}
    >
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
        {publication.documentKindLabel} · {publication.yearLabel}
      </p>
      <Heading
        className={`mt-3 font-serif font-medium tracking-tight text-ink ${featured ? "text-3xl sm:text-4xl" : "text-2xl"}`}
      >
        {publication.title}
      </Heading>
      <p className="mt-2 text-sm text-ink-faint">{publication.publisher}</p>
      <p
        className={`mt-4 leading-7 text-ink-soft ${featured ? "max-w-3xl text-base" : "text-sm"}`}
      >
        {publication.abstract}
      </p>
      <p className="mt-4 text-sm text-ink-faint">{publication.trackRelevance}</p>
      <p className="mt-2 text-sm text-ink-faint">
        {getAvailabilityLabel(publication.availability)}
      </p>
      <div className="mt-6">
        <ButtonLink href={`/writing/${publication.slug}`} variant="accent">
          Read publication
        </ButtonLink>
      </div>
    </article>
  );
}
