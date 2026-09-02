import { CallToAction } from "@/components/ui/CallToAction";
import { CareerTrackCard } from "@/components/ui/CareerTrackCard";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import { getPublishedFocusPages } from "@/lib/content/focus";
import { getPublishedSiteProfile } from "@/lib/content/profile";
import {
  profileFromPublishedResult,
  selectPublicContactChannels,
  visibleWorkAuthorization,
} from "@/lib/content/site-profile";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(
  "Resume",
  "Two professional focus packets for the same career record: cybersecurity, GRC, and IT risk; or privacy and AI governance. Resumes are provided on request.",
  "/resume",
);

export default async function ResumePage() {
  const [profileResult, focusResult] = await Promise.all([
    getPublishedSiteProfile(),
    getPublishedFocusPages(),
  ]);
  const profile = profileFromPublishedResult(profileResult);
  const contact = selectPublicContactChannels(profile);
  const workAuthorization = visibleWorkAuthorization(profile?.workAuthorization);
  const tracks = focusResult.ok ? focusResult.pages : [];

  return (
    <>
      <PageHero
        kicker="Resume"
        title="One professional record. Two focus lenses."
        lede="The same career record, presented through two professional emphases: cybersecurity, GRC, and IT risk; and privacy and AI governance. Resumes are provided on request rather than as public downloads."
      />
      <Container className="py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          {tracks.map((track) => (
            <CareerTrackCard
              key={track.id}
              track={{
                slug: track.slug,
                navLabel: track.title,
                summary: track.summary,
              }}
            />
          ))}
        </div>
        <p className="mt-8 text-sm leading-6 text-ink-soft">
          Request the relevant packet
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
          . The comprehensive CV is private and is not published here.
        </p>
        {workAuthorization ? (
          <p className="mt-4 text-sm text-ink-faint">{workAuthorization}</p>
        ) : null}
        <p className="mt-2 text-sm text-ink-faint">
          Licensed to Practice Law in the Philippines. Not licensed to practice law in
          the United States.
        </p>
        <div className="mt-12">
          <CallToAction
            title="Request a resume"
            lede="Email or LinkedIn is the request path. Specify Cybersecurity / GRC or Privacy / AI Governance."
          />
        </div>
      </Container>
    </>
  );
}
