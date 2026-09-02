import { CallToAction } from "@/components/ui/CallToAction";
import { CredentialCard } from "@/components/ui/CredentialCard";
import { ExperiencePreview } from "@/components/ui/ExperiencePreview";
import { PageHero } from "@/components/ui/PageHero";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { FocusWritingCard } from "@/components/focus/FocusWritingCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/layout/Container";
import {
  otherFocusRoute,
  type PublicFocusPage,
} from "@/lib/content/focus";
import { visibleWorkAuthorization } from "@/lib/content/site-profile";

export function FocusView({
  page,
  workAuthorization = "",
}: {
  page: PublicFocusPage;
  workAuthorization?: string;
}) {
  const authorization = visibleWorkAuthorization(workAuthorization);
  const other = otherFocusRoute(page.slug);
  const resumeLabel =
    page.slug === "cybersecurity-grc"
      ? "Cybersecurity / GRC resume"
      : "Privacy / AI Governance resume";

  return (
    <>
      <PageHero kicker="Focus profile" title={page.headline} lede={page.summary}>
        {authorization ? (
          <p className="text-sm text-ink-faint">{authorization}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink
            href="/resume"
            variant={page.slug === "cybersecurity-grc" ? "primary" : "secondary"}
          >
            {resumeLabel}
          </ButtonLink>
          <ButtonLink href="/projects/privai-guard" variant="secondary">
            Read the PrivAI Guard case study
          </ButtonLink>
          <ButtonLink href="/contact" variant="accent">
            Contact
          </ButtonLink>
        </div>
      </PageHero>

      <section className="py-16">
        <Container>
          <SectionHeader kicker="Competencies" title="What this track emphasizes" />
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

      {page.featuredProject ? (
        <section className="border-y border-line py-16">
          <Container>
            <SectionHeader
              kicker="Featured evidence"
              title={page.featuredProject.name}
              lede={page.featuredProjectLede || undefined}
            />
            <div className="mt-8">
              <ProjectCard project={page.featuredProject} featured />
            </div>
          </Container>
        </section>
      ) : null}

      {page.experience.length > 0 ? (
        <section className="py-16">
          <Container>
            <SectionHeader kicker="Experience" title="Selected roles" />
            <div className="mt-8">
              {page.experience.map((experience) => (
                <ExperiencePreview
                  key={experience.id}
                  experience={experience}
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
      ) : null}

      {page.credentials.length > 0 ? (
        <section className="border-y border-line py-16">
          <Container>
            <SectionHeader kicker="Credentials" title="Relevant credentials" />
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {page.credentials.map((credential) => (
                <CredentialCard key={credential.id} credential={credential} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {page.featuredPublication ? (
        <section className="py-16">
          <Container>
            <SectionHeader kicker="Writing" title="Selected writing" />
            <div className="mt-8">
              <FocusWritingCard publication={page.featuredPublication} />
            </div>
          </Container>
        </section>
      ) : null}

      <section className="py-16">
        <Container>
          <p className="text-sm text-ink-soft">
            Also available:{" "}
            <ButtonLink href={other.href} variant="text">
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
