"use client";

import Script from "next/script";
import {
  LINKEDIN_BADGE_PROFILE_HREF,
  LINKEDIN_BADGE_SCRIPT_SRC,
  LINKEDIN_PROFILE_VANITY,
} from "@/lib/content/linkedin-badge";

function renderLinkedInBadges() {
  const renderAll = (window as Window & { LIRenderAll?: () => void }).LIRenderAll;
  renderAll?.();
}

export function LinkedInProfileBadge() {
  return (
    <div className="mt-4 max-w-full overflow-x-auto">
      <div
        className="badge-base LI-profile-badge [&:has(iframe)>a.badge-base__link]:hidden"
        data-locale="en_US"
        data-size="medium"
        data-theme="light"
        data-type="VERTICAL"
        data-vanity={LINKEDIN_PROFILE_VANITY}
        data-version="v1"
      >
        <a
          className="badge-base__link LI-simple-link text-lg text-accent hover:underline"
          href={LINKEDIN_BADGE_PROFILE_HREF}
        >
          Rainier (Ram) M.
        </a>
      </div>
      <Script
        src={LINKEDIN_BADGE_SCRIPT_SRC}
        strategy="afterInteractive"
        onReady={renderLinkedInBadges}
      />
    </div>
  );
}
