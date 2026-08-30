# Initial Data Model

**Subject:** Rainier (Ram) Milanes portfolio CMS  
**Phase:** 1 — Discovery and portfolio strategy  
**Date:** 29 August 2026  
**Status:** Phase 1 approved with locked public-content decisions. Model notes updated. Not implemented. No database has been created. Phase 2 not started.

Goal: the owner can update copy, bullets, metrics, speaking items, and resume PDFs without a deploy, without storing private-source files, and without a general-purpose CMS that is harder to operate than the site itself.

---

## 1. Design principles

1. **Public content only.** The database is not a vault for the comprehensive CV, phone number, government internals, or the exhaustive CV speaking list.
2. **One identity, two tracks.** Tracks are tags and featured flags on shared records, not duplicated employee histories.
3. **Few tables.** Prefer a tagged `engagements` table over separate speaking/awards/leadership tables.
4. **Owner-only writes.** Supabase Auth for a single owner (and a backup owner later if needed). Public site uses the anonymous key for *reads of published rows only*.
5. **Draft vs published.** A `status` on each public object so unfinished edits never ship.
6. **No revision history system in v1.** Supabase backups + careful editing are enough.
7. **No headless page-builder.** Routes stay in Next.js. The CMS edits structured fields those routes already render.

---

## 2. Authentication and tenancy

| Piece | Proposal |
|---|---|
| Auth | Supabase Auth, email magic link or password, 1–2 users |
| Role | `owner` in `user_roles` or a single allowed `user_id` in `site_profile` |
| RLS | Public `SELECT` where `status = 'published'` (and `is_public = true` where needed). All other operations: authenticated owner only. |
| Inquiries | `SELECT/UPDATE/DELETE` owner only; `INSERT` via authenticated server action or Edge Function with rate limit — not wide-open anon insert if it can be abused. |

Do not store private-source documents in Supabase Storage.

---

## 3. Enumerations

Use Postgres enums or check constraints:

```text
content_status     = draft | published | archived
track_tag          = all | cybersecurity_grc | privacy_ai
experience_kind    = employment | consulting | additional | leadership
credential_kind    = degree | certification | training | license
engagement_kind    = speaking | advisory | award | leadership | teaching
inquiry_context    = recruiter | hiring_manager | other
inquiry_track      = cybersecurity_grc | privacy_ai | either
```

`track_tag` on child items means “show this bullet/card when the visitor is on that track.” `all` shows everywhere.

---

## 4. Tables

### 4.1 `site_profile` (singleton)

One row. Homepage and global chrome.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | Constant well-known id |
| display_name | text | e.g. Rainier (Ram) Milanes |
| headline | text | Unified, not track-specific |
| summary | text | 2–4 sentences |
| work_authorization | text | Locked: “Authorized to work in the U.S. without sponsorship.” |
| location_display | text nullable | Only if owner later wants a public location |
| linkedin_url | text | |
| public_email | text | Professional email (locked contact model). Do not store a phone field. |
| hero_cta_primary_label | text | |
| updated_at | timestamptz | |

Track-specific summaries live in `focus_pages`, not here.

**Do not add:** phone, legal name variants for KYC, street address, private notes, or a path to the comprehensive CV.

---

### 4.2 `focus_pages`

Two rows (cyber / privacy).

| Column | Type |
|---|---|
| id | uuid pk |
| slug | text unique | `cybersecurity-grc` / `privacy-ai-governance` |
| nav_label | text |
| headline | text |
| summary | text |
| competencies | text[] or jsonb | short chips |
| resume_media_id | uuid fk nullable | public PDF |
| status | content_status |
| sort_order | int |

Featured experience IDs and featured project IDs can be arrays of UUIDs on this row **or** expressed via `is_featured_on_focus` flags on those tables. Prefer flags on child rows to avoid sync bugs.

---

### 4.3 `experiences`

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| organization | text | |
| title | text | Locked public title only (see `PORTFOLIO_STRATEGY.md` §0). |
| title_secondary | text nullable | Use for NPC 2024–2026: “Designated Chief Information Technology Officer”. Do not collapse into `title`. |
| location_display | text | “Remote” / “Philippines” |
| kind | experience_kind | |
| start_date | date | |
| end_date | date nullable | null = present |
| is_current | bool | |
| summary | text nullable | one line |
| status | content_status | |
| sort_order | int | manual; do not infer from dates only (concurrent roles) |

No plantilla titles, salary grades, or confidential duty text.

---

### 4.4 `experience_items`

Bullets and optional metrics attached to an experience.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| experience_id | uuid fk | |
| body | text | |
| track | track_tag | default `all` |
| is_metric | bool | if true, treat as a statistic |
| metric_context | text nullable | required when `is_metric` — year, baseline, and unit; never a compressed or cross-year figure |
| sort_order | int | |
| status | content_status | |

Homepage “selected outcomes” can be `experience_items` (or `site_metrics` below) flagged `show_on_home`.

Add `show_on_home bool default false` to this table rather than creating a metrics table unless the owner wants standalone stats. **Lean choice:** add `show_on_home` here and skip a separate metrics table.

---

### 4.5 `projects`

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| slug | text unique | `privai-guard` |
| name | text | |
| tagline | text | |
| year_label | text | “2026” is enough |
| role | text | |
| summary | text | |
| stack | text[] | |
| limits | text | MVP / synthetic / human-review — required for PrivAI Guard |
| is_featured | bool | |
| status | content_status | |
| sort_order | int | |

