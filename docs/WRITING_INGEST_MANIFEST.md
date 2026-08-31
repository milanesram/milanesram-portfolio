# Writing Ingest Manifest

## 1. Metadata

| Field | Value |
|---|---|
| Date | 2026-08-31 |
| Step | 49G — Exact PDF binary upload and hosted publication freeze |
| Repository | `/Users/mbair_ram/Documents/rainier-portfolio` |
| Branch | `main` |
| Foundation HEAD | `81cda2f2b745b6a5070b9615537178f0d471eef2` (`feat: establish publications foundation`) |
| Ingest freeze HEAD | `19acd5636c6cb54109cca1aaff16bf5e86714da4` (`feat: prepare initial writing ingest`) |
| Hosted project | `rainier-portfolio` / `itoctveqrtozdehoofoq` |
| Hosted schema | Migrations through `20260831180000` applied. 10 published publications. 10 published/public media rows. Storage objects 10. |
| Draft seed | `supabase/migrations/20260831160000_initial_writing_draft_seed.sql` |
| Cutover migration | `supabase/migrations/20260831180000_publish_initial_writing.sql` |
| Application | Draft seed applied hosted in Step 49F. Cutover applied hosted in Step 49G. Not applied locally. |
| Hosted byte size | **VERIFIED** — each `media_assets.byte_size` equals the frozen Step 49F source size |

## 2. Owner publication policy

These files are previously published professional works supplied by the owner. The owner confirms authorship and permission to republish. Portfolio publication preserves the supplied PDF binaries as published. Editorial or factual revision is outside the ingest workflow unless the owner separately creates and approves a new version.

This rule controls all ten items.

**No editorial rewriting of supplied published PDFs during ingest.**

The portfolio may classify, describe, assign track/kind/sort, provide a concise abstract, show year, and host the exact PDF. It must not silently modify the binary, create a “corrected edition,” rewrite claims, replace statistics, or alter tone or illustrations.

A later revised edition, if ever authorized, is a **separate version**, not a substitute for the originally published work.

## 3. Collection boundary

All ten owner-controlled works are included. Political subject matter, named-company analysis, historical claims, later developments, editorial voice, and sourcing style do not exclude an owner-approved original from the archive.

NCSP remains **out of this seed**:

| Item | Treatment |
|---|---|
| Localization of the National Cybersecurity Plan (NCSP) 2023-2028 for Local Government Units | Static `/writing` source. Publisher-linked. Conceptually `link_only`. No hosted row. No PDF. Deferred until `/writing` cutover. |

## 4. Shared draft contract

| Field | Value |
|---|---|
| Publisher | `Independent professional publication` |
| Author | `NULL` (public helper fallback: `Rainier (Ram) Milanes`) |
| `published_on` | `NULL` |
| `external_url` | `NULL` (do not invent LinkedIn URLs) |
| Rights | `host_pdf` |
| Publication status | `published` |
| Media `kind` | `document` |
| Media `purpose` | `publication` |
| Media MIME | `application/pdf` |
| Media `byte_size` | exact Step 49F source size |
| Media `is_public` | `true` |
| Media `status` | `published` |
| Source status | Owner-supplied previously published original |
| Binary status | **SOURCE VERIFIED — HOSTED BINARY VERIFIED** |
| Original-publication consistency | **PRESERVE PDF UNCHANGED** |

PDF bylines inside the originals are not altered. Website byline uses the helper fallback.

Future object path:

`publication/{media_uuid}/{normalized_filename}`

## 5. Provenance presentation (future public detail)

For self-hosted previously published works, the detail page may show a subordinate note:

`Presented in the form originally published.`

Do not insert this into PDFs. Do not imply independent fact verification, employer endorsement, current regulatory status, or a correction. Not applied to `/writing/[slug]` in Step 49E.

## 6. Intake mapping and integrity (Step 49F)

Owner-controlled intake files were re-hashed in place. Source filenames were not renamed. Binaries were not copied into Git. Exact originals were uploaded to frozen `public-media` paths and byte-for-byte verified.

