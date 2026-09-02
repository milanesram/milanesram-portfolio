import { notFound } from "next/navigation";
import { FocusView } from "@/components/focus/FocusView";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import { getPublishedFocusPage } from "@/lib/content/focus";
import { getPublishedSiteProfile } from "@/lib/content/profile";
import { profileFromPublishedResult } from "@/lib/content/site-profile";
import { generateRouteMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return generateRouteMetadata("focus-cybersecurity-grc");
}

export default async function CyberFocusPage() {
  const [result, profileResult] = await Promise.all([
    getPublishedFocusPage("cybersecurity-grc"),
    getPublishedSiteProfile(),
  ]);

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
      page={result.page}
      workAuthorization={profileFromPublishedResult(profileResult)?.workAuthorization}
    />
  );
}
