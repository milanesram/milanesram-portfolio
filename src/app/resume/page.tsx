import { CallToAction } from "@/components/ui/CallToAction";
import { CareerTrackCard } from "@/components/ui/CareerTrackCard";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import { focusPages, siteProfile } from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(
  "Resume",
  "Two emphasis resumes for cybersecurity/GRC and privacy/AI-governance roles. The comprehensive CV is not published.",
  "/resume",
);

export default function ResumePage() {
  return (
    <>
      <PageHero
        kicker="Resume"
        title="One background. Two recruiter packets."
        lede="Choose the emphasis that matches the role. Public PDF downloads will be added after the site resumes are finalized. The comprehensive CV is private and is not available here."
      />
      <Container className="py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          {focusPages.map((track) => (
            <CareerTrackCard key={track.id} track={track} />
          ))}
        </div>
        <p className="mt-8 text-sm leading-6 text-ink-soft">
          Until the public PDFs are posted, request the relevant resume by email at{" "}
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
          .
        </p>
        <p className="mt-4 text-sm text-ink-faint">{siteProfile.workAuthorization}</p>
        <p className="mt-2 text-sm text-ink-faint">
          Licensed to Practice Law in the Philippines. Not licensed to practice law in
          the United States.
        </p>
        <div className="mt-12">
          <CallToAction title="Request a resume" />
        </div>
      </Container>
    </>
  );
}
