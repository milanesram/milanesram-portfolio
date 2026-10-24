import type { Metadata } from "next";
import Link from "next/link";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeFlagshipProject } from "@/components/home/HomeFlagshipProject";
import { HomeSupportingProjects } from "@/components/home/HomeSupportingProjects";
import { CredentialCard } from "@/components/ui/CredentialCard";
import { ExperiencePreview } from "@/components/ui/ExperiencePreview";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/ui/PageHero";
import {
  getPublishedFocusPages,
  HOME_FOCUS_CARD_CTA_LABEL,
} from "@/lib/content/focus";
import { getPublishedHomePage } from "@/lib/content/home";
import { getPublishedHomeSupportingProjects } from "@/lib/content/home-supporting-projects";
import { getPublishedLeadMediaBySlug } from "@/lib/content/projects";
import { getPublishedResumeTracks } from "@/lib/content/resume";
import { getPublishedSiteProfile } from "@/lib/content/profile";
import {
  profileFromPublishedResult,
  selectPublicContactChannels,
} from "@/lib/content/site-profile";
import {
  getPublishedPublicMediaAssetsByPurpose,
  selectPublishedPortrait,
} from "@/lib/content/media";
import { generateRouteMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateRouteMetadata("home");
}

export default async function HomePage() {
  const [
    homeResult,
    portraitResult,
    profileResult,
    focusResult,
    tracksResult,
    supportingProjects,
  ] = await Promise.all([
    getPublishedHomePage(),
    getPublishedPublicMediaAssetsByPurpose("portrait"),
    getPublishedSiteProfile(),
    getPublishedFocusPages(),
    getPublishedResumeTracks(),
    getPublishedHomeSupportingProjects(),
  ]);

  const portrait = selectPublishedPortrait(portraitResult);
  const profile = profileFromPublishedResult(profileResult);
  const contact = selectPublicContactChannels(profile);

  if (!homeResult.ok) {
    return (
      <>
        <PageHero
          kicker="Home"
          title="Home"
          lede="This page is temporarily unavailable."
        />
        <Container className="py-16">
          <p className="text-base leading-7 text-ink-soft">
            Home content is temporarily unavailable.
          </p>
        </Container>
      </>
    );
  }

  if (!homeResult.page) {
    return (
      <>
        <PageHero
          kicker="Home"
          title="Home"
          lede="This page is not published."
        />
        <Container className="py-16">
          <p className="text-base leading-7 text-ink-soft">
            Home content is not published.
          </p>
        </Container>
      </>
    );
  }

  const home = homeResult.page;
  const leadMedia = await getPublishedLeadMediaBySlug([
    home.featuredProject?.project.slug,
    ...supportingProjects.map((project) => project.slug),
  ]);
  const homeKickerByFocusSlug = new Map<string, string>();

  if (tracksResult.ok) {
    for (const track of tracksResult.tracks) {
      if (track.focusSlug) {
        homeKickerByFocusSlug.set(
          track.focusSlug,
          track.homeKicker?.trim() || "Pathway",
        );
      }
    }
  }

  return (
    <>
      <HomeHero
        eyebrow={home.heroKicker}
        headline={home.headline}
        lede={home.lede}
        chips={home.chips}
        primaryCta={home.primaryCta}
        secondaryCta={home.secondaryCta}
        portrait={portrait}
        workAuthorization={profile?.workAuthorization}
        initials={profile?.initials}
      />

      <section className="border-b border-line bg-paper" aria-label="Current signals">
        <Container className="py-10 sm:py-12">
          <ul className="grid gap-8 md:grid-cols-2 xl:grid-cols-4 xl:gap-x-0 xl:divide-x xl:divide-line">
            {home.proofItems.map((item) => {
              const content = (
                <>
                  <p className="font-serif text-lg leading-snug text-ink group-hover:underline">
                    {item.label}
                  </p>
                  <span
                    aria-hidden="true"
                    className="mt-3 block h-px w-8 bg-copper-decorative"
                  />
                  <p className="mt-3 text-sm leading-6 text-ink-soft">{item.supporting}</p>
                </>
              );

              return (
                <li key={item.id} className="min-w-0 xl:px-6 xl:first:pl-0 xl:last:pr-0">
                  {item.href ? (
                    <Link href={item.href} className="group block min-h-11">
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

      <section className="border-b border-line bg-paper-muted py-20">
        <Container>
          <SectionHeader
            kicker={home.experienceSection.kicker}
            title={home.experienceSection.title}
            lede={home.experienceSection.lede}
          />
          <div className="mt-10">
            {home.experiences.length > 0 ? (
              home.experiences.map((experience) => (
                <ExperiencePreview
                  key={experience.id}
                  experience={experience}
                />
              ))
            ) : (
              <p className="text-base leading-7 text-ink-soft">
                Experience is temporarily unavailable.
              </p>
            )}
          </div>
          <div className="mt-8">
            <ButtonLink href={home.experienceSection.cta.href} variant="text">
              {home.experienceSection.cta.label}
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section id="role-focus" className="py-20">
        <Container>
          <SectionHeader
            kicker={home.focusSection.kicker}
            title={home.focusSection.title}
            lede={home.focusSection.lede}
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {(focusResult.ok ? focusResult.pages : []).map((track) => {
              return (
                <Link
                  key={track.id}
                  href={`/focus/${track.slug}`}
                  className="group flex h-full flex-col rounded-lg border border-line bg-paper-elevated p-6 shadow-[var(--shadow)] transition-[border-color,box-shadow] duration-200 hover:border-accent/40 hover:shadow-[var(--shadow-hover)]"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
                    <span>{homeKickerByFocusSlug.get(track.slug) ?? "Pathway"}</span>
                    <span
                      aria-hidden="true"
                      className="ml-3 inline-block h-px w-8 bg-copper-decorative align-middle"
                    />
                  </p>
                  <h3 className="mt-3 font-serif text-2xl font-medium text-ink">
                    {track.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-ink-soft">
                    {track.cardSummary}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {track.cardChips.map((chip) => (
                      <li
                        key={chip}
                        className="rounded-full bg-accent-soft px-3 py-1 text-sm text-ink"
                      >
                        {chip}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-6 text-sm font-medium text-accent group-hover:underline">
                    {HOME_FOCUS_CARD_CTA_LABEL}
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-b border-line bg-paper-muted py-20" aria-label="Selected work">
        <Container>
          {home.featuredProject ? (
            <HomeFlagshipProject
              flagship={home.featuredProject}
              leadMedia={leadMedia.get(home.featuredProject.project.slug) ?? null}
            />
          ) : (
            <p className="text-base leading-7 text-ink-soft">
              Featured work is temporarily unavailable.
            </p>
          )}
          <HomeSupportingProjects
            projects={supportingProjects.map((project) => ({
              ...project,
              leadMedia: leadMedia.get(project.slug) ?? null,
            }))}
          />
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeader
            kicker={home.credentialsSection.kicker}
            title={home.credentialsSection.title}
            lede={home.credentialsSection.lede}
          />
          <div className="mt-10">
            {home.credentials.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-3">
                {home.credentials.map((credential) => (
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
            <ButtonLink href={home.credentialsSection.cta.href} variant="text">
              {home.credentialsSection.cta.label}
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="relative overflow-hidden rounded-lg border border-line bg-paper-elevated px-6 py-10 sm:px-10">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-accent" />
            <h2 className="font-serif text-3xl font-medium text-ink">
              {home.closing.heading}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-soft">
              {home.closing.body}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={home.closing.primaryCta.href} variant="primary">
                {home.closing.primaryCta.label}
              </ButtonLink>
              <ButtonLink href={home.closing.secondaryCta.href} variant="accent">
                {home.closing.secondaryCta.label}
              </ButtonLink>
              {contact ? (
                <>
                  <ButtonLink href={contact.mailtoHref} variant="secondary" external>
                    {contact.email}
                  </ButtonLink>
                  <ButtonLink href={contact.linkedinUrl} variant="text" external>
                    LinkedIn
                  </ButtonLink>
                </>
              ) : null}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
