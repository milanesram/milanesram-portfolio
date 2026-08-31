import { ButtonLink } from "@/components/ui/ButtonLink";
import type { FocusSelectedWriting } from "@/lib/content/focus";

export function FocusWritingCard({
  publication,
}: {
  publication: FocusSelectedWriting;
}) {
  return (
    <article className="rounded-xl border border-line bg-paper-elevated p-6 shadow-[var(--shadow)]">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
        {publication.documentKindLabel} · {publication.yearLabel}
      </p>
      <h3 className="mt-3 font-serif text-2xl font-medium text-ink">
        {publication.title}
      </h3>
      <p className="mt-4 line-clamp-4 leading-7 text-ink-soft">
        {publication.abstract}
      </p>
      <div className="mt-6">
        <ButtonLink href={`/writing/${publication.slug}`} variant="accent">
          Read publication
        </ButtonLink>
      </div>
    </article>
  );
}
