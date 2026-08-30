# Pre-Migration Readiness Audit

## Audit metadata

- **Date:** 2026-08-30
- **Repository:** `/Users/mbair_ram/Documents/rainier-portfolio`
- **Branch:** `main`
- **Audited HEAD:** `32a6f65 feat: add secure public inquiry intake`
- **Starting tree:** clean
- **Scope:** Read-only whole-system architecture, security, and readiness audit of the frozen Steps 26–35 implementation. No product source, migrations, package files, or existing docs were modified. No hosted Supabase mutation, migration apply, Storage creation, content load, intake activation, deploy, stage, or commit.

## Executive verdict

The frozen CMS and security architecture is internally coherent. There is **no blocker** to a later *controlled hosted application* of the four pending local-only migrations.

The repository is **not** ready to load real portfolio content, and the public site is **not** ready for broad Supabase cutover. Those are separate, intentional deferrals: public pages still render from `src/content/`, helpers (except the narrow contact-settings lookup) are unused, Storage does not exist, and several static fields need transformation before they can become schema rows.

No hosted changes were made during this audit.

## Current architecture summary

The application is a Next.js 16 App Router portfolio with:

- Public pages sourced from `src/content/` (static TypeScript).
- An owner admin shell under `/admin` using Supabase Auth, `getUser()`, and `public.is_admin()`.
- Server Actions for all CMS writes, each re-checking `requireAdminMutation()`.
- RLS enabled and FORCE RLS on every application table.
- No browser role trust; `user_roles` is Data-API private.
- No ordinary anon or authenticated `inquiries` INSERT.
- Step 35 public intake: browser → `POST /api/contact` → server-only privileged client → narrow `submit_public_inquiry` RPC. Currently fail-closed.
- Service role used only inside that server-only intake path.
- Four committed migrations remain **unapplied hosted**.

Authorization baseline (unchanged since `3414952`):

- `getAdminContext()` / `requireAdminMutation()` call `auth.getUser()` then `rpc('is_admin')`.
- Fail closed if the helper errors.
- Authenticated non-admins receive the access-denied shell, not CMS writes.

## Database object inventory

Authoritative count is taken from `supabase/migrations/20260830010000_initial_portfolio_schema.sql` plus `20260830060000_secure_public_inquiry_intake.sql`.

**Initial hosted-applied model: 13 application tables.**

**Post-Step-35 local model (after pending `60000`): 14 application tables.**

The 14th table is `inquiry_submission_events`. It is part of the current *intended* schema and is still unapplied hosted.

| Table | Purpose | PK | Important FKs / delete | Visibility | RLS / FORCE | Anon grants | Authenticated grants | Owner policy | Public-read policy | Admin module | Public helper | Real content |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `user_roles` | Admin roster | `user_id` → `auth.users` CASCADE | none | Internal | YES / YES | none | none | none (SQL-editor only) | none | none (intentional) | none | owner row exists hosted (bootstrap; not audited by mutating) |
| `site_profile` | Public identity singleton | `id` | `singleton_key` UNIQUE + CHECK `= 'default'` | `status` | YES / YES | SELECT | SELECT + I/U/D | `site_profile_admin_all` | `status = published` | `/admin/settings` | `getPublishedSiteProfile` (unused) | not migrated |
| `site_settings` | Public website flags singleton | `id` | `singleton_key` UNIQUE + CHECK `= 'default'` | no content_status; flags only | YES / YES | SELECT | SELECT + I/U/D | `site_settings_admin_all` | `USING (true)` | `/admin/settings` | `getPublicSiteSettings` (contact activation only) | no hosted row expected |
| `focus_pages` | Career-track pages + `competencies text[]` | `id` | `resume_media_id` → `media_assets` SET NULL | `status` | YES / YES | SELECT | SELECT + I/U/D | `focus_pages_admin_all` | `status = published` | `/admin/skills` | `getPublishedFocusPages*` (unused) | not migrated |
| `experiences` | Timeline parents | `id` | children CASCADE | `status` | YES / YES | SELECT | SELECT + I/U/D | `experiences_admin_all` | `status = published` | `/admin/experience` | `getPublishedExperiences*` (unused) | not migrated |
| `experience_items` | Timeline bullets / metrics | `id` | `experience_id` CASCADE | `status` + pending parent published | YES / YES | SELECT | SELECT + I/U/D | `experience_items_admin_all` | published; **pending** also parent published | `/admin/experience` | loaded by experience helper (unused) | not migrated |
| `projects` | Case studies | `id` | children CASCADE | `status` | YES / YES | SELECT | SELECT + I/U/D | `projects_admin_all` | `status = published` | `/admin/projects` | `getPublishedProjects*` (unused) | not migrated; content script exists, unused |
| `project_sections` | Case-study sections | `id` | `project_id` CASCADE | `status` + pending parent published | YES / YES | SELECT | SELECT + I/U/D | `project_sections_admin_all` | published; **pending** also parent published | `/admin/projects` | loaded by project helper (unused) | not migrated |
| `publications` | Writing | `id` | none | `status` | YES / YES | SELECT | SELECT + I/U/D | `publications_admin_all` | `status = published` | none (intentional) | none | not migrated |
| `credentials` | Degree / cert / training / license | `id` | `kind` discriminator | `status` AND `needs_verification = false` | YES / YES | SELECT | SELECT + I/U/D | `credentials_admin_all` | published AND not needs_verification | four subtype modules | four unused helpers | not migrated |
| `engagements` | Speaking / advisory / awards | `id` | `kind` discriminator | `status` | YES / YES | SELECT | SELECT + I/U/D | `engagements_admin_all` | `status = published` | none (intentional) | none | not migrated |
| `media_assets` | Storage metadata only | `id` | referenced by `focus_pages.resume_media_id` SET NULL | `status` AND `is_public` | YES / YES | SELECT (pending: column-restricted) | SELECT + I/U/D | `media_assets_admin_all` | published AND `is_public` | `/admin/media` | `getPublishedPublicMedia*` (unused) | none; no Storage |
| `inquiries` | Private owner inbox | `id` | none | `read_at` only | YES / YES | none | SELECT / UPDATE / DELETE; **no INSERT** | admin SELECT/UPDATE/DELETE; **no INSERT policy** | none | `/admin/inquiries` | none | none expected |
| `inquiry_submission_events` | Hash-only rate-limit log (Step 35) | `id` | none | none | YES / YES | none | none | none | none | none (intentional) | none | unapplied hosted |

