import { CallToAction } from "@/components/ui/CallToAction";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import { ResumeTracks } from "@/components/resume/ResumeTracks";
import {
  getPublishedResumePage,
  getPublishedResumeTracks,
} from "@/lib/content/resume";
import { resumeTracksHavePublicFiles } from "@/lib/content/resume-page";
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
  const hasPublicFiles = resumeTracksHavePublicFiles(tracks);

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
        <ResumeTracks tracks={tracks} />
        <p className="mt-8 text-sm leading-6 text-ink-soft">
          {hasPublicFiles ? (
            contact ? (
              <>
                <a className="text-accent hover:underline" href={contact.mailtoHref}>
                  {contact.email}
                </a>
                {" · "}
                <a
                  className="text-accent hover:underline"
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
                . {page.requestFootnote}
              </>
            ) : (
              page.requestFootnote
            )
          ) : (
            <>
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
            </>
          )}
        </p>
        {workAuthorization ? (
          <p className="mt-4 text-sm text-ink-faint">{workAuthorization}</p>
        ) : null}
        <div className="mt-12">
          <CallToAction
            title={hasPublicFiles ? undefined : page.closingHeading}
            lede={hasPublicFiles ? undefined : page.closingLede}
          />
        </div>
      </Container>
    </>
  );
}
