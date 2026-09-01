import { getPublishedSiteProfile } from "@/lib/content/profile";
import {
  profileFromPublishedResult,
  selectPublicContactChannels,
  visibleWorkAuthorization,
} from "@/lib/content/site-profile";
import { ButtonLink } from "./ButtonLink";

export async function CallToAction({
  title = "Start a conversation",
  lede = "Email and LinkedIn are the public contact channels.",
}: {
  title?: string;
  lede?: string;
}) {
  const profile = profileFromPublishedResult(await getPublishedSiteProfile());
  const contact = selectPublicContactChannels(profile);
  const workAuthorization = visibleWorkAuthorization(profile?.workAuthorization);

  return (
    <section className="rounded-2xl border border-line bg-paper-elevated px-6 py-10 sm:px-10">
      <h2 className="font-serif text-3xl font-medium text-ink">{title}</h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-ink-soft">{lede}</p>
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
