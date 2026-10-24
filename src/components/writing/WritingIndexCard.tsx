import { ButtonLink } from "@/components/ui/ButtonLink";
import { EditorialKicker } from "@/components/ui/EditorialKicker";
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
      className={`rounded-lg border border-line bg-paper-elevated p-6 shadow-[var(--shadow)] transition-[border-color,box-shadow] duration-200 hover:border-accent/40 hover:shadow-[var(--shadow-hover)] ${featured ? "sm:p-8" : ""}`}
    >
      <EditorialKicker>
        {publication.documentKindLabel} · {publication.yearLabel}
      </EditorialKicker>
      <Heading
        className={`font-serif font-medium leading-snug tracking-tight text-ink ${featured ? "text-3xl sm:text-4xl" : "text-2xl"}`}
      >
        {publication.title}
      </Heading>
      <p className="mt-2 text-sm text-ink-faint">{publication.publisher}</p>
      <p
        className={`mt-4 leading-7 text-ink-soft ${featured ? "max-w-3xl text-base" : "text-sm"}`}
      >
        {publication.abstract}
      </p>
      {publication.trackRelevance ? (
        <p className="mt-5 text-sm font-medium text-ink">{publication.trackRelevance}</p>
      ) : null}
      <p className="mt-2 text-sm text-ink-faint">
        {getAvailabilityLabel(publication.availability)}
      </p>
      <div className="mt-6">
        <ButtonLink
          href={`/writing/${publication.slug}`}
          variant="accent"
          ariaLabel={`Read publication: ${publication.title}`}
        >
          Read publication
        </ButtonLink>
      </div>
    </article>
  );
}
