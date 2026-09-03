import { CareerTrackCard } from "@/components/ui/CareerTrackCard";
import { resumeTracksLayoutClass } from "@/lib/content/resume-layout";
import type { PublicResumeTrack } from "@/lib/content/resume-page";

export function ResumeTracks({ tracks }: { tracks: PublicResumeTrack[] }) {
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
        />
      ))}
    </div>
  );
}
