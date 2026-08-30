# Real Content Migration Manifest

## 1. Metadata

| Field | Value |
|---|---|
| Date | 2026-08-30 |
| Repository | `/Users/mbair_ram/Documents/rainier-portfolio` |
| Branch | `main` |
| Source HEAD | `9513c46 docs: record pre-migration readiness audit` |
| Hosted project | `rainier-portfolio` / `itoctveqrtozdehoofoq` |
| Hosted schema state | Migrations `20260830010000` through `20260830060000` applied. 14 application tables. Content/inbox row counts 0. Storage not created. Inquiry intake fail-closed. |
| Scope | Step 38 mapping plus Step 39 review freeze. Wave-1 draft SQL artifacts are generated under `supabase/content/` and are **not** executed. Public routes remain static. `contact_form_enabled` remains `false`. Publications, engagements, media, inquiries, `inquiry_submission_events`, and `user_roles` are untouched. |

Authoritative static sources are the files under `src/content/` plus public-route presentation that is not schema-backed. Authoritative target schema is `supabase/migrations/20260830010000_initial_portfolio_schema.sql` plus the four already-applied security migrations. Those security migrations do not add content columns.

## 2. Migration principles

1. Preserve factual meaning over exact static object shape.
2. Do not invent achievements, dates, metrics, credentials, companies, technologies, or responsibilities.
3. Do not downgrade nuanced track-specific wording to force a 1:1 row collapse.
4. Do not change schema in this step or as a condition of first load.
5. Mark lossless gaps explicitly (`RESOLUTION REQUIRED`, `UNREPRESENTED STATIC`, `NO SOURCE`, `DEFER`).
6. Use schema-supported fields only.
7. Keep approved public wording unless a mechanical transform is required (track enum, date label → `date`, slug format).
8. Distinguish transformation from editorial rewrite. Editorial changes are out of scope.
9. One canonical database row per factual item. Home/About/Focus reuse that row later.
10. No invented media rows and no `bucket_path` fabrication.
11. First load is **draft**. Publication and route cutover are later, separate authorizations.
12. Do not enable inquiry intake as a side effect of content load.

### Track transform (mechanical)

| Static `TrackId` / array token | Database `track_tag` |
|---|---|
| `all` | `all` |
| `cyber` | `cybersecurity_grc` |
| `privacy` | `privacy_ai` |

Static items may list multiple tokens. The database stores **one** `track` per child row. Visibility rule used throughout this manifest, matching current static helpers:

- `/experience` shows only bullets whose static array includes `all`.
- Focus `/focus/cybersecurity-grc` shows `all` or `cyber`.
- Focus `/focus/privacy-ai-governance` shows `all` or `privacy`.

Therefore:

| Static `tracks` | Proposed DB `track` | Classification |
|---|---|---|
| `["all"]` | `all` | DIRECT (enum rename only if needed) |
| `["cyber", "all"]` | `all` | TRANSFORM — keep default-page visibility |
| `["privacy", "all"]` | `all` | TRANSFORM — keep default-page visibility |
| `["privacy"]` | `privacy_ai` | TRANSFORM — privacy-focus only |
| `["cyber"]` | `cybersecurity_grc` | TRANSFORM — none occur in current source |

Do not map `["cyber", "all"]` to `cybersecurity_grc`. That would hide the bullet from `/experience`.

### Date transform (Step 39 review freeze)

| Source shape | Classification | Rule |
|---|---|---|
| `Month YYYY` | TRANSFORM — **DQ-01 RESOLVED** | Normalize the database `date` to the **first day of that month** (`YYYY-MM-01`). Example: January 2026 → `2026-01-01`. This is a storage convention only. It is **not** evidence that the work literally began or ended on that calendar day. Public display must continue to use the source month/year label, not the synthetic day. |
| `Present` | DIRECT | `end_date = NULL` and `is_current = true` |
| `YYYY` only, no authoritative month | AMBIGUOUS — **DQ-02 remains unresolved** | Do not invent month or day. Exclude from Wave 1 if `start_date` is NOT NULL. This is why `experience:scionetrade` is deferred. |
| `YYYY` only, later given an authoritative month range | TRANSFORM — **DQ-03 RESOLVED** | `experience:dtslc` source period is January 2026 – December 2026 → `start_date = 2026-01-01`, `end_date = 2026-12-01`, same DQ-01 disclaimer. |

CMS validators require `YYYY-MM-DD`. Year-only rows without an approved month cannot be inserted.

## 3. Static source inventory

### Files under `src/content/`

| File | Exported objects | Record count | Role |
|---|---|---|---|
| `src/content/site.ts` | `siteProfile` | 1 | Identity / contact |
| `src/content/site.ts` | `focusPages` | 2 | Focus / skills |
| `src/content/site.ts` | `navPrimary` | 5 links | Application navigation — not DB content |
| `src/content/site.ts` | `umbrellaDomains` | 6 labels | Presentation chips — not DB content |
| `src/content/experiences.ts` | `experiences` | 8 parents / 27 bullets | Timeline |
| `src/content/experiences.ts` | `homeExperiences` | 3 (derived) | Home subset of parents |
| `src/content/projects.ts` | `projects` | 3 | Case studies |
| `src/content/projects.ts` | `privaiGuardSections` | 7 | Only PrivAI Guard has sections |
| `src/content/projects.ts` | `featuredProject` | 1 (derived) | Home/focus featured |
| `src/content/credentials.ts` | `credentials` | 10 | Degree / cert / training / license |
| `src/content/credentials.ts` | `publicCredentials` | 9 (excludes pending) | Public subset |
| `src/content/credentials.ts` | `highlightCredentials` | 3 | Home subset |
| `src/content/publications.ts` | `publications` | 1 | Writing |
| `src/content/metrics.ts` | `metrics` | 3 | Home cards; same facts as three experience bullets |
| `src/content/copy.ts` | `aboutCopy` | 1 object | About narrative |
| `src/content/copy.ts` | `speakingCategories` | 3 | About speaking audiences |
| `src/content/types.ts` | types only | — | Not data |
| `src/content/index.ts` | re-exports | — | Not data |

### Static identifiers and ordering

| Domain | Unique IDs | Ordering today |
|---|---|---|
| Focus pages | `cyber`, `privacy` (UI); slugs `cybersecurity-grc`, `privacy-ai-governance` | Array order |
| Experiences | string ids (`ram-privacy-security`, …) | Array order; `/experience` splits `kind !== leadership` vs leadership |
| Experience bullets | no stable id; array index within parent | Array order; filtered by `tracks` |
| Projects | `id` + `slug` | Array order; `featured` for PrivAI Guard |
| Project sections | section `id` within PrivAI Guard only | Array order |
| Credentials | string ids (`msis`, `cipm`, …) | Array order; public page groups by `kind` |
| Publications | `ncsp-lgu` | Single row |
| Metrics | string ids | Array order on Home |

Visibility assumptions today: every static object except `credentials.verification === "pending"` is treated as public. There is no static draft/archived status (`ContentStatus` is only `"published"`).

### Public routes that embed or reuse this content

