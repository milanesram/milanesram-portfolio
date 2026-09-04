import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import { WritingDetail } from "@/components/writing/WritingDetail";
import { getPublishedPublicationBySlug } from "@/lib/content/publications";
import {
  createPageMetadata,
  createPublicationDetailMetadata,
  withPublicRobots,
} from "@/lib/metadata";

export const dynamic = "force-dynamic";

type WritingSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: WritingSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedPublicationBySlug(slug);

  if (!result.ok) {
    return withPublicRobots(
      createPageMetadata(
        "Writing",
        "Selected writing is temporarily unavailable.",
        "/writing",
      ),
    );
  }

  if (!result.publication) {
    notFound();
  }

  return withPublicRobots(
    createPublicationDetailMetadata({
      title: result.publication.title,
      seoTitle: result.publication.seoTitle,
      abstract: result.publication.abstract,
      slug: result.publication.slug,
    }),
  );
}

export default async function WritingSlugPage({ params }: WritingSlugPageProps) {
  const { slug } = await params;
  const result = await getPublishedPublicationBySlug(slug);

  if (!result.ok) {
    return (
      <>
        <PageHero
          kicker="Writing"
          title="Writing"
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

  if (!result.publication) {
    notFound();
  }

  return <WritingDetail publication={result.publication} />;
}
