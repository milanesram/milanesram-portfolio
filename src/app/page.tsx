import type { Metadata } from "next";
import Link from "next/link";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeFlagshipProject } from "@/components/home/HomeFlagshipProject";
import { CredentialCard } from "@/components/ui/CredentialCard";
import { ExperiencePreview } from "@/components/ui/ExperiencePreview";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/ui/PageHero";
import { getPublishedHomePage, homeTracks } from "@/lib/content/home";
import { getPublishedSiteProfile } from "@/lib/content/profile";
import {
  profileFromPublishedResult,
  selectPublicContactChannels,
} from "@/lib/content/site-profile";
import {
  getPublishedPublicMediaAssetsByPurpose,
  selectPublishedPortrait,
} from "@/lib/content/media";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const result = await getPublishedHomePage();
  const page = result.ok ? result.page : null;
  const title = page?.seoTitle ?? "Portfolio";
  const description =
    page?.seoDescription ??
    "Cybersecurity governance, GRC, technology risk, privacy, and AI governance.";
  const metadata = createPageMetadata(
    "Cybersecurity, GRC, IT Risk & Privacy",
    description,
    "",
  );

  return {
    ...metadata,
    title: { absolute: title },
    openGraph: {
      ...metadata.openGraph,
      title,
      description,
    },
    twitter: {
      ...metadata.twitter,
      title,
      description,
    },
  };
}

export default async function HomePage() {
  const [homeResult, portraitResult, profileResult] = await Promise.all([
    getPublishedHomePage(),
    getPublishedPublicMediaAssetsByPurpose("portrait"),
    getPublishedSiteProfile(),
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

  return (
    <>
      <HomeHero
        eyebrow={profile?.displayName}
        headline={home.headline}
        lede={home.lede}
        chips={home.chips}
        primaryCta={home.primaryCta}
        secondaryCta={home.secondaryCta}
        portrait={portrait}
        workAuthorization={profile?.workAuthorization}
        initials={profile?.initials}
      />

      <section className="py-12" aria-label="Current signals">
        <Container>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
            {home.proofItems.map((item) => {
              const content = (
                <>
                  <p className="text-sm font-medium text-ink">{item.label}</p>
                  <p className="mt-1 text-sm text-ink-faint">{item.supporting}</p>
                </>
              );

              return (
                <li key={item.id} className="min-w-0 border-l border-line pl-4">
                  {item.href ? (
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
          {home.featuredProject ? (
            <HomeFlagshipProject flagship={home.featuredProject} />
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
            kicker={home.focusSection.kicker}
            title={home.focusSection.title}
            lede={home.focusSection.lede}
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
            <ButtonLink href={home.experienceSection.cta.href} variant="text">
              {home.experienceSection.cta.label}
            </ButtonLink>
          </div>
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
          <div className="rounded-2xl border border-line bg-paper-elevated px-6 py-10 sm:px-10">
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
