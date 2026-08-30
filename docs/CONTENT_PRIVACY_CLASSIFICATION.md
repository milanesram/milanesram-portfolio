# Content Privacy Classification

**Subject:** Rainier (Ram) Milanes  
**Phase:** 1 — Discovery and portfolio strategy  
**Date:** 29 August 2026  
**Status:** Phase 1 approved with locked public-content decisions. Classifications below reflect those locks. Phase 2 not started.

Private source files (`private-source/*`) remain **PRIVATE / DO NOT PUBLISH** as files. They must stay out of Git and off the public website. This document classifies *facts and artifacts derived from them*.

## Classification keys

| Label | Meaning |
|---|---|
| **PUBLIC** | Source-supported, appropriate for a U.S. professional site if still accurate. Minimal residual risk. |
| **PUBLIC AFTER EDITING** | Source-supported, but wording, title form, or context must be tightened before use. |
| **PRIVATE / DO NOT PUBLISH** | Unnecessary PII, confidential or sensitive government/client detail, or off-strategy personal history. |
| **REQUIRES OWNER REVIEW** | Could be public or private depending on accuracy, permission, sensitivity, or positioning. Do not implement until decided. |

When an item could sit in two buckets, the stricter label wins until the owner decides.

---

## 1. Identity, contact, and personal data

| Material | Class | Rationale / required edit |
|---|---|---|
| Public professional name: Rainier (Ram) Milanes | **REQUIRES OWNER REVIEW** | Confirm the exact public form. Using both given name and “Ram” is appropriate if that is the professional name. |
| “MS” name suffix | **REQUIRES OWNER REVIEW** | Depends on official degree title and conferral. |
| Work authorization statement | **PUBLIC AFTER EDITING** | **Locked wording:** “Authorized to work in the U.S. without sponsorship.” Recruiter-facing fact only; do not make it the hero message. Do not add visa-class detail. |
| LinkedIn URL | **PUBLIC** | Already a public professional profile on both U.S. resumes. |
| U.S. telephone number on the resumes | **PRIVATE / DO NOT PUBLISH** | Locked: do not display by default. |
| Professional email (public contact channel) | **PUBLIC AFTER EDITING** | Locked contact model includes professional email + LinkedIn + secure form. Do not copy a personal mailbox from private resumes into repo docs. Exact address still to be supplied. |
| Personal email harvested from private resumes | **PRIVATE / DO NOT PUBLISH** | Use only if it is the chosen professional address, supplied separately for the site. |
| Precise Philippine work locations (Quezon City, Pasay, Makati, Taguig, Agoo, La Union) | **PRIVATE / DO NOT PUBLISH** | Unnecessary geographic PII. Use “Philippines” or “Remote.” |
| Comprehensive private CV (file or full text) | **PRIVATE / DO NOT PUBLISH** | Locked: private source material only. Not a public download. Use only to support approved portfolio content. |
| Resume A / Resume B source PDFs as-is | **PUBLIC AFTER EDITING** | Basis for *public* resume downloads after applying locked titles/metrics/PII rules. Do not expose `private-source/` files. Public PDFs should omit the phone number to match the site. |
| Date of birth, government IDs, address, family, photos of IDs | Not in extracted sources | If discovered later: **PRIVATE / DO NOT PUBLISH** |
| Headshot / portrait | **REQUIRES OWNER REVIEW** | Not in sources. If added, use a professional photo the owner owns. |

---

## 2. Professional identity and narrative

| Material | Class | Rationale / required edit |
|---|---|---|
| Unified positioning: cybersecurity, GRC, IT risk, privacy, AI governance | **PUBLIC AFTER EDITING** | Use A/B summary language; shorten CV prose; avoid CV marketing adjectives. |
| “More than 10 years” of relevant experience | **PUBLIC AFTER EDITING** | Accurate if dated from 2013 privacy/compliance work. Do not inflate. |
| Dual-track framing (same person, two lenses) | **PUBLIC** | Strategy, not a new biographical claim. |
| Headline as “Attorney,” “U.S. lawyer,” or equivalent | **PRIVATE / DO NOT PUBLISH** | Philippine licensure is not U.S. licensure. Do not lead with law practice. |
| Fractional DPO/CISO *services* as a consulting offer | **PUBLIC AFTER EDITING** | CV service catalog. Allowed as capability language only if clearly not a current employer title and not backed by named clients. |
| Consulting outcome claims (“reduced legal exposure,” “faster audits,” “stronger digital trust”) | **PRIVATE / DO NOT PUBLISH** | Unsupported by named results. Marketing language, not evidence. |
| Any implied U.S. legal advice or U.S. bar admission | **PRIVATE / DO NOT PUBLISH** | Explicitly disclaim. |

