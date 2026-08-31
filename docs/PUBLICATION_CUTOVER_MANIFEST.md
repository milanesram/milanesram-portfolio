# Publication and Public Cutover Manifest

Step 42A read-only reconciliation of the current public static site against hosted Wave-1 draft content.

**Date:** 2026-08-30  
**Repository:** `/Users/mbair_ram/Documents/rainier-portfolio`  
**Branch:** `main`  
**HEAD:** `95c164f133144ac0394434916b47db6b169835c6`  
**Hosted project:** `rainier-portfolio` (`itoctveqrtozdehoofoq`)

This document is a review artifact only. It does not authorize publication, route cutover, Wave-1.1 loading, Storage creation, inquiry activation, or deployment.

---

## 1. Current hosted baseline

Reconfirmed read-only on 2026-08-30. Baseline matches the expected post-41B state.

### Target Wave-1 rows (57)

| Table | Count | Status |
|---|---:|---|
| `site_profile` | 1 | `draft` |
| `site_settings` | 1 | no status column; `contact_form_enabled = false`, `site_indexable = true` |
| `projects` | 3 | all `draft` |
| `project_sections` | 7 | all `draft` |
| `experiences` | 7 | all `draft` |
| `experience_items` | 26 | all `draft` |
| `credentials` | 10 | all `draft` |
| `focus_pages` | 2 | all `draft` |
| **TOTAL** | **57** | **published = 0** |

Status-bearing Wave-1 rows = 56, all `draft`. `site_settings` is the 57th operational singleton and has no publication status.

### Non-target

| Table | Count |
|---|---:|
| `media_assets` | 0 |
| `publications` | 0 |
| `engagements` | 0 |
| `inquiries` | 0 |
| `inquiry_submission_events` | 0 |
| `user_roles` | 1 (owner bootstrap; not content) |

### Operational reconfirmations

- Google AI credential: `needs_verification = true`, `details = NULL`, `year_label = NULL`, `track = privacy_ai`
- `contact_form_enabled = false`
- `site_indexable = true` (stored intent only; `src/app/robots.ts` does not consume it)
- Scionetrade: absent
- DTSLC: present — Northwestern University / Communications Head, Data & Technology Student Leadership Council / `2026-01-01`–`2026-12-01` / exactly 1 child
- Temporary UAT residue: none
- `[UAT-41B]` marker: none
- Storage: 0 buckets / 0 objects

No unexpected baseline change. Do not re-run Wave-1 apply or rollback.

---

## 2. Static-to-hosted reconciliation

Classification key:

| Code | Meaning |
|---|---|
| A EXACT | Hosted value matches the current public source factually and semantically |
| B TRANSFORMED-SAFE | Same fact; DB representation differs for a known technical reason |
| C STATIC-ONLY BY DESIGN | Intentionally remains application copy |
| D HOSTED-ONLY BY DESIGN | Operational/CMS field not intended for public presentation |
| E MISSING FROM HOSTED | Current public fact has no hosted equivalent |
| F CONFLICT | Static and hosted values disagree factually or materially |

### Domain summary

| Domain | Static records | Hosted records | Exact/safe | Missing | Conflict | Status |
|---|---:|---:|---:|---:|---:|---|
| Site profile (public fields) | 1 | 1 | 6 public fields exact | 0 factual | 0 | READY (draft) |
| Site settings | flags in app/env | 1 | flags match intent | — | 0 | operational; form off |
| Projects | 3 | 3 | 3 exact | 0 | 0 | READY (draft) |
| Project sections | 7 | 7 | 7 exact | 0 | 0 | READY (draft) |
| Experiences | 8 | 7 | 7 transformed-safe | 1 parent | 0 | HYBRID required |
| Experience items | 27 | 26 | 26 transformed-safe | 1 child | 0 | HYBRID required |
| Credentials | 10 | 10 | 9 exact/safe; 1 hold | 0 | 0 | 9 READY; Google AI HOLD |
| Focus pages | 2 | 2 | 2 exact (10 competencies each) | 0 | 0 | READY (draft) |
| Publications | 1 | 0 | — | 1 | 0 | KEEP STATIC |
| Home metrics (cards) | 3 | 0 table; 3 flagged items | 3 contexts exact | card value/label remain static | 0 | HYBRID |
| About / speaking | editorial | 0 | — | by design | 0 | KEEP STATIC |
| Media / resume files | placeholders / no PDF | 0 | — | by design | 0 | KEEP STATIC |
| Engagements | 0 public rows | 0 | — | — | 0 | DEFER |

