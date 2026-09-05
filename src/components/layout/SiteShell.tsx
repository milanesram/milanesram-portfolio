import type { PublicSiteProfile } from "@/lib/content/site-profile";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function SiteShell({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: PublicSiteProfile | null;
}) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader profile={profile} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter profile={profile} />
    </>
  );
}