---

### 4.6 `project_sections`

Case-study body, ordered.

| Column | Type |
|---|---|
| id | uuid pk |
| project_id | uuid fk |
| heading | text |
| body | text |
| track | track_tag |
| sort_order | int |
| status | content_status |

Home teaser can be `projects.summary` plus `limits`; no extra table.

---

### 4.7 `credentials`

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| kind | credential_kind | |
| name | text | |
| issuer | text | |
| year_label | text nullable | |
| details | text nullable | coursework; for the law-license row use locked phrase plus a non-U.S. limitation |
| needs_verification | bool | default false; true for Google AI Professional Certificate until production check |
| track | track_tag | CIPM → privacy; CC → cyber; degrees → all |
| highlight | bool | proof-chip candidates |
| sort_order | int | |
| status | content_status | |

Put the U.S. non-licensure sentence in `details` on the Philippine law-license row (and/or a site-wide legal note on `site_profile` later if needed).

---

### 4.8 `publications`

| Column | Type |
|---|---|
| id | uuid pk |
| slug | text unique |
| title | text |
| publisher | text |
| published_on | date nullable | Do not populate from the ambiguous CV `01/07/2025` date. |
| year_label | text | Locked public date for the NCSP paper: `2025` |
| abstract | text |
| external_url | text nullable |
| track | track_tag |
| status | content_status |
| sort_order | int |

Do not store the full publisher PDF unless republication rights are confirmed. Linking out is enough for v1.

---

### 4.9 `engagements`

Speaking, advisory, awards, student leadership, optional teaching.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| kind | engagement_kind | |
| title | text | award or talk title if known |
| host | text | organization |
| role_label | text | Speaker, Lecturer, Communications Head |
| year_label | text nullable | |
| body | text nullable | one line |
| track | track_tag | |
| status | content_status | draft until a named example is cleared; categories can be published without host names |
| sort_order | int | |

This replaces separate `awards`, `speaking`, and `leadership` tables.

---

### 4.10 `media_assets`

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| bucket_path | text | Supabase Storage path |
| kind | text | `resume_pdf` / `image` / `document` |
| title | text | |
| alt_text | text nullable | |
| status | content_status | |

Storage buckets:

- `public-media` — headshot, case-study images, public resume PDFs  
- Never: `private-source` uploads

---

### 4.11 `inquiries`

| Column | Type |
|---|---|
| id | uuid pk |
| name | text |
| email | text |
| organization | text nullable |
| context | inquiry_context |
| track | inquiry_track |
| message | text |
| created_at | timestamptz |
| read_at | timestamptz nullable |

Owner-only read. Retention: owner can delete from admin. No public listing.

---

### 4.12 `user_roles` (minimal)

| Column | Type |
|---|---|
| user_id | uuid pk fk auth.users |
| role | text | `owner` |

Skip if a hardcoded allow-list of auth user IDs is acceptable for a single operator.

---

## 5. What not to model in v1

| Omitted | Why |
|---|---|
| Page-builder blocks / rich layout JSON | Unnecessary; routes are known |
| Full CV import / source-document table | Privacy violation |
| Clients / testimonials | No source-supported clients |
| Tags taxonomy beyond `track_tag` | Overkill |
| Comments, newsletter, blog CMS | Out of scope |
| Multi-language | U.S. employer site, English only |
| Versioning / workflow / roles beyond owner | One editor |
| Analytics event warehouse | Use a simple analytics product later if needed |
| Job applications tracker | Not a portfolio need |

---

## 6. Relationships (logical)

```text
site_profile                          1 row
focus_pages                           2 rows ── resume_media_id → media_assets
experiences 1 ── * experience_items
projects    1 ── * project_sections
credentials
publications
engagements
media_assets
inquiries
user_roles
```

There is no `people` or `organizations` dimension table. Organization names are text on the row. This is a one-person site.

---

## 7. Read patterns for the Next.js app (later phase)

| Page | Reads |
|---|---|
| Home | `site_profile` + highlighted `credentials` + `show_on_home` items + featured `project` + top 3 `experiences` + latest `publication` |
| Focus | `focus_pages` by slug + `experience_items` where track in (that track, all) + featured project + weighted credentials |
| Experience | all published `experiences` + items (filter in UI) |
| Case study | `projects` + `project_sections` by slug |
| Admin | all statuses, inquiries |

Cache published reads (ISR or similar) in a later implementation phase. Not in scope now.

---

## 8. Suggested v1 seed (conceptual)

After owner decisions, seed only published-safe rows:

- 1 profile  
- 2 focus pages  
- 5–7 experiences  
- ~20 bullets  
- 1 project (PrivAI Guard) + ~8 sections  
- 6–10 credentials  
- 1 publication  
- A few category engagements; named hosts only if later chosen  
- 2 resume PDFs in storage (no phone; not the comprehensive CV)  

Do not seed the full CV speaking list. Do not seed a phone number.

---

## 9. Implementation sequence (for a later phase; not started)

1. Remaining verification items in `PHASE_1_REVIEW.md` (not a re-open of locked decisions)  
2. Static Next.js pages with typed local content (can precede Supabase) — **only after Phase 2 is authorized**  
3. Supabase project, schema, RLS, storage  
4. Admin CRUD for the tables above  
5. Swap page data source from local modules to Supabase  

Phase 1 documentation is updated. **Phase 2 has not started.** Product code has not been changed.
