import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/ui/PageHero";
import { WritingIndex } from "@/components/writing/WritingIndex";
import {
  WRITING_INDEX_COPY,
  getPublishedPublications,
} from "@/lib/content/publications";
import { generateRouteMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return generateRouteMetadata("writing");
}

export default async function WritingPage() {
  const result = await getPublishedPublications();

  if (!result.ok) {
    return (
      <>
        <PageHero
          kicker={WRITING_INDEX_COPY.eyebrow}
          title={WRITING_INDEX_COPY.title}
          lede="Writing is temporarily unavailable."
        />
        <Container className="py-16">
          <p className="text-base leading-7 text-ink-soft">
            Writing is temporarily unavailable.
          </p>
        </Container>
      </>
    );
  }

  return <WritingIndex publications={result.publications} />;
}
