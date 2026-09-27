import { ContactForm } from "@/components/contact/ContactForm";
import { LinkedInProfileBadge } from "@/components/contact/LinkedInProfileBadge";
import { ResumeRequestForm } from "@/components/contact/ResumeRequestForm";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import { getPublishedContactPage, selectVisibleContactChannels } from "@/lib/content/contact";
import {
  RESUME_REQUEST_HEADING,
  RESUME_REQUEST_LEDE,
  parseResumeRequestQuery,
} from "@/lib/resume-requests/choices";
import { parseInquiryLaneQuery } from "@/lib/contact/inquiry-prefill";
import { getPublicContactFormToken } from "@/lib/contact/intake";
import { getResumeRequestFormToken } from "@/lib/resume-requests/intake";
import { getPublishedSiteProfile } from "@/lib/content/profile";
import {
  profileFromPublishedResult,
  visibleWorkAuthorization,
} from "@/lib/content/site-profile";
import { generateRouteMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return generateRouteMetadata("contact");
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{
    request?: string | string[];
    inquiry?: string | string[];
  }>;
}) {
  const query = await searchParams;
  const initialChoice = parseResumeRequestQuery(query.request);
  const initialTrack = parseInquiryLaneQuery(query.inquiry);
  const [intakeToken, inquiryToken, profileResult, pageResult] = await Promise.all([
    getResumeRequestFormToken(),
    getPublicContactFormToken(),
    getPublishedSiteProfile(),
    getPublishedContactPage(),
  ]);
  const profile = profileFromPublishedResult(profileResult);
  const page = pageResult.ok ? pageResult.page : null;
  const workAuthorization = visibleWorkAuthorization(profile?.workAuthorization);
  const channels = page
    ? selectVisibleContactChannels({
        page,
        email: profile?.email ?? null,
        linkedinUrl: profile?.linkedinUrl ?? null,
        linkedinDisplay: profile?.linkedinLabel ?? null,
      })
    : { email: null, linkedin: null };
  const visible = [channels.email, channels.linkedin].filter(
    (item): item is NonNullable<typeof item> => item !== null,
  );

  if (!pageResult.ok || !page) {
    return (
      <>
        <PageHero
          kicker="Contact"
          title="Contact"
          lede="Public contact details are temporarily unavailable."
        />
      </>
    );
  }

  return (
    <>
      <PageHero kicker={page.kicker} title={page.headline} lede={page.lede} />
      <Container narrow className="space-y-12 py-16">
        <section aria-labelledby="resume-request-heading" className="space-y-4">
          <h2
            id="resume-request-heading"
            className="font-serif text-3xl font-medium tracking-tight text-ink"
          >
            {RESUME_REQUEST_HEADING}
          </h2>
          <p className="text-base leading-7 text-ink-soft">{RESUME_REQUEST_LEDE}</p>
          {intakeToken ? (
            <ResumeRequestForm token={intakeToken} initialChoice={initialChoice} />
          ) : (
            <p className="rounded-xl border border-line bg-paper-elevated p-6 text-sm leading-6 text-ink-soft">
              The resume request form is temporarily unavailable. Email and
              LinkedIn remain open.
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
            <ContactForm token={inquiryToken} initialTrack={initialTrack} />
          </section>
        ) : null}
        <section aria-labelledby="direct-contact-heading" className="space-y-4">
          <h2
            id="direct-contact-heading"
            className="font-serif text-3xl font-medium tracking-tight text-ink"
          >
            Direct contact
          </h2>
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
        {workAuthorization ? (
          <p className="text-sm text-ink-faint">{workAuthorization}</p>
        ) : null}
      </Container>
    </>
  );
}
