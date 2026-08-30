import type { Metric } from "@/content";

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article className="rounded-xl border border-line bg-paper-elevated p-6 shadow-[var(--shadow)]">
      <p className="font-serif text-3xl font-medium tracking-tight text-ink">
        {metric.value}
      </p>
      <p className="mt-2 text-sm font-medium text-ink">{metric.label}</p>
      <p className="mt-3 text-sm leading-6 text-ink-soft">{metric.context}</p>
    </article>
  );
}
