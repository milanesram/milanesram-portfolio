# Security

**Step:** 16 foundation + 18 authorization hardening (local)  
**Status:** Describes the intended hosted security model. The migration has not been applied remotely.

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

- Supabase Auth will identify users later (magic link or password).
- This step adds **no** sign-in UI and creates **no** users.
- Session cookies are refreshed in `src/proxy.ts` (Next.js 16 Proxy, not deprecated `middleware.ts`).
- Authorization decisions must use `getClaims()` / `getUser()`, not `getSession()` alone.

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

`user_roles` is **not** manageable through the public Data API. The first owner row must be inserted later in the SQL editor after an Auth user exists. There is no “first signup is admin” bootstrap. MVP role management through `anon` / `authenticated` grants is out of scope and would need a separately designed owner-only mechanism.

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

## 10. What this step does not do

- Apply SQL to the hosted project
- Create Auth users
- Create Storage buckets
- Build `/admin`
- Connect the contact form
- Deploy
- Request or store a service-role key
