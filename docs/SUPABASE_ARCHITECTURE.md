# Supabase Architecture

**Step:** 16 foundation + 18 authorization hardening (local)  
**Status:** Local preparation only. The hosted project has not been migrated. No remote tables, buckets, or users were created.

This site currently renders from `src/content/`. The clients and schema below are the path to a later CMS. They are not wired to public pages yet.

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

No authentication UI is included in this step.

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
- **Not applied** to the hosted project in this step
- CREATE / ALTER ENABLE RLS / GRANT / REVOKE / POLICY / INDEX / FUNCTION / TRIGGER only
- No DROP, TRUNCATE, or DELETE
- After owner approval, apply with the Supabase CLI or SQL editor as a later step
- Then generate types (see §9)

---

## 6. Future admin model

1. Create the owner Auth user in the hosted project (later).
2. Insert one `user_roles` row (`role = owner`) via the SQL editor. This bootstrap cannot be done through the public Data API. `user_roles` has no `anon` / `authenticated` table grants and no API-management RLS policy.
3. Build `/admin` against the server client. Writes succeed only when `is_admin()` is true.
4. Authenticated visitors who are not in `user_roles` can read published content only.
5. Future role management is out of scope for the MVP and must be a separately designed owner-only mechanism (not Data API CRUD on `user_roles`).

No `/admin` routes exist yet.

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