Authoritative filename → work mapping (do not infer titles from filenames):

| Source filename | Work |
|---|---|
| `4 Minute Read_Cybersecurity & Society Vol. 1.pdf` | You Are Easier to Hack Than Everything |
| `4 Minute Read_Cybersecurity & Society Vol. 2.pdf` | From Data Breach to Boardroom: Why Cybersecurity Is Now Corporate Governance |
| `4 Minute Read_Cybersecurity & Society Vol. 3.pdf` | From Orb to Oversight: Why the NPC Paused World App |
| `4 Minute Read_Cybersecurity & Society Vol. 4.pdf` | The Price of Ubiquity: GCash Is Now Critical Infrastructure |
| `4 Minute Read_Cybersecurity & Society Vol. 5.pdf` | Contain the Rumor, Protect the People |
| `AI for Privacy Documentation.pdf` | Leveraging Generative Artificial Intelligence for Privacy Compliance Documentation: A Governance Oriented Approach for the European Union, the Philippines, and the APEC Region |
| `Before Blocks.pdf` | Before Blocks, Build the Bedrock: Why Blockchain Shouldn't Lead Philippine Budget Reform—Yet |
| `Critical Analysis of the eGov Outage.pdf` | Architectural Fragility and the Illusion of Cost-Savings: A Critical Analysis of the eGov PH Super App Outage and the Imperative for Enterprise-Grade BC/DR |
| `Editorial Philippine Elections 2025 and Data Privacy.pdf` | Philippine Elections 2025: The Alarming Rise of Unsecured Personal Data Processing |
| `PPML_WP_v1.8.pdf` | Privacy-Preserving Machine Learning in Global Healthcare AI: Breaking the Clinical Validation Bottleneck Without Breaking the Law |

SHA-256 is the integrity reference for Step 49G. Hosted download must match this hash byte-for-byte. Do not upload a copy, rename, or re-export.

Shared integrity flags for all ten:

| Field | Value |
|---|---|
| MIME | `application/pdf` |
| Integrity status | `SOURCE VERIFIED` |
| Hosted binary status | `HOSTED BINARY VERIFIED` |
| Hosted SHA-256 | equals source SHA-256 |
| Original binary rule | `PRESERVE PDF UNCHANGED` |
| Hosted byte size | `HOSTED BYTE SIZE VERIFIED` |
| Media status | `PUBLISHED` |
| Publication status | `PUBLISHED` |
| Public PDF | `VERIFIED` |

## 7. Works

Display order follows `sort_order`.

### 1. Privacy-Preserving Machine Learning in Global Healthcare AI

| Field | Value |
|---|---|
| Title | Privacy-Preserving Machine Learning in Global Healthcare AI: Breaking the Clinical Validation Bottleneck Without Breaking the Law |
| Slug | `privacy-preserving-machine-learning-global-healthcare-ai` |
| Document kind | `white_paper` |
| Track | `all` |
| Year | `2026` |
| Rights | `host_pdf` |
| Sort order | `10` |
| Publication UUID | `6aff00bd-be4c-43cd-9dcf-bc649e919b7f` |
| Media UUID | `34d3775c-4fa8-47d7-bc35-2c995fc1be61` |
| Normalized filename | `privacy-preserving-machine-learning-global-healthcare-ai.pdf` |
| Bucket path | `publication/34d3775c-4fa8-47d7-bc35-2c995fc1be61/privacy-preserving-machine-learning-global-healthcare-ai.pdf` |
| Source status | Owner-supplied previously published original |
| Binary status | HOSTED BINARY VERIFIED |
| Publication status | PUBLISHED |
| Media status | PUBLISHED |
| Original-publication consistency | PRESERVE PDF UNCHANGED |
| Original source filename | `PPML_WP_v1.8.pdf` |
| MIME type | `application/pdf` |
| Byte size | `837948` |
| Page count | `15` |
| SHA-256 | `25a67d3a44edfc94af5d7c41e0630572b565298cb58034b8a746e1f4c262d81c` |
| Integrity status | SOURCE VERIFIED |
| Hosted binary status | HOSTED BINARY VERIFIED |
| Hosted SHA-256 | `25a67d3a44edfc94af5d7c41e0630572b565298cb58034b8a746e1f4c262d81c` |
| Original binary rule | PRESERVE PDF UNCHANGED |
| Hosted byte size | HOSTED BYTE SIZE VERIFIED |
| Public PDF | VERIFIED |
| Abstract | A governance and architecture white paper examining how Federated Learning, Differential Privacy, and Fully Homomorphic Encryption can support clinical AI validation while reducing unnecessary movement of regulated health data. The paper connects privacy engineering, cybersecurity, clinical evidence, patient agency, infrastructure equity, and audit-ready governance. |