| Route / component | Content used | Extra hardcoded copy |
|---|---|---|
| `/` `HomeHero` | `siteProfile`, `focusPages`, `umbrellaDomains` | none beyond layout |
| `/` | focus, metrics, featured project, home experiences, highlight credentials, first publication | section kickers/ledes |
| `/about` | `aboutCopy`, degrees from `publicCredentials`, `speakingCategories` | heading labels |
| `/experience` | `experiences` | page hero copy, including overlap sentence |
| `/projects` | `projects` | page hero copy |
| `/projects/privai-guard` | `featuredProject`, `privaiGuardSections` | kicker text |
| `/writing` | `publications[0]` | page hero copy |
| `/credentials` | `publicCredentials` | page hero copy |
| `/focus/*` `FocusView` | focus, experiences, credentials, publication, featured project | track-specific PrivAI ledes; resume button labels |
| `/resume` | `focusPages`, `siteProfile` | PDF-not-ready copy; license disclaimer repeated |
| `/contact` | `siteProfile` email/LinkedIn | channel copy |
| Header / footer | `shortName`, `displayName`, `navPrimary`, focus, email, LinkedIn | Resume / Contact chrome |
| `PortraitSlot` | `initials` | “Portrait to be added” |
| `CallToAction` | email, LinkedIn, work auth | default title/lede |
| `robots.ts` / `sitemap.ts` | not `src/content` | indexable `/`; disallow `/admin` |

No additional portfolio facts were found hardcoded in public components beyond the files above and short page-hero sentences. Default `public/*.svg` files are Next/Vercel placeholders, not portfolio media.

### Non-content artifact (not a source of truth)

| Path | Role |
|---|---|
| `supabase/content/privai_guard_project.sql` | Optional unpublished content script. **Do not execute.** See §9. |

## 4. Target table inventory

Writable application content tables and constraints that matter for this plan:

### `site_profile`

Singleton. `singleton_key = 'default'` UNIQUE + CHECK. Fields: `display_name`, `headline`, `summary`, `work_authorization`, `location_display` (nullable), `linkedin_url`, `public_email`, `hero_cta_primary_label` (nullable), `status` default `draft`. Public SELECT only when `status = published`.

### `site_settings`

Singleton. `singleton_key = 'default'`. Fields: `contact_form_enabled` default `false`, `site_indexable` default `true`. Public SELECT `USING (true)`. No `content_status`.

### `projects`

`slug` UNIQUE + format `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Fields: `name`, `slug`, `tagline`, `year_label`, `role`, `summary`, `stack text[]`, `limits`, `is_featured`, `status`, `sort_order`. **No `track` column.** Children CASCADE from `project_sections`.

### `project_sections`

`project_id` NOT NULL → `projects` ON DELETE CASCADE. Fields: `heading`, `body`, `track` default `all`, `status`, `sort_order`. Public SELECT now requires published parent and published child.

### `experiences`

Fields: `organization`, `title`, `title_secondary` nullable, `location_display`, `kind`, `start_date date NOT NULL`, `end_date date` nullable, `is_current`, `is_featured`, `summary` nullable, `status`, `sort_order`. CHECK `end_date IS NULL OR end_date >= start_date`. **No `track` column.**

### `experience_items`

`experience_id` CASCADE. Fields: `body`, `track` default `all`, `is_metric`, `metric_context` nullable, `show_on_home`, `status`, `sort_order`. CHECK: if `is_metric` then `metric_context` is non-blank. Public SELECT requires published parent and published child.

### `credentials`

`kind` in `degree | certification | training | license`. Fields: `name`, `issuer`, `year_label` nullable, `details` nullable, `needs_verification` default `false`, `track` default `all`, `highlight`, `status`, `sort_order`. Public SELECT requires `status = published AND needs_verification = false`.

### `focus_pages`

`slug` UNIQUE + same slug format. Fields: `nav_label`, `headline`, `summary`, `competencies text[]`, `resume_media_id` → `media_assets` SET NULL, `status`, `sort_order`.

### `media_assets`

Requires `bucket_path` NOT NULL + non-blank CHECK. `kind` in `resume_pdf | image | document`. No Storage objects exist. **No first-wave rows.**

### `publications`

`slug` UNIQUE + format (static source has **no slug field**). Fields: `title`, `publisher`, `published_on` nullable, `year_label`, `abstract`, `external_url` nullable, `track`, `status`, `sort_order`. No Publications CMS.

### `engagements`

`kind` in `speaking | advisory | award | leadership | teaching | category`. No Engagements CMS. Static source has no individual engagement events.

### Intentionally excluded from real-content counts

`user_roles`, `inquiries`, `inquiry_submission_events`. Operational/security only.

## 5. Site Profile manifest

Logical key: `site-profile:default`
Source: `src/content/site.ts` → `siteProfile`
Proposed status: `draft`
`singleton_key`: `default`

| DB field | Classification | Proposed value | Notes |
|---|---|---|---|
| `display_name` | DIRECT | `Rainier (Ram) Milanes` | |
| `headline` | DIRECT | `Cybersecurity, GRC, and privacy governance for regulated environments.` | |
| `summary` | DIRECT | `I help organizations assess technology and privacy risk, implement controls, and make governance visible — drawing on regulator-side leadership, enterprise privacy-program work, and a shipped Shadow AI governance capstone.` | |
| `work_authorization` | DIRECT | `Authorized to work in the U.S. without sponsorship` | |
| `location_display` | NO SOURCE | `NULL` | Not in static profile. Do not invent a city. |
| `linkedin_url` | DIRECT | `https://www.linkedin.com/in/milanesram/` | Public LinkedIn only. Not Auth email. |
| `public_email` | DIRECT | `milanesram@gmail.com` | Explicit public contact from static source. |
| `hero_cta_primary_label` | NO SOURCE | `NULL` | Home CTAs are focus `navLabel`s, not this field. Do not stuff “Contact”. |
| `status` | TRANSFORM | `draft` | Static has no draft concept. First-load rule. |

### UNREPRESENTED STATIC (do not force into other columns)

| Static field | Value | Disposition |
|---|---|---|
| `shortName` | `Ram Milanes` | Header brand. Remain application/static until a schema field exists. |
| `initials` | `RM` | Portrait placeholder. Remain static. |
| `linkedinLabel` | `linkedin.com/in/milanesram` | Display shortening of `linkedin_url`. Derive at render time if needed. |
| `emailNote` | unused (`undefined`) | No source value. |

Do not map `shortName` or `initials` into `display_name` or `hero_cta_primary_label`.

## 6. Site Settings manifest

Logical key: `site-settings:default`
Source: current application behavior, not convenience.

| DB field | Stored intended value | Current public behavior | Classification |
|---|---|---|---|
| `contact_form_enabled` | `false` | Form hidden unless env + this flag + secrets are all on. Hosted intake remains fail-closed. | DIRECT to fail-closed default |
| `site_indexable` | `true` | `robots.ts` already allows `/` and disallows `/admin`. `robots.ts` does **not** read this flag (Step 36 F-02). | DIRECT to current public intent |

Do not set `contact_form_enabled = true` during content migration. Stored `site_indexable = true` is the intended later-cutover value; it does not change `robots.ts` today.

## 7. Projects manifest

Source: `src/content/projects.ts` → `projects`
Initial status for all three: `draft`
Parent-level static `tracks: ["all"]` has **no project column**. Track lives on sections only. Record as UNREPRESENTED STATIC at project level.

Recommended first-load status is **draft**, not published, even though these projects are already on the static public site. See §19.

### 7.1 `project:privai-guard`

