"use client";

import { usePathname } from "next/navigation";
import type { PublicSiteProfile } from "@/lib/content/site-profile";
import { SiteShell } from "./SiteShell";

export function AppChrome({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: PublicSiteProfile | null;
}) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return <SiteShell profile={profile}>{children}</SiteShell>;
}