### Profile

| Field | Static | Hosted | Class |
|---|---|---|---|
| display name | Rainier (Ram) Milanes | same | A |
| headline | Cybersecurity, GRC, and privacy governance for regulated environments. | same | A |
| summary | I help organizations assess… capstone. | same | A |
| work authorization | Authorized to work in the U.S. without sponsorship | same | A |
| LinkedIn URL | `https://www.linkedin.com/in/milanesram/` | same | A |
| public email | `milanesram@gmail.com` | `public_email` same | A |
| location | not in static profile | `NULL` | D |
| hero CTA label | not in static profile | `NULL` | D |
| status | n/a | `draft` | D |
| shortName | Ram Milanes | no column | C |
| initials | RM | no column | C |
| linkedinLabel | linkedin.com/in/milanesram | no column | C |

`shortName`, `initials`, and `linkedinLabel` remain static-only. No schema change is required.

### Settings

| Flag | Hosted | Class | Notes |
|---|---|---|---|
| `contact_form_enabled` | `false` | A / D | `/contact` already reads this via `getPublicSiteSettings()`; form stays off |
| `site_indexable` | `true` | D | stored intent; `robots.ts` remains static and does not consume it |

`site_settings` SELECT is `USING (true)` for anon/authenticated. The flags are already queryable. They are website switches, not portfolio narrative.

### Projects

All three public projects match hosted rows exactly on name, slug, tagline, year, role, summary, limits, stack, featured, and list order (`sort_order` 10 / 20 / 30).

| Slug | Featured | Year | Class |
|---|---|---|---|
| `privai-guard` | true | 2026 | A |
| `dbnms` | false | 2022 | A |
| `npcrs` | false | 2023 | A |

Launch-date wording (“Launched 20 April 2022”, “Launched 3 February 2023”) lives inside `summary` and is already hosted. It does not need a separate launch-date column.

Static `tracks: ["all"]` has **no `projects.track` column**. Classification: C. Current UI does not filter project cards by parent track (`FocusView` always shows `featuredProject`). This is not a schema blocker.

### Project sections

All seven PrivAI sections match hosted `heading` + `body` in source order (sort 10–70). Hosted `track = all` on every section is D (static sections have no track field). Static section `id` values (`problem`, `risk`, …) are C (UI keys; DB uses UUIDs).

### Experiences and items

Seven hosted parents match the seven month-capable static parents. Dates are B (first-of-month storage). Featured flags match (`featuredOnHome` → `is_featured` for the three recent roles). Locations, titles, secondary title, kinds, and bullet bodies match.

Parent `tracks` arrays have **no `experiences.track` column**. Visibility is carried by `experience_items.track` after the Step 38 transform:

| Static tracks | Hosted item `track` | Class |
|---|---|---|
| `["all"]` | `all` | B |
| `["cyber", "all"]` | `all` | B — keeps `/experience` default visibility |
| `["privacy", "all"]` | `all` | B |
| `["privacy"]` | `privacy_ai` | B |

`/experience` currently shows only bullets whose static array includes `all` (`bulletsForTrack` with no track). Hosted `track = all` preserves that. Privacy-only variants remain focus-only.

The three Home metric facts are the NPC Chief items at sort 40 / 50 / 60 (`is_metric = true`, `show_on_home = true`). `metric_context` matches `src/content/metrics.ts` `context` exactly. Card `value` and `label` strings remain C.

### Credentials

Hosted kinds: 3 `degree`, 3 `certification`, 3 `training`, 1 `license`. Missing years remain `NULL`. Subtype and track mapping match the Step 38 rules. Disclaimers/details are preserved.

Google AI is the only verification hold. See §6.

### Focus pages

| Static id | Hosted slug | Headline / summary / 10 competencies / order | Class |
|---|---|---|---|
| `cyber` | `cybersecurity-grc` | exact | A; static id is C |
| `privacy` | `privacy-ai-governance` | exact | A; static id is C |

