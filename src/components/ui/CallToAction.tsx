import { siteProfile } from "@/content";
import { ButtonLink } from "./ButtonLink";

export function CallToAction({
  title = "Start a conversation",
  lede = "Email and LinkedIn are the public contact channels.",
}: {
  title?: string;
  lede?: string;
}) {
  return (
    <section className="rounded-2xl border border-line bg-paper-elevated px-6 py-10 sm:px-10">
      <h2 className="font-serif text-3xl font-medium text-ink">{title}</h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-ink-soft">{lede}</p>
      {siteProfile.workAuthorization ? (
        <p className="mt-4 text-sm text-ink-faint">{siteProfile.workAuthorization}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/contact" variant="accent">
          Contact
        </ButtonLink>
        <ButtonLink href={`mailto:${siteProfile.email}`} variant="secondary" external>
          {siteProfile.email}
        </ButtonLink>
        <ButtonLink href={siteProfile.linkedinUrl} variant="text" external>
          LinkedIn
        </ButtonLink>
      </div>
    </section>
  );
}
