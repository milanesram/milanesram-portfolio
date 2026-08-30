import { ContactFormPlaceholder } from "@/components/contact/ContactFormPlaceholder";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import { siteProfile } from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(
  "Contact",
  "Contact Rainier (Ram) Milanes by email or LinkedIn. A secure form will be connected in a later phase.",
  "/contact",
);

export default function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Contact"
        title="Start a conversation"
        lede="Email and LinkedIn are the public channels. A phone number is not published on this site."
      />
      <Container narrow className="space-y-10 py-16">
        <ul className="space-y-3 text-ink">
          <li>
            <span className="block text-xs uppercase tracking-[0.16em] text-copper">
              Email
            </span>
            <a className="text-lg text-accent hover:underline" href={`mailto:${siteProfile.email}`}>
              {siteProfile.email}
            </a>
          </li>
          <li>
            <span className="block text-xs uppercase tracking-[0.16em] text-copper">
              LinkedIn
            </span>
            <a
              className="text-lg text-accent hover:underline"
              href={siteProfile.linkedinUrl}
              target="_blank"
              rel="noreferrer"
            >
              {siteProfile.linkedinLabel}
            </a>
          </li>
        </ul>
        <p className="text-sm text-ink-faint">{siteProfile.workAuthorization}</p>
        <ContactFormPlaceholder />
      </Container>
    </>
  );
}
