# Portfolio Customization Architecture

**Status:** Frozen at Step 51F  
**Controlling reference for:** Steps 52+  
**Git freeze parent:** `fb4ec4ed15d8a62bdd7dfc3c1a6cf9a1179d383b` (`feat: finalize public career surfaces`)  
**Hosted project:** `rainier-portfolio` (`itoctveqrtozdehoofoq`)  
**Schema in this step:** none. This document freezes architecture only.

---

## 1. Project objective

This portfolio is a production-grade, maintainable, customizable career platform.

Professional content, positioning, evidence selection, milestones, resume configuration, contact settings, and metadata must be able to evolve **without routine React/TypeScript source edits**.

This is not an MVP. Visual redesign remains a code concern. Career data must not be trapped in components.

Approved public brand (do not reopen in implementation except to cut over sources):

- **Brand:** cybersecurity governance, GRC, technology / IT risk, privacy, data protection, AI governance
- **Foundation:** governance, regulatory operations, privacy/compliance, operational implementation, cross-functional work
- **Technical reinforcement:** earned Northwestern MSIS (Security specialization), PrivAI Guard, hands-on implementation, security/privacy governance controls

Do not reintroduce target-title branding, executive-seeking branding, or work-authorization / sponsorship / visa language. Historical titles remain factual evidence. PrivAI Guard remains a non-production Northwestern MSIS capstone MVP. Work authorization remains blank/optional and is not public brand behavior.

---

## 2. Code-vs-CMS boundary

### Keep in code

- React components, page structure, layout, typography, breakpoints, design tokens
- Responsive behavior and image-frame / crop mechanics (`AboutJourney` object-position map, portrait frames)
- Accessibility mechanics
- Authentication, RLS/security logic, validation, error handling
- Route definitions (`src/app/**/page.tsx` files and slugs)
- Query implementation (typed content layer)
- Stable structural labels: Menu, Close, Skip to main content, generic unavailable states, section kicker grammar where it is UI chrome rather than career narrative
- Canonical URL construction, sitemap routing mechanics, robots path rules, metadata fallback mechanics
- Contact form security (tokens, rate limits, honeypot, service-role RPC, origin checks)

### Manage through hosted content or structured configuration

- Professional profile (name, headline, summary, email, LinkedIn)
- Home brand copy (hero, lede, chips, proof strip, tracks framing, closing CTA)
- About narrative, speaking, professional boundaries
- Journey **milestones** (not the image crop CSS)
- Focus definitions and featured-evidence relationships
- Resume track configuration
- Contact introduction and channel settings
- SEO title/description and Open Graph title/description
- Mutable CTA heading / label / supporting copy
- Other mutable public editorial copy

### Explicit exceptions

| Exception | Decision | Why |
|---|---|---|
| Navigation routes | KEEP IN CODE | Routes are application structure, not career content. Labels may later be config if needed; Version 1.0 does not need a nav CMS. |
| `navPrimary` order | KEEP IN CODE | Little career benefit vs. redesign/IA risk. |
| Work authorization | Hosted optional field, **never public brand** | Column retained; empty string is the public-neutral value; do not render when blank. |
| PrivAI Guard boundary copy | KEEP HOSTED project/section text; do not “flex” the boundary in CMS without editorial review | Honesty constraint, not a marketing dial. |
| Philippine / U.S. bar disclaimer | Hosted site-level legal note (eventually); not employment authorization | Factual licensure, must stay accurate. |
| Scionetrade dates | Hosted year-only `2018`–`2020` | DQ-02 resolved without inventing months. |
| Google AI certificate | Remain unpublished | `needs_verification = true`, `status = draft`. |
| Image crop positions | KEEP IN CODE keyed by media UUID | Presentation, not career data. |
| Contact form enablement | Hosted flag **and** server env | Security stays in code; flag is not sufficient alone. |

---

## 3. Public route inventory

Mutable public content by surface (chrome shared by all routes: header `navPrimary` + hosted `site_profile` short name, footer headline / focus links / email / LinkedIn / bar disclaimer, default OG image from hosted `site_profile`).

| Route | Mutable content | Current public source |
|---|---|---|
| `/` | Hero, chips, CTAs, proof strip, flagship copy, track cards, selected experience bullets, selected credentials, closing CTA, metadata, portrait | Hosted `home_page` + UUID relationships; track cards from hosted `focus_pages` card fields; hosted `site_profile` for shared identity/contact; hosted portrait |
| `/about` | H1, lede, narrative, education glance, speaking, boundaries, metadata, portrait, Journey milestones | Hosted `about_page` + `journey_milestones`; education glance still static `publicCredentials` until 52F; hosted portrait |
| `/focus/cybersecurity-grc` | Headline, summary, competencies, featured project, experience, credentials, selected writing, CTAs, metadata | Hosted `focus_pages` + UUID relationships (`focus_experience_items`, `focus_credentials`, `featured_project_id`, `featured_publication_id`) |
| `/focus/privacy-ai-governance` | Same pattern | Same |
| `/experience` | Page chrome; role list including Scionetrade | Static `experienceCopy`; hosted `experiences` + `experience_items` only |
| `/projects` | Page chrome; project cards | Static `projectsCopy`; hosted `projects` |
| `/projects/privai-guard` | Case-study kicker; sections; CTA | Hosted project + sections; kicker hard-coded in page |
| `/writing` | Index copy; publication cards | `WRITING_INDEX_COPY` + hosted publications |
| `/writing/[slug]` | Title, abstract, PDF/link, metadata | Hosted publications (+ media) |
| `/credentials` | Page chrome; credential cards | Page chrome static; hosted `credentials` |
| `/resume` | Hero, track cards, request copy, CTA, metadata | Temporary hosted Focus cards via `getPublishedFocusPages()` until 52G `resume_tracks`; request-based V1.0 unchanged; hosted `site_profile` for email/LinkedIn |
| `/contact` | Hero, email, LinkedIn, placeholder, metadata | Hosted `site_profile` for channels; page strings static; hosted `site_settings` only for form gate |
| Header / footer / OG / sitemap / robots | Names, labels, paths | Hosted `site_profile` for identity/contact; `navPrimary`/`FOCUS_PUBLIC_ROUTES` remain code-owned route labels; sitemap adds hosted writing slugs; robots static |