**Enums / domains**

| Enum | Values | Application match |
|---|---|---|
| `content_status` | `draft`, `published`, `archived` | Exact. Browser submits intents (`draft` / `publish` / `unpublish` / `archive` / `keep`), not raw status, except child section/item editors which allowlist the same three statuses. |
| `track_tag` | `all`, `cybersecurity_grc`, `privacy_ai` | Exact in CMS validators and contact intake. Static `src/content` uses `cyber` / `privacy` / `all` — mapping concern only. |
| `experience_kind` | `employment`, `consulting`, `additional`, `leadership` | Exact. |
| `credential_kind` | `degree`, `certification`, `training`, `license` | Exact. Server-fixed per module; browser cannot set `kind`. |
| `engagement_kind` | `speaking`, `advisory`, `award`, `leadership`, `teaching`, `category` | Present in types/schema. No CMS; not reachable through application writes. |
| `inquiry_context` | `recruiter`, `hiring_manager`, `other` | Exact in contact validation and form. |
| `inquiry_track` | `cybersecurity_grc`, `privacy_ai`, `either` | Exact. |
| `media_kind` | `resume_pdf`, `image`, `document` | Exact. |
| `admin_role` | `owner`, `admin` | Types match. No UI. |

No application enum value is absent from the database. No typo drift between `database.types.ts` and migrations. Static content track aliases (`cyber` / `privacy`) are a future mapping issue, not a live CMS/DB mismatch.

## CMS coverage matrix

| Domain | Admin route | Create | Edit | Status | Ordering | Delete | Notes |
|---|---|---|---|---|---|---|---|
| Projects | `/admin/projects`, `/new`, `/[id]` | yes | yes | yes | yes | yes (confirm; sections CASCADE) | |
| Project sections | on project `[id]` | yes | yes | yes | yes | yes (confirm; parent-scoped) | |
| Experience | `/admin/experience`, `/new`, `/[id]` | yes | yes | yes | yes | yes (confirm; items CASCADE) | |
| Experience items | on experience `[id]` | yes | yes | yes | yes | yes (confirm; parent-scoped) | |
| Education (`kind=degree`) | `/admin/education`, `/new`, `/[id]` | yes | yes | yes | sort_order | yes (confirm; id+kind) | |
| Certifications | `/admin/certifications`, `/new`, `/[id]` | yes | yes | yes | sort_order | yes (confirm; id+kind) | |
| Training | `/admin/training`, `/new`, `/[id]` | yes | yes | yes | sort_order | yes (confirm; id+kind) | |
| Licenses | `/admin/licenses`, `/new`, `/[id]` | yes | yes | yes | sort_order | yes (confirm; id+kind) | |
| Skills / focus pages | `/admin/skills`, `/new`, `/[id]` | yes | yes | yes | sort_order | yes (confirm) | competencies: add/edit/reorder/delete |
| Site profile | `/admin/settings` | first save inserts | yes | yes | n/a | **no** | singleton |
| Site settings | `/admin/settings` | first save inserts | yes | n/a | n/a | **no** | singleton; flags only |
| Media | `/admin/media`, `/[id]` | **no** `/new` | yes | yes | n/a | yes (metadata only; SET NULL) | no upload |
| Inquiries | `/admin/inquiries`, `/[id]` | **no** `/new` | `read_at` only | n/a | n/a | yes (confirm) | no owner INSERT |
| `user_roles` | none | — | — | — | — | — | SQL-editor only |
| `inquiry_submission_events` | none | — | — | — | — | — | RPC-only |
| Publications | none | — | — | — | — | — | schema exists; CMS deferred |
| Engagements | none | — | — | — | — | — | schema exists; CMS deferred |