| Field | Classification | Proposed value |
|---|---|---|
| logical key | — | `project:privai-guard` |
| static id | DIRECT | `privai-guard` |
| `slug` | DIRECT | `privai-guard` |
| `name` | DIRECT | `PrivAI Guard` |
| `tagline` | DIRECT | `Shadow AI privacy-risk triage` |
| `year_label` | DIRECT | `2026` |
| `role` | DIRECT | `Designed and developed` |
| `summary` | DIRECT | `A cloud-deployed full-stack Shadow AI governance MVP that converts potentially risky AI use into structured risk assessment, governance review, remediation, audit evidence, and executive visibility.` |
| `limits` | DIRECT | `Northwestern University MSIS capstone MVP. Non-production. Synthetic demonstration data only. Human governance review — not automated legal or regulatory decisioning.` |
| `stack` | DIRECT | `{Next.js, React, TypeScript, Supabase/PostgreSQL, Vercel, GitHub}` |
| `is_featured` | DIRECT | `true` (`featured`) |
| `sort_order` | TRANSFORM | `10` |
| `status` | TRANSFORM | `draft` |
| media | — | none |
| case-study route | presentation | `/projects/privai-guard` exists; other projects only anchor on `/projects` |

### 7.2 `project:dbnms`

| Field | Classification | Proposed value |
|---|---|---|
| logical key | — | `project:dbnms` |
| static id | DIRECT | `dbnms` |
| `slug` | DIRECT | `dbnms` |
| `name` | DIRECT | `Data Breach Notification Management System` |
| `tagline` | DIRECT | `National breach-notification portal` |
| `year_label` | DIRECT | `2022` |
| `role` | DIRECT | `Project sponsor — planning, development, and implementation` |
| `summary` | DIRECT | `Public-facing web portal that automates mandatory personal-data-breach notification and annual security-incident reporting, including real-time submission and status checking. Launched 20 April 2022.` |
| `limits` | DIRECT | `Public-function description only. No internal architecture, credentials, or case files are published.` |
| `stack` | DIRECT | `{}` (empty in source; do not invent technologies) |
| `is_featured` | DIRECT | `false` |
| `sort_order` | TRANSFORM | `20` |
| `status` | TRANSFORM | `draft` |
| sections | — | none in source |
| `published_on`-like date in summary | UNREPRESENTED STATIC | “Launched 20 April 2022” stays inside `summary`. Schema has no project launch-date column. |

### 7.3 `project:npcrs`

| Field | Classification | Proposed value |
|---|---|---|
| logical key | — | `project:npcrs` |
| static id | DIRECT | `npcrs` |
| `slug` | DIRECT | `npcrs` |
| `name` | DIRECT | `National Privacy Commission Registration System` |
| `tagline` | DIRECT | `DPO and data-processing-system registration` |
| `year_label` | DIRECT | `2023` |
| `role` | DIRECT | `Project sponsor — planning, development, and implementation` |
| `summary` | DIRECT | `Public-facing web portal for registering data-processing systems and Data Protection Officers, and for recording notifications of automated decision-making and profiling. Launched 3 February 2023.` |
| `limits` | DIRECT | `Public-function description only. No internal architecture, credentials, or registration records are published.` |
| `stack` | DIRECT | `{}` |
| `is_featured` | DIRECT | `false` |
| `sort_order` | TRANSFORM | `30` |
| `status` | TRANSFORM | `draft` |
| sections | — | none in source |

Do not create project-detail pages or extra sections for DBNMS/NPCRS. Their public UI is card-only.

## 8. Project Sections manifest

Only PrivAI Guard has section source (`privaiGuardSections`).
Parent key: `project:privai-guard`
All tracks: `all`
All statuses: `draft`
Do **not** duplicate `summary`, `tagline`, `limits`, or `stack` as sections. Stack remains `projects.stack`. Limits remain `projects.limits`.

| Logical key | heading | body (exact source) | track | sort_order | status |
|---|---|---|---|---|---|
| `project-section:privai-guard:problem` | Problem | Organizations adopt AI tools faster than they can see where those tools touch sensitive data. Shadow AI use arrives as informal questions, screenshots, and one-off experiments rather than as a governed request. | `all` | 10 | `draft` |
| `project-section:privai-guard:risk` | Risk | Unstructured AI use can expose personal or confidential data, skip impact review, and leave no audit trail. The gap is not only a model-risk problem — it is a privacy, security, and accountability problem. | `all` | 20 | `draft` |
| `project-section:privai-guard:guardrail` | Guardrail | PrivAI Guard turns a potentially risky AI-use report into a structured privacy-risk triage: classification, transparent scoring, data-subject impact review, and a human decision path instead of an automated legal conclusion. | `all` | 30 | `draft` |
| `project-section:privai-guard:implementation` | Implementation | Designed and developed as a cloud-deployed full-stack application using Next.js, React, TypeScript, Supabase/PostgreSQL, Vercel, and GitHub. Security and governance controls include role-based access, PostgreSQL Row-Level Security, risk scoring, remediation workflows, audit logging, and privacy-by-design defaults. | `all` | 40 | `draft` |
| `project-section:privai-guard:workflow` | Governance workflow | A reported use can be classified, scored, routed for human-reviewed internal-AI consideration, assigned remediation, and recorded as audit evidence with executive visibility. Reviewers — not the application — remain accountable for governance outcomes. | `all` | 50 | `draft` |
| `project-section:privai-guard:value` | Business value | The MVP shows how a security, privacy, or AI-governance function can replace ad-hoc Shadow AI handling with a repeatable assessment-to-evidence path that hiring managers can inspect. | `all` | 60 | `draft` |
| `project-section:privai-guard:boundary` | MVP boundary | This is a Northwestern University MSIS capstone MVP. It is non-production, uses synthetic demonstration data only, and supports advisory human review rather than automated legal or regulatory decisioning. | `all` | 70 | `draft` |

Focus-page PrivAI ledes (“Control design…” vs “Privacy-risk triage…”) are presentation-only. Do not insert them as extra sections.

## 9. PrivAI Guard artifact reconciliation

Artifact: `supabase/content/privai_guard_project.sql`
Compared to: `src/content/projects.ts` (`projects[0]` + `privaiGuardSections`)

| Topic | Static source | SQL artifact | Verdict |
|---|---|---|---|
| Parent field text | name, tagline, year, role, summary, limits, stack | Identical wording | Aligned |
| Section headings/bodies | 7 sections | Identical 7 sections | Aligned |
| `is_featured` | `true` | `true` | Aligned |
| `status` | implicit public static | **`published`** | Conflicts with draft-first plan |
| `sort_order` parent | none | `0` | Conflicts with 10/20/30 spacing |
| Section `sort_order` | array index | `0`–`6` | Conflicts with 10/20/… spacing |
| Other projects | DBNMS + NPCRS exist | **Absent** | Incomplete vs full inventory |
| IDs | string slugs | Hard-coded UUIDs `8f3a1b20-…000001` / `…011`–`…017` | Artifact-only; not treated as future executor IDs |
| Execution | not applied | `ON CONFLICT DO NOTHING`, published immediately | Unsafe for first load |

**Classification: B — partially stale; supersede with this manifest.**

The SQL remains a useful *wording* cross-check. It is **not** the authoritative migration source. A later executor must not run it alongside a Step-38-derived script (duplicate-slug / published-vs-draft conflict).

Do not reuse the artifact UUIDs unless a later step explicitly elects them. This manifest uses logical keys only.

## 10. Experience manifest

Source: `src/content/experiences.ts` → `experiences`
Parent static `tracks` have **no experience column**. Filtering is via items (+ `kind` on `/experience`).
No parent `summary` exists in source → `summary = NULL`.
`featuredOnHome` → `is_featured`.
`location` → `location_display`.
`titleSecondary` → `title_secondary`.
All first-load statuses: `draft`.