Writing detail slugs (hosted, published):  
`privacy-preserving-machine-learning-global-healthcare-ai`, `egov-ph-architectural-fragility-bcdr`, `generative-ai-privacy-compliance-documentation`, `contain-the-rumor-protect-the-people`, `data-breach-to-boardroom-cyber-governance`, `orb-to-oversight-world-app-privacy`, `you-are-easier-to-hack-than-everything`, `before-blocks-build-the-bedrock`, `price-of-ubiquity-gcash-critical-infrastructure`, `philippine-elections-2025-data-privacy`, `ncsp-localization-local-government-units` (link-only).

---

## 4. Current content-authority matrix

Classification key: **KEEP IN CODE** · **KEEP HOSTED** · **CUT OVER TO HOSTED** · **HOSTED RELATIONSHIP** · **STATIC CONFIGURATION** · **RETIRE STATIC MIRROR** · **DEFER — JUSTIFIED**

| Surface | Content | Current Source | Duplicate/Mirror | Current Authority | Desired Authority | Action |
|---|---|---|---|---|---|---|
| Site chrome | displayName, shortName, headline, summary, email, LinkedIn | Hosted `site_profile` via `getPublishedSiteProfile()` | Static `siteProfile` retired | Hosted | Hosted `site_profile` | KEEP HOSTED |
| Site chrome | workAuthorization | Hosted `''` | Admin optional field | Empty / not rendered | Hosted empty optional; never public brand | KEEP HOSTED (blank) |
| Site chrome | initials | Derived from hosted display name | None | Derived in code | KEEP IN CODE or derive | KEEP IN CODE |
| Header/footer | nav items | `navPrimary` | Footer appends Resume | Static | KEEP IN CODE | KEEP IN CODE |
| Footer | Bar disclaimer | Hard-coded `SiteFooter` | `aboutCopy.nonClaims[0]` | Duplicate static | Hosted legal note / site profile | CUT OVER TO HOSTED |
| Home | Hero H1, lede, chips, CTAs | Hosted `home_page` / `home_page_chips` | Static `home.ts` retired | Hosted | Hosted home/page copy | KEEP HOSTED |
| Home | Proof strip | Hosted `home_proof_items` editorial labels + optional credential/project FKs | Official names stay on source records | Hosted hybrid | Hosted copy + relationships | KEEP HOSTED |
| Home | Flagship copy | Hosted `home_page` overlay fields | Project row facts | Hosted overlay | Project row + Home overlay | KEEP HOSTED |
| Home | Flagship selection | `home_page.featured_project_id` | `projects.is_featured` unused by Home | Hosted UUID | Hosted project UUID relationship | KEEP HOSTED |
| Home | Track cards | Hosted `focus_pages.card_summary` / `card_chips` / `nav_label` | Static `homeTracks` retired | Hosted Focus card fields | Hosted Focus | KEEP HOSTED |
| Home | Selected experience | `home_experience_items` UUIDs | `show_on_home` leftover (3 metrics, unused) | Hosted relationships | Ordered item UUID relationships | KEEP HOSTED |
| Home | Selected credentials | `home_credentials` UUIDs | `credentials.highlight` unused by Home | Hosted relationships | Credential UUID + sort | KEEP HOSTED |
| Home | Portrait | Hosted `media_assets` purpose=portrait | None | Hosted | Hosted | KEEP HOSTED |
| Home | Metadata | `home_page.seo_title` / `seo_description` | Sitewide SEO still code | Hosted Home-only | Page SEO record in 52G | KEEP HOSTED (Home only) |
| Home | Closing CTA | Hosted `home_page` closing fields | Email/LinkedIn from profile | Hosted | Page/CTA copy records | KEEP HOSTED |
| About | H1, lede, paragraphs, speaking, boundaries | Hosted `about_page` | Static `aboutCopy` retired | Hosted | Hosted about document | KEEP HOSTED |
| About | Education glance | Static `publicCredentials` degrees | Hosted credentials | Static temporary | Hosted credentials | TEMPORARY — 52F |
| About | Speaking categories | Hosted `about_page_list_items` | Empty `engagements` table | Hosted | Hosted About list items | KEEP HOSTED |
| About | Journey captions/years/order | Hosted `journey_milestones` | Media caption/year leftover | Hosted milestones | Milestone records → media FK | KEEP HOSTED |
| About | Journey images | `journey_milestones.media_asset_id` | Media binaries/alt/path | Hosted UUID | Media remains file authority | KEEP HOSTED |
| About | Portrait | Hosted media | Same as Home | Hosted | Hosted | KEEP HOSTED |
| About | Metadata | `about_page.seo_title` / `seo_description` | Sitewide SEO still code | Hosted About-only | Page SEO record in 52G | KEEP HOSTED (About only) |
| Focus | slug, headline, summary, competencies, status | Hosted `focus_pages` | Static `focusPages` retired | Hosted | Hosted | KEEP HOSTED |
| Focus | selected writing | `focus_pages.featured_publication_id` | Static slug retired | Hosted UUID | Publication UUID | KEEP HOSTED |
| Focus | featured project | `focus_pages.featured_project_id` | Static `featuredProject` retired | Hosted UUID | Project UUID | KEEP HOSTED |
| Focus | experience evidence | `focus_experience_items` | Static `experiencesForTrack` retired | Hosted UUID | Experience item UUID | KEEP HOSTED |
| Focus | credentials | `focus_credentials` | Static `publicCredentials` retired | Hosted UUID | Credential UUID + eligibility | KEEP HOSTED |
| Focus | track CTA labels | `FocusView` JSX | Resume tracks | JSX | Focus/Resume config | CUT OVER TO HOSTED |
| Focus | metadata | Focus `page.tsx` | None | Static | SEO record | CUT OVER TO HOSTED |
| Experience | Role facts + bullets | Hosted 8 parents / 27 items | Static `experiences.ts` retired | Hosted | Hosted only | KEEP HOSTED |
| Experience | Scionetrade | Hosted year-only `2018`–`2020` | Static hold retired | Hosted | Hosted year precision | KEEP HOSTED |
| Experience | Public IDs | Hosted Experience / item UUIDs | Org/title remap retired | Hosted UUID | Hosted UUID | KEEP HOSTED |
| Experience | Page chrome | `experienceCopy` | None | Static | Page copy record | CUT OVER TO HOSTED — later |
| Projects | Project + sections | Hosted | Static `projects.ts` / unused `privaiGuardSections` | Hosted public | Hosted | KEEP HOSTED; RETIRE STATIC MIRROR |
| Projects | featured flag | Hosted `is_featured` | Static `featured` | Dual for Focus | Hosted + relationships | KEEP HOSTED |
| Projects | Index chrome | `projectsCopy` | None | Static | Page copy | CUT OVER TO HOSTED |
| PrivAI case study | Kicker | Hard-coded page | Project year/limits | JSX | Project or page copy | CUT OVER TO HOSTED |
| Writing | Publication records, PDFs, link-only | Hosted | None as public authority | Hosted | Hosted | KEEP HOSTED |
| Writing | Index eyebrow/title/lede | `WRITING_INDEX_COPY` | Index metadata description | Static | Page copy + SEO | CUT OVER TO HOSTED |
| Writing | Kind labels | Code map `DOCUMENT_KIND_LABELS` | None | Code | KEEP IN CODE | KEEP IN CODE |
| Credentials | Facts | Hosted `/credentials` | Static `credentials.ts` for Focus/About | Dual | Hosted only | KEEP HOSTED; RETIRE STATIC MIRROR |
| Credentials | Google AI | Hosted draft + needs_verification | Static `verification: pending` | Unpublished | Stay unpublished until verified | DEFER — JUSTIFIED |
| Credentials | Page chrome | `credentials/page.tsx` | None | Static | Page copy | CUT OVER TO HOSTED |
| Credentials | Verification URL | Absent | None | Gap | Optional URL fields | See §16 |
| Resume | Tracks | Temporary hosted Focus via `getPublishedFocusPages()` | Dedicated `resume_tracks` later | Temporary hosted Focus | Resume-track records | TEMPORARY — 52G |
| Resume | Request model copy | `resume/page.tsx` | None | Static | Resume settings | CUT OVER TO HOSTED |
| Resume | Files | None | `focus_pages.resume_media_id` unused | Request-only V1.0 | Optional media FK | DEFER — JUSTIFIED (files); architecture ready |
| Contact | Email, LinkedIn | Hosted `site_profile` | Static `siteProfile` retired | Hosted | Hosted profile | KEEP HOSTED |
| Contact | Intro copy | `contact/page.tsx` | Placeholder component | Static | Contact settings | CUT OVER TO HOSTED |
| Contact | Form enabled | `site_settings.contact_form_enabled` + env | Form implementation in code | Flag off | Preserve dual gate | KEEP HOSTED + KEEP IN CODE (security) |
| SEO | Per-route title/description | Each `page.tsx` / `home.ts` / `metadata.ts` | OG duplicates description | Static | `page_seo` or equivalent | CUT OVER TO HOSTED |
| SEO | Canonical, robots, sitemap mechanics | Code | `site_settings.site_indexable` unused by `robots.ts` | Code | KEEP IN CODE; optionally honor indexable flag | KEEP IN CODE |
| CTA | Default heading/lede | `CallToAction` | Page overrides | Code defaults | Copy records; component stays | CUT OVER TO HOSTED |
| Metrics | `src/content/metrics.ts` | Unused | None live | Dead static | Do not auto-publish | LEGACY / DEFER |
| Engagements | Table empty | About speaking static | None | Static | Future hosted | CUT OVER TO HOSTED |