Intentionally absent routes confirmed: `/admin/media/new`, `/admin/inquiries/new`. No accidental empty `/new` for those modules.

Admin App Router inventory (actual):

- `/admin/login`
- `/admin`
- `/admin/projects`, `/new`, `/[id]`
- `/admin/experience`, `/new`, `/[id]`
- `/admin/education`, `/new`, `/[id]`
- `/admin/certifications`, `/new`, `/[id]`
- `/admin/training`, `/new`, `/[id]`
- `/admin/licenses`, `/new`, `/[id]`
- `/admin/skills`, `/new`, `/[id]`
- `/admin/settings`
- `/admin/media`, `/[id]`
- `/admin/inquiries`, `/[id]`

Build output matches this tree. No `/admin/publications*` or `/admin/engagements*`.

## Admin authorization matrix

**Page protection**

- Root `/admin/layout.tsx` is chrome/robots only (`force-dynamic`, noindex). It does not authorize.
- `/admin` and every module layout call `getAdminContext()`: unsigned → `/admin/login`; signed non-admin → `AdminAccessDenied`; admin → `AdminChrome`.
- `/admin/login` redirects already-admin users to `/admin`.
- List/detail pages additionally call `requireAdminMutation()` before queries (belt-and-suspenders).

**Mutations**

Every CMS Server Action calls `requireAdminMutation()` independently:

`saveProjectAction`, `deleteProjectAction`, `saveProjectSectionAction`, `deleteProjectSectionAction`, `moveProjectSectionAction`, `saveExperienceAction`, `deleteExperienceAction`, `saveExperienceItemAction`, `deleteExperienceItemAction`, `moveExperienceItemAction`, `saveEducationAction`, `deleteEducationAction`, `saveCertificationAction`, `deleteCertificationAction`, `saveTrainingAction`, `deleteTrainingAction`, `saveLicenseAction`, `deleteLicenseAction`, `saveFocusPageAction`, `deleteFocusPageAction`, `addCompetencyAction`, `saveCompetencyAction`, `deleteCompetencyAction`, `moveCompetencyAction`, `saveSiteProfileAction`, `saveSiteSettingsAction`, `saveMediaAction`, `deleteMediaAction`, `updateInquiryReadAction`, `deleteInquiryAction`.

Login/logout (`signInAction` / `signOutAction`) correctly do not use `requireAdminMutation()`.

No mutation relies only on layout, hidden buttons, or browser role state.

No ordinary CMS module imports `createPrivilegedSupabaseClient` or uses the service role.

## Public data exposure matrix

Database/Data API is the public boundary. Helpers do not compensate for policy leaks.

| Table | Anon SELECT (current hosted) | Anon SELECT (after pending) | Row condition | Column restrictions | Anon I/U/D | Helper | Helper vs DB |
|---|---|---|---|---|---|---|---|
| `projects` | yes | yes | `status = published` | none | denied | unused | equal (published filter) |
| `project_sections` | yes | yes | hosted: section published only; **pending: section AND parent published** | none | denied | unused | helper loads published parent first, then published sections — equal/stricter than hosted; equal after `30000` |
| `experiences` | yes | yes | `status = published` | none | denied | unused | equal |
| `experience_items` | yes | yes | hosted: item published only; **pending: item AND parent published** | none | denied | unused | same parent-first pattern; equal after `40000` |
| `credentials` | yes | yes | published AND `needs_verification = false` | none | denied | unused | helpers also filter `kind` — stricter |
| `focus_pages` | yes | yes | `status = published` | none | denied | unused | equal |
| `media_assets` | yes (all columns) | yes (column-restricted) | published AND `is_public` | pending anon: `id, kind, title, alt_text, is_public, status` only | denied | unused | helper omits `bucket_path`/timestamps — stricter than hosted; equal after `50000` for returned fields |
| `site_profile` | yes | yes | `status = published` | none | denied | unused | helper omits `singleton_key`/timestamps |
| `site_settings` | yes | yes | `USING (true)` | none (table is flags-only) | denied | **wired** for contact activation | equal; returns only the two flags |
| `publications` | yes | yes | `status = published` | none | denied | none | n/a |
| `engagements` | yes | yes | `status = published` | none | denied | none | n/a |
| `inquiries` | no | no | n/a | n/a | denied | none | n/a |
| `user_roles` | no | no | n/a | n/a | denied | none | n/a |
| `inquiry_submission_events` | n/a hosted | no | n/a | n/a | denied | none | n/a |

