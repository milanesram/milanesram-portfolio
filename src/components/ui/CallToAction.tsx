import { getPublishedContactPage } from "@/lib/content/contact";
import { getPublishedSiteProfile } from "@/lib/content/profile";
import {
  profileFromPublishedResult,
  selectPublicContactChannels,
  visibleWorkAuthorization,
} from "@/lib/content/site-profile";
import { ButtonLink } from "./ButtonLink";

const STRUCTURAL_CTA = {
  title: "Start a conversation",
  lede: "Email and LinkedIn are the public contact channels.",
} as const;

export async function CallToAction({
  title,
  lede,
}: {
  title?: string;
  lede?: string;
} = {}) {
  const hosted =
    title == null || lede == null ? await getPublishedContactPage() : null;
  const resolvedTitle =
    title ??
    (hosted?.ok ? hosted.page?.ctaHeading : undefined) ??
    STRUCTURAL_CTA.title;
  const resolvedLede =
    lede ??
    (hosted?.ok ? hosted.page?.ctaLede : undefined) ??
    STRUCTURAL_CTA.lede;

  const profile = profileFromPublishedResult(await getPublishedSiteProfile());
  const contact = selectPublicContactChannels(profile);
  const workAuthorization = visibleWorkAuthorization(profile?.workAuthorization);

  return (
    <section className="relative overflow-hidden rounded-lg border border-line bg-paper-elevated px-6 py-10 shadow-[var(--shadow)] sm:px-10">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-accent" />
      <h2 className="font-serif text-3xl font-medium text-ink">{resolvedTitle}</h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-ink-soft">
        {resolvedLede}
      </p>
      {workAuthorization ? (
        <p className="mt-4 text-sm text-ink-faint">{workAuthorization}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/contact" variant="accent">
          Contact
        </ButtonLink>
        {contact ? (
          <>
            <ButtonLink href={contact.mailtoHref} variant="secondary" external>
              {contact.email}
            </ButtonLink>
            <ButtonLink href={contact.linkedinUrl} variant="text" external>
              LinkedIn
            </ButtonLink>
          </>
        ) : null}
      </div>
    </section>
  );
}
