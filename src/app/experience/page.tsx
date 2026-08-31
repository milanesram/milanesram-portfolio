import { CallToAction } from "@/components/ui/CallToAction";
import { ExperienceEntry } from "@/components/ui/ExperienceEntry";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import { getHybridPublicExperiences } from "@/lib/content/experiences";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(
  "Experience",
  "Professional experience in cybersecurity, GRC, privacy operations, and technology risk — from consulting to National Privacy Commission leadership.",
  "/experience",
);

export default async function ExperiencePage() {
  const result = await getHybridPublicExperiences();

  return (
    <>
      <PageHero
        kicker="Experience"
        title="A single timeline"
        lede="Roles and dates are the same across both employer pathways. Consulting and National Privacy Commission work overlapped from October 2024."
      />
      <Container className="py-16">
        {result.ok ? (
          result.experiences.length === 0 ? (
            <p className="text-base leading-7 text-ink-soft">
              No published experience is available.
            </p>
          ) : (
            <>
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
                    Additional leadership
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