### 2. Architectural Fragility and the Illusion of Cost-Savings

| Field | Value |
|---|---|
| Title | Architectural Fragility and the Illusion of Cost-Savings: A Critical Analysis of the eGov PH Super App Outage and the Imperative for Enterprise-Grade BC/DR |
| Slug | `egov-ph-architectural-fragility-bcdr` |
| Document kind | `white_paper` |
| Track | `cybersecurity_grc` |
| Year | `2026` |
| Rights | `host_pdf` |
| Sort order | `20` |
| Publication UUID | `93bc6513-f2e8-436c-9639-0eb59288aca7` |
| Media UUID | `3de3cd93-c729-47e9-8096-99e7974a7d5e` |
| Normalized filename | `egov-ph-architectural-fragility-bcdr.pdf` |
| Bucket path | `publication/3de3cd93-c729-47e9-8096-99e7974a7d5e/egov-ph-architectural-fragility-bcdr.pdf` |
| Source status | Owner-supplied previously published original |
| Binary status | HOSTED BINARY VERIFIED |
| Publication status | PUBLISHED |
| Media status | PUBLISHED |
| Original-publication consistency | PRESERVE PDF UNCHANGED |
| Original source filename | `Critical Analysis of the eGov Outage.pdf` |
| MIME type | `application/pdf` |
| Byte size | `233977` |
| Page count | `19` |
| SHA-256 | `4d2f49bf82ce6daf4f275492c4cc85406cfbe10e50a96ed5da552185f8416fe7` |
| Integrity status | SOURCE VERIFIED |
| Hosted binary status | HOSTED BINARY VERIFIED |
| Hosted SHA-256 | `4d2f49bf82ce6daf4f275492c4cc85406cfbe10e50a96ed5da552185f8416fe7` |
| Original binary rule | PRESERVE PDF UNCHANGED |
| Hosted byte size | HOSTED BYTE SIZE VERIFIED |
| Public PDF | VERIFIED |
| Abstract | A resilience-focused analysis of the eGov PH Super App outage examining cloud capacity, availability, interoperability, identity governance, data protection, sovereign continuity, and business continuity and disaster recovery for national-scale digital services. |

### 3. Leveraging Generative Artificial Intelligence for Privacy Compliance Documentation

