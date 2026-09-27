import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";

type CareerTrackCardProps = {
  title: string;
  summary: string;
  href?: string | null;
  ctaLabel?: string;
  external?: boolean;
  unavailable?: boolean;
  secondaryHref?: string | null;
  secondaryLabel?: string;
};

export function CareerTrackCard({
  title,
  summary,
  href,
  ctaLabel = "View this profile",
  external = false,
  unavailable = false,
  secondaryHref = null,
  secondaryLabel = "Email Me",
}: CareerTrackCardProps) {
  const heading = (
    <>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
        Resume option
      </p>
      <h2 className="mt-3 font-serif text-2xl font-medium tracking-tight text-ink">
        {title}
      </h2>
      <p className="mt-3 flex-1 text-base leading-7 text-ink-soft">{summary}</p>
    </>
  );
  const body = (
    <>
      {heading}
      {href && !unavailable ? (
        <span className="mt-6 text-sm font-medium text-accent transition-colors group-hover:underline">
          {ctaLabel}
        </span>
      ) : unavailable ? (
        <span className="mt-6 text-sm text-ink-faint">{ctaLabel}</span>
      ) : null}
    </>
  );

  const className =
    "group flex h-full flex-col rounded-xl border border-line bg-paper-elevated p-6 shadow-[var(--shadow)] transition-[border-color,box-shadow] duration-200 hover:border-ink/15 hover:shadow-[var(--shadow-hover)]";

  if (href && secondaryHref && !unavailable) {
    return (
      <article className={className}>
        {heading}
        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
          <ButtonLink href={href} external={external} variant="primary">
            {ctaLabel}
          </ButtonLink>
          <ButtonLink href={secondaryHref} variant="secondary">
            {secondaryLabel}
          </ButtonLink>
        </div>
      </article>
    );
  }

  if (!href || unavailable) {
    return <article className={className}>{body}</article>;
  }

  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer">
        {body}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}