---

## 3. Experience records

### RAM Privacy & Security

| Material | Class | Rationale / required edit |
|---|---|---|
| Employer, Principal Consultant, October 2024–Present, Remote | **PUBLIC** | Consistent across all three sources. |
| Conservative A/B bullets (assessments, policies, incident readiness, TPRM, audit readiness) | **PUBLIC AFTER EDITING** | Keep generic; no clients. |
| Full CV practice manifesto (retainers, specialists, “no handoffs, no dilution”) | **PRIVATE / DO NOT PUBLISH** | Consultancy sales copy. |
| Named clients, logos, testimonials | Not in sources | Do not invent. If added later: **REQUIRES OWNER REVIEW** plus client permission. |
| Concurrent overlap with NPC consultant role | **PUBLIC AFTER EDITING** | Dates overlap in sources. Present as concurrent consulting + public-sector consultancy if both remain accurate; do not hide the overlap or invent a sequential-only story. |

### National Privacy Commission — CITO-period role

| Material | Class | Rationale / required edit |
|---|---|---|
| Employer: National Privacy Commission (Philippines) | **PUBLIC** | |
| Dates October 2024–January 2026 (day precision optional) | **PUBLIC** | CV has 1 Oct 2024–25 Jan 2026. |
| Public title string | **PUBLIC AFTER EDITING** | **Locked two-line form:** Innovation and Transformation Consultant / Designated Chief Information Technology Officer. Do not collapse into the combined resume title. |
| Advisory work on cybersecurity strategy, technology risk, critical-infrastructure protection, control implementation | **PUBLIC AFTER EDITING** | Describe function, not confidential subject matter. |
| CSMCC pre/post-production security implementation and privacy by design/default | **PUBLIC AFTER EDITING** | Name the system only at a public-function level. No architecture, vendors, or control gaps. |
| Institutionalizing government DPO / Office of the DPO | **PUBLIC AFTER EDITING** | Policy-advisory claim; keep high-level. |
| “Primary adviser on highly confidential matters affecting the Commission” | **PRIVATE / DO NOT PUBLISH** | Confidentiality is the point. Never expand. |
| Internal/external review of all offices’ outputs and “highly confidential” directives | **PRIVATE / DO NOT PUBLISH** | Over-broad and sensitive. |
| Exact office street locations | **PRIVATE / DO NOT PUBLISH** | |

### National Privacy Commission — Chief, CMD

| Material | Class | Rationale / required edit |
|---|---|---|
| Functional title: Chief, Compliance and Monitoring Division; dates Mar 2021–Sep 2024 | **PUBLIC AFTER EDITING** | Standard U.S. resume form. Whether to also show ITO III is still open. |
| Plantilla title: Information Technology Officer III | **REQUIRES OWNER REVIEW** | Accurate per CV. Optional footnote for integrity; may confuse U.S. readers if used as the *only* title. |
| Leadership of registration, breach notification, compliance checks, reporting | **PUBLIC AFTER EDITING** | Operational description, no case files. |
| DBNMS and NPCRS as named public-facing regulatory systems | **PUBLIC AFTER EDITING** | Public portals; describe purpose and role (sponsor/lead), not internals. |
| Launch dates (20 Apr 2022; 3 Feb 2023) | **PUBLIC** | If still accurate. |
| CCMMS, CSMCC, Project DaMPA, “AI-powered digital platform” vision | **REQUIRES OWNER REVIEW** | Internal/in-progress program language; “AI-powered” is promotional. Risk of over-claim. |
| Named NPC circulars and “primary contributor” | **REQUIRES OWNER REVIEW** | Circulars themselves are public law/policy. Contribution credit should be owner-confirmed and modestly worded. |
| PAW Awards / PPDPCP / conference planning lead | **PUBLIC AFTER EDITING** | Program leadership; no attendee PII. |
| Internal guidelines for on-site checks and on-the-spot privacy sweeps | **PRIVATE / DO NOT PUBLISH** | Enforcement methodology. |
| Unit-level org chart and assessment techniques write-up | **PRIVATE / DO NOT PUBLISH** | Internal operating detail. |
| OIC-Director IV (Jan–Mar 2022) | **REQUIRES OWNER REVIEW** | Short acting role; useful seniority signal if accurate. |
| IMISU Vice-Chair / Information Systems Planner | **REQUIRES OWNER REVIEW** | |
| BAC membership | **PRIVATE / DO NOT PUBLISH** | Procurement role; little U.S. recruiter value; unnecessary government-process detail. |
| Specific PIC names, breach files, registration records | Not in sources; would be confidential | **PRIVATE / DO NOT PUBLISH** if ever added |

