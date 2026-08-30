# Admin Guide

**Step:** 35 — Secure Public Inquiry Intake

**Status:** Owner CMS through Inquiries plus a fail-closed public intake foundation. Hosted intake remains disabled.

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
| `/admin/education` | List education (credential `kind = degree`) |
| `/admin/education/new` | Create an education record |
| `/admin/education/[id]` | Edit an education record |
| `/admin/certifications` | List certifications (credential `kind = certification`) |
| `/admin/certifications/new` | Create a certification |
| `/admin/certifications/[id]` | Edit a certification |
| `/admin/training` | List training (credential `kind = training`) |
| `/admin/training/new` | Create a training record |
| `/admin/training/[id]` | Edit a training record |
| `/admin/licenses` | List licenses (credential `kind = license`) |
| `/admin/licenses/new` | Create a license |
| `/admin/licenses/[id]` | Edit a license |
| `/admin/skills` | List focus pages and their competency counts |
| `/admin/skills/new` | Create a focus page (empty competencies) |
| `/admin/skills/[id]` | Edit a focus page and its competencies |
| `/admin/settings` | Edit the `site_profile` and `site_settings` singletons |
| `/admin/media` | List existing media metadata |
| `/admin/media/[id]` | Edit existing media metadata |
| `/admin/inquiries` | List owner-only inquiry inbox rows |
| `/admin/inquiries/[id]` | Review an inquiry and mark read/unread |

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

| Visitor | `/admin`, `/admin/projects*`, `/admin/experience*`, `/admin/education*`, `/admin/certifications*`, `/admin/training*`, `/admin/licenses*`, `/admin/skills*`, `/admin/settings`, `/admin/media*`, `/admin/inquiries*` |
|---|---|
| Not signed in | Redirect to `/admin/login` |
| Signed in, not an admin | Access denied |
| Signed-in owner / admin | Dashboard, Projects, Experience, Education, Certifications, Training, Licenses, Skills, Settings, Media, or Inquiries CMS |

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

## 6. Education CMS workflow

1. Open **Education** from the dashboard.
2. Create a record or open an existing row.
3. Edit name, issuer, year label, details, career track, highlight, needs-verification, and sort order.
4. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
5. Delete an education record from its edit page after confirmation.

Education is stored in `public.credentials` with `kind` fixed to `degree`. Certification, training, and license rows are out of scope for this module. There is no education child table. The schema has no school URL, logo, GPA, honors, field-of-study, or start/end date columns.

---

## 7. Certifications CMS workflow

1. Open **Certifications** from the dashboard.
2. Create a record or open an existing row.
3. Edit name, issuer, year label, details, career track, highlight, needs-verification, and sort order.
4. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
5. Delete a certification from its edit page after confirmation.

Certifications are stored in `public.credentials` with `kind` fixed to `certification`. Degree, training, and license rows are out of scope for this module. There is no certification child table. The schema has no credential URL, verification URL, credential ID, expiration, issue date, logo, or file attachment.

A published certification with `needs_verification = true` remains hidden from anonymous public SELECT. The owner can toggle that flag in this CMS.

---

## 8. Training CMS workflow

1. Open **Training** from the dashboard.
2. Create a record or open an existing row.
3. Edit name, issuer, year label, details, career track, highlight, needs-verification, and sort order.
4. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
5. Delete a training record from its edit page after confirmation.

Training is stored in `public.credentials` with `kind` fixed to `training`. Degree, certification, and license rows are out of scope for this module. There is no training child table. The schema has no training URL, credential ID, expiration, issue date, logo, or file attachment.

A published training row with `needs_verification = true` remains hidden from anonymous public SELECT. The owner can toggle that flag in this CMS.

---

## 9. License CMS workflow

1. Open **Licenses** from the dashboard.
2. Create a record or open an existing row.
3. Edit name, issuer, year label, details, career track, highlight, needs-verification, and sort order.
4. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
5. Delete a license from its edit page after confirmation.

Licenses are stored in `public.credentials` with `kind` fixed to `license`. Degree, certification, and training rows are out of scope for this module. There is no license child table. The schema has no license number, license state, verification URL, expiration, issue date, logo, or file attachment.

A published license with `needs_verification = true` remains hidden from anonymous public SELECT. The owner can toggle that flag in this CMS.

---

## 10. Skills CMS workflow

1. Open **Skills** from the dashboard.
2. Create a focus page or open an existing row.
3. Edit nav label, slug, headline, summary, and sort order.
4. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
5. Add, edit, reorder, or delete competencies on the same focus page.
6. Delete a focus page from its edit page after confirmation. The competencies array is stored on the same row and is removed with it.

Skills are stored as `public.focus_pages.competencies` (`text[]`). There is no skills table, category table, or per-skill status. The focus page is the career-track grouping. Resume media is not edited here. The schema has no featured, highlight, or show-on-home column on `focus_pages`.

Saving the focus page does not overwrite competencies. Skill add, edit, reorder, and delete are separate actions scoped to that page UUID plus the array index.

---

## 11. Settings CMS workflow

1. Open **Settings** from the dashboard.
2. Edit the Profile singleton (`site_profile`): display name, headline, summary, work authorization, optional location, LinkedIn URL, public email, and optional primary CTA label.
3. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
4. Edit Website flags (`site_settings`): contact form enabled and site indexable. Save flags. This table has no status column.
5. There is no `/new` route and no Delete. Each table allows at most one row (`singleton_key = 'default'`).

