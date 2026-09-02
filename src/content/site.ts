/**
 * Stable route/presentation config.
 *
 * Mutable professional identity now lives in hosted `site_profile`.
 * Mutable Focus copy and evidence now live in hosted `focus_pages` and
 * UUID relationships. This file keeps only code-owned route labels.
 */

export const FOCUS_PUBLIC_ROUTES = [
  {
    slug: "cybersecurity-grc",
    href: "/focus/cybersecurity-grc",
    navLabel: "Cybersecurity / GRC",
  },
  {
    slug: "privacy-ai-governance",
    href: "/focus/privacy-ai-governance",
    navLabel: "Privacy / AI Governance",
  },
] as const;

export const navPrimary = [
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/writing", label: "Writing" },
  { href: "/credentials", label: "Credentials" },
] as const;

export const umbrellaDomains = [
  "Cybersecurity",
  "GRC",
  "IT Risk",
  "Information Security",
  "Data Privacy",
  "AI Governance",
] as const;