### Date board

| Logical key | startLabel | endLabel | Date class | Wave-1 `start_date` | Wave-1 `end_date` | `is_current` |
|---|---|---|---|---|---|---|
| `experience:ram-privacy-security` | October 2024 | Present | TRANSFORM / DIRECT end | `2024-10-01` (DQ-01) | `NULL` | `true` |
| `experience:npc-consultant-cito` | October 2024 | January 2026 | TRANSFORM | `2024-10-01` (DQ-01) | `2026-01-01` (DQ-01) | `false` |
| `experience:npc-cmd-chief` | March 2021 | September 2024 | TRANSFORM | `2021-03-01` (DQ-01) | `2024-09-01` (DQ-01) | `false` |
| `experience:bankmer-ops-dpo` | January 2017 | July 2020 | TRANSFORM | `2017-01-01` (DQ-01) | `2020-07-01` (DQ-01) | `false` |
| `experience:bankmer-counsel` | March 2015 | December 2016 | TRANSFORM | `2015-03-01` (DQ-01) | `2016-12-01` (DQ-01) | `false` |
| `experience:bankmer-compliance` | November 2013 | February 2015 | TRANSFORM | `2013-11-01` (DQ-01) | `2015-02-01` (DQ-01) | `false` |
| `experience:scionetrade` | 2018 | 2020 | AMBIGUOUS | deferred — not Wave 1 | deferred — not Wave 1 | `false` |
| `experience:dtslc` | 2026 (authoritative months: January–December 2026) | 2026 | TRANSFORM (DQ-03) | `2026-01-01` | `2026-12-01` | `false` |

`end_date >= start_date` holds for every proposed month/year pair. Overlap of RAM consulting and NPC consultant from October 2024 is already stated on `/experience` and is preserved by the dates above.

### Parent rows

| Logical key | organization | title | title_secondary | location_display | kind | is_featured | sort_order | First-wave? |
|---|---|---|---|---|---|---|---|---|
| `experience:ram-privacy-security` | RAM Privacy & Security | Principal Consultant | `NULL` | Remote | `consulting` | `true` | 10 | YES |
| `experience:npc-consultant-cito` | National Privacy Commission | Innovation and Transformation Consultant | Designated Chief Information Technology Officer | Philippines | `consulting` | `true` | 20 | YES |
| `experience:npc-cmd-chief` | National Privacy Commission | Chief, Compliance and Monitoring Division | `NULL` | Philippines | `employment` | `true` | 30 | YES |
| `experience:bankmer-ops-dpo` | Bankmer Realty Corporation | Director of Operations & Data Protection Officer | `NULL` | Philippines | `employment` | `false` | 40 | YES |
| `experience:bankmer-counsel` | Bankmer Realty Corporation | Corporate Counsel / Facilities Manager | `NULL` | Philippines | `employment` | `false` | 50 | YES |
| `experience:bankmer-compliance` | Bankmer Realty Corporation | Compliance Officer | `NULL` | Philippines | `employment` | `false` | 60 | YES |
| `experience:scionetrade` | Scionetrade Corporation | Legal Consultant — Cybersecurity & Data Privacy Advisory | `NULL` | Philippines | `additional` | `false` | 70 | NO — deferred (DQ-02). Not a Wave-1 blocker. |
| `experience:dtslc` | Northwestern University | Communications Head, Data & Technology Student Leadership Council | `NULL` | United States | `leadership` | `false` | 80 | YES |

## 11. Experience Items manifest

Do not collapse cyber/privacy wording variants. They are intentional alternate sentences, not duplicates.

Home metric cards (`src/content/metrics.ts`) are **not** separate rows. They attach to three `npc-cmd-chief` bullets below.

`metric_context` is copied from the matching `metrics.context` only where the bullet is the same fact. Do not invent other metrics.

Unless noted: `is_metric = false`, `metric_context = NULL`, `show_on_home = false`, `status = draft`.

### `experience:ram-privacy-security`

| Logical key | body | track | sort_order |
|---|---|---|---|
| `experience-item:ram-privacy-security:01` | Support regulated and high-risk organizations with cybersecurity, privacy, risk-management, and governance initiatives aligned with business and regulatory requirements. | `all` | 10 |
| `experience-item:ram-privacy-security:02` | Conduct risk assessments and translate findings into prioritized remediation actions, implementation roadmaps, and measurable controls. | `all` | 20 |
| `experience-item:ram-privacy-security:03` | Conduct privacy and security risk assessments and translate findings into prioritized remediation actions, measurable controls, policies, standards, procedures, and implementation guidance. | `privacy_ai` | 30 |
| `experience-item:ram-privacy-security:04` | Develop policies, standards, procedures, incident-readiness materials, and executive reports; support third-party risk, audit readiness, regulatory compliance, and stakeholder coordination. | `all` | 40 |

### `experience:npc-consultant-cito`

| Logical key | body | track | sort_order |
|---|---|---|---|
| `experience-item:npc-consultant-cito:01` | Advised executive leadership on cybersecurity strategy, technology risk, critical-infrastructure protection, information security, and security-control implementation. | `all` | 10 |
| `experience-item:npc-consultant-cito:02` | Advised executive leadership on cybersecurity strategy, information security, privacy compliance, technology risk, critical-infrastructure protection, and security-control implementation. | `privacy_ai` | 20 |
| `experience-item:npc-consultant-cito:03` | Supported risk assessments and the development of controls addressing identified cybersecurity and information-security risks. | `all` | 30 |
| `experience-item:npc-consultant-cito:04` | Supported risk assessments and the development of controls addressing identified cybersecurity, information-security, and privacy risks. | `privacy_ai` | 40 |
| `experience-item:npc-consultant-cito:05` | Directed pre- and post-production security implementation for the Compliance and Security Monitoring Command Center, supporting centralized monitoring and remediation workflows. | `all` | 50 |
| `experience-item:npc-consultant-cito:06` | Directed pre- and post-production security implementation for the Compliance and Security Monitoring Command Center, including privacy-by-design and privacy-by-default requirements. | `privacy_ai` | 60 |
| `experience-item:npc-consultant-cito:07` | Coordinated technology, privacy, security, and organizational stakeholders on digital systems and technology initiatives. | `all` | 70 |
| `experience-item:npc-consultant-cito:08` | Advised on institutionalizing the Data Protection Officer function in government. | `all` | 80 |

### `experience:npc-cmd-chief`

| Logical key | body | track | is_metric | metric_context | show_on_home | sort_order |
|---|---|---|---|---|---|---|
| `experience-item:npc-cmd-chief:01` | Led compliance monitoring, breach-notification processing, registration, compliance support, and regulatory reporting operations. | `all` | false | NULL | false | 10 |
| `experience-item:npc-cmd-chief:02` | Managed multidisciplinary teams and high-volume privacy, security, and compliance workflows; conducted and oversaw privacy, security, technology, and compliance assessments. | `all` | false | NULL | false | 20 |
| `experience-item:npc-cmd-chief:03` | Led development and implementation of the Data Breach Notification Management System and the National Privacy Commission Registration System. | `all` | false | NULL | false | 30 |
| `experience-item:npc-cmd-chief:04` | Increased new Data Protection Officer registrations from 631 in 2020 to 1,498 in 2021. | `all` | **true** | New Data Protection Officer registrations rose from 631 in 2020 to 1,498 in 2021 at the National Privacy Commission. | **true** | 40 |
| `experience-item:npc-cmd-chief:05` | Supported more than 10,000 DPS and DPO registered entities by 30 September 2024 after the registration system launched in 2023. | `all` | **true** | More than 10,000 data-processing systems and DPO registered entities were on the national registration system by 30 September 2024. | **true** | 50 |
| `experience-item:npc-cmd-chief:06` | Raised 2021 compliance-check completions from a target of 350 personal information controllers to 685 PICs. | `all` | **true** | 2021 compliance-check completions rose from a target of 350 personal information controllers to 685 PICs. | **true** | 60 |

