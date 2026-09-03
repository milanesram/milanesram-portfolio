import Link from "next/link";

type CareerTrackCardProps = {
  title: string;
  summary: string;
  href?: string | null;
  ctaLabel?: string;
  external?: boolean;
};

export function CareerTrackCard({
  title,
  summary,
  href,
  ctaLabel = "View this profile",
  external = false,
}: CareerTrackCardProps) {
  const body = (
    <>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
        Resume option
      </p>
      <h2 className="mt-3 font-serif text-2xl font-medium tracking-tight text-ink">
        {title}
      </h2>
      <p className="mt-3 flex-1 text-base leading-7 text-ink-soft">{summary}</p>
      {href ? (
        <span className="mt-6 text-sm font-medium text-accent transition-colors group-hover:underline">
          {ctaLabel}
        </span>
      ) : null}
    </>
  );

  const className =
    "group flex h-full flex-col rounded-xl border border-line bg-paper-elevated p-6 shadow-[var(--shadow)] transition-[border-color,box-shadow] duration-200 hover:border-ink/15 hover:shadow-[var(--shadow-hover)]";

  if (!href) {
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
