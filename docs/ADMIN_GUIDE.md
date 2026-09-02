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
| `/admin/projects/[id]` | Edit a project, its sections, and screenshot relationships |
| `/admin/experience` | List all experience statuses |
| `/admin/experience/new` | Create an experience record |
| `/admin/experience/[id]` | Edit an experience record and its items |
| `/admin/credentials` | List all credentials and edit Credentials page framing |
| `/admin/credentials/new` | Create a credential |
| `/admin/credentials/[id]` | Edit a credential |
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
| `/admin/home` | Edit the Home singleton, chips, proof strip, and featured evidence |
| `/admin/about` | Edit the About singleton, narrative, Education credential selection, and section framing |
| `/admin/journey` | List Professional Journey milestones |
| `/admin/journey/new` | Create a Journey milestone |
| `/admin/journey/[id]` | Edit a Journey milestone and attach media |
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
6. Attach, caption, reorder, publish/unpublish, or remove **screenshots** on the same project. Screenshots are existing `media_assets` with purpose `project`. Removing a relationship does not delete the media file.
7. Delete a project from its edit page after confirmation. Sections cascade with the project row. Screenshot relationships cascade; media files remain.

The schema has no project-level career track, external URL, or SEO title/description. Career-track tagging lives on each section (`all`, `cybersecurity_grc`, `privacy_ai`). Screenshot captions and display roles (`hero`, `workflow`, `gallery`) live on `project_media`, not on the binary.

### Managing Project screenshots

1. Ingest approved original screenshot binaries into `public-media` using the existing media pipeline (`project/{media_uuid}/{filename}`). Do not hotlink another deployment. Do not generate, redraw, or crop confidential information out of a screenshot.
2. Publish the `media_assets` row (`kind = image`, `purpose = project`, `is_public = true`) with descriptive title and alt text. Leave media-object captions/years blank unless they describe the file itself.
3. On the Project edit page, attach that media, set the **relationship caption**, display role, sort order, and publication status.
4. Public pages show a screenshot only when the Project, the relationship, and the media asset are all publicly eligible.
5. Safe screenshot requirements: synthetic/demo content only; no credentials, secrets, tokens, personal data, private emails, or real customer records. Preserve visible demo/synthetic notices.

Saves revalidate `/projects`, `/projects/[slug]`, Home, both Focus routes, and `/admin/projects`.

---

## 5. Experience CMS workflow

1. Open **Experience** from the dashboard.
2. Create a record or open an existing row.
3. Edit organization, title, secondary title, location display, kind, date precision, dates or years, current/featured flags, summary, and sort order.
4. Choose **Month and year** when month-level evidence exists. Choose **Year only** when the approved evidence is year-level. Year-only records store `start_year` / `end_year` and must not include a month or day. Scionetrade is the current year-only example: 2018–2020.
5. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
6. Add, edit, reorder, or delete items on the same experience. Values are item UUIDs. Home and Focus keep their own selected item relationships; editing bullet text does not drop those selections.
7. Delete an experience from its edit page after confirmation. Items cascade with the experience row. Home/Focus relationship rows that pointed at those items are also removed.

Supported schema fields only. There is no company URL, logo, employment type, or experience-level career track. Track tagging lives on each item (`all`, `cybersecurity_grc`, `privacy_ai`). Metric items require `metric_context`. Public `/experience` shows published parents and published `all`-track items. Saves revalidate `/experience`, `/`, both Focus routes, and `/admin/experience`.

---

## 6. Credentials CMS workflow

1. Open **Credentials** from the dashboard (`/admin/credentials`).
2. Edit page framing if needed: kicker, headline, lede, and Credentials-only SEO title/description. Section group labels stay in code.
3. Create a credential or open an existing row.
4. Edit official name, issuer, kind, public description, year label, career track, sort order, highlight, needs-verification, optional HTTPS verification URL, and optional expiration date.
5. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
6. Delete a credential from its edit page after confirmation. Home, Focus, and About relationships to that credential cascade away. The core record is not deleted when a relationship is removed.

Public eligibility is **published + not held for verification**. Admin labels:

- **Publicly eligible** — published and `needs_verification = false`
- **Held** — `needs_verification = true` (Google AI is Held · draft)
- **Draft / Archived** — not public

