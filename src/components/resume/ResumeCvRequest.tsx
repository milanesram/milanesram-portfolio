export const CV_REQUEST_HEADING = "Need the comprehensive professional record?";

export const CV_REQUEST_BODY =
  "A comprehensive CV is available by request for opportunities that require a fuller professional, regulatory, academic, or technical record.";

export const CV_REQUEST_CTA = "Request Professional CV by Email";

export function ResumeCvRequest({
  mailtoHref,
}: {
  mailtoHref: string | null;
}) {
  if (!mailtoHref?.startsWith("mailto:")) {
    return null;
  }

  return (
    <section aria-labelledby="cv-request-heading" className="mt-10 max-w-2xl">
      <h2
        id="cv-request-heading"
        className="font-serif text-xl font-medium tracking-tight text-ink"
      >
        {CV_REQUEST_HEADING}
      </h2>
      <p className="mt-3 text-sm leading-6 text-ink-soft">{CV_REQUEST_BODY}</p>
      <a
        href={mailtoHref}
        className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {CV_REQUEST_CTA}
      </a>
    </section>
  );
}
