import Link from "next/link";
import type { FocusRouteCard } from "@/content";

export function CareerTrackCard({ track }: { track: FocusRouteCard }) {
  return (
    <Link
      href={`/focus/${track.slug}`}
      className="group flex h-full flex-col rounded-xl border border-line bg-paper-elevated p-6 shadow-[var(--shadow)] transition-shadow hover:shadow-md"
    >
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
        Pathway
      </p>
      <h2 className="mt-3 font-serif text-2xl font-medium text-ink">
        {track.navLabel}
      </h2>
      <p className="mt-3 flex-1 text-base leading-7 text-ink-soft">{track.summary}</p>
      <span className="mt-6 text-sm font-medium text-accent group-hover:underline">
        View this profile
      </span>
    </Link>
  );
}
