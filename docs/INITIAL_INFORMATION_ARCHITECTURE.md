# Initial Information Architecture

**Subject:** Rainier (Ram) Milanes public portfolio  
**Phase:** 1 — Discovery and portfolio strategy  
**Date:** 29 August 2026  
**Status:** Phase 1 approved with locked public-content decisions. IA updated to match. No routes or UI have been implemented. Phase 2 not started.

This IA assumes a single Next.js site, one professional identity, and two employer-facing pathways. Content is filtered and reordered by track; it is not duplicated as two biographies.

---

## 1. Navigation

### Primary navigation (always visible)

| Label | Route | Purpose |
|---|---|---|
| About | `/about` | Narrative and judgment |
| Experience | `/experience` | Recruiter timeline |
| Work | `/work` | Projects index |
| Writing | `/writing` | Publications |
| Credentials | `/credentials` | Degrees, certs, license disclaimer |
| Contact | `/contact` | Primary inbound |

Optional primary item if the bar has room: **Resume** → `/resume`. If not, place Resume in the header utility cluster and footer.

### Header utility cluster (right side, small)

- Work authorization chip (short, not dominant): “Authorized to work in the U.S. without sponsorship”
- LinkedIn (icon)
- Resume
- Contact (button)

### Secondary navigation / footer

| Label | Route |
|---|---|
| Cybersecurity, GRC & IT Risk | `/focus/cybersecurity-grc` |
| Privacy & AI Governance | `/focus/privacy-ai-governance` |
| Leadership & Speaking | `/leadership` |
| Resume | `/resume` |
| Privacy Policy | `/privacy` |
| LinkedIn | External |

### Not in public navigation

| Surface | Route | Notes |
|---|---|---|
| Home | `/` | Logo / name mark only |
| PrivAI Guard case study | `/work/privai-guard` | Linked from Home, Work, Focus pages |
| Admin CMS | `/admin/*` | Owner-only; no public link; noindex |

### Mobile

- Hamburger or sheet containing primary nav
- Persistent Contact + Resume actions
- Focus pathways available from Home and footer; not required in the compact top bar

### Naming notes

- Use **Work** rather than “Projects” in the main nav if it feels more executive; page H1 can still say “Selected work.”
- Do not use “Legal,” “Law,” or “CV” as nav labels. The comprehensive CV is never a nav target.
- Do not expose `/admin`.

---

## 2. Page hierarchy

```text
/
├── /about
├── /experience
├── /work
│   └── /work/privai-guard
│   └── /work/[slug]                  # future public-safe project cards (e.g. dbnms, npcrs)
├── /writing
│   └── /writing/[slug]               # optional long abstract; default can be a single-page list
├── /credentials
├── /leadership
├── /resume
├── /contact
├── /focus/cybersecurity-grc
├── /focus/privacy-ai-governance
├── /privacy
└── /admin                            # owner-only
    ├── /admin                        # dashboard
    ├── /admin/profile
    ├── /admin/experience
    ├── /admin/projects
    ├── /admin/writing
    ├── /admin/credentials
    ├── /admin/engagements
    ├── /admin/media
    └── /admin/inquiries
```

### Hierarchy rules

- Focus pages are **landing pages**, not a second site.
- Case studies live under Work, not under Focus, so both tracks share one canonical URL.
- Experience is a single timeline. Focus pages feature a subset of bullets and proof, then link to `/experience`.
- Admin mirrors public objects; it does not add a public “CV dump” page.

---

## 3. Homepage content order

Designed for a 60–90 second recruiter pass. Every block should map to CMS fields later.

1. **Utility / trust strip**  
   Locked work-authorization fact (concise; not the hero). LinkedIn. Optional location line only if the owner later chooses a U.S. display city (not in current sources).

2. **Hero**  
   Name. One unified headline covering cybersecurity, GRC, privacy, and AI governance. Two-sentence value proposition. **Do not** lead the hero with work authorization. Two equal CTAs:  
   - Cybersecurity / GRC / IT Risk  
   - Privacy / AI Governance  
   Secondary CTA: Contact. Tertiary: Download resume (goes to `/resume` or a chooser).

3. **Proof chips**  
   Master of Science in Information Systems, Security Specialization · CIPM · CC · National Privacy Commission · PrivAI Guard  
   Do not put “Attorney” here.

4. **Selected outcomes (maximum three)**  
   Only clearly source-supported metrics in exact contextual form (period, baseline, unit). Do not use compressed resume wording or combine years/baselines. If Home selection is not yet chosen, use three qualitative proof points (e.g., launched DBNMS, launched NPCRS, shipped PrivAI Guard MVP).

5. **Featured work: PrivAI Guard**  
   One paragraph + three control bullets + visible MVP/synthetic-data/human-review limit + link to case study.

6. **Experience snapshot**  
   Three entries only:  
   - RAM Privacy & Security, Principal Consultant (Present)  
   - National Privacy Commission, Innovation and Transformation Consultant / Designated Chief Information Technology Officer  
   - National Privacy Commission, Chief, Compliance and Monitoring Division  
   Link: Full experience.