| Field | Value |
|---|---|
| Title | Leveraging Generative Artificial Intelligence for Privacy Compliance Documentation: A Governance Oriented Approach for the European Union, the Philippines, and the APEC Region |
| Slug | `generative-ai-privacy-compliance-documentation` |
| Document kind | `white_paper` |
| Track | `privacy_ai` |
| Year | `2025` |
| Rights | `host_pdf` |
| Sort order | `30` |
| Publication UUID | `1908141e-4455-441d-81bd-d2c801ec5f5b` |
| Media UUID | `bb275243-05d5-48af-8113-ee9536ac7429` |
| Normalized filename | `generative-ai-privacy-compliance-documentation.pdf` |
| Bucket path | `publication/bb275243-05d5-48af-8113-ee9536ac7429/generative-ai-privacy-compliance-documentation.pdf` |
| Source status | Owner-supplied previously published original |
| Binary status | HOSTED BINARY VERIFIED |
| Publication status | PUBLISHED |
| Media status | PUBLISHED |
| Original-publication consistency | PRESERVE PDF UNCHANGED |
| Original source filename | `AI for Privacy Documentation.pdf` |
| MIME type | `application/pdf` |
| Byte size | `294920` |
| Page count | `24` |
| SHA-256 | `44ff142399d553003df612b8d86ab3e17223dc161df157ca3a795da6c88b6421` |
| Integrity status | SOURCE VERIFIED |
| Hosted binary status | HOSTED BINARY VERIFIED |
| Hosted SHA-256 | `44ff142399d553003df612b8d86ab3e17223dc161df157ca3a795da6c88b6421` |
| Original binary rule | PRESERVE PDF UNCHANGED |
| Hosted byte size | HOSTED BYTE SIZE VERIFIED |
| Public PDF | VERIFIED |
| Abstract | A governance-oriented white paper examining the use of Generative AI, Retrieval-Augmented Generation, and structured prompting to support privacy compliance documentation across European, Philippine, and Asia-Pacific regulatory environments. |

### 4. Contain the Rumor, Protect the People

| Field | Value |
|---|---|
| Title | Contain the Rumor, Protect the People |
| Slug | `contain-the-rumor-protect-the-people` |
| Document kind | `four_minute_read` |
| Track | `cybersecurity_grc` |
| Year | `2025` |
| Rights | `host_pdf` |
| Sort order | `40` |
| Publication UUID | `8c24bea7-36ed-40d0-b3fe-50c23e7936ab` |
| Media UUID | `b31d3cc2-111f-4f0d-bd56-d19666c0dade` |
| Normalized filename | `contain-the-rumor-protect-the-people.pdf` |
| Bucket path | `publication/b31d3cc2-111f-4f0d-bd56-d19666c0dade/contain-the-rumor-protect-the-people.pdf` |
| Source status | Owner-supplied previously published original |
| Binary status | HOSTED BINARY VERIFIED |
| Publication status | PUBLISHED |
| Media status | PUBLISHED |
| Original-publication consistency | PRESERVE PDF UNCHANGED |
| Original source filename | `4 Minute Read_Cybersecurity & Society Vol. 5.pdf` |
| MIME type | `application/pdf` |
| Byte size | `2531037` |
| Page count | `2` |
| SHA-256 | `bf70d6526760a104c01cf7e3290d2a772c6ecf1e296e2e781bf95102e66bef60` |
| Integrity status | SOURCE VERIFIED |
| Hosted binary status | HOSTED BINARY VERIFIED |
| Hosted SHA-256 | `bf70d6526760a104c01cf7e3290d2a772c6ecf1e296e2e781bf95102e66bef60` |
| Original binary rule | PRESERVE PDF UNCHANGED |
| Hosted byte size | HOSTED BYTE SIZE VERIFIED |
| Public PDF | VERIFIED |
| Abstract | A concise incident-governance analysis of responsible communications during an unverified cyber event, emphasizing evidence discipline, public guidance, regulatory coordination, investigative integrity, and threat-actor incentives. |

### 5. From Data Breach to Boardroom

