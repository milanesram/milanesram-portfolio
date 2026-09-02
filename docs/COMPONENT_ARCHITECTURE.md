# Component Architecture

**Subject:** Rainier (Ram) Milanes public portfolio  
**Phase:** 2–3 — Design specification and public-site shell  
**Date:** 29 August 2026  
**Status:** Maps to `src/components` and `src/content`. No admin, no Supabase.

---

## 1. Goals

- Pages compose; they do not own biography copy.
- Content lives in typed TypeScript modules under `src/content/` so it can later move to Supabase without rewriting UI.
- The homepage is a composition of section components, not a monolith.
- Client JavaScript is limited to navigation disclosure. Everything else is a Server Component.

---

## 2. Directory map

```text
src/content/          typed public content (source of truth for copy)
src/lib/              metadata helpers, site URL, track filters
src/components/
  layout/             SiteHeader, SiteFooter, Container, SiteShell
  ui/                 presentational primitives
  home/               homepage sections only
src/app/              routes, metadata, robots, sitemap
```

Pages import content + layout + ui. They do not embed long-form strings.

---

## 3. Layout components

| Component | Responsibility |
|---|---|
| `SiteShell` | Skip link, header, `<main>`, footer |
| `SiteHeader` | Desktop nav, mobile disclosure (client) |
| `SiteFooter` | Focus pathways, contact, work authorization, legal note |
| `Container` | Max-width + gutters |

---

## 4. UI primitives

| Component | Responsibility |
|---|---|
| `PageHero` | Interior page title, lede, optional actions |
| `SectionHeader` | Kicker, heading, lede |
| `CareerTrackCard` | Pathway door to a focus page |
| `MetricCard` | Contextual statistic (value + exact baseline sentence) |
| `ProjectCard` | Project index / featured teaser |
| `ExperiencePreview` | Compact role for Home / focus excerpts |
| `ExperienceEntry` | Full timeline entry |
| `CredentialCard` | Degree, certification, training, or license |
| `PublicationCard` | Writing teaser with outbound link |
| `CallToAction` | Closing band |
| `ButtonLink` | Primary / secondary / accent / text link styles |
| `PortraitSlot` | Reserved headshot frame + placeholder |
| `ContactChannels` | Email + LinkedIn only |
| `ContactFormPlaceholder` | Inert form UI for a later Supabase phase |

---

## 5. Homepage composition

`src/app/page.tsx` renders, in order:

1. `HomeHero` (umbrella identity + portrait slot + pathway CTAs)
2. Pathway pair (`CareerTrackCard` × 2)
3. Selected impact (`MetricCard` × 3)
4. Featured PrivAI Guard (`ProjectCard` featured)
5. Selected experience (`ExperiencePreview` × 3)
6. Credential chips / cards
7. Publication card
8. `CallToAction`

---

## 6. Content contracts

Content modules export typed objects, not React. Typical fields:

- `id`, `slug`, `status: "published"`
- Experience: `organization`, `title`, `titleSecondary?`, `location`, dates, `kind`, `tracks`, `bullets[]`
- Bullet: `body`, `tracks[]`
- Metric: `value`, `context` (required — never a bare percentage)
- Credential: `kind`, `name`, `issuer`, `highlight`
- Internal-only: `verification?: "pending"` — **never rendered in the UI**

Focus pages filter the same experience and credential records by `tracks`.

---

## 7. Routing

User-specified public shell (no `/admin`, no `/leadership`, no `/privacy` in this phase):

| Route | Page component job |
|---|---|
| `/` | 60-second recruiter briefing |
| `/about` | Narrative + non-claims |
| `/experience` | Full approved timeline |
| `/projects` | Index |
| `/projects/privai-guard` | Flagship case study |
| `/writing` | Publication(s) |
| `/credentials` | Degrees, certs, training, PH license |
| `/resume` | Two-track chooser (PDFs later) |
| `/contact` | Email, LinkedIn, inert form |
| `/focus/cybersecurity-grc` | Track A |
| `/focus/privacy-ai-governance` | Track B |

---

## 8. Dependencies

Use Next.js 16, React 19, Tailwind CSS 4, and `next/font` only.

No component library. No animation library. No form backend. No Supabase client.

If a package is added later, it must be justified against this constraint.

---

## 9. Accessibility and SEO ownership

- `SiteHeader` owns skip-target id (`#main`) and mobile focus management.
- Each `page.tsx` exports metadata via `generateRouteMetadata` / `createPageMetadata`.
- `src/app/robots.ts` honors `site_settings.site_indexable` and always excludes `/admin`.
- `src/app/sitemap.ts` includes indexable public routes plus published Writing/PrivAI details.
- `opengraph-image.tsx` provides a typographic OG image (no photograph).
