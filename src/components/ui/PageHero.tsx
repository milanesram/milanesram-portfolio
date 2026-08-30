type PageHeroProps = {
  kicker?: string;
  title: string;
  lede?: string;
  children?: React.ReactNode;
};

export function PageHero({ kicker, title, lede, children }: PageHeroProps) {
  return (
    <header className="border-b border-line bg-paper-elevated py-16 sm:py-20">
      <div className="mx-auto max-w-[72rem] px-5 sm:px-8">
        {kicker ? (
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-copper">
            {kicker}
          </p>
        ) : null}
        <h1 className="max-w-3xl font-serif text-4xl font-medium tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        {lede ? (
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-soft">{lede}</p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </header>
  );
}