## Anonymous write matrix

| Table | INSERT | UPDATE | DELETE |
|---|---|---|---|
| All 13 hosted tables | DENIED | DENIED | DENIED |
| `inquiry_submission_events` (after `60000`) | DENIED | DENIED | DENIED |

Public inquiry submission does **not** require anon table INSERT. It uses a server-only RPC executed as `service_role`. No unexpected anonymous write grant exists in any migration.

## Authenticated non-admin matrix

There is no public signup. A non-admin Auth user, if one existed, would:

| Surface | Behavior |
|---|---|
| CMS tables (projects, experience, credentials, focus, media, profile, settings, publications, engagements) | SELECT published (and media public) rows only. Writes blocked by RLS (`is_admin()`). |
| `media_assets` columns | After `50000`, table-level SELECT remains for `authenticated` so owner CMS can read `bucket_path`. A non-admin Auth user could therefore read `bucket_path` on published+public rows. Documented tradeoff; Storage does not exist. |
| `inquiries` | SELECT/UPDATE/DELETE grants exist; RLS requires `is_admin()` → no rows, no writes. |
| `user_roles` | No grants. |
| `inquiry_submission_events` | No grants. |
| `is_admin()` | Executable; returns false. |
| `submit_public_inquiry` | Not granted. |
| Admin UI | Access denied. |

No authenticated non-admin mutation path exists in application code.

## Pending migration audit

Reviewed in timestamp order. None applied hosted. None applied during this audit.

### `20260830030000_project_sections_select_parent_published.sql`

- **Purpose:** Replace `project_sections_select_published` so a section is publicly selectable only when `section.status = published` AND parent `projects.status = published`.
- **Dependencies:** Initial schema (`project_sections`, `projects`, existing policy name).
- **Depends on other pending?** No.
- **Conflicts:** None. Drops/recreates the same policy name. Admin `project_sections_admin_all` untouched. Grants untouched.
- **Four-state matrix:** draft parent + published section → hidden; archived parent + published section → hidden; published parent + draft section → hidden; published parent + published section → visible.
- **Admin:** unaffected.
- **Locally validated:** static SQL review only.
- **Hosted:** unapplied.

### `20260830040000_experience_items_select_parent_published.sql`

- **Purpose:** Same parent-published invariant for `experience_items` / `experiences`.
- **Dependencies:** Initial schema.
- **Depends on other pending?** No.
- **Conflicts:** None. Same pattern as `30000`.
- **Four-state matrix:** identical to projects.
- **Admin:** unaffected.
- **Locally validated:** static SQL review only.
- **Hosted:** unapplied.

### `20260830050000_restrict_anon_media_asset_columns.sql`

- **Purpose:** Revoke table-level anon SELECT; grant column SELECT for `id, kind, title, alt_text, is_public, status` only. Does not change RLS. Does not create Storage.
- **Dependencies:** Initial `media_assets` grants.
- **Depends on other pending?** No. Does not reverse `30000`/`40000`.
- **Conflicts:** None. Authenticated table-level SELECT unchanged by design.
- **Admin:** owner still has full SELECT via authenticated grant + `media_assets_admin_all`.
- **Locally validated:** static SQL review only.
- **Hosted:** unapplied. Current hosted anon can SELECT `bucket_path` / timestamps on published+public rows.

### `20260830060000_secure_public_inquiry_intake.sql`

- **Purpose:** Add private `inquiry_submission_events`; add `submit_public_inquiry` (`SECURITY DEFINER`, `search_path = pg_catalog`, schema-qualified `public` tables); grant EXECUTE to `service_role` only; revoke from PUBLIC/anon/authenticated. No `inquiries` INSERT grant or INSERT policy.
- **Dependencies:** Initial `inquiries` table and `inquiry_context` / `inquiry_track` enums.
- **Depends on other pending?** No. Does not touch `30000`–`50000` objects.
- **Conflicts:** None. New table, new function, new indexes.
- **Safety before real content:** Safe. Hash-only events; opportunistic 24h delete; transactional advisory locks; no PII in the event table.
- **Locally validated:** static SQL review only. No disposable isolated replay in this repository.
- **Hosted:** unapplied. Hosted intake therefore cannot succeed even if env flags were set.

**Ordering:** `30000` → `40000` → `50000` → `60000` is valid. Later migrations do not reverse earlier security changes. Policy/function names do not collide. None require real content to exist first; they should be applied *before* real content.

**Replay limitation:** There is no PGlite/local disposable role-test harness and no project test script. Persistent hosted/dev databases were not reset. Internal coherence is from static SQL review only.

## Migration dependency/order

