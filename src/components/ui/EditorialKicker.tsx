type EditorialKickerProps = {
  children: React.ReactNode;
  className?: string;
  ruleClassName?: string;
};

export function EditorialKicker({
  children,
  className = "",
  ruleClassName = "w-10",
}: EditorialKickerProps) {
  return (
    <p
      className={`mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium uppercase tracking-[0.18em] text-copper ${className}`}
    >
      <span>{children}</span>
      <span
        aria-hidden="true"
        className={`h-px shrink-0 bg-copper-decorative ${ruleClassName}`}
      />
    </p>
  );
}
