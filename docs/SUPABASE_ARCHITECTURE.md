# Supabase Architecture

**Step:** 16 foundation + 18 hardening + 23 admin shell + 26 Projects CMS

**Status:** Hosted schema is applied. Public pages still render from `src/content/`. `/admin/projects` writes to Supabase through the authenticated server client and RLS.

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

The app never queries `user_roles` through the Data API.

---

## 2. Environment-variable contract

Required in `.env.local` (already present, gitignored):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Rules:

- Do not commit these files.
- Do not print, log, or copy the values.
- Do not add a service-role / secret key to the Next.js app.
- Optional later: `NEXT_PUBLIC_SITE_URL` for canonical URLs (already used by metadata).

A service-role key, if ever needed, belongs only in a locked-down server or Edge Function that is not this public app.

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
| project_media | `media_assets` (`kind`) | One media table |
| publications | `publications` | |
| credentials | `credentials` | |
| education | `credentials.kind = degree` | Same object type |
| leadership | `engagements` | Speaking, advisory, awards, leadership |
| skills | `focus_pages.competencies` | Text array; no skills table |
| resume_assets | `media_assets` (`kind = resume_pdf`, `is_public`) | |
| site_settings | `site_settings` | Public-only flags: contact form + indexability. Never secrets. |
| contact_messages | `inquiries` | Admin-only; no anon insert yet |

No table stores the comprehensive CV or private-source documents.

---

## 4. Tables

`user_roles`, `site_profile`, `site_settings`, `focus_pages`, `experiences`, `experience_items`, `projects`, `project_sections`, `publications`, `credentials`, `engagements`, `media_assets`, `inquiries`

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
- Generated types can replace the temporary boundary after review (see §9)

---

## 6. Future admin model

1. The owner Auth user and `user_roles` (`role = owner`) row already exist in the hosted project.
2. `/admin/login` uses password sign-in. `/admin` and `/admin/projects*` render only after `getUser()` and `is_admin()` succeed on the server.
3. Projects CMS writes go through Server Actions, the authenticated server client, `is_admin()`, and RLS. There is no service-role key.
4. Authenticated visitors who are not in `user_roles` can read published public content only and are denied the admin shell.
5. Public project pages stay on `src/content/` until the seed is applied. Then switch them to `src/lib/content/projects.ts`.
6. Future role management remains out of scope for the MVP.

See `docs/ADMIN_GUIDE.md`.

---

## 7. Future Storage model

`media_assets` holds metadata and a `bucket_path`. Buckets are **not** created in this step.

Planned later:

- `public-media` — published headshot, case-study images, public resume PDFs (`is_public = true`)
- Never upload `private-source/` files
- Storage RLS should match `media_assets`: public read only when `status = published` and `is_public = true`

---

## 8. Future contact-form security

`inquiries` exists with **no** anonymous INSERT grant and **no** INSERT policy.

A later phase should add an abuse-controlled path, for example:

- Next.js Server Action or Edge Function
- Rate limit, honeypot / Turnstile
- Server-side insert using a locked-down path (not a wide-open anon table grant)

Until then the public UI stays an inert form.

---

## 9. Generated database types

`src/lib/supabase/database.types.ts` is a **temporary** hand-written `Database` type aligned to this migration.

After the remote schema exists:

```bash
npx supabase gen types typescript --project-id <project-ref> --schema public > src/lib/supabase/database.types.ts
```

Do not embed the project ref or any keys in committed docs beyond this placeholder. Review the generated file before replacing the temporary boundary.
