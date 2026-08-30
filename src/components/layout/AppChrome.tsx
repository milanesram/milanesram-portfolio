"use client";

import { usePathname } from "next/navigation";
import { SiteShell } from "./SiteShell";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return <SiteShell>{children}</SiteShell>;
}
