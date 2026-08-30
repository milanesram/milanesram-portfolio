# Phase 1 Review

**Subject:** Rainier (Ram) Milanes portfolio  
**Phase:** 1 — Discovery and portfolio strategy  
**Date:** 29 August 2026  
**Application implementation performed:** **None.**

Phase 1 discovery is approved with locked public-content decisions (29 August 2026). This file was updated to apply those decisions. It still does **not** authorize Phase 2, application implementation, scaffolding, package installation, Supabase setup, or deployment.

---

## 0. Locked public-content decisions

| # | Decision | Public rule |
|---|---|---|
| 1 | Northwestern degree | Master of Science in Information Systems, Security Specialization, Northwestern University — unless later replaced by an official transcript/diploma formulation |
| 2 | NPC 2024–2026 | Innovation and Transformation Consultant; Designated Chief Information Technology Officer — two lines; do not collapse |
| 3 | Bankmer 2015–2016 | Corporate Counsel / Facilities Manager — no conflicting third title; IT/security work in the body only |
| 4 | Scionetrade | Legal Consultant — Cybersecurity & Data Privacy Advisory — do not use “Legal & Data Protection Officer” unless later verified |
| 5 | Google AI Professional Certificate | May include; final credential verification required before production publication |
| 6 | Publication date | 2025 only — do not infer month/day |
| 7 | Contact | Professional email + LinkedIn + secure contact form — no phone by default |
| 8 | Legal licensure | Licensed to Practice Law in the Philippines — never imply U.S. bar admission or U.S. legal practice |
| 9 | Comprehensive CV | Private source material — not publicly downloadable |
| 10 | Metrics | Source-supported only; exact contextual formulations; do not combine years or baselines |
| 11 | Speaking / advisory | Categories + a small number of representative examples — not the exhaustive CV list |
| 12 | Work authorization | Authorized to work in the U.S. without sponsorship — recruiter fact, not a dominant hero message |

---

## 1. Source-file readability

All three owner-specified private source files were located under `private-source/` (gitignored) and were successfully read:

| File | Format | Read method | Result |
|---|---|---|---|
| `private-source/RAMilanes_CV_08292026.docx` | Word | macOS `textutil` text extraction | Readable (full 590-line text extract) |
| `private-source/ResumeA_CybersecurityGRC.pdf` | PDF | `pdftotext -layout` | Readable (2 pages) |
| `private-source/ResumeB_PrivacyAIGovernance.pdf` | PDF | `pdftotext -layout` | Readable (2 pages) |

No source contents were guessed. Private source files were not modified, moved, or copied into the public tree.

---

## 2. Major findings

1. **There is already a coherent U.S.-market identity.** Resume A and Resume B are two cuts of the same career, not two careers. The public site should preserve that discipline.

2. **The strongest employer story is regulator-side operating leadership plus a current technical artifact.** National Privacy Commission roles (compliance-monitoring leadership and later technology/security advisory) plus PrivAI Guard give U.S. reviewers both scope and a inspectable piece of work.

3. **The comprehensive CV is too broad and too sensitive to publish.** It includes early-career jobs, concurrent legal retainers, civic projects with political/military context, a long named speaking list, internal NPC process, and confidential-adviser language. It should remain a private source of truth.

4. **Title integrity was the main factual risk; the highest-conflict titles are now locked.** NPC 2024–2026, Bankmer 2015–2016, and Scionetrade have approved public formulations. Remaining title questions are narrower (see §5 and §8).

5. **Work authorization is a recruiter-facing fact, not the hero.** Locked wording: Authorized to work in the U.S. without sponsorship. Place it in the utility strip, Resume, and Contact — not as the dominant homepage message.

6. **Philippine legal licensure is real and must be fenced.** It is a credential, not the professional headline, and it is not U.S. licensure.

7. **Consulting cannot be evidenced like employment.** RAM Privacy & Security is consistently titled and dated, but no clients, logos, or outcomes appear. Public copy must stay at capability level.