`resume_media_id` is `NULL` on both (D). It must not block cutover while resume remains static.

FocusView PrivAI ledes (“Control design…” / “Privacy-risk triage…”) are hardcoded in `FocusView` (C).

---

## 3. Exact missing and conflicting content

### E — missing from hosted

Reported individually.

1. **Scionetrade parent** — `src/content/experiences.ts` id `scionetrade`. Year-only `2018`–`2020`. Not loaded. See §4.
2. **Scionetrade child** — one bullet: advised a security and technology solutions provider on cybersecurity, data privacy, and vendor-facing technology engagements. Not loaded.
3. **Publication `ncsp-lgu`** — NCSP 2023–2028 localization paper. Shown on `/writing`, Home, and the cyber focus page. No Publications CMS. Hosted `publications` = 0.
4. **Home metric card `value` / `label`** — `631 → 1,498` / `New DPO registrations`; `350 → 685` / `Compliance checks, 2021`; `10,000+` / `Registered entities`. Facts exist on hosted items; the compact card strings do not. Remain static presentation (C), listed here so Home HYBRID is explicit.
5. **Profile chrome** — `shortName`, `initials`, `linkedinLabel` (C).
6. **Application navigation and chips** — `navPrimary`, `umbrellaDomains` (C).
7. **About editorial** — `aboutCopy` title/lede/paragraphs/speaking/nonClaims and `speakingCategories` (C).
8. **Page and section chrome** — Home/Experience/Projects/Credentials/Writing/Resume/Contact heroes and section kickers (C).
9. **Focus PrivAI-specific ledes** — hardcoded in `FocusView` (C).
10. **CallToAction default title/lede** — component props, not CMS (C).
11. **Portrait and resume files** — `PortraitSlot` placeholder; `/resume` has no public PDF (C). Storage is not required for initial launch.
12. **Parent track aliases on projects and experiences** — no DB column (C). Not a blocker because current presentation does not depend on a project-level track column, and experience visibility is item-level after transform.

### F — conflicts

**None.** No Wave-1 overlapping fact disagrees with the current public source.

### Display-contract note (not F)

DTSLC static labels are `2026`–`2026`. Hosted dates are the approved DQ-03 range `2026-01-01`–`2026-12-01`. A Month-YYYY formatter would change the public label from `2026 – 2026` to `January 2026 – December 2026`. That is an approved enrichment, not a factual conflict. The synthetic day must never appear.

---

## 4. Scionetrade determination

Hard gate for a pure `/experience` database cutover.

### Actual current repository source

File: `src/content/experiences.ts`  
Logical id: `scionetrade`

| Field | Current source value |
|---|---|
| organization | Scionetrade Corporation |
| title | Legal Consultant — Cybersecurity & Data Privacy Advisory |
| location | Philippines |
| kind | `additional` |
| startLabel | `2018` |
| endLabel | `2020` |
| isCurrent | unset (false) |
| featuredOnHome | unset (false) |
| tracks | `["all"]` |
| child bullets | 1 |
| sort | array index 6 of 8 (after Bankmer Compliance, before DTSLC) |

Child body: advised a security and technology solutions provider on cybersecurity, data privacy, and vendor-facing technology engagements. Child tracks: `["all"]`.

### Date precision

| Question | Determination |
|---|---|
| A. Does the current source provide month/year? | **No** |
| B. Does it provide only years? | **Yes** — `2018` and `2020` |
| C. Is there another repository source with authoritative month/year? | **No for the live public site.** `docs/CONTENT_INVENTORY.md` §2.8 records a CV range “July 2018 – June 2020” and Resume A/B as “2018–2020”. That is a historical source conflict, not an approved public-site date. The live public source is year-only. |
| D. Did Step 38 incorrectly classify source precision? | **No.** Current `experiences.ts` is still year-only. |
| E. Would migration require inventing a month/day? | **Yes**, if the only authorized public source is `experiences.ts`. Adopting the inventory’s CV months would change the public label from `2018 – 2020` to `July 2018 – June 2020` and requires a separate owner authorization. This audit does not promote those months. |