| Field | Value |
|---|---|
| Title | From Data Breach to Boardroom: Why Cybersecurity Is Now Corporate Governance |
| Slug | `data-breach-to-boardroom-cyber-governance` |
| Document kind | `four_minute_read` |
| Track | `cybersecurity_grc` |
| Year | `2025` |
| Rights | `host_pdf` |
| Sort order | `50` |
| Publication UUID | `25628877-a099-42d1-8812-0e9c705bf62e` |
| Media UUID | `1598966c-b991-4f31-8828-f9e2d4664bc6` |
| Normalized filename | `data-breach-to-boardroom-cyber-governance.pdf` |
| Bucket path | `publication/1598966c-b991-4f31-8828-f9e2d4664bc6/data-breach-to-boardroom-cyber-governance.pdf` |
| Source status | Owner-supplied previously published original |
| Binary status | HOSTED BINARY VERIFIED |
| Publication status | PUBLISHED |
| Media status | PUBLISHED |
| Original-publication consistency | PRESERVE PDF UNCHANGED |
| Original source filename | `4 Minute Read_Cybersecurity & Society Vol. 2.pdf` |
| MIME type | `application/pdf` |
| Byte size | `12033529` |
| Page count | `3` |
| SHA-256 | `ae22d821e3d0396bdef29dede6dcc5c015692b7e7de212d1bfbc2850764cde31` |
| Integrity status | SOURCE VERIFIED |
| Hosted binary status | HOSTED BINARY VERIFIED |
| Hosted SHA-256 | `ae22d821e3d0396bdef29dede6dcc5c015692b7e7de212d1bfbc2850764cde31` |
| Original binary rule | PRESERVE PDF UNCHANGED |
| Hosted byte size | HOSTED BYTE SIZE VERIFIED |
| Public PDF | VERIFIED |
| Abstract | A short professional analysis framing cybersecurity incidents as governance, resilience, accountability, regulatory, business-continuity, and trust issues rather than purely technical failures. |

### 6. From Orb to Oversight

| Field | Value |
|---|---|
| Title | From Orb to Oversight: Why the NPC Paused World App |
| Slug | `orb-to-oversight-world-app-privacy` |
| Document kind | `four_minute_read` |
| Track | `privacy_ai` |
| Year | `2025` |
| Rights | `host_pdf` |
| Sort order | `60` |
| Publication UUID | `ad297187-e3c6-4317-a72f-bc661632e226` |
| Media UUID | `ba78a7f8-834d-4e85-a63f-78de5c5af0a1` |
| Normalized filename | `orb-to-oversight-world-app-privacy.pdf` |
| Bucket path | `publication/ba78a7f8-834d-4e85-a63f-78de5c5af0a1/orb-to-oversight-world-app-privacy.pdf` |
| Source status | Owner-supplied previously published original |
| Binary status | HOSTED BINARY VERIFIED |
| Publication status | PUBLISHED |
| Media status | PUBLISHED |
| Original-publication consistency | PRESERVE PDF UNCHANGED |
| Original source filename | `4 Minute Read_Cybersecurity & Society Vol. 3.pdf` |
| MIME type | `application/pdf` |
| Byte size | `1418207` |
| Page count | `3` |
| SHA-256 | `fb2762c6bcdb6d0ed0e5c2207ae0a038639959a4d266bc790fc715a4df1b5224` |
| Integrity status | SOURCE VERIFIED |
| Hosted binary status | HOSTED BINARY VERIFIED |
| Hosted SHA-256 | `fb2762c6bcdb6d0ed0e5c2207ae0a038639959a4d266bc790fc715a4df1b5224` |
| Original binary rule | PRESERVE PDF UNCHANGED |
| Hosted byte size | HOSTED BYTE SIZE VERIFIED |
| Public PDF | VERIFIED |
| Abstract | A privacy-governance analysis of biometric processing, consent, transparency, proportionality, irreversible identity risk, and regulatory oversight through the World App and Orb case in the Philippines. |

### 7. You Are Easier to Hack Than Everything

