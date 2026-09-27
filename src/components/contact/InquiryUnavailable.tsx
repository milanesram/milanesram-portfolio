import type { InquiryTrack } from "@/lib/supabase/database.types";
import {
  INQUIRY_TRACK_LABELS,
  inquiryFallbackSubject,
  mailtoWithInquirySubject,
} from "@/lib/contact/inquiry-prefill";

type InquiryUnavailableProps = {
  track: InquiryTrack;
  emailHref: string | null;
};

export function InquiryUnavailable({ track, emailHref }: InquiryUnavailableProps) {
  const subject = inquiryFallbackSubject(track);
  const laneLabel = subject ? INQUIRY_TRACK_LABELS[track] : null;
  const mailto = emailHref ? mailtoWithInquirySubject(emailHref, track) : null;

  return (
    <div className="rounded-xl border border-line bg-paper-elevated p-6 text-sm leading-6 text-ink-soft">
      <p>
        {laneLabel
          ? `Structured inquiry for ${laneLabel} is temporarily unavailable.`
          : "Structured inquiry is temporarily unavailable."}{" "}
        Email and LinkedIn above remain open.
      </p>
      {mailto && subject ? (
        <a
          className="mt-4 inline-flex min-h-11 items-center text-base text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          href={mailto}
        >
          Email about this inquiry
        </a>
      ) : null}
    </div>
  );
}
