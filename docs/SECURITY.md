# Security

**Step:** 16 foundation + 18 hardening + 23 admin shell + 26 Projects CMS + 27 Experience CMS + 28 Education CMS + 29 Certifications CMS + 30 Training + License CMS + 31 Skills CMS + 32 Settings CMS + 33 Media CMS + 34 Inquiries CMS

**Status:** Hosted schema is applied. Admin sign-in and the Projects, Experience, Education, Certifications, Training, License, Skills, Settings, Media, and Inquiries CMS use the authenticated server client and RLS. The Next.js app still does not use a service-role key.

---

## 1. Secrets and environment

| Name | Where | Public? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` | URL is public by design |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env.local` | Publishable / anon key; still do not commit |
| Service-role / secret key | **Not used** | Must not enter this Next.js app |

`.env*` is gitignored. Do not print, log, or copy values. The app validates that the two public names exist; it does not echo them.

---

## 2. Authentication model

- Supabase Auth password sign-in is used at `/admin/login`.
- There is **no** public signup, invite, or forgot-password UI.
- The MVP administrator is the manually provisioned owner Auth user.
- Login and logout are Next.js Server Actions (Origin-checked) and do not log credentials.
- Session cookies are refreshed in `src/proxy.ts` (Next.js 16 Proxy, not deprecated `middleware.ts`).
- Authorization decisions use `getUser()` plus `public.is_admin()`, not `getSession()` alone.
- `/admin` is enforced on the server. Hidden navigation or client-only checks are not sufficient.

---

## 3. Authorization model

Admin status is an explicit row in `public.user_roles`:

- `user_id` → `auth.users.id`
- `role` ∈ `owner` | `admin`

`public.is_admin()` returns true only when `auth.uid()` matches such a row.

| Actor | Portfolio content | `user_roles` | `inquiries` | Private media |
|---|---|---|---|---|
| `anon` | SELECT published only | none | none | none |
| Authenticated, not admin | SELECT published only | none | none | none |
| Admin (`is_admin()`) | full CRUD on CMS tables | none via Data API | SELECT / UPDATE / DELETE | full |

Signing in does **not** grant CMS rights.

`user_roles` is **not** manageable through the public Data API. The owner row was bootstrapped in the SQL editor. The admin app never queries `user_roles` directly; it calls `is_admin()`. There is no “first signup is admin” bootstrap and no role-management UI. MVP role changes remain an owner-only SQL-editor action.

---

## 4. `is_admin()` safety

The function is `SECURITY DEFINER` so RLS on `user_roles` does not hide the caller’s own admin row from the check.

Mitigations:

- `SET search_path = ''`
- Schema-qualified `public.user_roles`
- Subject is only `(SELECT auth.uid())`
- No dynamic SQL
- `EXECUTE` granted to `authenticated` only, so admin RLS policies can call it
- `EXECUTE` revoked from `PUBLIC` and not granted to `anon`

---

## 5. RLS strategy

RLS is **enabled and forced** on every application table.

Public / authenticated SELECT policies:

- `status = 'published'`
- `project_sections`: also the parent `projects` row must be `published`
- `experience_items`: also the parent `experiences` row must be `published`
- `credentials`: also `needs_verification = false`
- `media_assets`: also `is_public = true`
- `site_profile`: public SELECT when `status = 'published'`
- `site_settings`: public-only website flags (`contact_form_enabled`, `site_indexable`); `USING (true)` is valid only while this invariant holds. Never store secrets, administrator data, or unpublished/internal settings in this table.

Admin policies use `USING ((SELECT public.is_admin()))` and matching `WITH CHECK`.

`inquiries`:

- No INSERT grant to `anon` or `authenticated`
- No INSERT policy
- Admin SELECT / UPDATE / DELETE only via `is_admin()`
- No public SELECT policy
- Sender name, email, organization, and message are private administrative PII

Drafts, archived rows, private resume metadata, and the admin table are not visible to `anon`.

---

## 6. Grants strategy

The hosted project has **Automatically expose new tables: DISABLED**. RLS is not enough; privileges are explicit.