Held or draft credentials stay off `/credentials`, Home, Focus, and About even if a relationship still exists. Restoring eligibility shows them again without recreating UUIDs.

`year_label` is the display date. Do not invent completion, issue, or expiration dates. Leave verification URL blank unless an approved public HTTPS page exists. HTTP, `javascript:`, `data:`, and protocol-relative URLs are rejected. Expiration is informational and does not unpublish the record.

Do not store membership IDs, certification IDs, license numbers, or certificate serials.

`highlight` is an optional Credentials-page presentation flag. Home and Focus selections are separate UUID relationships and ignore highlight.

Kind-specific **Education**, **Certifications**, **Training**, and **Licenses** editors remain convenience views of the same `credentials` table. The unified Credentials editor can change kind.

Google AI must remain draft and `needs_verification = true` until separately verified and explicitly authorized.

Saves revalidate `/credentials`, `/`, `/about`, both Focus routes, and related admin pages.

---

## 7. Education CMS workflow

1. Open **Education** from the dashboard, or edit the same rows under **Credentials**.
2. Create a record or open an existing row. Kind is fixed to `degree`.
3. Edit name, issuer, year label, details, verification URL, expiration, career track, highlight, needs-verification, and sort order.
4. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
5. Delete an education record from its edit page after confirmation.

There is no education child table and no school URL, logo, GPA, honors, or start/end date columns.

---

## 8. Certifications CMS workflow

1. Open **Certifications** from the dashboard, or edit the same rows under **Credentials**.
2. Create a record or open an existing row. Kind is fixed to `certification`.
3. Edit name, issuer, year label, details, verification URL, expiration, career track, highlight, needs-verification, and sort order.
4. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
5. Delete a certification from its edit page after confirmation.

Do not store credential IDs or member numbers.

---

## 9. Training CMS workflow

1. Open **Training** from the dashboard, or edit the same rows under **Credentials**.
2. Create a record or open an existing row. Kind is fixed to `training`.
3. Edit name, issuer, year label, details, verification URL, expiration, career track, highlight, needs-verification, and sort order.
4. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
5. Delete a training record from its edit page after confirmation.

---

## 10. License CMS workflow

1. Open **Licenses** from the dashboard, or edit the same rows under **Credentials**.
2. Create a record or open an existing row. Kind is fixed to `license`.
3. Edit name, issuer, year label, details, verification URL, expiration, career track, highlight, needs-verification, and sort order.
4. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
5. Delete a license from its edit page after confirmation.

Do not store a license number. Philippine-law public copy must not imply U.S. bar admission.

---

## Skills / Focus CMS workflow

1. Open **Skills** from the dashboard (`/admin/skills`).
2. Create a focus page or open an existing row.
3. Edit nav label, slug, headline, summary, Home card summary/chips, featured project, featured writing, and sort order.
4. Select Experience evidence by organization, role, and bullet excerpt. Values are experience-item UUIDs. Reorder with the sort field. Duplicate items on the same Focus page are rejected.
5. Select credentials by name/issuer/year. Draft, archived, and `needs_verification` credentials (including Google AI) are disabled and cannot be saved as public Focus evidence.
6. Choose one featured Project and one featured Writing/publication by title. Unpublished related records stay selected in admin but are omitted from the public Focus page.
7. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
8. Add, edit, reorder, or delete competencies on the same focus page. Those actions do not overwrite evidence selections.
9. Delete a focus page from its edit page after confirmation. Relationship rows cascade with the Focus page. Core Experience, credential, project, and publication records are not deleted.

Public Focus, Home track cards, and temporary Resume track cards read published hosted Focus records. Changing a Focus summary updates the Focus page and Resume cards. Changing Home card summary/chips updates Home only. Resume media is not edited here; `resume_media_id` stays reserved for a later Resume step.

Saves revalidate `/focus/cybersecurity-grc`, `/focus/privacy-ai-governance`, `/`, `/resume`, and `/admin/skills`.

---

## 11. Settings CMS workflow

1. Open **Settings** from the dashboard.
2. Edit the Profile singleton (`site_profile`): display name, headline, summary, work authorization, optional location, LinkedIn URL, public email, and optional primary CTA label.
3. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
4. Edit Website flags (`site_settings`): contact form enabled and site indexable. Save flags. This table has no status column.
5. There is no `/new` route and no Delete. Each table allows at most one row (`singleton_key = 'default'`).