8. **PrivAI Guard is the correct featured project — if honesty stays above the fold.** All detailed descriptions agree it is a 2026 Northwestern capstone MVP using synthetic data and human review, not automated legal/regulatory decisioning.

9. **The existing application is a stock Create Next App.** `src/app/page.tsx` and `src/app/layout.tsx` still show the default Next.js starter. There is no portfolio UI, CMS, or content layer yet. That is appropriate; Phase 1 did not change it.

10. **Metrics may be used only in exact contextual form.** Compressed resume percentages and combined multi-year figures are not allowed. Which metrics appear on Home, and whether government operating statistics are cleared for personal public use, still need verification.

---

## 3. Strongest differentiators

Use these, in roughly this order, once wording is approved:

1. **National privacy-regulator leadership** — ran high-volume privacy compliance, breach-notification, and registration operations; sponsored public digital systems (DBNMS, NPCRS).
2. **Security and technology advisory at the same institution** — as Innovation and Transformation Consultant, designated Chief Information Technology Officer: cybersecurity strategy, technology risk, critical-infrastructure protection framing, and CSMCC security implementation with privacy by design/default.
3. **Enterprise privacy program creation** — first Privacy Management Program and designated DPO work at Bankmer.
4. **Hands-on AI-governance proof** — PrivAI Guard, with an explicit non-production boundary that will read as mature to serious AI-governance reviewers.
5. **Dual fluency** — privacy operations *and* security/GRC, plus a JD/PH bar that supports regulatory interpretation *without* claiming U.S. legal practice.
6. **Current credentials** — CIPM, CC, Northwestern security-focused graduate work, CISA ICS training, ANU cybersecurity professional development.
7. **Public writing** — NCSP 2023–2028 localization paper (Friedrich Naumann Foundation), useful for the cyber/GRC track.
8. **Hire logistics** — authorized to work in the U.S. without sponsorship.

---

## 4. Content risks

| Risk | Why it matters | Mitigation |
|---|---|---|
| Inflated titles | U.S. readers treat “CITO” and “DPO” as hard claims | Use locked formulations; do not collapse NPC designation into the contractual title |
| Confidential NPC advisory | CV states highly confidential adviser duties | Never describe subject matter; drop that bullet entirely |
| Government system internals | DBNMS, NPCRS, CSMCC, DaMPA | Public-function language only; no screenshots/code/findings |
| Enforcement methodology | On-site audits, privacy sweeps, internal guidelines | Do not publish methods |
| Named speaking hosts as fake clients | Long CV list includes companies and embassies | Categories + a few examples only; never imply client relationships |
| U.S. legal-practice implication | JD + “Corporate Counsel” + bar | Use locked phrase only; never imply U.S. practice; no “Attorney” headline |
| Consulting over-claim | CV sales language and fractional CISO/DPO wording | Capability, not results; no clients |
| PrivAI Guard over-claim | Easy to sound like a production AI product | MVP / synthetic / human-review above the fold |
| PII on a “privacy professional” site | Phone on resumes | Locked: no phone by default; professional email + LinkedIn + form |
| Comprehensive CV leak | File is gitignored today | Locked private source; never add to `public/` or Storage |
| Metric distortion | A/B compress CV baselines | Locked: exact contextual formulations only; no cross-year combinations |
| Concurrent roles hidden or mishandled | RAM Privacy and NPC both start Oct 2024; other overlaps exist | Show overlap honestly or omit the extra role — presentation still open |

---

## 5. Factual discrepancies

### Resolved (do not re-open)