### Eligibility

**Not eligible for Wave-1.1** on current evidence.

Keep Scionetrade blocked from database migration until authoritative months are obtained.

`/experience` cannot achieve full static parity through a pure DB cutover without one of:

1. obtaining authoritative months, or
2. deliberately retaining that record statically, or
3. deliberately removing it from the public site.

Do not choose removal to simplify implementation. **Recommended initial-production path:** option 2 — HYBRID `/experience` (seven hosted roles + one static Scionetrade entry).

Wave-1.1 SQL is **not needed** in this step.

---

## 5. Publication eligibility matrix

READY = factually reconciled and operationally safe to publish later.  
HOLD = must remain draft.  
DEFER = not part of initial DB-backed cutover.  
BLOCKED = a factual or technical issue must be resolved first.

| Domain/record | Eligibility | Reason |
|---|---|---|
| `site_profile` | READY | Public fields exact; NULL location/CTA are intentional |
| `site_settings` | n/a (already public flags) | No status; SELECT is `USING (true)`; form remains off |
| Project `privai-guard` | READY | Exact match; featured |
| Project `dbnms` | READY | Exact match |
| Project `npcrs` | READY | Exact match |
| Project sections (7) | READY | All seven PrivAI sections exact; no exceptions |
| Experience RAM Privacy & Security | READY | Dates transformed-safe; 4 items match |
| Experience NPC Innovation / CITO | READY | Dates transformed-safe; 8 items match |
| Experience NPC Chief, CMD | READY | Dates transformed-safe; 6 items including 3 home metrics |
| Experience Bankmer Ops & DPO | READY | Dates transformed-safe; 3 items match |
| Experience Bankmer Counsel | READY | Dates transformed-safe; 2 items match |
| Experience Bankmer Compliance | READY | Dates transformed-safe; 2 items match |
| Experience DTSLC | READY | Approved Jan–Dec 2026 dates; 1 item match |
| Experience items (26) | READY | Bodies and metric flags match; track transform safe |
| Scionetrade (not hosted) | BLOCKED | Year-only public source; do not invent months |
| Credentials — education (3) | READY | Years only where sourced; JD/BSBA year NULL |
| Credentials — CIPM, CC | READY | Tracks mapped to `all`; no verification hold |
| Credential — Google AI | HOLD | `needs_verification = true`; public site already hides it |
| Credentials — training (3) | READY | Details preserved; years NULL |
| Credential — PH law license | READY | Disclaimer preserved |
| Focus `cybersecurity-grc` | READY | Title, summary, 10 competencies, order exact |
| Focus `privacy-ai-governance` | READY | Title, summary, 10 competencies, order exact |
| Publications | DEFER | No CMS; keep `/writing` static |
| Media / Storage | DEFER | 0 rows / 0 buckets; placeholders suffice |
| Engagements | DEFER | Empty; speaking remains About copy |

READY does **not** mean “publish now.” See §8 and § publication-versus-cutover below.

---

## 6. Credential verification holds

### Google AI Professional Certificate

| Field | Hosted | Static |
|---|---|---|
| kind | `certification` | `certification` |
| issuer | Google | Google |
| year_label | `NULL` | unset |
| details | `NULL` | unset |
| track | `privacy_ai` | `["privacy"]` |
| highlight | false | unset |
| needs_verification | **true** | `verification: "pending"` |
| status | draft | n/a |

**Does the current public site display Google AI?** **No.**

`src/content/credentials.ts` exports `publicCredentials = credentials.filter((c) => c.verification !== "pending")`. `/credentials`, Home highlight cards, About education glance, and `FocusView` all consume `publicCredentials` or `highlightCredentials` (derived from it).

Hosted hold **matches** current public behavior. The public site does not require correction to hide this credential.

Do not publish this row merely because the static array still contains it. Public RLS already requires `status = 'published' AND needs_verification = false`. Keep HOLD until the owner clears verification.

No other credential has `needs_verification = true`.

---

## 7. Route cutover matrix

Current public routes still import `@/content`. Existing `src/lib/content/*` helpers already know how to read published rows but are **not** wired to public pages (except `getPublicSiteSettings()` on `/contact` and the contact API).