### A. Security / schema migrations (do not execute now)

1. `20260830030000_project_sections_select_parent_published.sql`
2. `20260830040000_experience_items_select_parent_published.sql`
3. `20260830050000_restrict_anon_media_asset_columns.sql`
4. `20260830060000_secure_public_inquiry_intake.sql`

Apply only in a later authorized hosted step. Then regenerate types from hosted if desired.

### B. Real content migration (do not execute now)

Safe FK order after A:

1. `media_assets` metadata first if any `focus_pages.resume_media_id` will be set (Storage still not required for metadata-only rows).
2. `site_profile` and `site_settings` singletons (`singleton_key = 'default'`).
3. `projects`, then `project_sections`.
4. `experiences`, then `experience_items`.
5. `credentials` by `kind` (degree / certification / training / license).
6. `focus_pages` (attach `resume_media_id` only after the media row exists).
7. `publications` / `engagements` only when a CMS or reviewed SQL script exists.
8. Never load real inquiries.

Existing opt-in script `supabase/content/privai_guard_project.sql` is insert-if-absent for one project + seven sections. It is not a migration and has not been applied.

### C. Public route cutover (do not execute now)

Per-domain, after reviewed published rows exist. Do not conflate with A or B. `robots.ts` and most pages should stay static until an explicit cutover step.

## Public helper / source-of-truth audit

All files under `src/lib/content/`:

| Helper | Table | Filters | Fields | Order | Public usage |
|---|---|---|---|---|---|
| `getPublishedSiteProfile` | `site_profile` | singleton + published | public chrome, no timestamps | n/a | unused |
| `getPublicSiteSettings` | `site_settings` | singleton | two flags | n/a | `/contact` token gate + `POST /api/contact` |
| `getPublishedProjects` / `getPublishedProjectBySlug` | `projects` + `project_sections` | published; slug format | no internal timestamps | sort_order, name | unused |
| `getPublishedExperiences` / `getPublishedExperienceById` | `experiences` + `experience_items` | published; UUID | mapped fields | sort_order, dates | unused |
| `getPublishedEducation*` | `credentials` | `kind=degree`, published, not needs_verification | mapped | sort_order, name | unused |
| `getPublishedCertifications*` | `credentials` | `kind=certification`, same | mapped | sort_order, name | unused |
| `getPublishedTraining*` | `credentials` | `kind=training`, same | mapped | sort_order, name | unused |
| `getPublishedLicenses*` | `credentials` | `kind=license`, same | mapped | sort_order, name | unused |
| `getPublishedFocusPages*` | `focus_pages` | published; slug/UUID | no `resume_media_id` | sort_order, nav_label | unused |
| `getPublishedPublicMedia*` | `media_assets` | published + public | no `bucket_path`/timestamps | title | unused |

**Wired today**

1. Static-content-backed public pages: `/`, `/about`, `/experience`, `/projects`, `/projects/privai-guard`, `/writing`, `/credentials`, `/focus/*`, `/resume`, header, footer, metadata.
2. Unused Supabase adapters: all helpers above except settings.
3. Narrow Step 35 lookup: `getPublicSiteSettings()` + `getPublicContactFormToken()` on `/contact` and the API route. Fail-closed when settings are missing or env is off.

No accidental public wiring of project/experience/credential/skill/profile/media helpers.

`createSupabaseBrowserClient` is exported and unused by app routes. Public data access is server-side only.

## Static-to-database mapping readiness

Planning only. Nothing was migrated.