1. `REVOKE ALL` on every application table from `PUBLIC`, `anon`, and `authenticated`
2. `GRANT SELECT` on published-content tables to `anon` and `authenticated`. `media_assets` is the exception: `anon` has column-level SELECT only (`id`, `kind`, `title`, `alt_text`, `is_public`, `status`). `bucket_path`, `created_at`, and `updated_at` are not granted to `anon`. Authenticated table-level SELECT is unchanged so the owner Media CMS can still read Storage identity.
3. `GRANT INSERT, UPDATE, DELETE` on those CMS tables to `authenticated` (RLS still requires admin)
4. **No** table privilege on `user_roles` to `anon` or `authenticated`. RLS remains ENABLED and FORCED. `is_admin()` may still read the table as `SECURITY DEFINER`.
5. `GRANT SELECT, UPDATE, DELETE` on `inquiries` to `authenticated` (RLS: admin only)
6. **No** `INSERT` grant on `inquiries` to `anon` or `authenticated`

Table owners / dashboard roles retain their usual privileges.

---

## 7. Contact-form approach (later)

Do not open `inquiries` to unrestricted anonymous insert.

Later: Server Action or Edge Function, rate limiting, bot control, then a tightly scoped insert path. The public form remains inert until that work.

---

## 8. Storage (later)

No buckets exist. Step 33 manages `media_assets` metadata only and does not upload, replace, or delete Storage objects. `bucket_path` is owner-visible internal Storage identity and is not writable from the browser. Anonymous row eligibility remains `status = published` and `is_public = true`. That RLS predicate does not hide columns: `anon` is granted only the public metadata fields. Direct anonymous `bucket_path` SELECT is denied. When buckets are added:

- Do not upload `private-source/`
- Public read only for published + `is_public` objects
- Private resume files stay `is_public = false`

---

## 9. Data classification reminders

Aligned with `CONTENT_PRIVACY_CLASSIFICATION.md`:

- No phone column
- No comprehensive-CV table
- No client names
- Unpublished verification items stay `needs_verification = true` or `draft`

---

## 10. Admin routes

| Route | Rule |
|---|---|
| `/admin/login` | Password sign-in. Owners already signed in are redirected to `/admin`. |
| `/admin` | Unauthenticated visitors redirect to login. Authenticated non-admins see access denied. Owners see the shell. |
| `/admin/projects*` | Same authorization as `/admin`. Mutations re-check `is_admin()` on the server. |
| `/admin/experience*` | Same authorization as `/admin`. Mutations re-check `is_admin()` on the server. |
| `/admin/education*` | Same authorization as `/admin`. Mutations re-check `is_admin()` on the server. Education writes only `credentials` rows with `kind = degree`. |
| `/admin/certifications*` | Same authorization as `/admin`. Mutations re-check `is_admin()` on the server. Certification writes only `credentials` rows with `kind = certification`. |
| `/admin/training*` | Same authorization as `/admin`. Mutations re-check `is_admin()` on the server. Training writes only `credentials` rows with `kind = training`. |
| `/admin/licenses*` | Same authorization as `/admin`. Mutations re-check `is_admin()` on the server. License writes only `credentials` rows with `kind = license`. |
| `/admin/skills*` | Same authorization as `/admin`. Mutations re-check `is_admin()` on the server. Skills writes only `focus_pages` rows and their `competencies` array. |
| `/admin/settings` | Same authorization as `/admin`. Mutations re-check `is_admin()` on the server. Settings writes only the `site_profile` and `site_settings` singleton rows. |
| `/admin/media*` | Same authorization as `/admin`. Mutations re-check `is_admin()` on the server. Media writes only `media_assets` metadata and never Storage objects. |
| `/admin/inquiries*` | Same authorization as `/admin`. Mutations re-check `is_admin()` on the server. Inquiry writes only `read_at` or delete the row. Sender fields are not writable. |

Authorization is `getUser()` then `rpc('is_admin')`. Fail closed if the helper errors.

Projects mutations:

- Allowlist fields only (no mass assignment)
- Status and section track come from closed enums
- Slugs must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- IDs must be UUIDs
- Section writes require the section’s `project_id` to match the edited project
- Public adapter functions filter `status = 'published'` in addition to RLS
- After-save redirects use server-known UUIDs only

Experience mutations:

- Allowlist fields only (no mass assignment)
- Kind, item track, and status come from closed enums
- Dates must be valid `YYYY-MM-DD` values; end date cannot precede start date
- IDs must be UUIDs
- Item writes require the item’s `experience_id` to match the edited experience
- Metric items require `metric_context`
- Public adapter functions filter `status = 'published'` in addition to RLS
- After-save redirects use server-known UUIDs only

Education mutations:

