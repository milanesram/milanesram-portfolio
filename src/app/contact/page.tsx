import { ContactForm } from "@/components/contact/ContactForm";
import { ContactFormPlaceholder } from "@/components/contact/ContactFormPlaceholder";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import { getPublicContactFormToken } from "@/lib/contact/intake";
import { getPublishedContactPage, selectVisibleContactChannels } from "@/lib/content/contact";
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

export default async function ContactPage() {
  const [intakeToken, profileResult, pageResult] = await Promise.all([
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
      <Container narrow className="space-y-10 py-16">
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
              </li>
            ))}
          </ul>
        ) : null}
        {workAuthorization ? (
          <p className="text-sm text-ink-faint">{workAuthorization}</p>
        ) : null}
        {intakeToken ? (
          <ContactForm token={intakeToken} />
        ) : (
          <ContactFormPlaceholder intro={page.formIntro} />
        )}
      </Container>
    </>
  );
}