| Topic | Locked public handling |
|---|---|
| Northwestern degree name | Master of Science in Information Systems, Security Specialization, Northwestern University |
| NPC 2024–2026 title | Innovation and Transformation Consultant / Designated Chief Information Technology Officer (not collapsed) |
| Bankmer 2015–2016 third title | Omitted. Public title: Corporate Counsel / Facilities Manager |
| Scionetrade title | Legal Consultant — Cybersecurity & Data Privacy Advisory. Do not use “Legal & Data Protection Officer” unless later verified |
| Google AI Professional Certificate (include vs drop) | May include; production verification still required (see remaining list) |
| Publication date | 2025 only |
| Publisher name | Friedrich Naumann Foundation for Freedom (English name for U.S. site) |
| Metric wording style | Exact contextual formulations; do not use compressed A/B figures or combine years/baselines |
| NPC location granularity | “Philippines” |
| Contact / phone / CV download | Professional email + LinkedIn + form; no phone by default; CV stays private |
| Legal licensure phrase | Licensed to Practice Law in the Philippines; no U.S. implication |
| Speaking list scope | Categories + small representative set; exhaustive CV list stays private |

### Still requiring verification

These are the only source or presentation issues that remain open.

| # | Topic | Why it is still open |
|---|---|---|
| 1 | “MS” name suffix in the header | Degree name is locked; using “MS” after the personal name was not decided |
| 2 | Official transcript/diploma wording | Locked formulation stands unless a later official document replaces it |
| 3 | NPC 2021–2024 plantilla title (ITO III) | Functional title is on the U.S. resumes; whether to show ITO III anywhere was not decided |
| 4 | Bankmer 2017–2020 title compression | CV is longer (Head, Legal and Compliance + designated DPO); A/B use Director of Operations & Data Protection Officer. Not locked. |
| 5 | Homepage metric selection | Policy is locked; which 0–3 contextual metrics appear on Home is not |
| 6 | Personal public use of NPC operating statistics | Even contextual figures are government performance data |
| 7 | Professional email address | Channel is locked; the actual address is not in these docs |
| 8 | Google AI Professional Certificate standing | Inclusion is allowed; verify before production publication |
| 9 | CIPM / CC current standing | Not documented with dates or IDs in the sources |
| 10 | Named speaking examples | Policy is locked; the few names (if any) are not chosen |
| 11 | Concurrent RAM Privacy + NPC (both start Oct 2024) | Dates are consistent with overlap; public phrasing is not locked |
| 12 | Whether to name CCMMS / Project DaMPA | Internal/in-progress language; “AI-powered” vision is not for public use |
| 13 | NPC circular “primary contributor” credit | Public issuances; contribution wording not confirmed |
| 14 | DSWD recognition / Tarlac civic leadership | Off-spine; default omit |
| 15 | OIC-Director IV / IMISU Vice-Chair | CV-only concurrent posts; default omit unless wanted |
| 16 | PrivAI Guard stack and Resume B-only capabilities | Still accurate? Confirm before case-study copy |
| 17 | DTSLC “Head” vs “Chair” | Use Communications Head unless the owner prefers Chair |
| 18 | Publication URL still live | Check before launch |

---

## 6. Privacy concerns

Highest priority:

- **Do not publish** the comprehensive CV or the `private-source/` files.
- **Do not publish** the resume telephone number.
- **Do not publish** “highly confidential” NPC advisory content or enforcement methods.
- **Do not publish** early-career, client-adjacent legal clinic, or Tarlac projects involving military land / Marawi conflict detail.
- **Do not imply** U.S. bar admission.
- **Do not list** diplomatic/security hosts (e.g., Fraud Prevention Unit, Joint Cybersecurity Working Group) without an explicit owner decision.
- **Do not treat** named private-sector speaking hosts as clients.
- **Contact form data** and the professional inbox are PII once the site exists; plan owner-only access.

See `CONTENT_PRIVACY_CLASSIFICATION.md` for item-level labels.

---

## 7. Missing assets

None of the following appear in the repo or the source extracts. They are needed before a polished public launch (not before owner approval of this phase):

