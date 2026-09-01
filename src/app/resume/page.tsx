import { CallToAction } from "@/components/ui/CallToAction";
import { CareerTrackCard } from "@/components/ui/CareerTrackCard";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import { focusPages, siteProfile } from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(
  "Resume",
  "Two professional focus packets for the same career record: cybersecurity, GRC, and IT risk; or privacy and AI governance. Resumes are provided on request.",
  "/resume",
);

export default function ResumePage() {
  return (
    <>
      <PageHero
        kicker="Resume"
        title="One professional record. Two focus lenses."
        lede="The same career record, presented through two professional emphases: cybersecurity, GRC, and IT risk; and privacy and AI governance. Resumes are provided on request rather than as public downloads."
      />
      <Container className="py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          {focusPages.map((track) => (
            <CareerTrackCard key={track.id} track={track} />
          ))}
        </div>
        <p className="mt-8 text-sm leading-6 text-ink-soft">
          Request the relevant packet by email at{" "}
          <a className="text-accent hover:underline" href={`mailto:${siteProfile.email}`}>
            {siteProfile.email}
          </a>{" "}
          or via{" "}
          <a
            className="text-accent hover:underline"
            href={siteProfile.linkedinUrl}
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
          . The comprehensive CV is private and is not published here.
        </p>
        {siteProfile.workAuthorization ? (
          <p className="mt-4 text-sm text-ink-faint">{siteProfile.workAuthorization}</p>
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