| Field | Value |
|---|---|
| Title | You Are Easier to Hack Than Everything |
| Slug | `you-are-easier-to-hack-than-everything` |
| Document kind | `four_minute_read` |
| Track | `cybersecurity_grc` |
| Year | `2025` |
| Rights | `host_pdf` |
| Sort order | `70` |
| Publication UUID | `cd76c098-66b3-4a80-a621-35a0181ab18e` |
| Media UUID | `52e8ba31-0122-4a09-b09e-e5fb16d102f7` |
| Normalized filename | `you-are-easier-to-hack-than-everything.pdf` |
| Bucket path | `publication/52e8ba31-0122-4a09-b09e-e5fb16d102f7/you-are-easier-to-hack-than-everything.pdf` |
| Source status | Owner-supplied previously published original |
| Binary status | HOSTED BINARY VERIFIED |
| Publication status | PUBLISHED |
| Media status | PUBLISHED |
| Original-publication consistency | PRESERVE PDF UNCHANGED |
| Original source filename | `4 Minute Read_Cybersecurity & Society Vol. 1.pdf` |
| MIME type | `application/pdf` |
| Byte size | `3288273` |
| Page count | `3` |
| SHA-256 | `90ba7ab0769b073c3d6ec6f48b2050d5a1b5caf60a33ebdc8587bf37ce6998ba` |
| Integrity status | SOURCE VERIFIED |
| Hosted binary status | HOSTED BINARY VERIFIED |
| Hosted SHA-256 | `90ba7ab0769b073c3d6ec6f48b2050d5a1b5caf60a33ebdc8587bf37ce6998ba` |
| Original binary rule | PRESERVE PDF UNCHANGED |
| Hosted byte size | HOSTED BYTE SIZE VERIFIED |
| Public PDF | VERIFIED |
| Abstract | An accessible cybersecurity piece examining social engineering, human-centered attack techniques, organizational awareness, verification controls, and practical defenses against manipulation-based intrusion. |

### 8. Before Blocks, Build the Bedrock

| Field | Value |
|---|---|
| Title | Before Blocks, Build the Bedrock: Why Blockchain Shouldn't Lead Philippine Budget Reform—Yet |
| Slug | `before-blocks-build-the-bedrock` |
| Document kind | `editorial` |
| Track | `cybersecurity_grc` |
| Year | `2025` |
| Rights | `host_pdf` |
| Sort order | `80` |
| Publication UUID | `d018f779-c07d-4a85-945d-b644b3d3e33e` |
| Media UUID | `9980ca4b-c0ff-45b9-bfb3-283ffdedcf7d` |
| Normalized filename | `before-blocks-build-the-bedrock.pdf` |
| Bucket path | `publication/9980ca4b-c0ff-45b9-bfb3-283ffdedcf7d/before-blocks-build-the-bedrock.pdf` |
| Source status | Owner-supplied previously published original |
| Binary status | HOSTED BINARY VERIFIED |
| Publication status | PUBLISHED |
| Media status | PUBLISHED |
| Original-publication consistency | PRESERVE PDF UNCHANGED |
| Original source filename | `Before Blocks.pdf` |
| MIME type | `application/pdf` |
| Byte size | `2938493` |
| Page count | `4` |
| SHA-256 | `d0a84e9836af51334dd73cc614102ad83a7112b0e8d28b73d1ff32addddd2515` |
| Integrity status | SOURCE VERIFIED |
| Hosted binary status | HOSTED BINARY VERIFIED |
| Hosted SHA-256 | `d0a84e9836af51334dd73cc614102ad83a7112b0e8d28b73d1ff32addddd2515` |
| Original binary rule | PRESERVE PDF UNCHANGED |
| Hosted byte size | HOSTED BYTE SIZE VERIFIED |
| Public PDF | VERIFIED |
| Abstract | An editorial arguing that public-sector digital reform should prioritize institutional capacity, interoperable and reliable data, security controls, auditability, and workforce readiness before adopting blockchain as a trust mechanism. |

### 9. The Price of Ubiquity

