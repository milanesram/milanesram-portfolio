import type { ContentStatus } from "@/lib/supabase/database.types";

const labels: Record<ContentStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  const tone =
    status === "published"
      ? "bg-accent-soft text-accent"
      : status === "archived"
        ? "bg-line text-ink-soft"
        : "border border-line text-ink-soft";

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-medium ${tone}`}
    >
      {labels[status]}
    </span>
  );
}