| Asset | Why |
|---|---|
| Professional headshot (owner-owned) | About / Home credibility |
| Simple name mark or wordmark | Replace Next.js starter branding |
| PrivAI Guard screenshots, architecture diagram, and/or demo URL | Case study without vapor-ware feel |
| Owner-approved public resume PDFs (PII-stripped as decided) | `/resume` downloads |
| Official transcript/diploma (only if replacing the locked degree line) | Optional later correction |
| CIPM / CC current standing (and optional badges per issuer rules) | Credentials |
| Google AI Professional Certificate verification | Allowed on site; confirm before production |
| Publication URL live check | Writing page (year already locked as 2025) |
| A few named speaking examples — or confirm categories-only launch | Leadership page |
| Professional email address to publish | Contact |
| Optional U.S. display location | Only if the owner wants one; not in sources |
| Privacy policy copy | Required at launch |
| Favicon / Open Graph image | Recruiter link previews |

---

## 8. Items still requiring owner verification

Locked decisions in §0 are closed. Phase 2 should not start until the owner answers or explicitly defers the remainder:

1. Public display name (Rainier / Ram / both) and whether to use an “MS” suffix  
2. Whether to show ITO III anywhere  
3. Bankmer 2017–2020 public title string  
4. Which contextual metrics, if any, appear on Home  
5. Whether NPC operating statistics are cleared for personal public use  
6. The professional email address to display  
7. Google AI Professional Certificate — verify before production  
8. CIPM / CC current standing  
9. Which few speaking examples to name, or categories-only MVP  
10. How to phrase concurrent RAM Privacy + NPC work  
11. Whether CCMMS / DaMPA are named  
12. Whether NPC circular contribution credit is used  
13. Whether DSWD recognition or Tarlac civic leadership appears (default omit)  
14. Domain / public URL preference (can defer)  
15. Approval to proceed to Phase 2  

---

## 9. Proposed Phase 2 scope

**Still no Supabase, no deploy, no private-file movement, and no package work unless the owner later expands the scope.**

Recommended Phase 2 (after approval):

1. **Remaining verification** — record answers to section 8 (locked items in §0 stay closed).  
2. **Public copy outlines** — page-by-page draft copy using locked formulations plus PUBLIC / PUBLIC AFTER EDITING items.  
3. **Visual direction locked** — type, color, spacing, and component list consistent with `PORTFOLIO_STRATEGY.md` (still can be documentation + a static mock, not a redesign of production content).  
4. **Static IA scaffolding only if explicitly requested** — Next.js routes that match `INITIAL_INFORMATION_ARCHITECTURE.md`, filled with approved placeholder or approved public copy.  
5. **Asset checklist execution** — collect headshot, PrivAI Guard visuals, public resume exports.

Explicitly **out of Phase 2** unless the owner says otherwise:

- Supabase project, schema, or CMS  
- Auth / admin  
- Deployment  
- Installing new packages  
- Importing or rewriting private source files  
- Publishing live metrics or named speaking hosts still marked for review  
- Re-opening locked titles, degree, contact model, or CV privacy  

---

## 10. Files created in Phase 1

Updated 29 August 2026 to apply locked public-content decisions. No new documentation files were added.

| File | Purpose |
|---|---|
| `docs/PORTFOLIO_STRATEGY.md` | Audience, positioning, two-track strategy, narrative, design, conversions |
| `docs/CONTENT_INVENTORY.md` | Source-supported inventory and proposed site use |
| `docs/CONTENT_PRIVACY_CLASSIFICATION.md` | PUBLIC / PUBLIC AFTER EDITING / PRIVATE / OWNER REVIEW |
| `docs/INITIAL_INFORMATION_ARCHITECTURE.md` | Nav, hierarchy, homepage order, recruiter pathways |
| `docs/INITIAL_DATA_MODEL.md` | Lean Supabase CMS proposal (not built) |
| `docs/PHASE_1_REVIEW.md` | This review |

No application files, configuration, dependencies, or private-source files were changed in this update.

---

## 11. Explicit non-implementation statement

**Phase 1 remains documentation only. Phase 2 has not started.**

The following were **not** done in this update or earlier in Phase 1:

- No Next.js application code was added, redesigned, or scaffolded  
- No packages were installed  
- Supabase was not connected or provisioned  
- Nothing was deployed  
- Private source files were not altered, moved, or copied into Git-tracked public directories  

Approval is still required before any Phase 2 work.
