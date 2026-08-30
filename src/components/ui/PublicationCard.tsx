import type { Publication } from "@/content";

export function PublicationCard({ publication }: { publication: Publication }) {
  return (
    <article className="rounded-xl border border-line bg-paper-elevated p-6 shadow-[var(--shadow)]">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
        Publication · {publication.yearLabel}
      </p>
      <h3 className="mt-3 font-serif text-2xl font-medium text-ink">
        {publication.title}
      </h3>
      <p className="mt-2 text-sm text-ink-faint">{publication.publisher}</p>
      <p className="mt-4 leading-7 text-ink-soft">{publication.abstract}</p>
      <a
        href={publication.externalUrl}
        className="mt-5 inline-flex text-sm font-medium text-accent hover:underline"
        target="_blank"
        rel="noreferrer"
      >
        Read the publication on the publisher site
      </a>
    </article>
  );
}