Metric card labels/values (`631 → 1,498`, `350 → 685`, `10,000+`) remain presentation. They can be derived later from `is_metric` + `body` / `metric_context`. Do not create a metrics table.

### `experience:bankmer-ops-dpo`

| Logical key | body | track | sort_order |
|---|---|---|---|
| `experience-item:bankmer-ops-dpo:01` | Established the organization’s first Privacy Management Program, including privacy governance, policies, security procedures, data-handling standards, employee training, and accountability controls. | `all` | 10 |
| `experience-item:bankmer-ops-dpo:02` | Conducted privacy and operational risk assessments and translated findings into corrective actions and improved data-governance practices. | `all` | 20 |
| `experience-item:bankmer-ops-dpo:03` | Led modernization, records digitalization, infrastructure improvements, vendor management, and cross-functional operational initiatives. | `all` | 30 |

### `experience:bankmer-counsel`

| Logical key | body | track | sort_order |
|---|---|---|---|
| `experience-item:bankmer-counsel:01` | Directed IT planning, infrastructure modernization, information-security initiatives, and corporate-record digitalization to protect confidential organizational information. | `all` | 10 |
| `experience-item:bankmer-counsel:02` | Coordinated technology vendors, contracts, regulatory requirements, and implementation activities involving confidential organizational information. | `all` | 20 |

### `experience:bankmer-compliance`

| Logical key | body | track | sort_order |
|---|---|---|---|
| `experience-item:bankmer-compliance:01` | Researched privacy and regulatory requirements and evaluated organizational legal, operational, documentation, and information-management risks. | `all` | 10 |
| `experience-item:bankmer-compliance:02` | Developed risk-mitigation recommendations and supported compliance implementation. | `all` | 20 |

### `experience:dtslc` (Wave 1)

Source verification: `src/content/experiences.ts` has **exactly one** DTSLC bullet. Wave-1 item count is therefore 26 (25 from the six month/year parents + 1 DTSLC), not 25 and not an invented extra child.

| Logical key | body | track | sort_order |
|---|---|---|---|
| `experience-item:dtslc:01` | Coordinate technology-focused communications, stakeholder engagement, and responsible management of student information. | `all` | 10 |

### Deferred with scionetrade (not Wave 1)

| Logical key | body | track | sort_order |
|---|---|---|---|
| `experience-item:scionetrade:01` | Advised a security and technology solutions provider on cybersecurity, data privacy, and vendor-facing technology engagements. | `all` | 10 |

## 12. Credentials manifest

Source: `src/content/credentials.ts`
All first-load `status = draft`.
Public later requires `published` **and** `needs_verification = false`.

Static `verification: "pending"` is the only explicit hold. That item is already excluded from `publicCredentials`.

### Track rule for credentials

Same as items: if static `tracks` includes `all` → DB `all`. If only `privacy` → `privacy_ai`.

Focus pages currently also show `highlight` credentials and any `license` regardless of track. That is a **render rule**, not a reason to change `kind` or `track`.

### Education (`kind = degree`)

| Logical key | name | issuer | year_label | details | needs_verification | track | highlight | sort_order |
|---|---|---|---|---|---|---|---|---|
| `credential:degree:msis` | Master of Science in Information Systems, Security Specialization | Northwestern University | `2026` | Coursework includes Information Security Management; Information Security Strategy; Cybersecurity Attacks & Countermeasures; Disaster Recovery & Business Continuity; Artificial Intelligence; Machine Learning; Spec-Driven Software Development; and Project Management. | `false` | `all` | `true` | 10 |
| `credential:degree:jd` | Juris Doctor | San Sebastian College – Recoletos | `NULL` | `NULL` | `false` | `all` | `false` | 20 |
| `credential:degree:bsba` | Bachelor of Science in Business Administration | Trinity University of Asia | `NULL` | `NULL` | `false` | `all` | `false` | 30 |

No year in source for JD/BSBA. Do not invent.

### Certifications (`kind = certification`)

| Logical key | name | issuer | year_label | details | needs_verification | track | highlight | sort_order |
|---|---|---|---|---|---|---|---|---|
| `credential:certification:cipm` | Certified Information Privacy Manager (CIPM) | IAPP | `NULL` | `NULL` | `false` | `all` | `true` | 10 |
| `credential:certification:cc` | Certified in Cybersecurity (CC) | ISC2 | `NULL` | `NULL` | `false` | `all` | `true` | 20 |
| `credential:certification:google-ai` | Google AI Professional Certificate | Google | `NULL` | `NULL` | **`true`** | `privacy_ai` | `false` | 30 |

**Verification hold:** `credential:certification:google-ai` remains `needs_verification = true` and `draft`. Do not publish it later until the owner clears the pending flag. No certificate IDs exist in source; do not invent them.

### Training (`kind = training`)

| Logical key | name | issuer | year_label | details | needs_verification | track | highlight | sort_order |
|---|---|---|---|---|---|---|---|---|
| `credential:training:anu-cyber` | Professional Development Certificate in Cybersecurity | Australian National University, National Security College | `NULL` | Cyber and Critical Tech Cooperation Program – Cybersecurity Bootcamp | `false` | `all` | `false` | 10 |
| `credential:training:cisa-ics` | Industrial Control Systems Cybersecurity Training | U.S. Department of Homeland Security, CISA | `NULL` | `NULL` | `false` | `all` | `false` | 20 |
| `credential:training:dx-professional` | Certified Digital Transformation Professional | Asian Institute of Digital Transformation | `NULL` | Executive Masterclass in Digital Transformation | `false` | `all` | `false` | 30 |

### Licenses (`kind = license`)

| Logical key | name | issuer | year_label | details | needs_verification | track | highlight | sort_order |
|---|---|---|---|---|---|---|---|---|
| `credential:license:ph-law` | Licensed to Practice Law in the Philippines | Supreme Court of the Philippines / Integrated Bar of the Philippines | `NULL` | This is Philippine legal licensure. It does not imply U.S. bar admission or authorization to practice law in the United States. | `false` | `all` | `false` | 10 |

Do not change `kind` to make About/Home grouping easier. About “Education at a glance” is a later read of `kind = degree`.

## 13. Skills / Focus Pages manifest

Source: `src/content/site.ts` → `focusPages`
`resume_media_id = NULL` (no media rows; Storage absent).
Status: `draft`.

| Logical key | static id | slug | nav_label | headline | summary | sort_order |
|---|---|---|---|---|---|---|
| `focus:cybersecurity-grc` | `cyber` | `cybersecurity-grc` | Cybersecurity / GRC / IT Risk | Cybersecurity, GRC, and IT risk | Security governance, control implementation, audit readiness, and technology-risk translation — the same background, read for cybersecurity and GRC roles. | 10 |
| `focus:privacy-ai-governance` | `privacy` | `privacy-ai-governance` | Privacy / AI Governance | Privacy and AI governance | Privacy operations, privacy by design, incident process, and responsible-AI review — the same background, read for privacy and AI-governance roles. | 20 |

Do not copy static ids `cyber` / `privacy` into UUID columns.