`public_email` is a public contact address, not the owner Auth email. `linkedin_url` must be `https:`. `site_settings` flags are anonymously readable by design and must never hold secrets. Public pages still use `src/content/` until a later cutover.

---

## 12. Media CMS workflow

1. Open **Media** from the dashboard.
2. Inspect existing `media_assets` metadata: title, alt text, kind, public flag, and status.
3. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
4. Public anonymous SELECT requires both `status = published` and `is_public = true`. Anon may read only public metadata columns (`id`, `kind`, `title`, `alt_text`, `is_public`, `status`), not `bucket_path` or timestamps.
5. Delete metadata after confirmation. Focus-page `resume_media_id` references are SET NULL. Storage objects are not deleted because Storage is not configured.

There is no `/new` route and no upload. `bucket_path` is owner-visible immutable storage identity and is not writable from the browser. Do not invent object paths.

---

## 13. Inquiries CMS workflow

1. Open **Inquiries** from the dashboard.
2. Review owner-only `inquiries` rows: received time, sender name/email, context, track, and a short message preview.
3. Open a row to read the full message. Sender fields are read-only.
4. **Mark as read** or **Mark as unread**. `read_at` is set on the server; the browser does not supply a timestamp.
5. Delete after confirmation. There is no archive or notes column.

There is no `/new` route. Owner CMS still cannot INSERT. Inquiry records are private administrative data and have no public content adapter.

Public `/contact` stays email, LinkedIn, and a disabled placeholder unless both `site_settings.contact_form_enabled` and server-only `CONTACT_INTAKE_ENABLED=true` are set and the intake secrets exist. Submissions go to `POST /api/contact`, then a server-only RPC. The Step 35 migration is not applied hosted, so current hosted intake stays off.

---

## 14. Draft / publish behavior

| Status | Admin | Public adapter | Current public pages |
|---|---|---|---|
| `draft` | Visible | Hidden | Still served from `src/content/` |
| `published` | Visible | Eligible | Still served from `src/content/` |
| `archived` | Visible | Hidden | Still served from `src/content/` |

Public pages are **not** switched to Supabase in this step. After reviewed project content is applied, switch `/projects` and `/projects/privai-guard` to `getPublishedProjects()` / `getPublishedProjectBySlug()`. After reviewed experience content is loaded in a later step, switch `/experience` to `getPublishedExperiences()` / `getPublishedExperienceById()`. After reviewed education content is loaded, switch the Education group on `/credentials` (and home highlights) to `getPublishedEducation()` / `getPublishedEducationById()`. After reviewed certification content is loaded, switch the Certifications group on `/credentials` to `getPublishedCertifications()` / `getPublishedCertificationById()`. After reviewed training content is loaded, switch the Training group on `/credentials` to `getPublishedTraining()` / `getPublishedTrainingById()`. After reviewed license content is loaded, switch the Licenses group on `/credentials` to `getPublishedLicenses()` / `getPublishedLicenseById()`. After reviewed focus-page content is loaded, switch Home, About, and focus routes to `getPublishedFocusPages()` / `getPublishedFocusPageBySlug()`. After a reviewed `site_profile` row is published, switch Home, About, header, and footer identity to `getPublishedSiteProfile()`. After a later cutover, switch robots/indexability and the contact-form flag to `getPublicSiteSettings()`. After reviewed public media metadata exists, switch resume/project media consumers to `getPublishedPublicMediaAssets()` / `getPublishedPublicMediaAssetById()`. Anonymous media SELECT also requires `is_public = true`.

---

## 15. Project sections

- Heading, body, track, status, and sort order
- Move up / move down (only among sections of that project)
- Delete requires an explicit confirmation
- A section update or delete is rejected unless the section’s `project_id` matches the project being edited

---

## 16. Experience items

- Body, track, status, sort order, `is_metric`, `metric_context`, and `show_on_home`
- Move up / move down (only among items of that experience)
- Delete requires an explicit confirmation
- An item update or delete is rejected unless the item’s `experience_id` matches the experience being edited
- Metric items must include `metric_context`

---

## 17. Focus-page competencies

- Plain text values on `focus_pages.competencies`
- Move up / move down (only within that page’s array)
- Delete requires an explicit confirmation
- A skill update or delete is scoped to the page UUID plus the array index
- There is no per-skill status, track enum, or child table

---

## 18. Logout

Use **Log out**. The session cookies are cleared and the browser returns to `/admin/login`.

---

## 19. Troubleshooting authentication

1. `.env.local` defines `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Public intake also requires server-only `CONTACT_INTAKE_ENABLED`, `CONTACT_RATE_LIMIT_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY` (never commit values).
2. The hosted project has `public.is_admin()` and the owner `user_roles` row.
3. Invalid credentials show a generic error.
4. Do not put `SUPABASE_SERVICE_ROLE_KEY`, `CONTACT_RATE_LIMIT_SECRET`, or `CONTACT_INTAKE_ENABLED` on a `NEXT_PUBLIC_` variable or in client code.

---

## 20. Proposed content script

`supabase/content/privai_guard_project.sql` inserts the approved public PrivAI Guard project and seven sections if they are absent.

It is not a schema migration and is not run by `supabase db push`, `supabase start`, or `supabase db reset`. It has not been applied to hosted Supabase. Apply it only in a later explicitly authorized content step. It contains no private-source material.

---

## 21. Still out of scope

Publications, Storage upload, resume uploads, CAPTCHA, email notifications, registration, password reset, role management, public project/experience/education/certification/training/license/skills/settings/media cutover, real employment, education-history, certification, training, license, skills, site-profile, media, or inquiry load, hosted intake activation, and deploy.