| Domain | Static source | Target | Straightforward | Static-only / richer | Schema-only | Transforms | Dependencies |
|---|---|---|---|---|---|---|---|
| Site profile | `src/content/site.ts` | `site_profile` | displayName, headline, summary, workAuthorization, linkedinUrl, email→public_email | `shortName`, `initials`, `linkedinLabel` | `location_display`, `hero_cta_primary_label`, `status`, singleton | choose published; drop extras or derive | none |
| Site settings | none | `site_settings` | — | — | `contact_form_enabled`, `site_indexable` | must be chosen explicitly; `robots.ts` still static | none |
| Projects | `src/content/projects.ts` | `projects` | slug, name, tagline, year, role, summary, limits, stack, featured | `tracks[]` on project (DB has no project track) | `status`, `sort_order` | assign UUIDs, status, sort; drop project-level tracks | sections after parent |
| Project sections | `privaiGuardSections` + `supabase/content/privai_guard_project.sql` | `project_sections` | heading, body | static ids are slugs; no `track` on static sections | `track`, `status`, `sort_order` | script already sets `track=all`, published | project first |
| Other projects (`dbnms`, `npcrs`) | same file | `projects` | parent fields | no section bodies in static | status/sort | write sections or leave empty | project first |
| Experience | `src/content/experiences.ts` | `experiences` | organization, title, titleSecondary, kind, isCurrent | `startLabel`/`endLabel` strings (month names / years); parent `tracks[]`; `featuredOnHome` | `start_date`/`end_date` dates, `is_featured`, `status`, `sort_order`, `location_display` | parse dates; map featured; drop parent tracks | items after parent |
| Experience items | bullets | `experience_items` | body | static `tracks[]` including `cyber`/`privacy` | `track` enum, `status`, `sort_order`, `is_metric`, `metric_context`, `show_on_home` | map `cyber`→`cybersecurity_grc`, `privacy`→`privacy_ai`; split multi-track bullets | parent first |
| Metrics | `src/content/metrics.ts` | possibly `experience_items` | context text | standalone value/label cards | `is_metric`, `metric_context`, `show_on_home`, parent FK | decide parent experience; not 1:1 | experiences first |
| Education / certs / training / licenses | `src/content/credentials.ts` | `credentials` | name, issuer, year, details, highlight, kind | `tracks[]`; `verification: pending` | single `track`, `needs_verification`, `status`, `sort_order` | map tracks; Google AI cert → `needs_verification=true`; status published for public ones | none |
| Skills / focus | `src/content/site.ts` `focusPages` | `focus_pages` | slug, navLabel, headline, summary, competencies | static `id` is `cyber`/`privacy` | UUID, `status`, `sort_order`, `resume_media_id` | new UUIDs; publish | media before resume FK |
| Media | `/public` assets + resume page | `media_assets` | none as rows | local files | `bucket_path`, kind, flags, status | no Storage yet — metadata-only or defer | Storage later |
| Publications | `src/content/publications.ts` | `publications` | title, publisher, year, abstract, url | `tracks[]`; no slug | `slug`, `track`, `status`, `sort_order`, `published_on` | invent slug; no CMS yet | CMS or script first |
| Engagements | `speakingCategories` strings | `engagements` | none | category labels only | full row + `kind` | not a 1:1 load | CMS first |

## Delete-semantics matrix

| Entity | Action | Exact-id | Extra scope | Confirm | FK | Redirect | Service role |
|---|---|---|---|---|---|---|---|
| Project | `deleteProjectAction` | UUID | pre-read | yes | sections CASCADE | `/admin/projects` | no |
| Project section | `deleteProjectSectionAction` | UUID | `project_id` match | yes | none | project `[id]` | no |
| Experience | `deleteExperienceAction` | UUID | pre-read | yes | items CASCADE | `/admin/experience` | no |
| Experience item | `deleteExperienceItemAction` | UUID | `experience_id` match | yes | none | experience `[id]` | no |
| Education | `deleteEducationAction` | UUID | `kind=degree` + pre-read | yes | none | `/admin/education` | no |
| Certification | `deleteCertificationAction` | UUID | `kind=certification` | yes | none | list | no |
| Training | `deleteTrainingAction` | UUID | `kind=training` | yes | none | list | no |
| License | `deleteLicenseAction` | UUID | `kind=license` | yes | none | list | no |
| Focus page | `deleteFocusPageAction` | UUID | pre-read | yes | competencies die with row | `/admin/skills` | no |
| Competency | `deleteCompetencyAction` | page UUID + index | bounds-checked rewrite | yes | none (array) | stay | no |
| Media | `deleteMediaAction` | UUID | pre-read | yes | `resume_media_id` SET NULL; Storage not deleted | `/admin/media` | no |
| Inquiry | `deleteInquiryAction` | UUID | pre-read | yes | none | `/admin/inquiries` | no |
| Profile / settings | none | — | — | — | — | — | — |

No broad unscoped deletes. Child writes require parent ownership.

## Status / publication matrix

`content_status` meanings are consistent: `draft` (admin only), `published` (public-eligible), `archived` (admin only).

Application intents: `draft`→draft, `publish`→published, `unpublish`→draft, `archive`→archived, `keep`→current or draft.

Exceptions:

- `site_settings` has no status.
- `inquiries` use `read_at`.
- `inquiry_submission_events` have no publication state.
- Credentials also require `needs_verification = false` for public SELECT.
- Media also requires `is_public = true`.
- Child sections/items: independent status **plus** (after pending migrations) parent published.

| Content | Visibility model |
|---|---|
| Projects | Independent `status` |
| Project sections | Parent-dependent after `30000` |
| Experience | Independent `status` |
| Experience items | Parent-dependent after `40000` |
| Credentials | Subtype (`kind`) + status + verification-dependent |
| Focus pages | Independent `status` (competencies inherit parent row) |
| Media | Public flag + status |
| Site profile | Singleton + status |
| Site settings | Singleton; fully public flags |
| Publications / engagements | Independent `status` (no CMS) |

## Secret / service-role audit

**Environment names (values not inspected or copied)**

Expected public: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, optional `NEXT_PUBLIC_SITE_URL`.

