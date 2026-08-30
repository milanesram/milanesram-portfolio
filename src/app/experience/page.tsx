import { CallToAction } from "@/components/ui/CallToAction";
import { ExperienceEntry } from "@/components/ui/ExperienceEntry";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import { experiences } from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(
  "Experience",
  "Professional experience in cybersecurity, GRC, privacy operations, and technology risk — from consulting to National Privacy Commission leadership.",
  "/experience",
);

export default function ExperiencePage() {
  const primary = experiences.filter((item) => item.kind !== "leadership");
  const additional = experiences.filter((item) => item.kind === "leadership");

  return (
    <>
      <PageHero
        kicker="Experience"
        title="A single timeline"
        lede="Roles and dates are the same across both employer pathways. Consulting and National Privacy Commission work overlapped from October 2024."
      />
      <Container className="py-16">
        {primary.map((experience) => (
          <ExperienceEntry key={experience.id} experience={experience} />
        ))}

        <h2 className="mt-12 font-serif text-2xl font-medium text-ink">
          Additional leadership
        </h2>
        <div className="mt-6">
          {additional.map((experience) => (
            <ExperienceEntry key={experience.id} experience={experience} />
          ))}
        </div>

        <div className="mt-16">
          <CallToAction />
        </div>
      </Container>
    </>
  );
}
