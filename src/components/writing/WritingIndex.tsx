import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WritingIndexCard } from "@/components/writing/WritingIndexCard";
import {
  getAvailabilityLabel,
  indexPublishedWriting,
  selectFeaturedWriting,
  type PublishedPublication,
} from "@/lib/content/publications";

const linkClassName =
  "block rounded-lg py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

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
  const indexed = indexPublishedWriting(publications);
  const featured = selectFeaturedWriting(indexed);

  if (indexed.length === 0) {
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
                  key={publication.id}
                  publication={publication}
                />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
      <section
        className={
          featured.length > 0 ? "border-t border-line py-16" : "py-16"
        }
        aria-label="All publications"
      >
        <Container>
          <SectionHeader title="All publications" />
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {indexed.map((publication) => (
              <li key={publication.id}>
                <Link
                  href={`/writing/${publication.slug}`}
                  className={linkClassName}
                >
                  <span className="font-medium text-ink">{publication.title}</span>
                  <span className="mt-1 block text-sm text-ink-faint">
                    {publication.yearLabel} · {getAvailabilityLabel(publication.availability)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
