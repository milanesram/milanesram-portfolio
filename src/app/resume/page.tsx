import { CallToAction } from "@/components/ui/CallToAction";
import { CareerTrackCard } from "@/components/ui/CareerTrackCard";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import {
  getPublishedResumePage,
  getPublishedResumeTracks,
} from "@/lib/content/resume";
import { getPublishedSiteProfile } from "@/lib/content/profile";
import {
  profileFromPublishedResult,
  selectPublicContactChannels,
  visibleWorkAuthorization,
} from "@/lib/content/site-profile";
import { generateRouteMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return generateRouteMetadata("resume");
}

export default async function ResumePage() {
  const [pageResult, tracksResult, profileResult] = await Promise.all([
    getPublishedResumePage(),
    getPublishedResumeTracks(),
    getPublishedSiteProfile(),
  ]);
  const profile = profileFromPublishedResult(profileResult);
  const contact = selectPublicContactChannels(profile);
  const workAuthorization = visibleWorkAuthorization(profile?.workAuthorization);
  const page = pageResult.ok ? pageResult.page : null;
  const tracks = tracksResult.ok ? tracksResult.tracks : [];

  if (!pageResult.ok || !page) {
    return (
      <>
        <PageHero
          kicker="Resume"
          title="Resume"
          lede="Resume options are temporarily unavailable."
        />
      </>
    );
  }

  return (
    <>
      <PageHero kicker={page.kicker} title={page.headline} lede={page.lede} />
      <Container className="py-16">
        {tracks.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {tracks.map((track) => (
              <CareerTrackCard
                key={track.id}
                title={track.title}
                summary={track.summary}
                href={track.href}
                ctaLabel={track.ctaLabel}
                external={Boolean(track.media)}
              />
            ))}
          </div>
        ) : null}
        <p className="mt-8 text-sm leading-6 text-ink-soft">
          {page.requestIntro}
          {contact ? (
            <>
              {" "}
              by email at{" "}
              <a className="text-accent hover:underline" href={contact.mailtoHref}>
                {contact.email}
              </a>{" "}
              or via{" "}
              <a
                className="text-accent hover:underline"
                href={contact.linkedinUrl}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            </>
          ) : (
            " through the contact page"
          )}
          . {page.requestFootnote}
        </p>
        {workAuthorization ? (
          <p className="mt-4 text-sm text-ink-faint">{workAuthorization}</p>
        ) : null}
        <p className="mt-2 text-sm text-ink-faint">
          Licensed to Practice Law in the Philippines. Not licensed to practice law in
          the United States.
        </p>
        <div className="mt-12">
          <CallToAction title={page.closingHeading} lede={page.closingLede} />
        </div>
      </Container>
    </>
  );
}