### Competency arrays (display order, exact wording)

`focus:cybersecurity-grc` (10):

1. IT risk
2. Technology risk
3. GRC
4. Information security
5. Security controls
6. Control assessment
7. Audit readiness
8. Incident readiness
9. Third-party risk
10. Security governance

`focus:privacy-ai-governance` (10):

1. Data privacy
2. Privacy governance
3. Privacy risk
4. Privacy by design / default
5. Breach and incident management
6. Data governance
7. AI governance
8. Responsible AI
9. Audit evidence
10. Remediation

### Normalization

| Check | Result |
|---|---|
| Duplicates | none |
| Near-duplicates | “IT risk” / “Technology risk” and “AI governance” / “Responsible AI” are distinct source phrases. Keep both. |
| Whitespace / punctuation | already consistent. No mechanical change. |
| Overlong entries | none |
| Track labels mistaken for competencies | none in these arrays. `umbrellaDomains` is a different, presentation-only list. |
| Editorial rewrite | none authorized. Do not change “Privacy by design / default”. |

`umbrellaDomains` (`Cybersecurity`, `GRC`, `IT Risk`, `Information Security`, `Data Privacy`, `AI Governance`) stays static. It is a Home chip list, not a third competency array.

## 14. Media manifest

| Candidate | Current form | Classification |
|---|---|---|
| Focus-page resumes | `/resume` states public PDFs are **not posted** | DEFER UNTIL STORAGE — `resume_media_id` stays `NULL` |
| Portrait | initials placeholder; caption “Portrait to be added” | DEFER UNTIL STORAGE / NO DB MEDIA NEEDED until a real file exists |
| `public/file.svg`, `window.svg`, `vercel.svg` | framework placeholders | NO DB MEDIA NEEDED |
| External publication URL | publisher site, not a Storage object | NO DB MEDIA NEEDED |
| LinkedIn / mailto | URLs, not media | NO DB MEDIA NEEDED |

`media_assets.bucket_path` cannot be satisfied. **First-wave `media_assets` count = 0.**
Do not insert metadata-only rows with fake paths.

## 15. Publications manifest

Source: `src/content/publications.ts` → one object.
No Publications CMS. `slug` is required by schema and **missing** from the static type.

| Field | Classification | Proposed value |
|---|---|---|
| logical key | — | `publication:ncsp-lgu` |
| `slug` | TRANSFORM | `ncsp-lgu` (from static `id`; valid slug format) |
| `title` | DIRECT | Localization of the National Cybersecurity Plan (NCSP) 2023-2028 for Local Government Units |
| `publisher` | DIRECT | Friedrich Naumann Foundation for Freedom |
| `year_label` | DIRECT | `2025` |
| `published_on` | AMBIGUOUS | `NULL` — year only; writing page already says year-only is shown when precise date is ambiguous |
| `abstract` | DIRECT | A policy paper on localizing the Philippines’ National Cybersecurity Plan 2023–2028 so national standards can be implemented at the local-government level. |
| `external_url` | DIRECT | `https://www.freiheit.org/philippines/fnf-philippines-advocates-localization-national-cybersecurity-plan-local-government` |
| `track` | TRANSFORM | `all` (static `["cyber", "all"]`) |
| `sort_order` | TRANSFORM | `10` |
| `status` | TRANSFORM | `draft` if ever loaded |

Static `id` is UNREPRESENTED after slug transform.

**First-wave recommendation: DEFER UNTIL CMS/OPERATIONAL SUPPORT.**
Mapping is complete enough for a later script, but post-load edits would be SQL-only. Do not include this row in the first CMS-backed load.

## 16. Engagements manifest

| Source | What it is | Maps to `engagements`? |
|---|---|---|
| `aboutCopy.speaking` | One narrative paragraph; hosts intentionally omitted | No. Umbrella About copy. |
| `speakingCategories` | Three audience labels, no year/host/role | Not individual engagements. Forcing `kind = category` would invent titles-as-events. |
| Professional experience rows | Jobs/consulting | No. Already `experiences`. |

**Count: 0 engagement rows.**
**Recommendation: DO NOT MIGRATE / DEFER.** Keep speaking on About as static-only until the owner authorizes individual, source-supported engagement records and/or an Engagements CMS.

## 17. Static-only / non-schema content

| Item | Source | Disposition |
|---|---|---|
| About title, lede, three paragraphs, non-claims | `aboutCopy` | Remain static. Do not copy the long narrative into `site_profile.summary` (summary is already a different, shorter sentence). |
| Speaking paragraph + audience list | `copy.ts` | Remain static (see §16). |
| `umbrellaDomains` | `site.ts` | Remain static Home chips. |
| `navPrimary` and Resume/Contact chrome | `site.ts` / header | Application navigation. Not DB rows. |
| `shortName`, `initials`, `linkedinLabel` | `siteProfile` | Remain static/derived. |
| Home / About / Experience / Projects / Writing / Credentials / Resume / Focus hero kickers and ledes | page files | Presentation. |
| Focus PrivAI track-specific ledes | `FocusView` | Presentation. |
| Home metric **display** value/label | `metrics.ts` | Presentation over canonical experience items. |
| Experience-page overlap sentence | `/experience` | Presentation. |
| Resume “PDFs not posted” copy | `/resume` | Presentation; also a media deferral. |
| License disclaimer on `/resume` | hardcoded page string | Same fact as `credential:license:ph-law.details` / About non-claim. Canonical DB source is the license row after cutover. |
| `CallToAction` default title/lede | component | Presentation. |
| `hero_cta_primary_label` | unused | Leave NULL. |
| Portrait caption | `PortraitSlot` | Presentation. |

## 18. Duplication / canonical-source decisions

| Fact | Appears today | Canonical future row | Deliberate denormalization? |
|---|---|---|---|
| Identity / headline / summary / work auth / email / LinkedIn | Home, header, footer, contact, metadata, CTA | `site-profile:default` | No |
| Focus blurbs and competencies | Home cards, focus pages, resume chooser | `focus:*` | No |
| PrivAI Guard parent fields | Home, projects, focus, case study | `project:privai-guard` | No |
| PrivAI Guard sections | Case study only | `project-section:privai-guard:*` | No |
| DBNMS / NPCRS | Projects list | `project:dbnms` / `project:npcrs` | No |
| Featured roles | Home + experience + focus | `experiences` + items | `is_featured` / `show_on_home` are flags, not copies |
| Operating metrics | Home cards + NPC chief bullets | three `experience-item:npc-cmd-chief:04..06` | Home values/labels may stay derived at render |
| Degrees | Credentials, About glance, Home highlights (MSIS) | `credential:degree:*` | No |
| CIPM / CC | Home + credentials + focus | those credential rows | `highlight` flag only |
| PH law disclaimer | credential details, About non-claims, Resume | `credential:license:ph-law` | About/Resume may keep short legal chrome until cutover |
| NCSP publication | Home, writing, cyber focus | `publication:ncsp-lgu` (deferred) | No |
| DBNMS/NPCRS launch dates | inside project `summary` | remain in `summary` | No extra date column |

## 19. Status strategy

### Option A — migrate as published

Pros: database immediately mirrors current static public pages.
Cons: after publish, anon Data API can read those rows **before** owner CMS QA and **before** public routes switch**. Helper unused ≠ data hidden.

### Option B — migrate as draft first (recommended)

Pros: owner can review every row in existing CMS modules; anon policies hide `draft`; publication is a second controlled step; matches security-first workflow.
Cons: a later publish pass is required.