`public_email` is a public contact address, not the owner Auth email. `linkedin_url` must be `https:`. `site_settings` flags are anonymously readable by design and must never hold secrets. Published `site_profile` is the public authority for shared identity, headline, summary, email, and LinkedIn. Published `home_page` is the public authority for Home editorial content. Published `about_page` is the public authority for About editorial content. Work authorization may be saved blank and is not rendered when empty.

---

## 12. Home CMS workflow

1. Open **Home** from the dashboard (`/admin/home`).
2. Edit the Home singleton (`home_page`): headline, lede, CTA labels/URLs, featured-project overlay, section framing, closing CTA, and Home SEO title/description.
3. Reorder domain chips by label + sort order. Empty chip rows are ignored.
4. Edit proof-strip items (label, supporting text, optional URL). Relate an item to a credential or a project, not both.
5. Select featured Experience evidence by checking experience items. The visible label is organization, role, and bullet excerpt. Home stores the item UUID, so later bullet edits do not drop the selection.
6. Select featured Credentials by name/issuer. Draft or `needs_verification` credentials are not shown on the public Home even if selected.
7. Choose the featured Project by title. Core project facts stay on the project record; Home overlay copy is separate.
8. **Save as draft**, **Publish**, **Unpublish**, or **Archive**. Public Home renders only a published singleton. Unpublished related evidence is omitted, not replaced with old static copy.

Home track cards read hosted Focus card fields. `show_on_home` on experience items is not the Home selector.

---

## 13. About CMS workflow

1. Open **About** from the dashboard (`/admin/about`).
2. Edit the About singleton: kicker, headline, lede, narrative paragraphs, Journey/Education/Speaking/Boundaries headings, speaking body, and About SEO title/description.
3. Reorder paragraphs and list items with sort order. Empty rows are ignored.
4. **Save as draft**, **Publish**, **Unpublish**, or **Archive**. Public About renders only a published singleton.
5. Select Education credentials by name, issuer, and year. Values are credential UUIDs. Reorder with the sort field. Duplicates are rejected. Publishing About requires every selected Education credential to be publicly eligible (published and not held). Ineligible credentials can remain selected in a draft About page and are omitted from the public page.
6. Education facts stay on the credential record. About does not store a second name, issuer, year, or description.

---

## 14. Journey CMS workflow

1. Open **Journey** from the dashboard (`/admin/journey`).
2. Each row is a professional milestone: title, year, caption, optional media, sort order, and status.
3. Caption and year live on the milestone. Media is an optional presentation file selected by title.
4. Drafts may have no media. Publishing without an approved public image is blocked.
5. The Northwestern MSIS Graduation row is a **2026 draft with no media**. Do not publish it until an approved graduation photo is attached through Media, then explicitly publish the milestone.
6. Do not invent or reuse an unrelated image for graduation.

---

## 15. Media CMS workflow

1. Open **Media** from the dashboard.
2. Inspect existing `media_assets` metadata: title, alt text, kind, public flag, and status.
3. **Save as draft**, **Publish**, **Unpublish** (returns to draft), or **Archive**.
4. Public anonymous SELECT requires both `status = published` and `is_public = true`. Anon may read only public metadata columns (`id`, `kind`, `title`, `alt_text`, `is_public`, `status`), not `bucket_path` or timestamps.
5. Delete metadata after confirmation. Focus-page `resume_media_id` references are SET NULL. Storage objects are not deleted because Storage is not configured.

There is no `/new` route and no upload. `bucket_path` is owner-visible immutable storage identity and is not writable from the browser. Do not invent object paths.

---

## 16. Inquiries CMS workflow

1. Open **Inquiries** from the dashboard.
2. Review owner-only `inquiries` rows: received time, sender name/email, context, track, and a short message preview.
3. Open a row to read the full message. Sender fields are read-only.
4. **Mark as read** or **Mark as unread**. `read_at` is set on the server; the browser does not supply a timestamp.
5. Delete after confirmation. There is no archive or notes column.

There is no `/new` route. Owner CMS still cannot INSERT. Inquiry records are private administrative data and have no public content adapter.

