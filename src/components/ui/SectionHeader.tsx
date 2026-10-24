import { EditorialKicker } from "@/components/ui/EditorialKicker";

type SectionHeaderProps = {
  kicker?: string;
  title: string;
  lede?: string;
  as?: "h1" | "h2";
};

export function SectionHeader({
  kicker,
  title,
  lede,
  as = "h2",
}: SectionHeaderProps) {
  const Heading = as;

  return (
    <div className="max-w-2xl">
      {kicker ? <EditorialKicker>{kicker}</EditorialKicker> : null}
      <Heading className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
        {title}
      </Heading>
      {lede ? <p className="mt-4 text-lg leading-8 text-ink-soft">{lede}</p> : null}
    </div>
  );
}
