# Admin Guide

**Step:** 27 — Experience CMS

**Status:** Owner authentication plus Projects and Experience CMS. Other CMS types are not implemented.

This guide does not include passwords, user IDs, tokens, or other private identifiers.

---

## 1. Routes

| Route | Purpose |
|---|---|
| `/admin/login` | Owner sign-in. No registration. |
| `/admin` | Administration dashboard |
| `/admin/projects` | List all project statuses |
| `/admin/projects/new` | Create a project |
| `/admin/projects/[id]` | Edit a project and its sections |
| `/admin/experience` | List all experience statuses |
| `/admin/experience/new` | Create an experience record |
| `/admin/experience/[id]` | Edit an experience record and its items |

Search engines are instructed not to index `/admin` routes.

---

## 2. No public signup

There is no sign-up form, invite flow, or “create account” path.

The only authorized administrator for the MVP is the Auth user provisioned in the Supabase dashboard and granted `role = owner` in `public.user_roles` through a trusted SQL-editor action.

---

## 3. Owner authorization model

1. Sign in with email and password through Supabase Auth.
2. Admin routes validate the session with `getUser()`.
3. Routes and mutations call `public.is_admin()` over RPC. They do **not** query `public.user_roles`.
4. Content renders or writes only when `is_admin()` returns true.

| Visitor | `/admin`, `/admin/projects*`, `/admin/experience*` |
|---|---|
| Not signed in | Redirect to `/admin/login` |
| Signed in, not an admin | Access denied |
| Signed-in owner / admin | Dashboard, Projects CMS, or Experience CMS |

There is no role-management UI.

---

## 4. Projects CMS workflow

1. Open **Projects** from the dashboard.
2. Create a project or open an existing row.
3. Edit name, slug, tagline, year, role, summary, limits, stack, featured flag, and sort order.
4. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
5. Add, edit, reorder, or delete sections on the same project.
6. Delete a project from its edit page after confirmation. Sections cascade with the project row.

The schema has no project-level career track, external URL, or SEO title/description. Career-track tagging lives on each section (`all`, `cybersecurity_grc`, `privacy_ai`).

---

## 5. Experience CMS workflow

1. Open **Experience** from the dashboard.
2. Create a record or open an existing row.
3. Edit organization, title, secondary title, location display, kind, dates, current/featured flags, summary, and sort order.
4. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
5. Add, edit, reorder, or delete items on the same experience.
6. Delete an experience from its edit page after confirmation. Items cascade with the experience row.

Supported schema fields only. There is no company URL, logo, employment type, or experience-level career track. Track tagging lives on each item (`all`, `cybersecurity_grc`, `privacy_ai`). Metric items require `metric_context`.

---

## 6. Draft / publish behavior

| Status | Admin | Public adapter | Current public pages |
|---|---|---|---|
| `draft` | Visible | Hidden | Still served from `src/content/` |
| `published` | Visible | Eligible | Still served from `src/content/` |
| `archived` | Visible | Hidden | Still served from `src/content/` |

Public pages are **not** switched to Supabase in this step. After reviewed project content is applied, switch `/projects` and `/projects/privai-guard` to `getPublishedProjects()` / `getPublishedProjectBySlug()`. After reviewed experience content is loaded in a later step, switch `/experience` to `getPublishedExperiences()` / `getPublishedExperienceById()`.

---

## 7. Project sections

- Heading, body, track, status, and sort order
- Move up / move down (only among sections of that project)
- Delete requires an explicit confirmation
- A section update or delete is rejected unless the section’s `project_id` matches the project being edited

---

## 8. Experience items

- Body, track, status, sort order, `is_metric`, `metric_context`, and `show_on_home`
- Move up / move down (only among items of that experience)
- Delete requires an explicit confirmation
- An item update or delete is rejected unless the item’s `experience_id` matches the experience being edited
- Metric items must include `metric_context`

---

## 9. Logout

Use **Log out**. The session cookies are cleared and the browser returns to `/admin/login`.

---

## 10. Troubleshooting authentication

1. `.env.local` defines `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
2. The hosted project has `public.is_admin()` and the owner `user_roles` row.
3. Invalid credentials show a generic error.
4. Do not add a service-role key to this app.

---

## 11. Proposed content script

`supabase/content/privai_guard_project.sql` inserts the approved public PrivAI Guard project and seven sections if they are absent.

It is not a schema migration and is not run by `supabase db push`, `supabase start`, or `supabase db reset`. It has not been applied to hosted Supabase. Apply it only in a later explicitly authorized content step. It contains no private-source material.

---

## 12. Still out of scope

Publications, credentials, media/Storage, resume uploads, contact-form submission, messages inbox, site settings, registration, password reset, role management, public experience/project cutover, real employment-history load, and deploy.
