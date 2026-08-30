# Admin Guide

**Step:** 23 — Owner authentication and protected admin shell  
**Status:** Authentication shell only. Content management is not implemented.

This guide does not include passwords, user IDs, tokens, or other private identifiers.

---

## 1. Routes

| Route | Purpose |
|---|---|
| `/admin/login` | Owner sign-in. No registration. |
| `/admin` | Protected administration shell |

Search engines are instructed not to index these routes (`robots.txt` and page-level `noindex`).

---

## 2. No public signup

There is no sign-up form, invite flow, or “create account” path in this application.

The only authorized administrator for the MVP is the Auth user that was provisioned in the Supabase dashboard and granted `role = owner` in `public.user_roles` through a trusted SQL-editor action.

---

## 3. Owner authorization model

1. The visitor signs in with email and password through Supabase Auth.
2. `/admin` validates the session on the server with `getUser()` (not `getSession()` alone).
3. The page calls `public.is_admin()` over RPC. It does **not** query `public.user_roles` through the Data API.
4. The shell renders only when `is_admin()` returns true.

| Visitor | `/admin` result |
|---|---|
| Not signed in | Redirect to `/admin/login` |
| Signed in, not an admin | Access denied (no CMS) |
| Signed-in owner / admin | Administration shell |

Signing in does not grant privileges by itself. Authorization is the `user_roles` row plus `is_admin()`.

There is no role-management UI.

---

## 4. Logout

Use **Log out** on the admin shell (or **Sign out** on the access-denied screen).

Sign-out clears the Supabase Auth session cookies and redirects to `/admin/login`. A later request to `/admin` must redirect to login again.

---

## 5. Troubleshooting authentication

Check these items without printing secrets:

1. `.env.local` defines `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
2. The hosted project has the initial schema, including `public.is_admin()`.
3. The owner Auth user exists and has exactly one `user_roles` row with `role = owner`.
4. Invalid credentials always show a generic error. That is intentional and does not confirm whether an email exists.
5. If sign-in succeeds but `/admin` shows access denied, the Auth user is missing an admin role row. Do not add that row through the public API.
6. If an already authorized owner opens `/admin/login`, they are redirected to `/admin`.
7. After logout, `/admin` must not render the shell.

Do not put a service-role key in the Next.js app to “fix” authorization.

---

## 6. Future CMS scope

Not in this phase:

- Profile, experience, project, publication, credential, media, resume, message, or settings editors
- File uploads or Storage
- Public-site content reads from Supabase
- Contact-form submission
- User registration, password reset, or role management

Those features must keep using server-side `is_admin()` checks and the existing RLS / grants model.
