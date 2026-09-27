import { ContactForm } from "@/components/contact/ContactForm";
import { LinkedInProfileBadge } from "@/components/contact/LinkedInProfileBadge";
import { ResumeRequestForm } from "@/components/contact/ResumeRequestForm";
import { CV_REQUEST_CTA } from "@/components/resume/ResumeCvRequest";
import type { ResumeContactChannels } from "@/lib/content/contact-page";
import type { InquiryTrack } from "@/lib/supabase/database.types";
import {
  RESUME_REQUEST_HEADING,
  RESUME_REQUEST_LEDE,
} from "@/lib/resume-requests/choices";

export const DIRECT_CONTACT_LEDE =
  "Prefer a direct conversation? Reach me by email or LinkedIn.";

export const CONTACT_SECTION_ORDER = [
  "direct-contact",
  "send-inquiry",
  "professional-cv",
] as const;

type ContactPageSectionsProps = {
  channels: ResumeContactChannels;
  inquiryToken: string | null;
  inquiryTrack: InquiryTrack;
  cvToken: string | null;
  workAuthorization: string | null;
};

export function ContactPageSections({
  channels,
  inquiryToken,
  inquiryTrack,
  cvToken,
  workAuthorization,
}: ContactPageSectionsProps) {
  const visible = [channels.email, channels.linkedin].filter(
    (item): item is NonNullable<typeof item> => item !== null,
  );

  return (
    <div className="space-y-12">
      <section aria-labelledby="direct-contact-heading" className="space-y-4">
        <h2
          id="direct-contact-heading"
          className="font-serif text-3xl font-medium tracking-tight text-ink"
        >
          Direct contact
        </h2>
        <p className="text-base leading-7 text-ink-soft">{DIRECT_CONTACT_LEDE}</p>
        {visible.length > 0 ? (
          <ul className="space-y-3 text-ink">
            {visible.map((channel) => (
              <li key={channel.href}>
                <span className="block text-xs uppercase tracking-[0.16em] text-copper">
                  {channel.label}
                </span>
                <a
                  className="text-lg text-accent hover:underline"
                  href={channel.href}
                  {...(channel.external
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                >
                  {channel.text}
                </a>
                {channel.href === channels.linkedin?.href ? (
                  <LinkedInProfileBadge />
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-ink-soft">
            Public contact channels are temporarily unavailable.
          </p>
        )}
      </section>

      {inquiryToken ? (
        <section aria-labelledby="send-inquiry-heading" className="space-y-4">
          <h2
            id="send-inquiry-heading"
            className="font-serif text-3xl font-medium tracking-tight text-ink"
          >
            Send inquiry
          </h2>
          <ContactForm token={inquiryToken} initialTrack={inquiryTrack} />
        </section>
      ) : null}

      {cvToken || channels.email ? (
        <section aria-labelledby="cv-request-heading" className="space-y-4">
          <h2
            id="cv-request-heading"
            className="font-serif text-3xl font-medium tracking-tight text-ink"
          >
            {RESUME_REQUEST_HEADING}
          </h2>
          <p className="text-base leading-7 text-ink-soft">{RESUME_REQUEST_LEDE}</p>
          {cvToken ? (
            <ResumeRequestForm token={cvToken} />
          ) : channels.email ? (
            <a
              className="inline-flex min-h-11 items-center text-base text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              href={channels.email.href}
            >
              {CV_REQUEST_CTA}
            </a>
          ) : null}
        </section>
      ) : null}

      {workAuthorization ? (
        <p className="text-sm text-ink-faint">{workAuthorization}</p>
      ) : null}
    </div>
  );
}
