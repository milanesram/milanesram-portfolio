import type { Metadata } from "next";
import Link from "next/link";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeFlagshipProject } from "@/components/home/HomeFlagshipProject";
import { CredentialCard } from "@/components/ui/CredentialCard";
import { ExperiencePreview } from "@/components/ui/ExperiencePreview";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/layout/Container";
import { siteProfile } from "@/content";
import { getHybridPublicExperiences } from "@/lib/content/experiences";
import {
  getPublishedCredentials,
  toPresentationCredential,
} from "@/lib/content/credentials";
import {
  getPublishedProjects,
  toPresentationProject,
} from "@/lib/content/projects";
import {
  homeAbsoluteTitle,
  homeDescription,
  homeProofStrip,
  homeTracks,
  selectHomeCredentials,
  selectHomeExperiences,
  selectHomeFlagshipProject,
} from "@/lib/content/home";
import {
  getPublishedPublicMediaAssetsByPurpose,
  selectPublishedPortrait,
} from "@/lib/content/media";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

const pageMetadata = createPageMetadata(
  "Cybersecurity, GRC, IT Risk & Privacy",
  homeDescription,
  "",
);

export const metadata: Metadata = {
  ...pageMetadata,
  title: { absolute: homeAbsoluteTitle },
  openGraph: {
    ...pageMetadata.openGraph,
    title: homeAbsoluteTitle,
  },
  twitter: {
    ...pageMetadata.twitter,
    title: homeAbsoluteTitle,
  },
};

export default async function HomePage() {
  const [projectsResult, credentialsResult, experiencesResult, portraitResult] =
    await Promise.all([
      getPublishedProjects(),
      getPublishedCredentials(),
      getHybridPublicExperiences(),
      getPublishedPublicMediaAssetsByPurpose("portrait"),
    ]);

  const portrait = selectPublishedPortrait(portraitResult);

  const flagship = projectsResult.ok
    ? selectHomeFlagshipProject(projectsResult.projects.map(toPresentationProject))
    : null;

  const homeCredentials = credentialsResult.ok
    ? selectHomeCredentials(credentialsResult.credentials.map(toPresentationCredential))
    : [];

  const homeExperiences = experiencesResult.ok
    ? selectHomeExperiences(experiencesResult.experiences)
    : [];

  return (
    <>
      <HomeHero portrait={portrait} />

      <section className="py-12" aria-label="Current signals">
        <Container>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
            {homeProofStrip.map((item) => {
              const content = (
                <>
                  <p className="text-sm font-medium text-ink">{item.label}</p>
                  <p className="mt-1 text-sm text-ink-faint">{item.supporting}</p>
                </>
              );

              return (
                <li key={item.label} className="min-w-0 border-l border-line pl-4">
                  {"href" in item && item.href ? (
                    <Link href={item.href} className="block hover:text-ink">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section className="border-y border-line py-20">
        <Container>
          {flagship ? (
            <HomeFlagshipProject project={flagship} />
          ) : (
            <p className="text-base leading-7 text-ink-soft">
              Featured work is temporarily unavailable.
            </p>
          )}
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeader
            kicker="Two tracks"
            title="One record. Two recruiter packets."
            lede="Choose the track that matches the role. The employers, dates, and evidence are the same."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {homeTracks.map((track) => (
              <Link
                key={track.id}
                href={track.href}
                className="group flex h-full flex-col rounded-xl border border-line bg-paper-elevated p-6 shadow-[var(--shadow)] transition-shadow hover:shadow-md"
              >
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
                  {track.resumeLabel}
                </p>
                <h3 className="mt-3 font-serif text-2xl font-medium text-ink">
                  {track.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-ink-soft">{track.summary}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {track.chips.map((chip) => (
                    <li
                      key={chip}
                      className="rounded-full bg-accent-soft px-3 py-1 text-sm text-ink"
                    >
                      {chip}
                    </li>
                  ))}
                </ul>
                <span className="mt-6 text-sm font-medium text-accent group-hover:underline">
                  {track.ctaLabel}
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-line py-20">
        <Container>
          <SectionHeader
            kicker="Experience"
            title="Selected recent work"
            lede="Selected examples of transferable risk, controls, and privacy work."
          />
          <div className="mt-10">
            {experiencesResult.ok && homeExperiences.length > 0 ? (
              homeExperiences.map((experience) => (
                <ExperiencePreview
                  key={experience.id}
                  experience={experience}
                  showTitleSecondary={false}
                />
              ))
            ) : (
              <p className="text-base leading-7 text-ink-soft">
                Experience is temporarily unavailable.
              </p>
            )}
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
            title="Education and certifications"
            lede="Formal credentials that support both tracks."
          />
          <div className="mt-10">
            {credentialsResult.ok && homeCredentials.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-3">
                {homeCredentials.map((credential) => (
                  <CredentialCard
                    key={credential.id}
                    credential={credential}
                    compact
                  />
                ))}
              </div>
            ) : (
              <p className="text-base leading-7 text-ink-soft">
                Credentials are temporarily unavailable.
              </p>
            )}
          </div>
          <div className="mt-8">
            <ButtonLink href="/credentials" variant="text">
              View credentials
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="rounded-2xl border border-line bg-paper-elevated px-6 py-10 sm:px-10">
            <h2 className="font-serif text-3xl font-medium text-ink">
              Request a resume or start a conversation
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-soft">
              Choose the resume track that fits the role, or reach me directly by email
              or LinkedIn.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/resume" variant="primary">
                View resume options
              </ButtonLink>
              <ButtonLink href="/contact" variant="accent">
                Contact
              </ButtonLink>
              <ButtonLink href={`mailto:${siteProfile.email}`} variant="secondary" external>
                {siteProfile.email}
              </ButtonLink>
              <ButtonLink href={siteProfile.linkedinUrl} variant="text" external>
                LinkedIn
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