Public `/contact` stays email, LinkedIn, and a disabled placeholder unless both `site_settings.contact_form_enabled` and server-only `CONTACT_INTAKE_ENABLED=true` are set and the intake secrets exist. Submissions go to `POST /api/contact`, then a server-only RPC. The Step 35 migration is not applied hosted, so current hosted intake stays off.

---

## 17. Draft / publish behavior

| Status | Admin | Public adapter | Current public pages |
|---|---|---|---|
| `draft` | Visible | Hidden | Still served from `src/content/` |
| `published` | Visible | Eligible | Still served from `src/content/` |
| `archived` | Visible | Hidden | Still served from `src/content/` |

Public pages are **not** switched to Supabase in this step. After reviewed project content is applied, switch `/projects` and `/projects/privai-guard` to `getPublishedProjects()` / `getPublishedProjectBySlug()`. After reviewed experience content is loaded in a later step, switch `/experience` to `getPublishedExperiences()` / `getPublishedExperienceById()`. After reviewed education content is loaded, switch the Education group on `/credentials` (and home highlights) to `getPublishedEducation()` / `getPublishedEducationById()`. After reviewed certification content is loaded, switch the Certifications group on `/credentials` to `getPublishedCertifications()` / `getPublishedCertificationById()`. After reviewed training content is loaded, switch the Training group on `/credentials` to `getPublishedTraining()` / `getPublishedTrainingById()`. After reviewed license content is loaded, switch the Licenses group on `/credentials` to `getPublishedLicenses()` / `getPublishedLicenseById()`. After reviewed focus-page content is loaded, switch Home, About, and focus routes to `getPublishedFocusPages()` / `getPublishedFocusPageBySlug()`. After a reviewed `site_profile` row is published, switch Home, About, header, and footer identity to `getPublishedSiteProfile()`. After a later cutover, switch robots/indexability and the contact-form flag to `getPublicSiteSettings()`. After reviewed public media metadata exists, switch resume/project media consumers to `getPublishedPublicMediaAssets()` / `getPublishedPublicMediaAssetById()`. Anonymous media SELECT also requires `is_public = true`.

---

## 18. Project sections

- Heading, body, track, status, and sort order
- Move up / move down (only among sections of that project)
- Delete requires an explicit confirmation
- A section update or delete is rejected unless the section’s `project_id` matches the project being edited

---

## 19. Experience items

- Body, track, status, sort order, `is_metric`, `metric_context`, and `show_on_home`
- Move up / move down (only among items of that experience)
- Delete requires an explicit confirmation
- An item update or delete is rejected unless the item’s `experience_id` matches the experience being edited
- Metric items must include `metric_context`

---

## 20. Focus-page competencies

- Plain text values on `focus_pages.competencies`
- Move up / move down (only within that page’s array)
- Delete requires an explicit confirmation
- A skill update or delete is scoped to the page UUID plus the array index
- There is no per-skill status, track enum, or child table

---

## 21. Logout

Use **Log out**. The session cookies are cleared and the browser returns to `/admin/login`.

---

## 22. Troubleshooting authentication

1. `.env.local` defines `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Public intake also requires server-only `CONTACT_INTAKE_ENABLED`, `CONTACT_RATE_LIMIT_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY` (never commit values).
2. The hosted project has `public.is_admin()` and the owner `user_roles` row.
3. Invalid credentials show a generic error.
4. Do not put `SUPABASE_SERVICE_ROLE_KEY`, `CONTACT_RATE_LIMIT_SECRET`, or `CONTACT_INTAKE_ENABLED` on a `NEXT_PUBLIC_` variable or in client code.

---

## 23. Proposed content script

`supabase/content/privai_guard_project.sql` inserts the approved public PrivAI Guard project and seven sections if they are absent.

It is not a schema migration and is not run by `supabase db push`, `supabase start`, or `supabase db reset`. It has not been applied to hosted Supabase. Apply it only in a later explicitly authorized content step. It contains no private-source material.

---

## 24. Still out of scope

Publications, Storage upload, resume uploads, CAPTCHA, email notifications, registration, password reset, role management, public project/experience/education/certification/training/license/skills/settings/media cutover, real employment, education-history, certification, training, license, skills, site-profile, media, or inquiry load, hosted intake activation, and deploy.
