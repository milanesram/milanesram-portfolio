import { CallToAction } from "@/components/ui/CallToAction";
import { ExperienceEntry } from "@/components/ui/ExperienceEntry";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import { getPublishedExperiencePage } from "@/lib/content/experience-chrome";
import { getPublishedExperiences } from "@/lib/content/experiences";
import { generateRouteMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return generateRouteMetadata("experience");
}

export default async function ExperiencePage() {
  const [chromeResult, result] = await Promise.all([
    getPublishedExperiencePage(),
    getPublishedExperiences(),
  ]);

  if (!chromeResult.ok) {
    return (
      <>
        <PageHero
          kicker="Experience"
          title="Experience"
          lede="Experience is temporarily unavailable."
        />
        <Container className="py-16">
          <p className="text-base leading-7 text-ink-soft">
            Experience is temporarily unavailable.
          </p>
        </Container>
      </>
    );
  }

  if (!chromeResult.page) {
    return (
      <>
        <PageHero
          kicker="Experience"
          title="Experience"
          lede="This page is not published."
        />
        <Container className="py-16">
          <p className="text-base leading-7 text-ink-soft">
            Experience page framing is not published.
          </p>
        </Container>
      </>
    );
  }

  const chrome = chromeResult.page;

  return (
    <>
      <PageHero
        kicker={chrome.kicker}
        title={chrome.headline}
        lede={chrome.lede}
      />
      <Container className="py-16">
        {result.ok ? (
          result.experiences.length === 0 ? (
            <p className="text-base leading-7 text-ink-soft">
              No published experience is available.
            </p>
          ) : (
            <>
              <h2 className="sr-only">Selected roles</h2>
              {result.experiences
                .filter((item) => item.kind !== "leadership")
                .map((experience) => (
                  <ExperienceEntry
                    key={experience.id}
                    experience={experience}
                  />
                ))}

              {result.experiences.some((item) => item.kind === "leadership") ? (
                <>
                  <h2 className="mt-12 font-serif text-2xl font-medium text-ink">
                    {chrome.additionalHeading}
                  </h2>
                  <div className="mt-6">
                    {result.experiences
                      .filter((item) => item.kind === "leadership")
                      .map((experience) => (
                        <ExperienceEntry
                          key={experience.id}
                          experience={experience}
                        />
                      ))}
                  </div>
                </>
              ) : null}
            </>
          )
        ) : (
          <p className="text-base leading-7 text-ink-soft">
            Experience is temporarily unavailable.
          </p>
        )}

        <div className="mt-16">
          <CallToAction />
        </div>
      </Container>
    </>
  );
}