### Bankmer Realty Corporation

| Material | Class | Rationale / required edit |
|---|---|---|
| Employer, 2013–2020 progression, Philippines | **PUBLIC AFTER EDITING** | Use “Philippines,” not Makati. |
| Director of Operations & DPO (2017–2020) as on A/B | **PUBLIC AFTER EDITING** | CV is longer (Head, Legal and Compliance + designated DPO). Owner picks public title. |
| DPO designation date 15 August 2017 | **PUBLIC** | Useful precision if desired. |
| First Privacy Management Program + training + policies | **PUBLIC AFTER EDITING** | Do not attach policy documents or employee PII. |
| 2015–2016 public title | **PUBLIC AFTER EDITING** | **Locked:** Corporate Counsel / Facilities Manager. Do not assert the conflicting third title. Body: source-supported IT, information-security, infrastructure, digitalization, vendor, and compliance work only. |
| Confidential employee/client information handling (as a duty) | **PUBLIC AFTER EDITING** | Say “confidential organizational information,” not client identities. |
| Lease negotiations, healthcare plan, energy equipment, revenue plan, “all financial activities” | **PRIVATE / DO NOT PUBLISH** | Off-strategy; some commercial-sensitive. |
| Court/quasi-judicial representation of the corporation | **PRIVATE / DO NOT PUBLISH** | Legal-practice detail; U.S. licensure confusion risk. |
| Labor-dispute hearing officer; meeting minutes | **PRIVATE / DO NOT PUBLISH** | |

### Scionetrade

| Material | Class | Rationale / required edit |
|---|---|---|
| Additional role, 2018–2020, security/technology provider, privacy/cyber advice | **PUBLIC AFTER EDITING** | Use locked title. |
| Public title | **PUBLIC AFTER EDITING** | **Locked:** Legal Consultant — Cybersecurity & Data Privacy Advisory. Do not use “Legal & Data Protection Officer” unless separately verified later. |
| Liaison to cybersecurity companies in Israel | **PRIVATE / DO NOT PUBLISH** | Unnecessary third-party/geopolitical detail; no names in sources anyway. |
| BAC/GPPB bidding-document review, RFI answers, Philippine procurement advice | **PRIVATE / DO NOT PUBLISH** | Low U.S. value; process-sensitive. |

### Other experience

| Material | Class | Rationale / required edit |
|---|---|---|
| Northwestern DTSLC Communications Head, 2026 | **PUBLIC AFTER EDITING** | Student leadership, not a job. Do not expose student-database practices beyond “responsible handling of student information.” |
| DSWD Office of the Secretary consultancy and 2021 Special Recognition | **REQUIRES OWNER REVIEW** | Government program (Social Amelioration / COVID). Full commendation text is **PRIVATE / DO NOT PUBLISH**. |
| Private law practice blocks (2015–2016 and 2020–2021) | **PRIVATE / DO NOT PUBLISH** | Off-strategy; licensure confusion; 2015–2016 overlaps Bankmer. |
| Corvill Agricom roles | **PRIVATE / DO NOT PUBLISH** | Off-strategy; concurrent corporate work. |
| Letran teaching | **REQUIRES OWNER REVIEW** | Harmless if brief; not a Home item. |
| Law-student practitioner / indigent-client clinic | **PRIVATE / DO NOT PUBLISH** | Client-type sensitivity; off-strategy. |
| Tarlac Heritage Foundation roles and project list | **REQUIRES OWNER REVIEW** | Civic leadership possible. **Hardin ng Lunas on idle military lands**, **Marawi displacement / named terrorist groups**, and similar detail: **PRIVATE / DO NOT PUBLISH**. |
| Early career: construction admin, SSS intern, real estate agent, PC technician, automotive mechanic | **PRIVATE / DO NOT PUBLISH** | Unnecessary; dilutes the professional identity. |
| 2005–2006 student-council audit role | **PRIVATE / DO NOT PUBLISH** | |