Expected server-only: `SUPABASE_SERVICE_ROLE_KEY`, `CONTACT_RATE_LIMIT_SECRET`, `CONTACT_INTAKE_ENABLED`. None use a `NEXT_PUBLIC_` prefix.

`.env*` is gitignored. No tracked `.env` / `.env.local`.

**Privileged client**

- `src/lib/supabase/privileged.ts`: `import "server-only"`; reads `SUPABASE_SERVICE_ROLE_KEY`; not `NEXT_PUBLIC_`.
- Sole importer: `src/lib/contact/submit.ts` (`import "server-only"`), which only calls `rpc("submit_public_inquiry", …)`.
- No `.from(...).insert/update/delete` on the privileged client.
- No Client Component import.
- No CMS service-role CRUD.

**`user_roles` / `is_admin()`**

Occurrences: schema, types, `authorization.ts` RPC, docs. No browser query. No role-management UI. Anon cannot execute `is_admin()`. Authenticated can execute it (needed for RLS). No Data API self-promotion.

**Client bundle (after `npm run build`)**

Searched `.next/static` for `SUPABASE_SERVICE_ROLE_KEY`, `CONTACT_RATE_LIMIT_SECRET`, `CONTACT_INTAKE_ENABLED`, `createPrivilegedSupabaseClient`. **No matches.** Those identifiers appear only in server chunks, which is expected.

## Inquiry intake security audit

Confirmed path:

browser `ContactForm` → `POST /api/contact` → bounded body (`12_288` bytes, incremental) → `isContactIntakeConfigured()` (env + secret length ≥ 32 + service-role present) → `getPublicSiteSettings().contactFormEnabled` → origin check → honeypot → HMAC token (3s min, 2h max) → field validation (enum-closed) → HMAC fingerprint/email hashes (IP/UA clipped, never stored raw) → privileged RPC → events + inquiries.

Also confirmed:

- No direct browser DB INSERT.
- No anon/authenticated INSERT grant or INSERT policy.
- RPC not executable by anon or authenticated.
- `SECURITY DEFINER` + `search_path = pg_catalog` + schema-qualified `public` tables.
- Rate-limit table private; raw IP/email not stored there; hashes are 64-char hex.
- DB rate limits transactional (advisory xact locks): 5 / 15 min per fingerprint, 3 / 60 min per email.
- API rechecks DB + env; missing settings fail closed.
- Current hosted intake disabled (migration unapplied; no settings row expected; form shows placeholder unless both gates are true).
- Owner inbox: sender fields immutable; `read_at` only; delete by exact id; URLs use UUID only; `safeMailtoHref` rejects unsafe emails; no public inquiry helper; no PII logging in application code.

## Media / Storage boundary

- Metadata CMS only. No `/admin/media/new`.
- `bucket_path` displayed as immutable; not accepted from the form; not written on update.
- No Storage bucket, Storage RLS, upload, signed URL, or Storage deletion.
- Pending `50000` hides `bucket_path` / timestamps from anon.
- `focus_pages.resume_media_id` → `media_assets` ON DELETE SET NULL.
- Skills CMS does not write `resume_media_id`.

## Validation results

| Check | Result |
|---|---|
| `npm run lint` | PASS |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS |
| Tests | N/A — no test script |
| `git diff --check` (before this document) | PASS |

Types in `src/lib/supabase/database.types.ts` match the *local* migration-defined schema, including `inquiry_submission_events` and `submit_public_inquiry`. They are hand-written and intentionally ahead of hosted. They were not regenerated from hosted.

## Findings

### F-01 — Stale admin dashboard placeholders

- **Severity:** LOW
- **Component:** `AdminShell` upcoming modules
- **Evidence:** Dashboard still lists “Publications”, “Credentials”, and “Resume Assets” as “Not implemented yet” while Education/Certifications/Training/Licenses and Media are live destinations.
- **Impact:** Owner confusion only. Navigation links to implemented modules are correct and unique.
- **Required action:** In a later polish step, remove or reword obsolete placeholders. Do not treat as a migration blocker.

### F-02 — `robots.ts` ignores `site_indexable`

- **Severity:** LOW
- **Component:** `src/app/robots.ts`
- **Evidence:** `robots.ts` is static allow-all (except `/admin` and `/private-source/`). `getPublicSiteSettings()` is unused here. Documented as remaining static.
- **Impact:** Toggling `site_indexable` in CMS would not change robots output until an explicit cutover.
- **Required action:** When settings cutover happens, wire `robots.ts` *after* a reviewed settings row exists. Not required before applying pending schema migrations.

### F-03 — Opening SECURITY status can be misread