**Decision: Option B.**

```
REAL CONTENT LOAD → DRAFT
OWNER CMS REVIEW → PUBLISH
ANON DATA API CHECK → PER-DOMAIN ROUTE CUTOVER LAST
```

Exceptions:

- `site_settings` has no status. Load with `contact_form_enabled = false`.
- `credential:certification:google-ai` stays `draft` **and** `needs_verification = true`.
- Publications/engagements/media are not in the first load.

Do not combine load and publish.

## 20. Sort-order strategy

Use tens so later inserts can land between rows. Restart at 10 inside each parent (sections, items) and inside each credential `kind` group.

| Domain | Rule |
|---|---|
| projects | 10, 20, 30 in current static array order (featured first) |
| project_sections | 10…70 within `project:privai-guard` in current section order |
| experiences | 10…80 in current array order (newest primary first; leadership last) |
| experience_items | 10, 20, … within each parent, source array order |
| credentials | 10, 20, … within each `kind`, source array order |
| focus_pages | 10 cyber, 20 privacy |
| publications (later) | 10 |

Do not copy raw `0` indexes from the PrivAI SQL artifact.

## 21. Expected record counts

### Full mapped inventory (including deferred scionetrade)

| Table | Count | Notes |
|---|---|---|
| `site_profile` | 1 | |
| `site_settings` | 1 | |
| `projects` | 3 | |
| `project_sections` | 7 | PrivAI Guard only |
| `experiences` | 8 | 7 Wave 1 + 1 deferred scionetrade |
| `experience_items` | 27 | 26 Wave 1 + 1 deferred scionetrade child. Source-verified: DTSLC has exactly 1 child. |
| `credentials` | 10 | degree 3 / certification 3 / training 3 / license 1 |
| `focus_pages` | 2 | |
| `media_assets` | 0 | deferred until Storage |
| `publications` | 1 mapped, 0 Wave 1 | deferred until CMS |
| `engagements` | 0 | not migrated |

### Approved Wave-1 insert counts (Step 39 freeze)

Source-verified from `src/content/` after DQ-01 / DQ-03 and excluding DQ-02.

| Table | Count |
|---|---|
| `site_profile` | 1 |
| `site_settings` | 1 |
| `projects` | 3 |
| `project_sections` | 7 |
| `experiences` | 7 |
| `experience_items` | 26 |
| `credentials` | 10 |
| `focus_pages` | 2 |
| `media_assets` | 0 |
| `publications` | 0 |
| `engagements` | 0 |
| **Total Wave-1 rows** | **57** |

`scionetrade` is deferred from Wave 1. It is **not** a Wave-1 blocker. Publications remain deferred. Engagements are not migrated. Media remains deferred. Inquiries, `inquiry_submission_events`, and `user_roles` are untouched. `contact_form_enabled` remains `false`. Public routes remain static during this step.

### Never receive real-content rows

| Table | Reason |
|---|---|
| `inquiries` | Inbox; no content migration |
| `inquiry_submission_events` | Rate-limit hashes only |
| `user_roles` | Owner/security roster; not portfolio content |

Do not count the existing owner role as a portfolio record.

## 22. Data-quality findings

| ID | Severity | Domain | Issue | Disposition |
|---|---|---|---|---|
| DQ-01 | RESOLVED | experiences | Month/year labels need a day for `date` columns. | First day of the stated month. Storage convention only; public UI keeps month/year. |
| DQ-02 | DEFERRED (not a Wave-1 blocker) | `experience:scionetrade` | Year-only `2018`–`2020`. | Entire parent and its 1 child excluded from Wave 1. Do not invent months. |
| DQ-03 | RESOLVED | `experience:dtslc` | Year-only labels; authoritative period January–December 2026. | `2026-01-01` / `2026-12-01`. Source has exactly 1 child item. |
| DQ-04 | LOW | credentials | JD, BSBA, CIPM, CC, most training, PH law have no `year_label`. | Accept `NULL`. Do not invent years. |
| DQ-05 | INFO | credentials | `google-ai` is `verification: pending`. | Load `needs_verification = true`, `draft`. Hold from publish. |
| DQ-06 | LOW | projects | DBNMS/NPCRS `stack` empty; launch dates only inside `summary`. | Accept empty stack. Do not add a launch-date column. |
| DQ-07 | INFO | publications | No static slug; no `published_on`; no CMS. | Remain deferred. Not in Wave 1. |
| DQ-08 | INFO | engagements | No event-level source. | Do not create rows. |
| DQ-09 | INFO | media | No Storage objects; resumes explicitly unposted. | Zero media rows; `resume_media_id` NULL. |
| DQ-10 | INFO | site_profile | `location_display` and `hero_cta_primary_label` have no source. | Leave NULL. |
| DQ-11 | INFO | site_profile | `shortName` / `initials` / `linkedinLabel` have no columns. | Keep static/derived. |
| DQ-12 | LOW | experiences | Parent `tracks` and project `tracks` have no parent column. | Rely on child `track` + later render rules. |
| DQ-13 | INFO | PrivAI SQL | Artifact would insert **published** rows with different sort orders and only one project. | Do not execute. Wave-1 file `portfolio_wave1_draft.sql` supersedes it operationally. |
| DQ-14 | INFO | robots | `site_indexable` is unused by `robots.ts`. | Store `true`; do not treat load as SEO cutover. |
| DQ-15 | INFO | About | Long narrative has no table. | Remain static. Do not duplicate into profile summary. |

Wave 1 is not blocked. The only remaining content deferral inside experience is scionetrade (DQ-02).

## 23. First-wave readiness matrix

| Domain | Classification | Blocking dependency | Recommended action |
|---|---|---|---|
| Site Profile | READY FOR FIRST CONTENT LOAD | none | Insert one draft singleton |
| Site Settings | READY FOR FIRST CONTENT LOAD | none | Insert intake-disabled singleton (`contact_form_enabled = false`) |
| Projects | READY FOR FIRST CONTENT LOAD | none | Insert 3 drafts |
| Project Sections | READY FOR FIRST CONTENT LOAD | parent projects | Insert 7 drafts under PrivAI Guard |
| Experience (7 Wave-1 parents) | READY FOR FIRST CONTENT LOAD | DQ-01 and DQ-03 resolved | Insert 7 drafts including DTSLC |
| Experience (scionetrade) | DEFER | DQ-02 | Exclude parent and child. Not a Wave-1 blocker. |
| Experience Items (26) | READY FOR FIRST CONTENT LOAD | Wave-1 parents | Insert 26 drafts (source-verified DTSLC child count = 1) |
| Credentials | READY FOR FIRST CONTENT LOAD | none | Insert 10 drafts; hold Google AI verification |
| Focus Pages | READY FOR FIRST CONTENT LOAD | none | Insert 2 drafts; `resume_media_id` NULL |
| Media | DEFER UNTIL STORAGE | buckets/objects/policies | No rows |
| Publications | DEFER UNTIL CMS/OPERATIONAL SUPPORT | no CMS | Do not load in Wave 1 |
| Engagements | DO NOT MIGRATE | no event source | Keep About static |
| Inquiries / events / roles | DO NOT MIGRATE | operational | Untouched |

## 24. Dependency graph

```
site_profile                 (independent singleton)
site_settings                (independent singleton)
credentials                  (independent)
publications                 (independent; deferred)
engagements                  (none)
media_assets                 (deferred)
        └── optional focus_pages.resume_media_id

projects
        └── project_sections

experiences
        └── experience_items

focus_pages                  (independent if resume_media_id is NULL)
```

