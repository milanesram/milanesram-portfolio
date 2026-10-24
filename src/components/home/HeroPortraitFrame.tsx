type HeroPortraitFrameProps = {
  children: React.ReactNode;
};

export function HeroPortraitFrame({ children }: HeroPortraitFrameProps) {
  return (
    <div className="relative mx-auto w-full max-w-sm px-3 pt-3 pr-4 pb-6 sm:px-4 sm:pr-5 sm:pb-7 lg:mx-0 lg:max-w-none lg:pt-8 lg:pr-7 lg:pb-8">
      <svg
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute top-0 right-3 hidden h-8 w-28 lg:block"
        viewBox="0 0 112 32"
        fill="none"
      >
        <circle cx="10" cy="16" r="6" stroke="var(--copper-decorative)" strokeWidth="1.25" />
        <circle cx="10" cy="16" r="2" fill="var(--copper-decorative)" />
        <path d="M16 16H78" stroke="var(--copper-decorative)" strokeWidth="1.25" />
        <circle cx="90" cy="16" r="8" stroke="var(--accent)" strokeWidth="1.25" />
        <circle cx="90" cy="16" r="2.5" fill="var(--accent)" />
      </svg>
      <svg
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute right-1 bottom-2 hidden h-12 w-12 lg:block"
        viewBox="0 0 56 56"
        fill="none"
      >
        <circle cx="34" cy="28" r="14" stroke="var(--accent)" strokeWidth="1.25" />
        <path d="M34 14V4" stroke="var(--accent)" strokeWidth="1.25" />
        <circle cx="34" cy="4" r="2.5" fill="var(--copper-decorative)" />
      </svg>
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-5 right-0 bottom-0 left-5 bg-accent sm:top-7 sm:-right-3 sm:-bottom-4 sm:left-7"
        />
        <div className="relative border border-copper-decorative bg-paper p-1.5 sm:p-2">
          {children}
        </div>
      </div>
    </div>
  );
}
