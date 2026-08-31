import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WritingIndexCard } from "@/components/writing/WritingIndexCard";
import {
  WRITING_INDEX_COPY,
  groupPublishedWriting,
  type PublishedPublication,
} from "@/lib/content/publications";

export function WritingIndex({
  publications,
}: {
  publications: PublishedPublication[];
}) {
  const { lead, availableHere, publishedElsewhere } =
    groupPublishedWriting(publications);

  if (!lead) {
    return (
      <>
        <PageHero
          kicker={WRITING_INDEX_COPY.eyebrow}
          title={WRITING_INDEX_COPY.title}
          lede={WRITING_INDEX_COPY.lede}
        />
        <Container className="py-16">
          <p className="text-base leading-7 text-ink-soft">
            No publications are listed yet.
          </p>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageHero
        kicker={WRITING_INDEX_COPY.eyebrow}
        title={WRITING_INDEX_COPY.title}
        lede={WRITING_INDEX_COPY.lede}
      />
      <section className="py-16" aria-label="Lead publication">
        <Container>
          <WritingIndexCard publication={lead} featured />
        </Container>
      </section>
      {availableHere.length > 0 ? (
        <section
          className="border-t border-line py-16"
          aria-label="Available here"
        >
          <Container>
            <SectionHeader title="Available here" />
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {availableHere.map((publication) => (
                <WritingIndexCard
                  key={publication.slug}
                  publication={publication}
                />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
      {publishedElsewhere.length > 0 ? (
        <section
          className="border-t border-line py-16"
          aria-label="Published elsewhere"
        >
          <Container>
            <SectionHeader title="Published elsewhere" />
            <div className="mt-10 grid gap-6">
              {publishedElsewhere.map((publication) => (
                <WritingIndexCard
                  key={publication.slug}
                  publication={publication}
                />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
