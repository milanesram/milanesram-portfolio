import { selectAboutProfessionalContext } from "@/lib/content/professional-context";

export function AboutProfessionalContext() {
  const context = selectAboutProfessionalContext();

  return (
    <section
      className="mt-14 border-t border-line pt-8"
      aria-labelledby="professional-context-heading"
    >
      <h2
        id="professional-context-heading"
        className="text-xs font-medium uppercase tracking-[0.16em] text-copper"
      >
        {context.kicker}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-ink-faint">
        {context.disclaimer}
      </p>
    </section>
  );
}