- Allowlist fields only (no mass assignment)
- `kind` is server-fixed to `degree`
- Track and status come from closed enums
- IDs must be UUIDs
- Updates and deletes are scoped to `id` and `kind = degree`
- Public adapter functions filter `kind = degree`, `status = published`, and `needs_verification = false` in addition to RLS
- After-save redirects use server-known UUIDs only

Certification mutations:

- Allowlist fields only (no mass assignment)
- `kind` is server-fixed to `certification`
- Track and status come from closed enums
- IDs must be UUIDs
- Updates and deletes are scoped to `id` and `kind = certification`
- Public adapter functions filter `kind = certification`, `status = published`, and `needs_verification = false` in addition to RLS
- After-save redirects use server-known UUIDs only

Training mutations:

- Allowlist fields only (no mass assignment)
- `kind` is server-fixed to `training`
- Track and status come from closed enums
- IDs must be UUIDs
- Updates and deletes are scoped to `id` and `kind = training`
- Public adapter functions filter `kind = training`, `status = published`, and `needs_verification = false` in addition to RLS
- After-save redirects use server-known UUIDs only

License mutations:

- Allowlist fields only (no mass assignment)
- `kind` is server-fixed to `license`
- Track and status come from closed enums
- IDs must be UUIDs
- Updates and deletes are scoped to `id` and `kind = license`
- Public adapter functions filter `kind = license`, `status = published`, and `needs_verification = false` in addition to RLS
- After-save redirects use server-known UUIDs only

Skills mutations:

- Allowlist fields only (no mass assignment)
- Status comes from closed intents (`draft`, `publish`, `unpublish`, `archive`, `keep`)
- Slugs must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- IDs must be UUIDs
- Focus-page updates do not write `competencies` or `resume_media_id`
- Competency add, edit, reorder, and delete pre-read the page by UUID and rewrite only that row’s array
- Public adapter functions filter `status = published` in addition to RLS
- After-save redirects use server-known UUIDs only

Settings mutations:

- Allowlist fields only (no mass assignment; `singleton_key` is server-fixed to `default`)
- Profile status comes from closed intents (`draft`, `publish`, `unpublish`, `archive`, `keep`)
- `site_settings` has no status column; only the two public flags are writable
- `linkedin_url` must parse as an `https:` URL; `javascript:` and other schemes are rejected
- `public_email` is format-validated as a public contact address, not the owner Auth email
- There is no Delete and no `/new` route; missing rows are inserted once as the singleton
- Public adapters return published profile fields only, or the two public flags; they omit Auth email and `user_roles`
- Public pages still render from `src/content/`

Media mutations:

- Allowlist fields only (no mass assignment; `bucket_path` is never accepted from the browser)
- Kind is a closed enum (`resume_pdf`, `image`, `document`)
- Status comes from closed intents (`draft`, `publish`, `unpublish`, `archive`, `keep`)
- Anonymous row eligibility remains `status = published` and `is_public = true`
- Anonymous column privileges are only `id`, `kind`, `title`, `alt_text`, `is_public`, and `status`
- Direct anonymous `bucket_path` access is denied. Public adapters also omit `bucket_path` and timestamps
- Delete removes metadata only. `focus_pages.resume_media_id` is ON DELETE SET NULL. Storage objects are not deleted
- There is no `/new` route and no upload

Inquiry mutations:

- Allowlist fields only (`read_at`). Sender name, email, organization, context, track, and message are immutable
- Read/unread intents are closed (`read`, `unread`). `read_at` is server-generated
- No public inquiry helper. Inquiry records are private administrative data
- Anonymous INSERT remains disabled. There is no public submission Server Action
- Delete requires confirmation, UUID, and a pre-read. There is no archive column
- URLs use inquiry UUIDs only. Sender email and message are not placed in query strings

The explicit content script `supabase/content/privai_guard_project.sql` is not a migration, is not auto-applied, and has not been applied to hosted Supabase.

Forward corrections (not applied hosted):

- `supabase/migrations/20260830030000_project_sections_select_parent_published.sql`
- `supabase/migrations/20260830040000_experience_items_select_parent_published.sql`
- `supabase/migrations/20260830050000_restrict_anon_media_asset_columns.sql`

---

## 11. What remains out of scope

- Publications and other remaining CMS modules
- Storage / uploads
- Public contact-form submission / anonymous inquiry INSERT
- Switching public pages to Supabase before reviewed content is applied
- Loading real professional-experience, education, certification, training, license, skills, site-profile, media, or inquiry content into Supabase
- User registration or password-reset UI
- Role-management UI
- Deploy
- Service-role / secret keys in this app
