import { HomeHero } from "@/components/home/HomeHero";
import { CallToAction } from "@/components/ui/CallToAction";
import { CareerTrackCard } from "@/components/ui/CareerTrackCard";
import { CredentialCard } from "@/components/ui/CredentialCard";
import { ExperiencePreview } from "@/components/ui/ExperiencePreview";
import { MetricCard } from "@/components/ui/MetricCard";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { PublicationCard } from "@/components/ui/PublicationCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/layout/Container";
import {
  featuredProject,
  focusPages,
  highlightCredentials,
  homeExperiences,
  metrics,
  publications,
} from "@/content";

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <section className="py-20">
        <Container>
          <SectionHeader
            kicker="Positioning"
            title="Two pathways. One professional record."
            lede="The same employers, dates, and evidence — ordered for cybersecurity and GRC roles, or for privacy and AI-governance roles."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {focusPages.map((track) => (
              <CareerTrackCard key={track.id} track={track} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-line py-20">
        <Container>
          <SectionHeader
            kicker="Selected impact"
            title="Source-supported operating results"
            lede="Each figure keeps its year, baseline, and unit. Numbers from different years are not combined."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {metrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeader
            kicker="Featured work"
            title="PrivAI Guard"
            lede="A Northwestern MSIS capstone that turns Shadow AI use into structured privacy-risk triage."
          />
          <div className="mt-10">
            <ProjectCard project={featuredProject} featured />
          </div>
        </Container>
      </section>

      <section className="border-y border-line py-20">
        <Container>
          <SectionHeader
            kicker="Experience"
            title="Recent roles"
            lede="Independent consulting, then National Privacy Commission technology advisory and compliance-monitoring leadership."
          />
          <div className="mt-10">
            {homeExperiences.map((experience) => (
              <ExperiencePreview key={experience.id} experience={experience} />
            ))}
          </div>
          <div className="mt-8">
            <ButtonLink href="/experience" variant="text">
              View full experience
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeader
            kicker="Credentials"
            title="Education and professional credentials"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {highlightCredentials.map((credential) => (
              <CredentialCard key={credential.id} credential={credential} />
            ))}
          </div>
          <div className="mt-8">
            <ButtonLink href="/credentials" variant="text">
              View credentials
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="border-y border-line py-20">
        <Container>
          <SectionHeader kicker="Writing" title="Selected publication" />
          <div className="mt-10">
            <PublicationCard publication={publications[0]} />
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <CallToAction />
        </Container>
      </section>
    </>
  );
}
