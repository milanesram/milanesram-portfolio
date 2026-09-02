# Supabase Architecture

**Step:** 16 foundation + 18 hardening + 23 admin shell + 26 Projects CMS + 27 Experience CMS + 28 Education CMS + 29 Certifications CMS + 30 Training + License CMS + 31 Skills CMS + 32 Settings CMS + 33 Media CMS + 34 Inquiries CMS + 35 public inquiry intake

**Status:** Hosted schema is applied. Public pages still render from `src/content/` except the `/contact` form-activation flag. Admin CMS writes use the authenticated server client and RLS. Public inquiry intake, when both gates are on, uses a server-only privileged client to call `submit_public_inquiry`. The Step 35 migration is local-only.

---

## 1. Client / server architecture

| Module | Runtime | Role |
|---|---|---|
| `src/lib/supabase/env.ts` | Shared | Reads public env names only. Throws if a required name is missing. Never logs values. |
| `src/lib/supabase/client.ts` | Browser | `createBrowserClient` from `@supabase/ssr` |
| `src/lib/supabase/server.ts` | Server Components / Route Handlers / Server Actions | Per-request `createServerClient` using Next.js `cookies()` |
| `src/lib/supabase/update-session.ts` | Proxy | Cookie-aware server client that refreshes the session |
| `src/proxy.ts` | Next.js 16 Proxy | Session refresh before render. Not `middleware.ts`. |

Next.js 16 deprecates the `middleware.ts` convention in favor of `src/proxy.ts` exporting `proxy`. Session refresh lives there so Server Components do not have to write cookies.

Admin authentication:

| Module | Role |
|---|---|
| `src/lib/admin/authorization.ts` | Server-side `getUser()` + `rpc('is_admin')` |
| `src/app/admin/actions.ts` | Sign-in / sign-out Server Actions |
| `src/app/admin/login/page.tsx` | Login form; redirects authorized owners to `/admin` |
| `src/app/admin/page.tsx` | Protected shell or access denied |
| `src/lib/admin/projects/` | Project validation and admin queries |
| `src/app/admin/projects/actions.ts` | Project and section Server Actions |
| `src/lib/content/projects.ts` | Public published-only reads (not wired to pages yet) |
| `src/lib/admin/experience/` | Experience validation and admin queries |
| `src/app/admin/experience/actions.ts` | Experience and item Server Actions |
| `src/lib/content/experiences.ts` | Public published-only reads (not wired to pages yet) |
| `src/lib/admin/education/` | Education validation and admin queries (`credentials.kind = degree`) |
| `src/app/admin/education/actions.ts` | Education Server Actions |
| `src/lib/content/education.ts` | Public published-only education reads (not wired to pages yet) |
| `src/lib/admin/certifications/` | Certification validation and admin queries (`credentials.kind = certification`) |
| `src/app/admin/certifications/actions.ts` | Certification Server Actions |
| `src/lib/content/certifications.ts` | Public published-only certification reads (not wired to pages yet) |
| `src/lib/admin/training/` | Training validation and admin queries (`credentials.kind = training`) |
| `src/app/admin/training/actions.ts` | Training Server Actions |
| `src/lib/content/training.ts` | Public published-only training reads (not wired to pages yet) |
| `src/lib/admin/licenses/` | License validation and admin queries (`credentials.kind = license`) |
| `src/app/admin/licenses/actions.ts` | License Server Actions |
| `src/lib/content/licenses.ts` | Public published-only license reads (not wired to pages yet) |
| `src/lib/admin/skills/` | Skills validation and admin queries (`focus_pages` + `competencies`) |
| `src/app/admin/skills/actions.ts` | Focus-page and competency Server Actions |
| `src/lib/content/skills.ts` | Public published-only focus-page reads (not wired to pages yet) |
| `src/lib/admin/settings/` | Settings validation and admin queries (`site_profile` + `site_settings` singletons) |
| `src/app/admin/settings/actions.ts` | Site profile and site settings Server Actions |
| `src/lib/content/profile.ts` | Public published-only site-profile reads (not wired to pages yet) |
| `src/lib/content/settings.ts` | Public site-settings flag reads (`contactFormEnabled` may gate `/contact` only) |
| `src/lib/admin/media/` | Media metadata validation and admin queries (`media_assets`) |
| `src/app/admin/media/actions.ts` | Media metadata Server Actions (no Storage mutations) |
| `src/lib/content/media.ts` | Public published+public media-metadata reads (not wired to pages yet) |
| `src/lib/admin/inquiries/` | Inquiry inbox validation and admin queries (`inquiries`) |
| `src/app/admin/inquiries/actions.ts` | Inquiry read-state and delete Server Actions (no INSERT) |
| `src/lib/supabase/privileged.ts` | Server-only service-role client for the intake RPC |
| `src/lib/contact/` | Intake config, HMAC tokens/hashes, validation, RPC helper |
| `src/app/api/contact/route.ts` | `POST /api/contact` public intake endpoint |