No mutable career/editorial field is left unclassified.

---

## 5. Desired content-authority matrix (Version 1.0 customizable)

Public rendering path:

`Supabase published content → typed content layer (`src/lib/content/*`) → presentational components → design system`

| Domain | Authoritative store | Public consumer rule |
|---|---|---|
| Profile | `site_profile` | Header, footer, Contact, OG site name; ignore empty work_authorization |
| Settings | `site_settings` | Form flag, optional indexable; never secrets |
| Home copy | New `page_copy` / `home_settings` (or `site_profile` + page_copy) | No `home.ts` career prose |
| Home evidence | Junctions: home→experience_items, home→credentials, home→project | Stable UUIDs, sort_order |
| About copy | New `about_document` (or page_copy keyed `about`) | Paragraphs as ordered rows |
| Journey | New `journey_milestones` → `media_assets` | Milestones exist without media; unpublished until media if required |
| Focus | `focus_pages` + junctions to experience_items, projects, publications, credentials | No evidence text duplication |
| Experience | `experiences` + `experience_items` only | No public static dataset |
| Projects | `projects` + `project_sections` | Relationships select where they appear |
| Writing | `publications` + `media_assets` | Keep as-is |
| Credentials | `credentials` only | Home/Focus/About read hosted |
| Resume | New `resume_tracks` (or extend `focus_pages`) | Request-only until file attached |
| Contact | Profile channels + contact copy settings | Form remains gated |
| SEO | New `page_seo` keyed by route | Fallback: page → site_profile defaults → code |

---

## 6. Site profile cutover (completed in 52A)

**Authoritative source:** published hosted `site_profile` row `7b916af9-2874-44a3-8629-24fb5627b072`, read through `getPublishedSiteProfile()` (`src/lib/content/profile.ts`) and mapped to `PublicSiteProfile` (`src/lib/content/site-profile.ts`).

**Public consumers:** header short name, footer identity/headline/email/LinkedIn, Contact channels, Resume request channels, shared CTA email/LinkedIn, Home closing contact links only, Focus/Home work-authorization slot, portrait initials, root metadata identity, default Open Graph name/headline.

**Derived in code (no hosted columns):** `shortName` from parenthetical display name, `initials` from short name, `linkedinLabel` from URL (protocol/`www` stripped).

**Retired:** public `src/content/site.ts` `siteProfile` export and `SiteProfile` type. Tests keep a hosted-row fixture. No silent fallback to the old career copy.

**Failure behavior:** `{ ok: false }` is a query/transport failure; `{ ok: true, profile: null }` is missing/unpublished. Chrome uses structural “Portfolio” only. Contact/email/LinkedIn/headline are omitted rather than replaced with stale static prose.

**Caching / freshness:** `React.cache()` dedupes one public profile query per request. Most public routes are already `force-dynamic`. Admin `saveSiteProfileAction` calls `revalidatePath("/", "layout")`. Profile edits become visible on the next public request.

**Still deferred:** remaining per-page SEO outside Home (52G); `location_display` and `hero_cta_primary_label` remain unused publicly.

Work authorization remains hosted blank and unrendered. Admin can save a blank value. No static fallback reintroduces employment-status wording.

---

## 7. Home CMS and stable UUID relationships (completed in 52B)

**Authoritative store:** published `home_page` singleton `c52b0001-0000-4000-8000-000000000001`, plus `home_page_chips`, `home_proof_items`, `home_experience_items`, and `home_credentials`. Featured project is `home_page.featured_project_id` → PrivAI Guard `0002fb1b-5c40-41ea-98a9-e62de9dac37e`.

**Public path:** `getPublishedHomePage()` in `src/lib/content/home.ts` maps to `PublicHomePage`. Failure is `{ ok: false }`; missing/unpublished is `{ ok: true, page: null }`. Related unpublished or `needs_verification` records are omitted, not replaced with static copy.

**Experience:** six current Home bullets are selected by `experience_item_id`. Exact-string matching and static slug remapping are retired for Home. `experience_items.show_on_home` remains on the schema as unused leftover (three NPC metric items) and is **not** a public Home authority.

**Credentials:** MSIS, CIPM, and ISC2 CC by UUID. Google AI remains unpublished and unselected.

**Admin:** `/admin/home`. Saves revalidate `/` and `/admin/home`.

**Focus cards:** Home track cards now consume hosted Focus `nav_label`, `card_summary`, and `card_chips`. Home CMS heading/lede were not rewritten.

---

## 8. About and Journey (completed in 52C)

**Authoritative store:** published `about_page` singleton `c52c0001-0000-4000-8000-000000000001`, plus `about_page_paragraphs` and `about_page_list_items`. Journey events live in `journey_milestones` with optional `media_asset_id`.

**Public path:** `getPublishedAboutPage()` in `src/lib/content/about.ts`. Failure is `{ ok: false }`; missing/unpublished is `{ ok: true, page: null }`. Draft milestones, including Northwestern graduation, are omitted.

**Journey:** five published milestones keep the current captions, years, order, and media UUIDs. GPA year is 2025. ANU year is null. Crop classes stay in code keyed by media UUID (`src/lib/content/journey-crop.ts`). Media caption/year on `media_assets` are leftover compatibility fields, not public Journey authority.

**Graduation:** draft milestone `c52c0001-0000-4000-8000-000000000046`, year 2026, `media_asset_id` null. Admin can attach approved media later and then explicitly publish. No placeholder image.

**Temporary:** About Education glance still reads static `publicCredentials` degrees until Step 52F.

**Admin:** `/admin/about` and `/admin/journey`. Saves revalidate `/about`, `/admin/about`, and `/admin/journey`.

Crop map remains code keyed by media UUID.

---

## 9. Northwestern graduation milestone (future)

**Title:** Northwestern University — MSIS Graduation  
**Year:** 2026  
**Purpose:** Represent completion of the MSIS with Security specialization as professional-development reinforcement of cybersecurity governance, technology risk, privacy, and AI governance. Must not imply prior professional credibility began at graduation.

**Caption (approved conceptual):**  
Completed the Master of Science in Information Systems with a Security specialization, strengthening the technical foundation supporting my cybersecurity governance, technology risk, privacy, and AI governance work.

Forbidden framing: aspiring; finally graduated; career transition complete; beginning my professional journey.

**Media:** No approved graduation image exists in the repository, hosted `media_assets`, or Storage (16 objects: 1 portrait, 5 journey, 10 publication PDFs). Do not infer approval from filenames. Do not create a placeholder. Do not publish an empty milestone.

**NORTHWESTERN GRADUATION MILESTONE — ARCHITECTURE READY / MEDIA REQUIRED**

Add via admin/CMS after image approval.

---

## 10. Focus, Experience, Projects, Writing, Credentials

### Focus

**Completed in 52D.** Public Focus core copy and supporting evidence are hosted. Accessor: `getPublishedFocusPage(slug)` / `getPublishedFocusPages()` in `src/lib/content/focus.ts`. No runtime static `focusPages` career-content authority.

Relationships:
- `focus_experience_items` → `experience_items.id` (parent context joined from `experiences`)
- `focus_credentials` → `credentials.id` (public only if published and `needs_verification = false`)
- `focus_pages.featured_project_id` → `projects.id` `ON DELETE SET NULL`
- `focus_pages.featured_publication_id` → `publications.id` `ON DELETE SET NULL`

Home-specific card copy lives on `focus_pages.card_summary` / `card_chips` so Home wording stays unchanged without duplicating Focus summaries onto Home CMS. Featured-project ledes live on `focus_pages.featured_project_lede`.

Footer Focus links use code-owned `FOCUS_PUBLIC_ROUTES` labels (`Cybersecurity / GRC`, `Privacy / AI Governance`). Those labels are stable route labels; the layout already has profile data and does not add a Focus query solely for footer chrome.

Resume track cards temporarily consume hosted Focus until Step 52G creates `resume_tracks`. Request-based Version 1.0 is unchanged. No public PDFs.

`resume_media_id` remains unused: **KEEP FOR 52G**. Do not activate public resume files here.

Admin `/admin/skills` edits core copy, competencies, and evidence relationships. Saves revalidate both Focus routes, `/`, `/resume`, and `/admin/skills`.

Static Credential datasets remain for About until 52F. Scionetrade is not selected as Home or Focus evidence. Google AI is not selected.

### Experience

**Completed in 52E.** Public `/experience` uses hosted `experiences` + `experience_items` only. Accessor: `getPublishedExperiences()` in `src/lib/content/experiences.ts`. Hosted UUIDs are the public identity. Hybrid Scionetrade merge and org/title remapping are retired.

**Date precision:** `date_precision` is `month` or `year`. Month records keep `start_date` / `end_date` and render as before. Year-only records store `start_year` / `end_year` and leave date columns null. Scionetrade is the first year-only record: `2018`–`2020`, no fabricated month/day.

**Page chrome:** `experienceCopy` (H1, lede, overlap disclosure, additional-experience heading) remains static until a later page-copy/SEO step.

Home’s six `home_experience_items` and Focus’s 10 + 10 `focus_experience_items` are unchanged UUID relationships.

### Projects

`/projects` and PrivAI case study: hosted. Focus featured card: static `featuredProject`. `privaiGuardSections` unused. PrivAI limits/MVP/non-production/synthetic/human-review remain hosted project truth.

### Writing

Already the customization model to copy: hosted publications, PDFs in Storage, one link-only NCSP piece, Focus resolves one slug then hosted row. Gaps: index copy/SEO static; Focus slug static; no publications admin screen (dashboard “Not implemented”). Do not rewrite published works.

### Credentials

`/credentials` hosted; Focus and About degrees static. Google AI unpublished. Hierarchy MSIS → CIPM → ISC2 CC already via kind groups + `sort_order`. Dual public dataset must end.

### Credential verification gap (no columns yet)

| Field | Justified for production customization? |
|---|---|
| verification URL (https) | Yes — optional, public if present |
| credential URL (issuer page) | Yes — optional; may be same as verification |
| expiry date | Yes — optional; CIPM/CC may need it later |
| featured / highlight | Already exists (`highlight`) — reuse |
| credential ID / member number | **No** by default — sensitive; do not store unless owner later requires a non-secret public ID |

Do not add fields in 51F.

---

## 11. Resume and Contact

### Resume

Approved V1.0 public model: **One professional record. Two focus lenses.** Request-based. No public PDFs.

Current tracks are content packages, not identity: Cybersecurity / GRC / IT Risk; Privacy / AI Governance.

Future `resume_tracks`: id, title, description, active, sort_order, request-only vs public-file, optional `media_id`, CTA labels, `focus_page_id`. A third track must not require redesign. Do not publish resume files in 51F. Existing `focus_pages.resume_media_id` may be reused or replaced by an explicit resume-track table (prefer explicit table if tracks can outlive/diverge from Focus).

### Contact

Approved V1.0: email + LinkedIn. Form unpublished (`contact_form_enabled = false` + env gates).

Future settings: introduction, enabled channels (email, LinkedIn, form), CTA labels. Security implementation stays in code. Enabling the form still requires env secrets, rate limit, RPC, validation — not a CMS checkbox alone.

---

## 12. Metadata strategy

**Keep in code:** `createPageMetadata` helper, canonical construction, `metadataBase`, sitemap generation, robots path disallow list, OG image layout component.

**Move to hosted/config:** per-route SEO title, meta description, OG title, OG description.

**Fallback precedence (frozen):**

1. Page-specific hosted metadata (`page_seo` keyed by route, e.g. `/about`)
2. Hosted site-profile defaults (display name, headline/summary as description fallback)
3. Safe stable code fallback (generic capability description already in `lib/metadata.ts` — keep as last resort, not a second career CMS)

`robots.ts` does not read `site_settings.site_indexable`; optional later wiring without putting robots policy prose in the database.

Writing detail metadata already uses the publication row — preserve that pattern.

---

## 13. Navigation and CTA

**Navigation:** KEEP IN CODE. Routes, order, and labels are IA. Configurable visibility/order is not required for Version 1.0 career operations. Do not CMS-control arbitrary routes.

**CTA:**

- Editorial: heading, label, supporting copy → hosted/config
- Structural: `ButtonLink`, focus states, href implementation → code
- Do not store component trees or variant recipes in the database

---

## 14. Admin coverage and gap matrix

### Already managed

| Admin | Tables |
|---|---|
| Settings | `site_profile`, `site_settings` |
| Experience | `experiences`, `experience_items` |
| Projects | `projects`, `project_sections` |
| Education / Certifications / Training / Licenses | `credentials` by kind |
| Skills (Focus) | `focus_pages` core fields |
| Media | `media_assets` metadata (no upload UI) |
| Inquiries | `inquiries` read/update/delete |

### Missing production-customization screens

| Screen | Gap |
|---|---|
| Home | Copy + featured relationships |
| About | Narrative, speaking, boundaries |
| Journey milestones | Distinct from media metadata |
| Publications / Writing | Dashboard notes not implemented |
| Resume tracks | None |
| SEO | None |
| Contact copy | None (flag exists) |
| Focus evidence relationships | Skills CMS does not attach Experience/Project/Writing/Credentials |
| Featured Home experience items | `show_on_home` exists but is unused by public Home selector |
| Engagements | Table empty, no admin |
| Media upload | Metadata only |

---

## 15. Relationship architecture

Prefer ordered junction tables (or equivalent ordered child rows) over duplicated display text. Simplest normalized model:

| Relationship | Model |
|---|---|
| Home → Experience item | `home_experience_items (experience_item_id, sort_order, status)` |
| Home → Credential | `home_credentials (credential_id, sort_order)` or reuse `highlight` **only if** product is “all highlighted” |
| Home → Project | `home_settings.flagship_project_id` or `projects.is_featured` with a single-featured constraint |
| Focus → Experience item | `focus_experience_items (focus_page_id, experience_item_id, sort_order)` |
| Focus → Project | `focus_pages.featured_project_id` or junction |
| Focus → Publication | `focus_pages.selected_publication_id` |
| Focus → Credential | `focus_credentials` junction |
| Journey milestone → Media | `journey_milestones.media_asset_id` nullable |
| Resume track → file | `resume_tracks.media_id` nullable (or existing `focus_pages.resume_media_id`) |
| SEO → page | `page_seo.route_key` primary (`/`, `/about`, …) |

Do not join on bullet body, credential official name, or organization+title.

After cutover, public Experience IDs must be hosted UUIDs (or a stored stable `public_key` column), not reconstructed slugs.

---

## 16. Publication-state model

Reuse existing `content_status`: `draft` | `published` | `archived` (and current admin intents).

| Domain | States |
|---|---|
| Profile, Focus, Experience, Projects, Publications, Credentials, Media, future About/Home/Journey/Resume/SEO | draft / published / archived |
| `site_settings` flags | enabled/disabled booleans (no status column today — preserve) |
| Credentials | + `needs_verification` |
| Resume tracks | active + request_only / has_public_file |
| Journey | published only with or without media per editorial rule; graduation requires approved media |

Anonymous reads: published (+ credentials not needing verification, media `is_public`). Admin: `is_admin()` mutations. Do not weaken RLS. Service role: inquiry RPC only.

---

## 17. Static-retirement inventory (export-level)

### `src/content/site.ts`

| Export | Classification |
|---|---|
| `siteProfile` career fields | RETIRED — hosted `site_profile` is public authority |
| `siteProfile.workAuthorization` | KEEP HOSTED blank |
| `focusPages` | RETIRED — public career-content authority removed; `FOCUS_PUBLIC_ROUTES` is route config only |
| `navPrimary` | KEEP — presentation/config in code |
| `umbrellaDomains` | LEGACY unused |

### `src/content/copy.ts`

| Export | Classification |
|---|---|
| `aboutCopy` | RETIRED — hosted `about_page` is public authority |
| `experienceCopy` | MOVE |
| `projectsCopy` | MOVE |
| `speakingCategories` | RETIRED — hosted `about_page_list_items` |

### `src/content/experiences.ts`

| Export | Classification |
|---|---|
| `experiences` career dataset | RETIRED — hosted Experience is public authority |
| `scionetrade` entry | RETIRED — hosted year-only parent/item |
| `homeExperiences` | RETIRED |
| `experiencesForTrack` | RETIRED |
| `bulletsForTrack` | KEEP — presentation filter for `/experience` `all`-track bullets |

### `src/content/projects.ts`

| Export | Classification |
|---|---|
| `projects` | RETIRE public authority |
| `featuredProject` | RETIRE |
| `privaiGuardSections` | LEGACY unused |

### `src/content/credentials.ts`

| Export | Classification |
|---|---|
| `credentials` / `publicCredentials` | RETIRE public authority |
| `highlightCredentials` | LEGACY unused |
| `google-ai` pending | Keep unpublished in hosted row |

### `src/content/metrics.ts`

| Export | Classification |
|---|---|
| `metrics` | LEGACY unused; do not silently publish |

### `src/lib/content/home.ts`

| Export | Classification |
|---|---|
| Copy constants | MOVE |
| `HOME_EXPERIENCE_SELECTION` / name matchers | RETIRE after junctions |
| `selectHome*` helpers | KEEP as query-layer mappers over hosted relationships |

Silent full-dataset fallbacks (`query fails → render static career record`) must be removed when each domain cuts over.

---

## 18. Hard-coded JSX (public)

### Legitimate structural

Skip link, Menu/Close, generic “temporarily unavailable”, “No published …”, stack/explore/contact chrome, PortraitSlot “Portrait to be added”.

### Mutable career/editorial (move)

- `src/app/page.tsx` section titles, track framing, closing CTA
- `src/app/contact/page.tsx`, `src/app/resume/page.tsx`, `src/app/credentials/page.tsx` heroes
- `src/app/projects/privai-guard/page.tsx` kicker and “Discuss this work”
- Focus error heroes; `FocusView` featured ledes and resume button labels
- `CallToAction` default title/lede
- `ContactFormPlaceholder`
- `SiteFooter` bar disclaimer
- `lib/content/home.ts` and `lib/content/publications.ts` `WRITING_INDEX_COPY` (modules, not JSX, but same class of content)
- `lib/metadata.ts` default descriptions

Do not treat design-system labels as CMS content.

---

## 19. Failure / fallback architecture

**Do not** preserve full duplicate career datasets as silent public authorities.

| Failure | Behavior |
|---|---|
| Hosted query error | Explicit unavailable state for that section/page (already used on several routes) |
| Empty published set | Honest empty/omission, not stale static |
| Missing optional relation (no flagship, no portrait) | Omit the block |
| Missing Journey media on a milestone | Show text milestone without figure |
| Missing site_profile | Structural “Portfolio” chrome only; omit headline/email/LinkedIn |
| Contact form misconfigured | Direct email/LinkedIn from hosted profile (current State A) |

Logging: server logs / existing error returns; no new telemetry required for freeze.

**Must eventually remove:** Focus/About static credentials; remaining page-chrome static copy. Experience hybrid merge and Home exact-string selectors are already retired.

---

## 20. Query and performance baseline

| Page | Pattern | Cutover note |
|---|---|---|
| Home | Cached `getPublishedHomePage()` (singleton + related IDs) + profile + portrait + cached Focus cards | Experience join includes date precision; no N+1 |
| About | `Promise.all` portrait + journey | Milestones query + batched media |
| Experience | Cached `getPublishedExperiences()`: published parents, then batched items | Hosted-only; no static merge |
| Focus | Cached page + parallel evidence | Experience join includes date precision |
| Writing index | Publications then per-row media `Promise.all` | Prefer join/`media_id` in one query at cutover |
| Credentials / Projects | Single list query | Keep |
| Contact | Settings then maybe token | Keep |

Public reads: anonymous publishable client. Admin: cookie server client. Inquiries insert: service role RPC only. `force-dynamic` on most public pages — acceptable for V1.0; do not add client-side content fetches.

---

## 21. Security / RLS principles (frozen)

Existing public SELECT: published (and credentials `needs_verification = false`; media `is_public`). Parent-published required for experience items and project sections. `site_settings` fully readable (safe flags only). Inquiries: no anon SELECT; no anon INSERT; service-role RPC only. `user_roles` not exposed on Data API.

**Future tables** (when implemented): RLS enabled; anon SELECT published-only; writes `is_admin()`; no service role except existing inquiry RPC. Junctions: public read only if parent and child are public. Do not create policies in 51F.

---

## 22. Redesign-readiness

Most pages already separate PageHero + cards from data. Tight couplings to break at cutover:

- `FocusView` imports static content modules
- `HomeFlagshipProject` prefers `homeFlagshipCopy` over project row fields
- `AboutJourney` is media-list, not milestone-list (crop map is OK)
- Resume is a static page with Focus mirrors
- Home selection helpers encode editorial curation in TypeScript

Target: hosted content → typed layer → reusable components → design system. A visual redesign must not require professional-data migration.

---

## 23. Customization acceptance matrix

| Scenario | Current | Future requirement |
|---|---|---|
| Change Home brand headline | hosted `home_page` | preserve |
| Change About narrative | source edit (`copy.ts`) | CMS |
| Add Journey milestone | media-oriented admin + code crop | CMS milestone |
| Add Northwestern graduation | not present | CMS + approved media |
| Add certification | CMS | preserve |
| Reorder credentials | CMS `sort_order` | preserve |
| Add Experience | CMS, including year-only records | preserve |
| Feature different Home Experience | Home CMS UUID relationships | preserve |
| Feature different Focus evidence | Focus CMS UUID relationships | preserve |
| Add project | CMS | preserve |
| Feature another project | partial (`is_featured` + static Focus + Home slug) | configurable relationship |
| Add Writing publication | hosted (no admin UI) | preserve model + add admin |
| Select different Focus Writing | static slug | relationship |
| Add Resume track | source edit | configurable |
| Publish/replace Resume file | unavailable | configurable media FK |
| Change Contact channels | hosted `site_profile` | preserve |
| Enable contact form | hosted flag + env | preserve dual gate |
| Change SEO metadata | source edit | CMS/config |
| Change visual theme | code | remain code |
| Change site headline in Settings | hosted public chrome | preserve |
| Hide work authorization | already empty/optional | preserve |

---

## 24. Recommended implementation phases (Step 52+)

Do not start these in 51F.

1. **52A — Profile public cutover (complete)**
   Hosted `site_profile` is the public authority for shared identity, headline, email, and LinkedIn. Empty work-auth stays unrendered. Static `siteProfile` career strings are retired. Ready for 52B.

2. **52B — Home relationships + copy (complete)**
   Hosted `home_page` is public Home authority. Experience and credential selections use UUIDs. Exact-string matching is retired. Ready for 52C.

3. **52C — About + Journey milestones (complete)**
   Hosted `about_page` is public About authority. `journey_milestones` own captions/years/order. Graduation remains draft without media. Ready for 52D.

4. **52D — Focus evidence relationships (complete)**
   Hosted Focus is the public authority. Experience, credentials, project, and writing use stable UUIDs. `focusPages` / `homeTracks` public career-content authority retired. Resume temporarily consumes hosted Focus. Ready for 52E.

5. **52E — Experience hosted-only + Scionetrade year precision (complete)**
   Public Experience uses hosted records only. Scionetrade is hosted as year-only 2018–2020. Static Experience authority and hybrid merge are retired. Home/Focus UUID relationships remain intact. Ready for 52F.

6. **52F — Credentials dual-source retirement**  
   About/Focus read hosted credentials. Optional verification URL column if still justified.

7. **52G — Resume tracks + Contact copy + page SEO**  
   Request-based model unchanged. Form remains unpublished until operational requirements met.

8. **52H — Admin screens + publications CMS + mirror deletion**  
   Build missing editors. Remove dead exports (`metrics`, `privaiGuardSections`, etc.) only after public cutover.

Each phase: versioned migration, assertion counts, no silent static fallback, RLS on new tables, local commit, no push/deploy until the owner requests it.

---

## 25. What 51F did not change

No public copy, layout, schema, RLS, hosted rows, media, or Storage. This file is the architecture freeze.

Hosted baseline counts at freeze: experiences 7, experience_items 26, projects 3, project_sections 7, focus_pages 2, media_assets 16, credentials 10, publications 11, engagements 0, inquiries 0, site_profile 1, site_settings 1, Storage objects 16.

---

## 26. Step 52A completion

Site Profile public cutover is complete. Public chrome, Contact, Resume request channels, shared CTA, root identity metadata, and default Open Graph read hosted `site_profile` through the typed content layer. Static `siteProfile` is retired.

---

## 27. Step 52B completion

Home CMS cutover is complete. Mutable Home editorial content and featured evidence live in `home_page` and UUID relationship tables. Exact-string Experience matching is gone. `show_on_home` is unused leftover. Focus/Resume track cards remain a documented 52D dependency.

---

## 28. Step 52C completion

About CMS cutover is complete. Mutable About editorial content lives in `about_page`. Professional Journey is a dedicated milestone entity linked to media by UUID. The five current Journey entries are unchanged publicly. Northwestern graduation exists as a 2026 draft with no media. About Education credentials remain a documented 52F dependency. Next: Step 52D — Focus evidence relationships + static Focus retirement.
