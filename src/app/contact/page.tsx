import { ContactForm } from "@/components/contact/ContactForm";
import { ContactFormPlaceholder } from "@/components/contact/ContactFormPlaceholder";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import { getPublicContactFormToken } from "@/lib/contact/intake";
import { getPublishedSiteProfile } from "@/lib/content/profile";
import {
  profileFromPublishedResult,
  selectPublicContactChannels,
  visibleWorkAuthorization,
} from "@/lib/content/site-profile";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(
  "Contact",
  "Contact Rainier (Ram) Milanes by email or LinkedIn about cybersecurity governance, GRC, technology risk, privacy, or AI governance.",
  "/contact",
);

export default async function ContactPage() {
  const [intakeToken, profileResult] = await Promise.all([
    getPublicContactFormToken(),
    getPublishedSiteProfile(),
  ]);
  const profile = profileFromPublishedResult(profileResult);
  const contact = selectPublicContactChannels(profile);
  const workAuthorization = visibleWorkAuthorization(profile?.workAuthorization);

  return (
    <>
      <PageHero
        kicker="Contact"
        title="Start a conversation"
        lede="Email and LinkedIn are the public channels for conversations about cybersecurity governance, GRC, technology risk, privacy, and AI governance. A phone number is not published on this site."
      />
      <Container narrow className="space-y-10 py-16">
        {contact ? (
          <ul className="space-y-3 text-ink">
            <li>
              <span className="block text-xs uppercase tracking-[0.16em] text-copper">
                Email
              </span>
              <a className="text-lg text-accent hover:underline" href={contact.mailtoHref}>
                {contact.email}
              </a>
            </li>
            <li>
              <span className="block text-xs uppercase tracking-[0.16em] text-copper">
                LinkedIn
              </span>
              <a
                className="text-lg text-accent hover:underline"
                href={contact.linkedinUrl}
                target="_blank"
                rel="noreferrer"
              >
                {contact.linkedinLabel}
              </a>
            </li>
          </ul>
        ) : (
          <p className="text-base leading-7 text-ink-soft">
            Public contact channels are temporarily unavailable.
          </p>
        )}
        {workAuthorization ? (
          <p className="text-sm text-ink-faint">{workAuthorization}</p>
        ) : null}
        {intakeToken ? (
          <ContactForm token={intakeToken} />
        ) : (
          <ContactFormPlaceholder />
        )}
      </Container>
    </>
  );
}
