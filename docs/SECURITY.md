# Security

**Step:** 16 foundation + 18 hardening + 23 admin shell + 26 Projects CMS + 27 Experience CMS + 28 Education CMS

**Status:** Hosted schema is applied. Admin sign-in and the Projects, Experience, and Education CMS use the authenticated server client and RLS. The Next.js app still does not use a service-role key.

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
- `site_settings`: public-only website flags (`contact_form_enabled`, `site_indexable`); `USING (true)` is valid only while this invariant holds. Never store secrets, administrator data, or unpublished/internal settings in this table.

Admin policies use `USING ((SELECT public.is_admin()))` and matching `WITH CHECK`.

`inquiries`:

- No INSERT policy
- Admin SELECT / UPDATE / DELETE only

Drafts, archived rows, private resume metadata, and the admin table are not visible to `anon`.

---

## 6. Grants strategy

The hosted project has **Automatically expose new tables: DISABLED**. RLS is not enough; privileges are explicit.

1. `REVOKE ALL` on every application table from `PUBLIC`, `anon`, and `authenticated`
2. `GRANT SELECT` on published-content tables to `anon` and `authenticated`
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

No buckets in this step. When added:

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

The explicit content script `supabase/content/privai_guard_project.sql` is not a migration, is not auto-applied, and has not been applied to hosted Supabase.

Forward RLS corrections (not applied hosted):

- `supabase/migrations/20260830030000_project_sections_select_parent_published.sql`
- `supabase/migrations/20260830040000_experience_items_select_parent_published.sql`

---

## 11. What remains out of scope

- Publications, remaining credential kinds, and other remaining CMS modules
- Storage / uploads
- Contact-form submission
- Switching public pages to Supabase before reviewed content is applied
- Loading real professional-experience or education content into Supabase
- User registration or password-reset UI
- Role-management UI
- Deploy
- Service-role / secret keys in this app
