import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WritingIndexCard } from "@/components/writing/WritingIndexCard";
import {
  groupPublishedWriting,
  selectFeaturedWriting,
  type PublishedPublication,
} from "@/lib/content/publications";

export function WritingIndex({
  kicker,
  title,
  lede,
  publications,
}: {
  kicker: string;
  title: string;
  lede: string;
  publications: PublishedPublication[];
}) {
  const featured = selectFeaturedWriting(publications);
  const { lead, availableHere, publishedElsewhere } =
    groupPublishedWriting(publications);

  if (!lead) {
    return (
      <>
        <PageHero kicker={kicker} title={title} lede={lede} />
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
      <PageHero kicker={kicker} title={title} lede={lede} />
      {featured.length > 0 ? (
        <section className="py-16" aria-label="Featured Writing">
          <Container>
            <SectionHeader title="Featured Writing" />
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featured.map((publication) => (
                <WritingIndexCard
                  key={publication.slug}
                  publication={publication}
                />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
      {/*
        Featured works stay in All Writing. The groups below are the complete
        published library, including those three, so the library count is unchanged.
      */}
      <section
        className={
          featured.length > 0 ? "border-t border-line py-16" : "py-16"
        }
        aria-label="All Writing"
      >
        <Container>
          <SectionHeader title="All Writing" />
          <div className="mt-10">
            <WritingIndexCard publication={lead} featured />
          </div>
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
