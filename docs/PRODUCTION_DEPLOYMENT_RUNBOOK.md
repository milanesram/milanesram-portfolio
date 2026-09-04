# Production Deployment Runbook

**Status:** Prepared at Step 52I. This document does not perform a deployment.

**Next step:** Step 52J — Preview deployment + production smoke test.

Do not treat this file as authorization to push, deploy, or enable search indexing.

---

## 1. Environment contract

### Public / client-safe

| Name | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Hosted project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Publishable (anon) key only |
| `NEXT_PUBLIC_SITE_URL` | Production yes | Canonical origin used by metadata, sitemap, robots |

### Server-only

| Name | Required | Notes |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Only if contact intake is enabled | Never prefix `NEXT_PUBLIC_`. Used only for `submit_public_inquiry`. |
| `CONTACT_INTAKE_ENABLED` | Optional | Must stay unset/false for Version 1.0 |
| `CONTACT_RATE_LIMIT_SECRET` | Only with intake | Server-only HMAC secret |
| `INDEXNOW_KEY` | Optional | Server-only IndexNow verification key. Served at `/indexnow-key.txt` when set. Public CMS mutations notify IndexNow in source, but Production activation requires this key. Never `NEXT_PUBLIC_`. |

### Platform-provided

| Name | Notes |
|---|---|
| `VERCEL_ENV` | `production` / `preview` / `development` |
| `VERCEL_URL` | Used as a last-resort origin helper |

`.env*` files are gitignored. Do not commit secrets. Do not print values.

### Preview vs Production

- **Preview:** `VERCEL_ENV=preview` forces robots `Disallow: /` and metadata `robots.index = false`, regardless of hosted `site_settings.site_indexable`.
- **Production:** follows hosted `site_indexable` and per-page `page_seo.indexable`. Query failure does not noindex Production.
- Contact form remains unpublished until both the hosted flag and `CONTACT_INTAKE_ENABLED=true` plus server secrets exist.

---

## 2. Runtime contract

- Node.js 20.9+ (Next.js 16)
- Next.js `16.3.3`
- React 19
- Supabase JS / SSR clients from package.json
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`
- Types: `npx tsc --noEmit`
- Tests: `npm test`
- Server Actions body limit: 16 MB (media upload)

Vercel project should use the default Next.js build command and Node 20.

---

## 3. Pre-deploy Git checks

1. Branch is the intended deployment SHA.
2. Working tree is clean.
3. Quality gates passed on that SHA:
   - `git diff --check`
   - `npm run lint`
   - `npx tsc --noEmit`
   - `npm test`
   - `npm run build`
4. No `.env*` files staged.
5. Do not push until the owner explicitly starts Step 52J.

---

## 4. Migration parity

1. Compare local `supabase/migrations/` with hosted history:
   - `npx supabase@2.116.0 migration list --linked`
2. Pending must be none before a Production cutover.
3. Local Docker is not required. If unused: **Local DB application: NO**.
4. Apply hosted migrations only with the pinned CLI and after reviewing SQL.

Current residual-operations migration: `20260902030000_residual_content_operations.sql`.

---

## 5. Preview deployment procedure

Do this only in Step 52J.

1. Link the Vercel project to this repository.
2. Set Preview env vars: public Supabase URL/publishable key, `NEXT_PUBLIC_SITE_URL` if Preview should emit canonical URLs to the Preview origin.
3. Do **not** set `CONTACT_INTAKE_ENABLED=true`.
4. Create a Preview deployment. Do not promote it.
5. Confirm Preview HTML and `/robots.txt` are noindex / `Disallow: /`.
6. Smoke-test public and admin routes below.

---

## 6. Smoke test

Public:

- `/` `/about` `/focus/cybersecurity-grc` `/focus/privacy-ai-governance`
- `/experience` `/projects` `/projects/privai-guard`
- `/writing` plus one hosted-PDF detail and the NCSP link-only detail
- `/credentials` `/resume` `/contact`
- `/robots.txt` `/sitemap.xml` `/opengraph-image`

Admin, unauthenticated:

- `/admin` and module routes redirect to `/admin/login`

Admin, owner:

- Dashboard modules load
- Writing, Media upload, Resume, Contact, SEO reachable from nav

Content checks:

- Google AI unpublished
- Northwestern graduation unpublished
- Resume files not publicly downloadable
- Contact form unpublished
- Brand strings unchanged

---

## 7. Production deploy

Do this only after Preview smoke tests pass.

1. Confirm hosted `site_indexable` is the intended Production value.
2. Set Production env vars, including `NEXT_PUBLIC_SITE_URL` as the public origin.
3. Deploy the same Git SHA that passed Preview.
4. Re-run the smoke test against the Production origin.
5. Confirm Production robots match hosted indexability.
6. Confirm sitemap includes only intended public URLs.

---

## 8. Post-deploy verification

- Hosted migration list still has pending = none
- Public routes return 200
- Admin remains owner-protected
- Storage still exposes only published public objects
- No service-role or inquiry contents in public HTML

---

## 9. Rollback

- Vercel: restore the previous successful deployment SHA.
- Schema: do not write ad-hoc reverse SQL during an incident unless the owner has a reviewed down-migration. Prefer restoring the previous app SHA if the schema is already compatible.
- Content: restore from Supabase backups / point-in-time recovery if enabled on the project. Do not claim PITR unless the dashboard shows it is on.

---

## 10. Backup / recovery notes

- Git owns schema migrations and application source.
- Supabase platform backups own hosted row data if the plan has them enabled.
- `media_assets.bucket_path` maps to Storage object `{purpose}/{media_uuid}/{filename}` in `public-media`.
- Publication PDFs are frozen published works; recover binaries from Storage, not Git.
- There is no in-repo full CMS export script. A practical production backup is: confirm Supabase backups, export `media_assets` rows, and keep migration history.

---

## 11. Incident notes

- Contact intake stays fail-closed without both gates.
- Preview URLs must remain noindex.
- If a draft graduation or Google AI credential appears publicly, unpublish immediately in admin and verify RLS.
- If a Resume PDF becomes downloadable, set the track back to `request` and unpublish/private the media row.