| Route | Current source | Initial target source | Mode | Required DB domains | Blocker? | Reason | Recommended sequence |
|---|---|---|---|---|---|---|---|
| `/` | `page.tsx` + HomeHero + `@/content` | profile, featured project, featured experiences, highlight credentials, metric facts from hosted; publication + chrome static | HYBRID | site_profile; projects; experiences + items; credentials | no for hybrid | Publication card and metric labels stay static; Scionetrade is not on Home | 5 |
| `/about` | `aboutCopy`, `speakingCategories`, `publicCredentials` | education list from credentials; narrative/speaking remain static | HYBRID | credentials (degree) optional | no | Long About and speaking stay editorial | 6 |
| `/experience` | `experiences` | 7 hosted + 1 static Scionetrade | HYBRID | experiences + items | **yes for pure DB** | Year-only Scionetrade; retain statically | 4 |
| `/projects` | `projects` | hosted projects | DATABASE | projects | no | Three rows exact | 1 |
| `/projects/privai-guard` | `featuredProject`, `privaiGuardSections` | hosted project + 7 sections | DATABASE | projects + project_sections | no | Seven sections exact | 1 |
| `/credentials` | `publicCredentials` | hosted credentials excluding verification hold | DATABASE | credentials | no | Google AI already hidden by RLS + hold | 2 |
| `/writing` | `publications[0]` | keep `src/content/publications.ts` | STATIC | none | no | No Publications CMS; one approved public paper | — (do not cut over) |
| `/resume` | focusPages + siteProfile + placeholder copy | keep static; optional profile chrome later | STATIC | none required | no | No PDFs; no Storage; request-by-email remains correct | — (do not cut over) |
| `/focus/cybersecurity-grc` | `FocusView` + `@/content` | focus page + filtered experiences/credentials/project from hosted; writing + PrivAI ledes static | HYBRID | focus_pages; experiences + items; credentials; projects | no for hybrid | Publication and ledes stay static | 3 |
| `/focus/privacy-ai-governance` | same | same | HYBRID | same | no for hybrid | Google AI remains hidden | 3 |
| `/contact` | siteProfile + settings gate | profile fields from hosted; form remains off | HYBRID | site_profile; site_settings (already read) | no | Inquiry intake stays disabled | 7 |

Header, footer, metadata, and Open Graph currently read `siteProfile` / `navPrimary` / `focusPages` from `@/content`. Treat chrome as sequence 7 with `/contact`, or later with Home. Do not cut chrome over before a published profile exists.

---

## 8. Publication order

### Publication versus cutover

**PUBLICATION** changes hosted `status` so the database public RLS path can return the row.

**CUTOVER** changes the Next.js public route or helper to consume hosted data instead of `src/content`.

These are separate release operations.

Published rows are queryable through the anon/publishable key even when the website remains static. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is a public client value. “Not used by the route” does **not** mean “not public.”

It is **not safe** to publish eligible records as a casual prelude to cutover. Publication is itself a public-data event. Prefer one controlled window: publish immediately before or together with route cutover, after this manifest is reviewed.

`site_settings` is already readable (`USING true`). That exposes only `contact_form_enabled` and `site_indexable`. It is not a portfolio-content leak.

### RLS parent/child rules (from applied migrations)

| Object | Anon/authenticated SELECT |
|---|---|
| `site_profile` | `status = 'published'` |
| `site_settings` | `USING (true)` |
| `focus_pages` | `status = 'published'` |
| `projects` | `status = 'published'` |
| `project_sections` | section `published` **and** parent project `published` |
| `experiences` | `status = 'published'` |
| `experience_items` | item `published` **and** parent experience `published` |
| `credentials` | `published` **and** `needs_verification = false` |
| `publications` | `published` (none loaded) |
| `engagements` | `published` (none loaded) |
| `media_assets` | `published` **and** `is_public = true` (none loaded) |

Publishing a parent without its children can produce an empty public parent. Publishing children first keeps them invisible until the parent is published. Prefer **one transaction per tightly coupled domain**.

### Proposed domain order (do not execute)

