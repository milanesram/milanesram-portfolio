import { CallToAction } from "@/components/ui/CallToAction";
import { PageHero } from "@/components/ui/PageHero";
import { AboutJourney } from "@/components/about/AboutJourney";
import { AboutPortrait } from "@/components/about/AboutPortrait";
import { Container } from "@/components/layout/Container";
import { aboutCopy, publicCredentials, speakingCategories } from "@/content";
import {
  getPublishedPublicMediaAssetsByPurpose,
  selectPublishedPortrait,
} from "@/lib/content/media";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(
  "About",
  "Privacy and governance background, an earned Northwestern MSIS (Security Specialization), and current cybersecurity, GRC, and privacy work.",
  "/about",
);

export default async function AboutPage() {
  const [portraitResult, journeyResult] = await Promise.all([
    getPublishedPublicMediaAssetsByPurpose("portrait"),
    getPublishedPublicMediaAssetsByPurpose("journey"),
  ]);

  const portrait = selectPublishedPortrait(portraitResult);
  const journeyItems = journeyResult.ok ? journeyResult.assets : [];

  return (
    <>
      <PageHero
        kicker={aboutCopy.kicker}
        title={aboutCopy.title}
        lede={aboutCopy.lede}
      />
      <Container narrow className="py-16">
        {portrait ? (
          <div className="mb-10">
            <AboutPortrait portrait={portrait} />
          </div>
        ) : null}

        <div className="space-y-5 text-lg leading-8 text-ink-soft">
          {aboutCopy.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {journeyItems.length > 0 ? <AboutJourney items={journeyItems} /> : null}

        <h2 className="mt-14 font-serif text-2xl font-medium text-ink">
          Education at a glance
        </h2>
        <ul className="mt-4 space-y-2 text-ink-soft">
          {publicCredentials
            .filter((item) => item.kind === "degree")
            .map((item) => (
              <li key={item.id}>
                {item.name}
                {item.issuer ? ` · ${item.issuer}` : ""}
              </li>
            ))}
        </ul>

        <h2 className="mt-14 font-serif text-2xl font-medium text-ink">
          Speaking and advisory
        </h2>
        <p className="mt-4 leading-7 text-ink-soft">{aboutCopy.speaking}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-soft">
          {speakingCategories.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="mt-14 font-serif text-2xl font-medium text-ink">
          {aboutCopy.boundaryHeading}
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-soft">
          {aboutCopy.nonClaims.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="mt-14">
          <CallToAction />
        </div>
      </Container>
    </>
  );
}
