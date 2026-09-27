import { ContactPageSections } from "@/components/contact/ContactPageSections";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import { getPublishedContactPage, selectVisibleContactChannels } from "@/lib/content/contact";
import { parseInquiryLaneQuery } from "@/lib/contact/inquiry-prefill";
import { getPublicContactFormToken } from "@/lib/contact/intake";
import { getResumeRequestFormToken } from "@/lib/resume-requests/intake";
import { getPublishedSiteProfile } from "@/lib/content/profile";
import {
  profileFromPublishedResult,
  visibleWorkAuthorization,
} from "@/lib/content/site-profile";
import { generateRouteMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return generateRouteMetadata("contact");
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{
    request?: string | string[];
    inquiry?: string | string[];
  }>;
}) {
  const query = await searchParams;
  const inquiryTrack = parseInquiryLaneQuery(query.inquiry);
  const [cvToken, inquiryToken, profileResult, pageResult] = await Promise.all([
    getResumeRequestFormToken(),
    getPublicContactFormToken(),
    getPublishedSiteProfile(),
    getPublishedContactPage(),
  ]);
  const profile = profileFromPublishedResult(profileResult);
  const page = pageResult.ok ? pageResult.page : null;
  const workAuthorization = visibleWorkAuthorization(profile?.workAuthorization);
  const channels = page
    ? selectVisibleContactChannels({
        page,
        email: profile?.email ?? null,
        linkedinUrl: profile?.linkedinUrl ?? null,
        linkedinDisplay: profile?.linkedinLabel ?? null,
      })
    : { email: null, linkedin: null };

  if (!pageResult.ok || !page) {
    return (
      <>
        <PageHero
          kicker="Contact"
          title="Contact"
          lede="Public contact details are temporarily unavailable."
        />
      </>
    );
  }

  return (
    <>
      <PageHero kicker={page.kicker} title={page.headline} lede={page.lede} />
      <Container narrow className="py-16">
        <ContactPageSections
          channels={channels}
          inquiryToken={inquiryToken}
          inquiryTrack={inquiryTrack}
          cvToken={cvToken}
          workAuthorization={workAuthorization}
        />
      </Container>
    </>
  );
}