1. **`site_profile`** — no children; chrome/home/contact depend on it.
2. **`focus_pages`** — no children; both rows together.
3. **`credentials` except Google AI** — no parent/child pair; leave Google AI `draft` + `needs_verification = true`.
4. **`projects` + `project_sections`** — one transaction: three parents and seven PrivAI sections together.
5. **`experiences` + `experience_items`** — one transaction: seven parents and 26 items together.

Do not publish publications, engagements, media, or Google AI. Do not insert Scionetrade.

---

## 9. Transformation rules

Use the existing server helpers in `src/lib/content/*` with `createSupabaseServerClient()` (publishable key, user session cookies). Do not use `createPrivilegedSupabaseClient()` / service role for ordinary public reads.

### Date / display contract

| Layer | Rule |
|---|---|
| Database | `DATE` stored as first of month: `YYYY-MM-01` |
| Public UI | `Month YYYY` (for example `October 2024`) |
| Current / open role | `end_date IS NULL` and `is_current = true` → display `Present` |
| Forbidden | Never show the synthetic day (`1`, `01`, or `October 1, 2024`) as a claimed start or end day |

DTSLC exception to current static labels: after cutover, display `January 2026 – December 2026`, not `2026 – 2026` and not `January 1, 2026`.

### Track

| Static | Hosted enum | Public filter |
|---|---|---|
| `all` | `all` | default `/experience` and both focus pages |
| `cyber` | `cybersecurity_grc` | cyber focus only |
| `privacy` | `privacy_ai` | privacy focus only |

Hosted items already store the transformed enum. Public helpers should filter items, then include a parent if it has any visible item.

### Empty / fallback

Existing helpers return `[]` or `null` on error or zero published rows. Cutover must not invent content when the published set is empty. Keep `src/content` available as rollback until the hosted path is validated.

### Metric cards

Derive Home cards from `experience_items` where `is_metric` and `show_on_home`. Keep compact `value` / `label` as presentation until a later derivation is specified. Do not create a metrics table.

---

## 10. Static-retention strategy

Do **not** delete `src/content` during initial cutover.

| Source | Role now | When it can stop being authoritative |
|---|---|---|
| `src/content/site.ts` profile fields | live public + rollback | after published profile cutover is validated on Home, chrome, contact |
| `src/content/site.ts` `shortName` / `initials` / `linkedinLabel` / `navPrimary` / `umbrellaDomains` | permanently static by design | only if a later schema/product decision exists |
| `src/content/projects.ts` | live public + rollback | after `/projects` and PrivAI detail are validated |
| `src/content/experiences.ts` | live public; Scionetrade remains authoritative | 7 hosted roles: after hybrid `/experience` validation; Scionetrade: only after months are authorized or the static-retain decision is reversed |
| `src/content/metrics.ts` | live Home card presentation | after card value/label derivation is specified and validated |
| `src/content/credentials.ts` | live public + rollback | after `/credentials` validation; keep `verification: "pending"` as the static twin of the Google AI hold |
| `src/content/publications.ts` | **authoritative** for `/writing`, Home writing, cyber focus writing | until a Publications CMS exists and is loaded |
| `src/content/copy.ts` | **authoritative** About / speaking | indefinitely unless an About CMS is later justified |
| `src/content/types.ts` / `index.ts` | application types/barrel | remain as long as static modules remain |

---

## 11. Deferred modules

| Module | Hosted | Initial-production treatment |
|---|---|---|
| Publications / `/writing` | 0 rows; no CMS | **A. KEEP STATIC** |
| Engagements | 0 | remain unused; speaking stays About copy |
| Media / Storage | 0 / 0 | not required for launch; portrait placeholder and resume-by-email stay |
| Inquiry intake | 0 inquiries; form flag false | do not enable |
| Scionetrade | not loaded | retain statically on `/experience` |
| `site_indexable` → robots | stored only | do not change `robots.ts` |
| Project-section CMS create/delete | not UAT-exercised | non-blocking; see §12 |

`/writing` classification: **A. KEEP STATIC for initial production.** Blocking cutover until a Publications CMS exists would add pre-launch scope without changing the approved public page.

---

## 12. Known launch gaps

### Step 41B CMS coverage

| Operation | Status |
|---|---|
| Project section READ | validated |
| Project section UPDATE/REVERT | validated |
| Project section CREATE/DELETE | **not exercised** |
| Parent project CREATE/DELETE | validated |