The app never queries `user_roles` through the Data API.

---

## 2. Environment-variable contract

Required in `.env.local` (already present, gitignored):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Rules:

- Do not commit these files.
- Do not print, log, or copy the values.
- Do not prefix `SUPABASE_SERVICE_ROLE_KEY`, `CONTACT_INTAKE_ENABLED`, or `CONTACT_RATE_LIMIT_SECRET` with `NEXT_PUBLIC_`.
- Optional later: `NEXT_PUBLIC_SITE_URL` for canonical URLs (already used by metadata).

`SUPABASE_SERVICE_ROLE_KEY` is server-only and is used only to execute `public.submit_public_inquiry`. It must never enter client components or the browser bundle.

---

## 3. Schema vs. the Step 16 noun list

The approved `docs/INITIAL_DATA_MODEL.md` is leaner than a one-table-per-noun list. This migration follows that model.

| Suggested noun | Implemented as | Why |
|---|---|---|
| admins | `user_roles` | Tied to `auth.users.id`; `owner` / `admin` |
| profile | `site_profile` | Singleton public chrome |
| career_tracks | `focus_pages` | Two employer pathways |
| experiences | `experiences` | Shared timeline |
| achievements | `experience_items` | Bullets and contextual metrics |
| projects | `projects` | |
| project_media | `project_media` → `media_assets` | Relationship table; binaries stay in `media_assets` |
| publications | `publications` | |
| credentials | `credentials` | |
| education | `credentials.kind = degree` | Same object type |
| certifications | `credentials.kind = certification` | Same object type |
| training | `credentials.kind = training` | Same object type |
| licenses | `credentials.kind = license` | Same object type |
| leadership | `engagements` | Speaking, advisory, awards, leadership |
| skills | `focus_pages.competencies` | Text array; no skills table |
| resume_assets | `media_assets` (`kind = resume_pdf`, `is_public`) | |
| site_settings | `site_settings` | Public-only flags: contact form + indexability. Never secrets. |
| contact_messages | `inquiries` | Admin-only table; public creation only via server RPC |

No table stores the comprehensive CV or private-source documents.

---

## 4. Tables

`user_roles`, `site_profile`, `site_settings`, `focus_pages`, `experiences`, `experience_items`, `projects`, `project_sections`, `project_media`, `publications`, `credentials`, `engagements`, `media_assets`, `inquiries`, `inquiry_submission_events`

`inquiry_submission_events` is Data-API private: hash-only rate-limit rows, no `anon` / `authenticated` grants, FORCE RLS, and no public policies. Retention is opportunistic deletion of events older than 24 hours inside `submit_public_inquiry`.

`user_roles` is Data-API private: no `anon` / `authenticated` table grants and no API-management RLS policy. `is_admin()` may still read it as `SECURITY DEFINER`. `EXECUTE` on `is_admin()` is granted to `authenticated` only (`PUBLIC` and `anon` remain revoked).

`site_settings` is **intentionally public-only** website configuration: `contact_form_enabled`, `site_indexable`, `singleton_key`, and timestamps. Its public SELECT policy is `USING (true)` only because every column is safe to expose. Never store secrets, administrator data, unpublished values, or security configuration in this table. If that invariant changes, restrict the policy before adding columns.

---

## 5. Migration strategy

