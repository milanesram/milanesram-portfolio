import { CallToAction } from "@/components/ui/CallToAction";
import { CredentialCard } from "@/components/ui/CredentialCard";
import { ExperiencePreview } from "@/components/ui/ExperiencePreview";
import { PageHero } from "@/components/ui/PageHero";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { PublicationCard } from "@/components/ui/PublicationCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/layout/Container";
import {
  featuredProject,
  focusPages,
  publicCredentials,
  publications,
  siteProfile,
  type FocusPage,
  type TrackId,
} from "@/content";
import { experiencesForTrack } from "@/content";

export function FocusView({
  trackId,
  page,
}: {
  trackId: TrackId;
  page: FocusPage;
}) {
  const other = focusPages.find((item) => item.id !== trackId)!;
  const experiences = experiencesForTrack(trackId).filter(
    (item) => item.kind !== "leadership",
  );
  const credentials = publicCredentials.filter(
    (credential) =>
      credential.tracks.includes(trackId) || credential.highlight || credential.kind === "license",
  );
  const writing = publications.filter(
    (publication) =>
      publication.tracks.includes(trackId) || publication.tracks.includes("all"),
  );

  return (
    <>
      <PageHero kicker="Focus profile" title={page.headline} lede={page.summary}>
        <p className="text-sm text-ink-faint">{siteProfile.workAuthorization}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink
            href="/resume"
            variant={trackId === "cyber" ? "primary" : "secondary"}
          >
            {trackId === "cyber"
              ? "Cybersecurity / GRC resume"
              : "Privacy / AI Governance resume"}
          </ButtonLink>
          <ButtonLink href="/projects/privai-guard" variant="secondary">
            PrivAI Guard case study
          </ButtonLink>
          <ButtonLink href="/contact" variant="accent">
            Contact
          </ButtonLink>
        </div>
      </PageHero>

      <section className="py-16">
        <Container>
          <SectionHeader kicker="Competencies" title="How this profile is read" />
          <ul className="mt-8 flex flex-wrap gap-2">
            {page.competencies.map((item) => (
              <li
                key={item}
                className="rounded-full bg-accent-soft px-3 py-1 text-sm text-ink"
              >
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-y border-line py-16">
        <Container>
          <SectionHeader
            kicker="Featured evidence"
            title="PrivAI Guard"
            lede={
              trackId === "cyber"
                ? "Control design, access boundaries, risk scoring, remediation, and audit evidence."
                : "Privacy-risk triage, data-subject impact review, and human-reviewed routing."
            }
          />
          <div className="mt-8">
            <ProjectCard project={featuredProject} featured />
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeader kicker="Experience" title="Selected roles" />
          <div className="mt-8">
            {experiences.slice(0, 5).map((experience) => (
              <ExperiencePreview
                key={experience.id}
                experience={experience}
                track={trackId}
              />
            ))}
          </div>
          <div className="mt-8">
            <ButtonLink href="/experience" variant="text">
              View full experience
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="border-y border-line py-16">
        <Container>
          <SectionHeader kicker="Credentials" title="Relevant credentials" />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {credentials.map((credential) => (
              <CredentialCard key={credential.id} credential={credential} />
            ))}
          </div>
        </Container>
      </section>

      {writing.length > 0 ? (
        <section className="py-16">
          <Container>
            <SectionHeader kicker="Writing" title="Selected publication" />
            <div className="mt-8">
              <PublicationCard publication={writing[0]} />
            </div>
          </Container>
        </section>
      ) : null}

      <section className="py-16">
        <Container>
          <p className="text-sm text-ink-soft">
            Also available:{" "}
            <ButtonLink href={`/focus/${other.slug}`} variant="text">
              {other.navLabel}
            </ButtonLink>
          </p>
          <div className="mt-8">
            <CallToAction />
          </div>
        </Container>
      </section>
    </>
  );
}
