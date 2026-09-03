/**
 * Variable-count Resume track layout.
 *
 * Count drives CSS only. Hosted `resume_tracks` remain the card authority.
 */
export function resumeTracksLayoutClass(count: number): string {
  if (count <= 0) {
    return "hidden";
  }

  if (count === 1) {
    return "mx-auto grid w-full max-w-xl gap-6";
  }

  if (count === 2) {
    return "grid gap-6 md:grid-cols-2";
  }

  if (count === 3) {
    return "grid gap-6 md:grid-cols-3";
  }

  return "grid gap-6 sm:grid-cols-2 xl:grid-cols-3";
}