- Versioned SQL: `supabase/migrations/20260830010000_initial_portfolio_schema.sql`
- Applied to the hosted project in an earlier step
- Explicit content script (not a migration, not auto-applied, not applied hosted): `supabase/content/privai_guard_project.sql`
- That script is insert-if-absent for the approved public PrivAI Guard project and seven sections
- Forward RLS correction (not applied hosted): `supabase/migrations/20260830030000_project_sections_select_parent_published.sql`
- That file only replaces `project_sections_select_published` so a section is public when both the section and its parent project are `published`
- Forward RLS correction (not applied hosted): `supabase/migrations/20260830040000_experience_items_select_parent_published.sql`
- That file only replaces `experience_items_select_published` so an item is public when both the item and its parent experience are `published`
- Forward intake foundation (not applied hosted): `supabase/migrations/20260830060000_secure_public_inquiry_intake.sql`
- Generated types can replace the temporary boundary after review (see §9)

---

## 6. Future admin model

1. The owner Auth user and `user_roles` (`role = owner`) row already exist in the hosted project.
2. `/admin/login` uses password sign-in. `/admin`, `/admin/projects*`, `/admin/experience*`, `/admin/education*`, `/admin/certifications*`, `/admin/training*`, `/admin/licenses*`, `/admin/skills*`, `/admin/settings`, `/admin/media*`, and `/admin/inquiries*` render only after `getUser()` and `is_admin()` succeed on the server.
3. Projects, Experience, Education, Certifications, Training, License, Skills, Settings, Media, and Inquiries CMS writes go through Server Actions, the authenticated server client, `is_admin()`, and RLS. Inquiry owner writes remain `read_at` or delete only; there is no owner INSERT action. Public inquiry creation uses a server-only service-role client to call `submit_public_inquiry` only.
4. Authenticated visitors who are not in `user_roles` can read published public content only and are denied the admin shell.
5. Public project, experience, education, certification, training, license, focus, identity, and media pages stay on `src/content/`. After reviewed content is applied, switch them to `src/lib/content/projects.ts`, `src/lib/content/experiences.ts`, `src/lib/content/education.ts`, `src/lib/content/certifications.ts`, `src/lib/content/training.ts`, `src/lib/content/licenses.ts`, `src/lib/content/skills.ts`, `src/lib/content/profile.ts`, `src/lib/content/settings.ts`, and `src/lib/content/media.ts`.
6. Future role management remains out of scope for the MVP.

See `docs/ADMIN_GUIDE.md`.

---

## 7. Future Storage model

`media_assets` holds metadata and a `bucket_path`. Buckets are **not** created. Step 33 is metadata and reference management only; Storage upload is deferred.

`bucket_path` is owner-visible internal Storage identity. RLS still limits anonymous rows to `status = published` AND `is_public = true`. Column privileges then limit `anon` to `id`, `kind`, `title`, `alt_text`, `is_public`, and `status`. Direct anonymous `bucket_path` SELECT is denied. Authenticated owner Media CMS retains table-level SELECT. `supabase/migrations/20260830050000_restrict_anon_media_asset_columns.sql` is local-only and has not been applied hosted.

Planned later:

- `public-media` — published headshot, case-study images, public resume PDFs (`is_public = true`)
- Never upload `private-source/` files
- Storage RLS should match `media_assets`: public read only when `status = published` and `is_public = true`

---

## 8. Public inquiry intake

`inquiries` still has **no** anonymous or authenticated INSERT grant and **no** INSERT policy. Step 34 owner inbox behavior is unchanged.

Step 35 adds `inquiry_submission_events` (hash-only, no Data API grants) and `submit_public_inquiry` (`SECURITY DEFINER`, `search_path = pg_catalog`). Application tables are schema-qualified. EXECUTE is granted only to `service_role`. Anon and authenticated cannot call it.

`POST /api/contact` independently enforces both activation keys and a 12,288-byte incremental body cap. The signed form token is bot friction, not one-time authentication; durable rate limits control replay.

`/contact` may show an active form only when `getPublicSiteSettings().contactFormEnabled` and `CONTACT_INTAKE_ENABLED=true` and the server-only secrets are present. Otherwise the existing disabled placeholder remains. Other public pages stay on `src/content/`. Hosted intake remains off until the local migration is applied and secrets are configured. CAPTCHA may be added later if abuse warrants it.

---

## 9. Generated database types

`src/lib/supabase/database.types.ts` is a **temporary** hand-written `Database` type aligned to this migration.

After the remote schema exists:

```bash
npx supabase gen types typescript --project-id <project-ref> --schema public > src/lib/supabase/database.types.ts
```

Do not embed the project ref or any keys in committed docs beyond this placeholder. Review the generated file before replacing the temporary boundary.