This gap does **not** block publication, public-read cutover, or initial production deployment. Initial launch does not require creating or deleting PrivAI sections.

The CMS must **not** be called fully tested for project-section create/delete.

**Recommendation: A. Accept as non-blocking for launch.** Schedule a later narrowly scoped UAT for section create/delete. Do not run that UAT in this step.

### Other known gaps (non-blocking for this audit)

- No Publications CMS
- No Storage / media
- Scionetrade year-only (blocks pure `/experience` DB parity only)
- Google AI verification hold (matches public hide)
- `robots.ts` does not read `site_indexable`
- Inquiry intake off
- Existing public helpers are unused by public routes (except settings on contact)

---

## 13. Explicit next-step recommendation

1. Review this manifest. Do not publish and do not cut over in the same breath as this audit.
2. Decide `/experience` as **HYBRID** (recommended): hosted seven roles plus static Scionetrade. Do not create Wave-1.1 SQL unless the owner separately authorizes months.
3. Treat publication and cutover as one later controlled release, not “publish now, wire routes later.”
4. When that release is authorized, implement the smallest public-read path: existing `src/lib/content/*` server helpers, publishable-key RLS, Month-YYYY date formatting, no service role.
5. Keep `/writing`, `/resume`, About narrative, nav/footer/CTA chrome, and metric card labels static for initial production.
6. Leave Google AI on HOLD. Leave `contact_form_enabled = false`. Do not create Storage.
7. Accept the project-section create/delete UAT gap as non-blocking.

**Do not begin Step 42B from this document alone.** Step 42A ends at this review artifact.

---

## Appendix A — Current public data-source inventory

| Surface | File | Data used |
|---|---|---|
| Home | `src/app/page.tsx` | `featuredProject`, `focusPages`, `highlightCredentials`, `homeExperiences`, `metrics`, `publications` |
| Home hero | `src/components/home/HomeHero.tsx` | `siteProfile`, `focusPages`, `umbrellaDomains`, `PortraitSlot` |
| About | `src/app/about/page.tsx` | `aboutCopy`, `speakingCategories`, `publicCredentials` (degrees) |
| Experience | `src/app/experience/page.tsx` | `experiences`; primary = non-leadership; additional = leadership |
| Projects index | `src/app/projects/page.tsx` | `projects` |
| PrivAI detail | `src/app/projects/privai-guard/page.tsx` | `featuredProject`, `privaiGuardSections` |
| Credentials | `src/app/credentials/page.tsx` | `publicCredentials` |
| Writing | `src/app/writing/page.tsx` | `publications[0]` |
| Resume | `src/app/resume/page.tsx` | `focusPages`, `siteProfile`; no file download |
| Focus cyber | `src/app/focus/cybersecurity-grc/page.tsx` | `FocusView trackId="cyber"` |
| Focus privacy | `src/app/focus/privacy-ai-governance/page.tsx` | `FocusView trackId="privacy"` |
| Contact | `src/app/contact/page.tsx` | `siteProfile` + `getPublicContactFormToken()` (settings + intake gate) |
| Header | `src/components/layout/SiteHeader.tsx` | `navPrimary`, `siteProfile.shortName` |
| Footer | `src/components/layout/SiteFooter.tsx` | `siteProfile`, `navPrimary`, `focusPages` |
| CTA | `src/components/ui/CallToAction.tsx` | static title/lede + profile email/LinkedIn/work auth |
| Portrait | `src/components/ui/PortraitSlot.tsx` | `siteProfile.initials`; “Portrait to be added” |
| Metadata / OG | `src/lib/metadata.ts`, `src/app/opengraph-image.tsx` | `siteProfile` |
| Robots / sitemap | `src/app/robots.ts`, `src/app/sitemap.ts` | static; sitemap lists the 11 public paths above |
| Content modules | `src/content/{site,experiences,projects,credentials,publications,metrics,copy,types,index}.ts` | authoritative live public data |

Public helpers already exist and are unused by those routes: `src/lib/content/{profile,settings,projects,experiences,education,certifications,training,licenses,skills,media}.ts`.
