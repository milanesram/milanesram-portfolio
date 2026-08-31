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
  "Privacy and AI Governance",
  "Privacy and AI-governance profile for Rainier (Ram) Milanes — privacy operations, privacy by design, and Shadow AI risk triage.",
  "/focus/privacy-ai-governance",
);

export default async function PrivacyFocusPage() {
  const result = await getPublishedFocusPageBySlug("privacy-ai-governance");

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
            The privacy focus profile is temporarily unavailable.
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
      trackId="privacy"
      page={toPresentationFocusPage(result.page, "privacy")}
    />
  );
}