7. **Two-track doors (repeat, more explanatory)**  
   Short paragraph each; same destinations as hero CTAs. Makes the dual pathway obvious if the hero was skipped.

8. **Writing teaser**  
   NCSP 2023–2028 localization paper; publisher; year; link.

9. **Close / contact**  
   One sentence ask. Contact button (form). Professional email. LinkedIn. Resume button. No phone number. No comprehensive CV download.

### Homepage must not include

- Full speaking host list
- Early-career or law-clinic roles
- Comprehensive CV download
- Unresolved titles or unapproved statistics
- Stock Next.js marketing content (current app default)

---

## 4. Recruiter pathways

### Pathway 0 — Unsure / general (Home)

Home → proof chips → PrivAI Guard teaser → experience snapshot → `/resume` chooser → `/contact`.

**Success:** Recruiter can label the candidate and leave with a resume or a message in under 90 seconds.

### Pathway A — Cybersecurity / GRC / IT Risk

Entry: Home CTA or `/focus/cybersecurity-grc`.

Recommended page order on the focus page:

1. Track headline and shared identity reminder  
2. Work authorization  
3. Track-weighted summary (Resume A language)  
4. Competency list (IT risk, GRC, security controls, audit readiness, incident readiness, third-party risk)  
5. Featured evidence: NPC 2024–2026 security/technology advisory (locked title); CSMCC security implementation (public-safe); PrivAI Guard control design  
6. Experience excerpts (security-weighted bullets)  
7. Credentials: CC, CISA ICS training, ANU cybersecurity certificate, CIPM (secondary on this page), “Licensed to Practice Law in the Philippines” in a smaller note with no U.S. licensure implication  
8. Publication (NCSP localization)  
9. CTAs: Download Cybersecurity/GRC resume · View case study · Contact  
10. Cross-link: “Also available: Privacy & AI Governance profile”

Then optional depth: `/work/privai-guard` → `/experience` → `/credentials`.

### Pathway B — Privacy / AI Governance

Entry: Home CTA or `/focus/privacy-ai-governance`.

Same skeleton as A, with Resume B emphasis:

1. Track headline + shared identity  
2. Work authorization  
3. Privacy/AI-governance summary  
4. Competencies: privacy governance, privacy operations, PbD/PbDefault, breach/incident process, AI governance, responsible AI, audit evidence  
5. Featured evidence: NPC compliance-monitoring leadership; Bankmer first privacy program; PrivAI Guard privacy-risk triage; DPO institutionalization (if approved)  
6. Experience excerpts (privacy-weighted bullets)  
7. Credentials: CIPM first, then CC, Google AI Professional Certificate (verify before production), “Licensed to Practice Law in the Philippines” with no U.S. licensure implication  
8. Writing / policy-contribution one-liner if circular credit is approved  
9. CTAs: Download Privacy/AI Governance resume · Case study · Contact  
10. Cross-link to Track A

### Pathway C — Diligence (hiring manager / CISO / privacy lead)

Home or Focus → `/experience` (full timeline) → `/work/privai-guard` → `/credentials` → `/writing` → `/leadership` (if curated) → `/contact`.

### Pathway D — Professional contact / speaking host

Home → `/about` → `/leadership` → `/contact`.

### Shared rules for all pathways

- Same employers and dates everywhere  
- Same PrivAI Guard URL  
- Same locked licensure phrase — Licensed to Practice Law in the Philippines — wherever the JD or license appears; never imply U.S. practice  
- No dead ends: every page offers Contact and the other track

---

## 5. Project / case-study structure

### Work index (`/work`)

Cards, not a dump:

| Card | Status |
|---|---|
| PrivAI Guard | Featured; required |
| DBNMS | Optional short card after editing |
| NPCRS | Optional short card after editing |
| Bankmer Privacy Management Program | Optional program card, not a software case study |

Each card: name, one-line outcome, year, track tags, link.

### PrivAI Guard case study (`/work/privai-guard`)

Fixed section order so the page stays honest and scannable:

1. **Title and context** — Shadow AI privacy-risk triage; Northwestern MSIS capstone; 2026  
2. **Limits (above the fold)** — Non-production MVP; synthetic demonstration data; human governance review; not automated legal or regulatory decisioning  
3. **Problem** — Shadow AI use creates unstructured privacy/security risk  
4. **Role** — Designed and developed  
5. **Approach** — Convert potentially risky AI use into structured assessment, review, remediation, evidence, and visibility  
6. **Capabilities** — Only source-supported features (classification, scoring, DS impact, routing, etc., after confirmation)  
7. **Controls** — RBAC, RLS, logging, privacy by design  
8. **Stack** — Next.js, React, TypeScript, Supabase/PostgreSQL, Vercel, GitHub  
9. **What a reviewer can inspect** — Screenshots, architecture note, or live demo *if assets exist*; otherwise omit rather than fake  
10. **Relevance to employers** — Two short paragraphs (GRC/security lens and privacy/AI-governance lens)  
11. **CTAs** — Contact; both focus pages; resume

Do not include fabricated metrics, customer quotes, or production SLAs.

### Future case studies

Use the same template. Government systems get a shorter template: problem (public function) → owner’s role → outcome (launch/public capability) → explicit “no confidential internals” boundary.

