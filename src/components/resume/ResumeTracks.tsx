import { CareerTrackCard } from "@/components/ui/CareerTrackCard";
import { resumeTracksLayoutClass } from "@/lib/content/resume-layout";
import {
  EMAIL_ME_CTA_LABEL,
  type PublicResumeTrack,
} from "@/lib/content/resume-page";

export function ResumeTracks({
  tracks,
  emailHref = null,
}: {
  tracks: PublicResumeTrack[];
  emailHref?: string | null;
}) {
  if (tracks.length === 0) {
    return null;
  }

  return (
    <div className={resumeTracksLayoutClass(tracks.length)}>
      {tracks.map((track) => (
        <CareerTrackCard
          key={track.id}
          title={track.title}
          summary={track.summary}
          href={track.href}
          ctaLabel={track.ctaLabel}
          external={Boolean(track.media)}
          unavailable={track.unavailable}
          secondaryHref={track.media && emailHref ? emailHref : null}
          secondaryLabel={EMAIL_ME_CTA_LABEL}
        />
      ))}
    </div>
  );
}