| Field | Value |
|---|---|
| Title | The Price of Ubiquity: GCash Is Now Critical Infrastructure |
| Slug | `price-of-ubiquity-gcash-critical-infrastructure` |
| Document kind | `four_minute_read` |
| Track | `cybersecurity_grc` |
| Year | `2025` |
| Rights | `host_pdf` |
| Sort order | `90` |
| Publication UUID | `5cb691fd-d699-48cc-867d-ac20c77d8845` |
| Media UUID | `880703b6-29cb-440a-b60e-8568a76b0a71` |
| Normalized filename | `price-of-ubiquity-gcash-critical-infrastructure.pdf` |
| Bucket path | `publication/880703b6-29cb-440a-b60e-8568a76b0a71/price-of-ubiquity-gcash-critical-infrastructure.pdf` |
| Source status | Owner-supplied previously published original |
| Binary status | HOSTED BINARY VERIFIED |
| Publication status | PUBLISHED |
| Media status | PUBLISHED |
| Original-publication consistency | PRESERVE PDF UNCHANGED |
| Original source filename | `4 Minute Read_Cybersecurity & Society Vol. 4.pdf` |
| MIME type | `application/pdf` |
| Byte size | `5329293` |
| Page count | `3` |
| SHA-256 | `64828378cb4991e6110284b081f489c57b5154e52ece81d1c5987ad0c55e2bf0` |
| Integrity status | SOURCE VERIFIED |
| Hosted binary status | HOSTED BINARY VERIFIED |
| Hosted SHA-256 | `64828378cb4991e6110284b081f489c57b5154e52ece81d1c5987ad0c55e2bf0` |
| Original binary rule | PRESERVE PDF UNCHANGED |
| Hosted byte size | HOSTED BYTE SIZE VERIFIED |
| Public PDF | VERIFIED |
| Abstract | A contemporaneous cybersecurity and public-trust analysis of the risk created when a widely used digital-payment platform becomes socially and economically critical infrastructure. |

### 10. Philippine Elections 2025

| Field | Value |
|---|---|
| Title | Philippine Elections 2025: The Alarming Rise of Unsecured Personal Data Processing |
| Slug | `philippine-elections-2025-data-privacy` |
| Document kind | `editorial` |
| Track | `privacy_ai` |
| Year | `2025` |
| Rights | `host_pdf` |
| Sort order | `100` |
| Publication UUID | `0133a00f-c307-4135-8bdb-48018bb9161d` |
| Media UUID | `8af86f88-8595-4812-8177-47ca30778300` |
| Normalized filename | `philippine-elections-2025-data-privacy.pdf` |
| Bucket path | `publication/8af86f88-8595-4812-8177-47ca30778300/philippine-elections-2025-data-privacy.pdf` |
| Source status | Owner-supplied previously published original |
| Binary status | HOSTED BINARY VERIFIED |
| Publication status | PUBLISHED |
| Media status | PUBLISHED |
| Original-publication consistency | PRESERVE PDF UNCHANGED |
| Original source filename | `Editorial Philippine Elections 2025 and Data Privacy.pdf` |
| MIME type | `application/pdf` |
| Byte size | `5666770` |
| Page count | `4` |
| SHA-256 | `78200a44643572f06c9d65ba8e644ab2356cafcd9679e22614115e004381ead0` |
| Integrity status | SOURCE VERIFIED |
| Hosted binary status | HOSTED BINARY VERIFIED |
| Hosted SHA-256 | `78200a44643572f06c9d65ba8e644ab2356cafcd9679e22614115e004381ead0` |
| Original binary rule | PRESERVE PDF UNCHANGED |
| Hosted byte size | HOSTED BYTE SIZE VERIFIED |
| Public PDF | VERIFIED |
| Abstract | An editorial on privacy risk in election-period and public-assistance data processing, focusing on identification data, public disclosure, health information, proportionality, data minimization, and citizen awareness. |

## 8. Source-of-truth boundary

| Concern | Authority |
|---|---|
| Original PDF content | Owner-supplied binary, unchanged |
| Portfolio title | Metadata, matching original title |
| Portfolio abstract | Derived presentation summary |
| Type / track / sort | Portfolio curation |
| Rights | Owner-confirmed `host_pdf` |
| Publication status | Published in Step 49G. `/writing` index remains static NCSP until 49H. |
| Website byline | Helper fallback while `author` is NULL |

Do not conflate metadata curation with editing the work.

## 9. What Step 49G does not do

- Cut over `/writing` to hosted publications
- Create an NCSP hosted row
- Modify Home, Focus, About, Experience, Projects, Credentials, Resume, or Contact
- Modify schema, Storage bucket, MIME allowlist, size limit, or Storage policies
- Copy or edit source PDFs
- Implement the provenance line on `/writing/[slug]`
- Push or deploy
