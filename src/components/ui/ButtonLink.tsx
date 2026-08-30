import Link from "next/link";

type Variant = "primary" | "secondary" | "accent" | "text";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-paper-elevated hover:bg-[#1b3048] border border-ink",
  secondary:
    "bg-transparent text-ink border border-ink/20 hover:border-ink/50 hover:bg-paper-elevated",
  accent:
    "bg-accent text-paper-elevated hover:bg-[#164743] border border-accent",
  text: "bg-transparent text-accent underline-offset-4 hover:underline px-0 min-h-0",
};

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
  className = "",
}: ButtonLinkProps) {
  const classes = `inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition-colors ${variants[variant]} ${className}`;

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
