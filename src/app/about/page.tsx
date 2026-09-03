import type { Metadata } from "next";
import { CallToAction } from "@/components/ui/CallToAction";
import { PageHero } from "@/components/ui/PageHero";
import { AboutJourney } from "@/components/about/AboutJourney";
import { AboutPortrait } from "@/components/about/AboutPortrait";
import { AboutProfessionalContext } from "@/components/about/AboutProfessionalContext";
import { aboutAlreadyIncludesLawDisclaimer } from "@/lib/content/professional-context";
import { Container } from "@/components/layout/Container";
import { getPublishedAboutPage } from "@/lib/content/about";
import {
  getPublishedPublicMediaAssetsByPurpose,
  selectPublishedPortrait,
} from "@/lib/content/media";
import { generateRouteMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateRouteMetadata("about");
}

export default async function AboutPage() {
  const [aboutResult, portraitResult] = await Promise.all([
    getPublishedAboutPage(),
    getPublishedPublicMediaAssetsByPurpose("portrait"),
  ]);

  const portrait = selectPublishedPortrait(portraitResult);

  if (!aboutResult.ok) {
    return (
      <>
        <PageHero
          kicker="About"
          title="About"
          lede="This page is temporarily unavailable."
        />
        <Container className="py-16">
          <p className="text-base leading-7 text-ink-soft">
            About content is temporarily unavailable.
          </p>
        </Container>
      </>
    );
  }

  if (!aboutResult.page) {
    return (
      <>
        <PageHero
          kicker="About"
          title="About"
          lede="This page is not published."
        />
        <Container className="py-16">
          <p className="text-base leading-7 text-ink-soft">
            About content is not published.
          </p>
        </Container>
      </>
    );
  }

  const about = aboutResult.page;

  return (
    <>
      <PageHero
        kicker={about.kicker}
        title={about.headline}
        lede={about.lede}
      />
      <Container narrow className="py-16">
        {portrait ? (
          <div className="mb-10">
            <AboutPortrait portrait={portrait} />
          </div>
        ) : null}

        <div className="space-y-5 text-lg leading-8 text-ink-soft">
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph.id}>{paragraph.body}</p>
          ))}
        </div>

        {about.journeyItems.length > 0 ? (
          <AboutJourney heading={about.journeyHeading} items={about.journeyItems} />
        ) : null}

        <h2 className="mt-14 font-serif text-2xl font-medium text-ink">
          {about.educationHeading}
        </h2>
        <ul className="mt-4 space-y-2 text-ink-soft">
          {about.educationCredentials.map((item) => (
            <li key={item.id}>
              {item.name}
              {item.issuer ? ` · ${item.issuer}` : ""}
            </li>
          ))}
        </ul>

        <h2 className="mt-14 font-serif text-2xl font-medium text-ink">
          {about.speakingHeading}
        </h2>
        <p className="mt-4 leading-7 text-ink-soft">{about.speakingBody}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-soft">
          {about.speakingItems.map((item) => (
            <li key={item.id}>{item.body}</li>
          ))}
        </ul>

        <h2 className="mt-14 font-serif text-2xl font-medium text-ink">
          {about.boundariesHeading}
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-soft">
          {about.boundaryItems.map((item) => (
            <li key={item.id}>{item.body}</li>
          ))}
        </ul>

        {aboutAlreadyIncludesLawDisclaimer({
          paragraphs: about.paragraphs,
          boundaryItems: about.boundaryItems,
        }) ? null : (
          <AboutProfessionalContext />
        )}

        <div className="mt-14">
          <CallToAction />
        </div>
      </Container>
    </>
  );
}