---

## 6. Resume experience

### Page: `/resume`

Purpose: help a recruiter pick the correct packet without exposing the private CV.

1. Short explanation: one background, two emphasis resumes  
2. Card A — Cybersecurity / GRC / IT Risk: 3-bullet preview + Download PDF  
3. Card B — Privacy / AI Governance: 3-bullet preview + Download PDF  
4. Note: “The public site and these resumes are a curated professional record. They are not a comprehensive CV.”  
5. Work authorization repeat  
6. Legal note: Licensed to Practice Law in the Philippines — not U.S. licensure  
7. Contact: form, professional email, LinkedIn  
8. Optional: “Prefer LinkedIn?” if not already adjacent

### File rules

- Public PDFs are **generated or exported copies** stored as CMS media, not files from `private-source/`
- Filenames should be boring and professional, e.g. `Ram-Milanes-Cybersecurity-GRC.pdf`
- Do not include a phone number on the public PDF by default
- No admin or comprehensive-CV download on this page

### In-page experience (reading without PDF)

`/experience` is the HTML resume. Recommended order:

1. Intro sentence + track filters (All | Cyber/GRC | Privacy/AI) that show/hide bullets, not jobs  
2. RAM Privacy & Security — Principal Consultant  
3. National Privacy Commission — Innovation and Transformation Consultant; Designated Chief Information Technology Officer  
4. National Privacy Commission — Chief, Compliance and Monitoring Division  
5. Bankmer (2017–2020; 2015–2016 as Corporate Counsel / Facilities Manager; 2013–2015 Compliance Officer)  
6. Additional: Scionetrade — Legal Consultant — Cybersecurity & Data Privacy Advisory; DTSLC  
7. Education (short; locked Northwestern formulation) + link to Credentials

Collapsed by default: long NPC accomplishment lists. Show 4–5 bullets; “Show details” can reveal owner-approved extras.

---

## 7. Contact experience

### Goals

- Low friction for recruiters and hiring managers  
- No public phone number  
- Owner receives structured inbound  
- Candidate appears privacy-conscious (the medium is the message)

### `/contact` layout

1. One-sentence invite  
2. Form fields:  
   - Name  
   - Email  
   - Organization (optional)  
   - Role / context (Recruiter, Hiring manager, Other)  
   - Track interest (Cyber/GRC, Privacy/AI, Either)  
   - Message  
3. Submit confirmation (no extra PII requested)  
4. Alternatives: professional email; LinkedIn  
5. Work-authorization line (locked wording; not dominant)  
6. Response-time expectation only if the owner wants one (do not invent)

### Anti-goals

- Calendly or phone required to start a conversation  
- Resume wall / gated PDF  
- Chat widget  
- Capturing more PII than needed

### Privacy Policy (`/privacy`)

Short page: what the contact form collects, that inquiries are owner-only, that the public site does not host the comprehensive CV, and that source documents are not published. Required before launch; copy can be drafted in a later phase.

---

## 8. Other public pages (brief)

### About

- First-person narrative following the recommended arc in `PORTFOLIO_STRATEGY.md`  
- What he does and how he works  
- Education  
- Explicit non-claims (not a U.S. attorney; PrivAI Guard is an MVP; no unnamed client results)  
- Optional civic leadership one-liner if approved  
- Photo only if provided

### Credentials

Grouped: Graduate education (locked Northwestern formulation) · Privacy · Cybersecurity · Specialized training · Legal licensure (separate visual group: “Licensed to Practice Law in the Philippines”; no U.S. implication)

### Leadership / Speaking

- Categories first (public sector, private-sector privacy/security forums, selected international briefings)
- Only a small number of named examples, if any
- Do not render the exhaustive CV organization list
- Format for named items: year (if known), host, role (Speaker / Lecturer / Advisor), topic if known
- Default: categories only until examples are chosen

### Writing

- Publication list with outbound links  
- Room to add future posts without a redesign

---

## 9. SEO and indexing (planning only)

- Unique title/description per track page so recruiters landing from search still see the unified identity  
- Canonical URLs for case study and experience  
- `noindex` on `/admin` and any inquiry thank-you tokens  
- Do not generate pages from private-source filenames  

---

## 10. Content reuse map

| Content object | Home | Focus A | Focus B | Experience | Work / Case study | Credentials | Resume |
|---|---|---|---|---|---|---|---|
| Profile / headline | ● | ● | ● | ○ | ○ | ○ | ● |
| Work authorization | ● | ● | ● | ○ | ○ | ○ | ● |
| Experiences | snapshot | excerpt | excerpt | full | ○ | ○ | preview |
| Experience bullets (tagged) | ○ | A tags | B tags | filterable | ○ | ○ | ○ |
| PrivAI Guard | teaser | control lens | privacy lens | ○ | full | ○ | ○ |
| Credentials | chips | weighted | weighted | link | ○ | full | ○ |
| Publication | teaser | ● | ○/● | ○ | ○ | ○ | ○ |
| Metrics (if approved) | 3 max | subset | subset | contextual | ○ | ○ | ○ |

● primary  ○ supporting / link