---

## 4. Projects and technical artifacts

| Material | Class | Rationale / required edit |
|---|---|---|
| PrivAI Guard name, capstone context, 2026, Shadow AI privacy-risk triage purpose | **PUBLIC** | Consistent and central. |
| MVP / synthetic data / non-production / human review (no automated legal or regulatory decisioning) | **PUBLIC** | Mandatory framing. Do not weaken. |
| Stack: Next.js, React, TypeScript, Supabase/PostgreSQL, Vercel, GitHub | **PUBLIC AFTER EDITING** | On A/B only; confirm still accurate. |
| Controls: RBAC, RLS, risk scoring, review, remediation, audit log, privacy by design | **PUBLIC AFTER EDITING** | Describe as designed/implemented in the MVP. |
| B-only capabilities (classification, DS impact, internal-AI routing) | **PUBLIC AFTER EDITING** | Confirm still in the product. |
| Production-looking claims, customer logos, real personal data, live secrets | Not in sources | **PRIVATE / DO NOT PUBLISH** |
| DBNMS / NPCRS public-purpose descriptions and owner’s role | **PUBLIC AFTER EDITING** | No screenshots of production government UIs unless the owner has publication rights and no confidential data is visible. |
| Government system credentials, schemas, source code, vendor names, threat findings | Not in sources | **PRIVATE / DO NOT PUBLISH** |
| Project DaMPA “state of the art AI” language | **PRIVATE / DO NOT PUBLISH** | Promotional and easy to over-read as a shipped AI regulator platform. |

---

## 5. Education and credentials

| Material | Class | Rationale / required edit |
|---|---|---|
| Northwestern graduate degree | **PUBLIC AFTER EDITING** | **Locked public formulation:** Master of Science in Information Systems, Security Specialization, Northwestern University. Replace later only if an official transcript/diploma uses a different formulation. |
| Named relevant coursework on A/B | **PUBLIC** | |
| Juris Doctor, San Sebastian College – Recoletos | **PUBLIC AFTER EDITING** | Pair with PH-only licensure note if used near legal titles. |
| BS Business Administration, Trinity University of Asia | **PUBLIC** | |
| Incomplete units (San Beda LL.B. 61 units; Ateneo AB 30 units) | **PRIVATE / DO NOT PUBLISH** | Default omit; looks like filler on a U.S. site. |
| CIPM (IAPP); CC (ISC2) | **PUBLIC AFTER EDITING** | Confirm current standing; no credential IDs unless owner wants them. |
| ANU professional development certificate; CISA ICS training; digital-transformation credential | **PUBLIC AFTER EDITING** | Describe CISA item as **training**, not a certification, unless the owner confirms a certificate name. |
| Google AI Professional Certificate | **PUBLIC AFTER EDITING** | May include (both U.S. resumes). **Requires final credential verification before production publication.** |
| Philippine bar membership | **PUBLIC AFTER EDITING** | **Locked phrase:** Licensed to Practice Law in the Philippines. Never imply U.S. bar admission or authorization to practice U.S. law. |
| MCLE lecturer credit | **PUBLIC AFTER EDITING** | Speaking evidence, not a U.S. CLE credential. |

---

## 6. Publications

| Material | Class | Rationale / required edit |
|---|---|---|
| Paper title, English publisher name, year 2025, outbound foundation URL | **PUBLIC AFTER EDITING** | **Locked date:** 2025 only. Do not expose or infer month/day. Verify the URL still points to the piece before launch. |
| Short abstract | **PUBLIC AFTER EDITING** | Rewrite CV blurb; avoid sounding like a Philippine-government advocacy page if the site is for U.S. employers. |
| Full paper text copied onto the site | **REQUIRES OWNER REVIEW** | Copyright/publisher terms unknown. Link out unless republication is allowed. |

