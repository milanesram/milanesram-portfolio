import { ButtonLink } from "@/components/ui/ButtonLink";
import { EditorialKicker } from "@/components/ui/EditorialKicker";
import type { FocusSelectedWriting } from "@/lib/content/focus";

export function FocusWritingCard({
  publication,
}: {
  publication: FocusSelectedWriting;
}) {
  return (
    <article className="rounded-lg border border-line bg-paper-elevated p-6 shadow-[var(--shadow)]">
      <EditorialKicker>
        {publication.documentKindLabel} · {publication.yearLabel}
      </EditorialKicker>
      <h3 className="font-serif text-2xl font-medium leading-snug text-ink">
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