## 25. Proposed first-load order

Do **not** execute in this step.

1. `site_profile` draft (`site-profile:default`)
2. `site_settings` with `contact_form_enabled = false`, `site_indexable = true`
3. `projects` drafts (`privai-guard`, `dbnms`, `npcrs`)
4. `project_sections` drafts for `project:privai-guard`
5. `experiences` drafts for the seven Wave-1 parents (six DQ-01 + DTSLC)
6. `experience_items` drafts for those seven parents (26 items)
7. `credentials` drafts (Google AI verification-held)
8. `focus_pages` drafts with `resume_media_id = NULL`

Deferred separately: media, publications, engagements, scionetrade. Public routes remain static. Inquiries, events, and `user_roles` stay untouched.

## 26. Recommended execution method

Compare:

| Option | Fit |
|---|---|
| A. Manual admin CMS only | Poor. 57 Wave-1 rows, parent/child IDs, easy drift from this manifest. |
| B. One controlled idempotent SQL/content script | Strong for reproducibility and audit. Matches how the (now superseded) PrivAI artifact was imagined — but draft, multi-domain, logical-key based. |
| C. Server-side app utility | Possible, but adds runtime/service-role surface for a one-time load. |
| D. Hybrid | **Recommended.** Script inserts **draft** rows from this manifest; owner reviews/edits/publishes only through existing CMS. |

**Recommendation: D (scripted draft load + CMS review/publish).**

Step 39 generated the opt-in artifacts `supabase/content/portfolio_wave1_draft.sql` and `supabase/content/portfolio_wave1_draft_rollback.sql`. They are **not** executed in this step. Do not use the service role in a browser. Do not execute `privai_guard_project.sql`.

## 27. Idempotency requirements

A future executor must:

1. Validate pre-state: content tables empty of these logical keys / slugs (currently all counts 0).
2. Insert only when the natural unique key is absent.
3. Never duplicate on rerun.
4. Fail (do not update-in-place) if an unexpected conflicting real row exists.
5. Avoid `DELETE FROM <table>` and avoid reset.
6. Preserve `user_roles` and never write `inquiries` / `inquiry_submission_events`.
7. Produce exact inserted-count evidence vs §21.

| Table | Conflict detector |
|---|---|
| `site_profile` / `site_settings` | `singleton_key = 'default'` |
| `projects` / `focus_pages` / `publications` | unique `slug` |
| `project_sections` | parent slug + heading + `sort_order` (no unique constraint — fail if parent already has unexpected children) |
| `experiences` | `organization` + `title` + `start_date` (no unique constraint — fail if any unexpected experience exists when expecting zero or the known set) |
| `experience_items` | parent match + `sort_order` + `body` |
| `credentials` | `kind` + `name` + `issuer` (no unique constraint — fail if unexpected credential rows exist) |

Because several child/credential tables lack a natural unique key, the first load should run only against the known empty hosted baseline, or against an explicit allow-list of already-inserted logical keys recorded by the executor. Do not implement a hidden provenance table in this step.

## 28. Rollback / cleanup requirements

If validation fails after a future load:

- Remove **only** migrated content identified by the logical keys / slugs in this manifest.
- Delete parents first only when CASCADE is intended: `projects` → sections; `experiences` → items.
- `focus_pages.resume_media_id` will be NULL; no media cleanup.
- Do not `DELETE FROM` whole tables.
- Do not reset the database.
- Do not delete `user_roles`, Auth users, inquiries, or events.
- Do not drop Storage (none should exist).
- Re-verify counts return to 0 for content tables.

No rollback is executed now.

## 29. Post-load validation plan

After a future insert, before any publish:

1. Exact row counts match the authorized wave in §21.
2. No duplicate slugs (`projects`, `focus_pages`).
3. Required fields populated; empty `stack` only where source is empty.
4. Every section parent is `project:privai-guard`; every item parent exists.
5. Credential `kind` counts: 3 / 3 / 3 / 1.
6. Approved dates match this manifest; scionetrade absent; DTSLC is `2026-01-01` / `2026-12-01`.
7. `sort_order` matches tens schedule.
8. All migrated `content_status` rows are `draft`.
9. `google-ai` has `needs_verification = true`.
10. `contact_form_enabled = false`; `site_settings` count 1; `site_profile` count 1.
11. `inquiries` = 0; `inquiry_submission_events` = 0; `user_roles` unchanged.
12. `media_assets` = 0; Storage still 0 buckets / 0 objects.
13. Anon SELECT of each content table returns 0 rows (draft + RLS).
14. Owner CMS list/detail can read and edit each first-wave domain.
15. Public pages still render from `src/content/`.

Do not execute this plan in Step 38.

## 30. Pre-publish reconciliation plan

For every first-wave domain, owner compares:

`STATIC SOURCE` vs `CMS RECORD` vs `DATABASE ROW`

Check wording, order, track, kind, dates, flags (`is_featured`, `is_metric`, `highlight`, `needs_verification`), and completeness.

Publish **per domain** only after that review. Do not publish all tables in one unreviewed burst unless a later step explicitly authorizes it.

`credential:certification:google-ai` stays unpublished until verification is cleared.

## 31. Future public cutover sequence

1. Load draft rows (later authorized step).
2. Owner CMS verification.
3. Controlled publication (still no route change).
4. Anonymous Data API verification (published rows only; media columns still restricted; children still require published parents).
5. Per-domain public helper verification (`getPublished*` still unused until this point).
6. One domain at a time, switch public routes off `src/content/`.
7. Regression (Home, About, Experience, Projects, Focus, Credentials, Contact).
8. Remove static source only much later, if desired.

Do not modify public routes in this step. Schema readiness ≠ content-cutover readiness.

## 32. Explicitly excluded data

- `user_roles` and any owner/admin roster facts
- `inquiries` and inquiry message content
- `inquiry_submission_events`
- Auth users, sessions, identities
- Secrets, service-role keys, rate-limit secrets
- Storage buckets, objects, policies, signed URLs
- `supabase/content/privai_guard_project.sql` execution
- Unpublished/internal settings
- Comprehensive CV / phone number (none in public source; do not add)
- Host names omitted from speaking copy
- Client names / consulting outcomes (explicitly not published)

## 33. Readiness decision

### Ready to create a controlled migration script?

**YES — generated in Step 39, not executed**

Wave-1 artifacts:

- `supabase/content/portfolio_wave1_draft.sql`
- `supabase/content/portfolio_wave1_draft_rollback.sql`

### Ready to execute real content migration?

**NO**

The SQL is reviewable only. Hosted and local databases must not be mutated until a later explicit authorization. Public routes remain static.

### Ready to publish migrated content?

**NO**

### Ready for broad public cutover?

**NO**

Public pages remain on `src/content/`. Helpers remain unused (except fail-closed contact settings). Storage and intake remain off. `contact_form_enabled` remains `false`.

## 34. Step 39 artifact status

Step 39 freeze:

1. DQ-01 resolved (first-of-month storage convention).
2. DQ-03 resolved (DTSLC January–December 2026). Source child count = 1.
3. DQ-02 deferred: scionetrade excluded from Wave 1; not a Wave-1 blocker.
4. Generated opt-in draft apply + rollback scripts. **Do not execute** until a later step authorizes hosted load.
5. Do not execute `privai_guard_project.sql`. The Wave-1 apply file supersedes it operationally.
6. Do not publish, cut over routes, create Storage, or enable intake.
