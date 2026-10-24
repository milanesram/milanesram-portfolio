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
    <div className="site-public flex min-h-full w-full flex-1 flex-col bg-paper text-ink">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader profile={profile} />
      <main id="main" tabIndex={-1} className="flex-1 scroll-mt-16 outline-none">
        {children}
      </main>
      <SiteFooter profile={profile} />
    </div>
  );
}
