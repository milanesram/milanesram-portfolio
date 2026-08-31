import { notFound } from "next/navigation";
import { FocusView } from "@/components/focus/FocusView";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import {
  getPublishedFocusPageBySlug,
  toPresentationFocusPage,
} from "@/lib/content/focus";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(
  "Cybersecurity, GRC, and IT Risk",
  "Cybersecurity, GRC, and IT-risk profile for Rainier (Ram) Milanes — security governance, controls, audit readiness, and technology risk.",
  "/focus/cybersecurity-grc",
);

export default async function CyberFocusPage() {
  const result = await getPublishedFocusPageBySlug("cybersecurity-grc");

  if (!result.ok) {
    return (
      <>
        <PageHero
          kicker="Focus profile"
          title="Focus profile"
          lede="This profile is temporarily unavailable."
        />
        <Container className="py-16">
          <p className="text-base leading-7 text-ink-soft">
            The cybersecurity focus profile is temporarily unavailable.
          </p>
        </Container>
      </>
    );
  }

  if (!result.page) {
    notFound();
  }

  return (
    <FocusView
      trackId="cyber"
      page={toPresentationFocusPage(result.page, "cyber")}
    />
  );
}
