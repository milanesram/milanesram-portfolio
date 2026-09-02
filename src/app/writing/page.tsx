import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/ui/PageHero";
import { WritingIndex } from "@/components/writing/WritingIndex";
import { getPublishedWritingPage } from "@/lib/content/writing-chrome";
import { getPublishedPublications } from "@/lib/content/publications";
import { generateRouteMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return generateRouteMetadata("writing");
}

export default async function WritingPage() {
  const [chromeResult, result] = await Promise.all([
    getPublishedWritingPage(),
    getPublishedPublications(),
  ]);

  if (!chromeResult.ok) {
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

  if (!chromeResult.page) {
    return (
      <>
        <PageHero
          kicker="Writing"
          title="Writing"
          lede="This page is not published."
        />
        <Container className="py-16">
          <p className="text-base leading-7 text-ink-soft">
            Writing page framing is not published.
          </p>
        </Container>
      </>
    );
  }

  const chrome = chromeResult.page;

  if (!result.ok) {
    return (
      <>
        <PageHero
          kicker={chrome.kicker}
          title={chrome.headline}
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

  return (
    <WritingIndex
      kicker={chrome.kicker}
      title={chrome.headline}
      lede={chrome.lede}
      publications={result.publications}
    />
  );
}