---

## 7. Leadership, speaking, and awards

| Material | Class | Rationale / required edit |
|---|---|---|
| Category summary of speaking/advisory (public sector, private sector, academia / forums) | **PUBLIC AFTER EDITING** | Locked MVP approach: categories first. |
| Full CV host list (40+ named organizations) | **PRIVATE / DO NOT PUBLISH** | Locked: do not publish the exhaustive list. |
| Small set of representative named examples | **REQUIRES OWNER REVIEW** | Only a few clearly supportable, professionally useful names. Default omit until chosen. |
| U.S. Embassy Fraud Prevention Unit; U.S.–Philippines Joint Cybersecurity Working Group; named intelligence/law-enforcement adjacent bodies | **PRIVATE / DO NOT PUBLISH** | Default omit for MVP. |
| Named private companies as if they were clients | **PRIVATE / DO NOT PUBLISH** | If a company is later chosen as a speaking example, frame only as host/forum, never as a client. |
| NPC PRAISE Exemplary Leadership Award 2022 | **PUBLIC AFTER EDITING** | Short name + year. Do not publish salary-grade eligibility text or “highest award” unless owner confirms. |
| DSWD Special Recognition full commendation | **PRIVATE / DO NOT PUBLISH** | |
| Talk recordings, slides, attendee lists | Not in sources | Add later only if owned and cleared. |

---

## 8. Measurable results

| Material | Class | Rationale / required edit |
|---|---|---|
| Regulator performance statistics (DPO counts, PIC counts, utilization rates, on-site audit counts) | **PUBLIC AFTER EDITING** | Locked wording rule: exact contextual formulations only; do not use compressed A/B figures or combine years/baselines. **Still verify** which appear on Home and that personal public use of government operating statistics is acceptable. |
| Launch dates of public portals | **PUBLIC** | |
| Invented conversion rates, $ impact, team size, MTTR, consulting ROI | Not in sources | **PRIVATE / DO NOT PUBLISH** (do not create) |

---

## 9. Legal licensure (standalone rule)

| Material | Class | Rationale / required edit |
|---|---|---|
| “Licensed to Practice Law in the Philippines” | **PUBLIC AFTER EDITING** | Locked public phrase. Same view must never imply U.S. bar admission or U.S. legal practice. |
| Supreme Court of the Philippines / Integrated Bar of the Philippines | **PUBLIC AFTER EDITING** | Accurate per CV; optional supporting line under the locked phrase. Still no U.S. licensure implication. |
| Any visual treatment that looks like a U.S. attorney bio (scales, “Esq.”, “Admitted in …”) | **PRIVATE / DO NOT PUBLISH** | |

---

## 10. Administrative and implementation artifacts

| Material | Class | Rationale / required edit |
|---|---|---|
| Owner-only CMS, auth credentials, Supabase keys | **PRIVATE / DO NOT PUBLISH** | Never in Git. |
| Contact-form submissions | **PRIVATE / DO NOT PUBLISH** | Treat as PII; restrict to owner. |
| This `docs/` strategy set | **PUBLIC** (repo) | Contains no resume phone/email and no private-file contents beyond professional facts needed to plan the site. Still do not copy private-source files into `docs/`. |
| Private-source directory | **PRIVATE / DO NOT PUBLISH** | Already gitignored. Do not move, rename into `public/`, or attach to the CMS. |

---

## 11. Recommended publish set (if owner agrees)

Safe **first** public surface under the locked decisions:

- Name, unified headline, locked work-authorization fact (not as hero), LinkedIn
- RAM Privacy & Security role (generic bullets)
- NPC 2024–2026 locked two-line title; NPC Chief, CMD
- Bankmer 2017–2020 (title compression still to confirm); 2015–2016 locked title; 2013–2015 Compliance Officer
- Scionetrade locked title
- PrivAI Guard case study with MVP limits
- DBNMS / NPCRS one-liners
- Locked Northwestern degree + CIPM + CC + selected training + Google AI certificate (verify before production)
- Locked PH law-license phrase; no U.S. licensure implication
- One publication, year 2025 only
- Speaking: categories + at most a few named examples
- Professional email + LinkedIn + secure contact form; no phone; no comprehensive CV

Everything else waits.
