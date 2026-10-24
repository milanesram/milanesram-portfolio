import Link from "next/link";

type Variant = "primary" | "secondary" | "accent" | "text";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-paper-elevated hover:bg-ink-hover border border-ink",
  secondary:
    "bg-transparent text-ink border border-ink/20 hover:border-accent hover:bg-paper-elevated",
  accent:
    "bg-accent text-paper-elevated hover:bg-accent-hover border border-accent",
  text: "bg-transparent text-accent underline-offset-4 hover:underline px-0 min-h-0",
};

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
  ariaLabel?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
  className = "",
  ariaLabel,
}: ButtonLinkProps) {
  const classes = `inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition-colors ${variants[variant]} ${className}`;
  const mailto = href.startsWith("mailto:");

  if (external || mailto) {
    return (
      <a
        href={href}
        className={classes}
        aria-label={ariaLabel}
        {...(external && !mailto ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