- **Severity:** LOW
- **Component:** `docs/SECURITY.md` status line
- **Evidence:** Status begins “Hosted schema is applied,” then correctly lists four forward migrations as not applied hosted.
- **Impact:** A hurried reader might think parent-child and media-column corrections are already live.
- **Required action:** Optional wording clarification in a later docs pass. The same file already lists the four unapplied files.

### F-04 — Public helpers import admin UUID helper

- **Severity:** LOW
- **Component:** `src/lib/content/{experiences,education,certifications,training,licenses,skills,media}.ts`
- **Evidence:** They import `isUuid` from `@/lib/admin/ids`. That file is a pure UUID predicate with no queries or secrets.
- **Impact:** Module-boundary smell only. Not a privilege leak.
- **Required action:** Optional later move of `isUuid` to a shared util.

### F-05 — No isolated SQL replay harness

- **Severity:** INFO
- **Component:** repository tooling
- **Evidence:** `package.json` has no test script. No PGlite/pg-mem/role-fixture suite. Playwright appears only as a transitive lockfile entry.
- **Impact:** Pending migrations were validated by static review, not disposable replay.
- **Required action:** Accept as a limitation for this audit. Do not install a new framework in this step.

### F-06 — Publications and engagements have schema without CMS

- **Severity:** INFO
- **Component:** `publications`, `engagements`
- **Evidence:** Tables, grants, and published SELECT policies exist. No admin routes or public helpers. Static writing/about copy is not loaded.
- **Impact:** Published rows inserted by SQL would be anonymously readable. None are migrated. CMS is intentionally deferred.
- **Required action:** Keep SQL-only until a later module. Do not load those tables during an early content pass unless reviewed.

### F-07 — Hosted still has weaker child/media public SELECT until pending migrations

- **Severity:** INFO
- **Component:** hosted vs local schema
- **Evidence:** Current hosted policies allow published children of unpublished parents, and anon table-level media SELECT including `bucket_path`. Public helpers are unused; no real content is migrated.
- **Impact:** Data API could expose those rows if they existed. They should not exist yet.
- **Required action:** Apply `30000`, `40000`, and `50000` before real content and before any public helper cutover. That is the purpose of those migrations, not a new defect.

### F-08 — Authenticated column SELECT on public media remains after `50000`

- **Severity:** INFO
- **Component:** `media_assets` grants
- **Evidence:** `50000` restricts **anon** only. Authenticated table-level SELECT is unchanged so owner CMS can read `bucket_path`.
- **Impact:** A non-admin Auth user (no public signup) could read `bucket_path` on published+public rows. Storage is absent.
- **Required action:** Accept as documented. Revisit if public signup is ever added or Storage goes live.

### F-09 — Static-to-schema mapping is not 1:1

- **Severity:** INFO
- **Component:** `src/content/` vs schema
- **Evidence:** Date labels vs `date` columns; `cyber`/`privacy` vs `track_tag`; project-level tracks vs section tracks; metrics as standalone cards; extra profile fields; no media rows; publications/engagements lack CMS.
- **Impact:** A naive copy of static objects into tables would violate CHECKs or lose meaning.
- **Required action:** Use a reviewed mapping plan (this document) before any real-content step.

### F-10 — Contact form and settings remain fail-closed

- **Severity:** INFO
- **Component:** `/contact`, intake
- **Evidence:** Token helper returns null without env + settings. Hosted `60000` unapplied. Email and LinkedIn remain on the page from static `siteProfile`.
- **Impact:** Expected. No successful hosted inquiry was attempted.
- **Required action:** None for this audit.

No BLOCKER or HIGH findings.

## Deferred intentional scope

- Applying the four hosted migrations
- Real portfolio content load
- Broad public Supabase cutover
- Storage buckets, upload, signed URLs, Storage RLS
- Publications and engagements CMS
- CAPTCHA, SMTP, notifications
- Public signup / password reset / role UI
- Isolated SQL replay harness
- Deploy
- Intake activation

## Readiness decisions

### Pending migrations

**YES**

The four local-only migrations are internally coherent, ordered, non-conflicting, and do not expand privileged capability. They only tighten child visibility, restrict anon media columns, and add the designed server-only intake objects. They are safe enough for a later *controlled* hosted application step.

### Real-content migration

**NO**

Pending security migrations are still unapplied hosted. Static-to-schema mapping requires transformations (dates, tracks, metrics, extras). Storage and publications/engagements CMS are absent. No reviewed multi-domain load procedure has been executed. Loading real rows now would write against the weaker hosted child/media policies.

### Broad public Supabase cutover

**NO**

Public pages still correctly use `src/content/`. Helpers (except the fail-closed contact-settings lookup) are unused by design. Cutover should follow reviewed published content, not precede it.

## Recommended next step

A later authorized step should apply the four pending migrations to hosted Supabase in timestamp order, then re-verify grants/policies — still without loading real content, creating Storage, activating intake, or switching public routes.

Do not begin that work as part of this audit.
