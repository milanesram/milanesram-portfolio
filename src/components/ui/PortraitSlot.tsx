export function PortraitSlot({ initials = "" }: { initials?: string }) {
  return (
    <figure className="mx-auto w-full max-w-xs lg:mx-0">
      <div
        className="flex aspect-square items-center justify-center rounded-2xl border border-line bg-[linear-gradient(160deg,#efe8db_0%,#f7f4ee_48%,#e7eee9_100%)]"
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
