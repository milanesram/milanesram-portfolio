import { PageHero } from "@/components/ui/PageHero";
import { PublicationCard } from "@/components/ui/PublicationCard";
import { Container } from "@/components/layout/Container";
import { publications } from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(
  "Writing",
  "Selected publication on localizing the National Cybersecurity Plan 2023–2028 for local government units.",
  "/writing",
);

export default function WritingPage() {
  return (
    <>
      <PageHero
        kicker="Writing"
        title="Publications"
        lede="Public writing that is already on the record. Year only is shown where a more precise date is ambiguous."
      />
      <Container className="py-16">
        <PublicationCard publication={publications[0]} />
      </Container>
    </>
  );
}
