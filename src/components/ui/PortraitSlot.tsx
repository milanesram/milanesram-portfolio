export function PortraitSlot({ initials = "" }: { initials?: string }) {
  return (
    <figure>
      <div
        className="flex aspect-[4/5] items-center justify-center bg-[linear-gradient(160deg,#f3eee6_0%,#fffcf8_52%,#e5f0ee_100%)]"
        aria-hidden="true"
      >
        {initials ? (
          <span className="font-serif text-6xl font-medium text-ink/70">
            {initials}
          </span>
        ) : null}
      </div>
      <figcaption className="mt-3 text-center text-sm text-ink-faint lg:text-left">
        Portrait to be added
      </figcaption>
    </figure>
  );
}
