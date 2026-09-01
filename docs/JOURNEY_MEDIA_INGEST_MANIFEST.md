# Journey Media Ingest Manifest

## 1. Purpose

Step 50C local integrity baseline and approved web-derivative freeze for the Professional Journey visual set.

This manifest is the only Git artifact from Step 50C. It records provenance hashes, approved derivative hashes, rights, captions, and transform notes so a later hosted upload can place **exact derivative bytes** into `public-media`.

It does **not** create media rows, Storage objects, or About/Home cutover.

## 2. Frozen architecture

| Layer | Location | Role |
|---|---|---|
| Original | `/Users/mbair_ram/Documents/rainier-portfolio-journey-intake` (outside Git) | Archival source. Hash is provenance only. |
| Derivative | `/Users/mbair_ram/Documents/rainier-portfolio-journey-derivatives` (outside Git) | Approved sanitized WebP. Hash is the future hosted binary baseline. |
| Git | `docs/JOURNEY_MEDIA_INGEST_MANIFEST.md` only | Contract and integrity record. |
| Hosted (later) | `public-media` | Must equal the derivative SHA-256 and byte size exactly. |

Do not require the hosted object to equal the original source. That distinction is intentional and differs from publication PDFs.

Intended later Storage path shape (UUIDs not assigned in this step):

`{purpose}/{media_uuid}/{normalized_filename}`

with `purpose` of `portrait` or `journey`.

Do not invent UUIDs or `bucket_path` values here.

## 3. Workflow metadata

| Field | Value |
|---|---|
| Date | 2026-08-31 |
| Step | 50C — Local image integrity and web derivative preparation |
| Repository | `/Users/mbair_ram/Documents/rainier-portfolio` |
| Branch | `main` |
| Foundation HEAD | `020e22fea413297f8d372f3f9b1aa372c5db55ea` (`feat: tailor focus writing evidence`) |
| Rights confirmation | Explicit owner confirmation during Step 50C: all six selected assets **CLEARED FOR REPUBLICATION** |
| Upload status | `NOT YET UPLOADED` |
| Media row status | `NOT YET CREATED` |
| About / Home | Unchanged |

## 4. Rights statement

All six selected assets are **CLEARED FOR REPUBLICATION** based on explicit owner confirmation dated in this workflow.

This manifest does not invent a license, photographer contract, or institutional release text.

Unknown photographer credit does **not** change rights status.

Future `media_assets.credit` remains `NULL` until the owner supplies a required or meaningful attribution.

## 5. Tooling

| Tool | Version / role |
|---|---|
| `sips` | macOS; HEIC/JPEG decode to a working JPEG only |
| `ffmpeg` | 8.0; bake EXIF orientation into pixels, crop, resize, strip container metadata |
| `cwebp` | 1.6.0; WebP encode at quality 80, `-metadata none` |
| `exiftool` | 13.36; metadata classification |
| SHA-256 | `hashlib` / `shasum` |

Working JPEGs lived only in `/tmp` and are not approved derivatives.

Allowed transforms only: orientation normalization, crop, resize, WebP encode, metadata strip. No generative fill, face work, upscaling, person removal, or background replacement.

## 6. Shared derivative contract

| Field | Portrait | Journey |
|---|---|---|
| `kind` | `image` | `image` |
| `purpose` | `portrait` | `journey` |
| MIME | `image/webp` | `image/webp` |
| Long edge | 1200–1600px | 1600–2000px where source permits; never upscale |
| Quality | ~80 | ~80 |
| Public metadata | stripped | stripped |
| Credit | `NOT PROVIDED` → future `NULL` | `NOT PROVIDED` → future `NULL` |
| Rights | `CLEARED` | `CLEARED` |
| Upload | `NOT YET UPLOADED` | `NOT YET UPLOADED` |
| Media row | `NOT YET CREATED` | `NOT YET CREATED` |

## 7. Selected assets

Display / timeline order follows the Step 50B freeze: portrait, then Journey 1–5.

### Portrait — Professional portrait

| Field | Value |
|---|---|
| Selection role | Primary portrait |
| Source filename | `Formal Headshot.JPG` |
| Original SHA-256 | `f82c6a847f8182b71f20c470d79a07ff80cc5779c128c3ae31e541deca55413e` |
| Original bytes | `5206339` |
| Original MIME | `image/jpeg` |
| Original dimensions | 3712 × 5568 |
| Displayed orientation | Portrait; EXIF Horizontal (normal) |
| EXIF classification | EXIF PRESENT; CAMERA METADATA PRESENT; CREATOR/COPYRIGHT ABSENT |
| GPS | ABSENT |
| Rights | `CLEARED` |
| Intended purpose | `portrait` |
| Administrative title | Professional portrait |
| Caption | none |
| Alt | `Professional portrait of Rainier Milanes.` |
| Year label | omit / future `NULL` |
| Credit | `NOT PROVIDED` |
| Derivative filename | `rainier-milanes-portrait.webp` |
| Transformations | Bake/strip metadata; resize long edge to 1600px; WebP q80. No square bake. No retouching. |
| Crop notes | None. Master remains portrait-oriented so Home can CSS-crop square and About can show the larger frame from one asset. |
| Derivative SHA-256 | `db62540e06b24ea05c4e971258df4f99e3ab2cb65339adb861a4dba70aa3bfb4` |
| Derivative bytes | `34440` |
| Derivative dimensions | 1067 × 1600 |
| Derivative MIME | `image/webp` |
| Metadata sanitized | PASS |
| Visual QA | PASS |
| Upload status | `NOT YET UPLOADED` |
| Media row status | `NOT YET CREATED` |
| Intended public surfaces | Home portrait slot; About portrait |

### Journey 1 — ANU cybersecurity study

| Field | Value |
|---|---|
| Selection role | Journey 1 — recent technical / education identity |
| Source filename | `ANU Cybersecurity.jpg` |
| Original SHA-256 | `8d16fac36f98a1f50df1de1cf68b736f201b6ab3cc6ccb786de96cf55953e24e` |
| Original bytes | `199808` |
| Original MIME | `image/jpeg` |
| Original dimensions | 1200 × 1600 |
| Displayed orientation | Portrait |
| EXIF classification | EXIF ABSENT |
| GPS | ABSENT |
| Rights | `CLEARED` |
| Intended purpose | `journey` |
| Administrative title | ANU cybersecurity study |
| Caption | Completing cybersecurity study at ANU’s National Security College. |
| Alt | Rainier Milanes standing with another adult beside an Australian National University National Security College banner, holding a certificate. |
| Year label | `PENDING OWNER CONTEXT` — future `NULL` |
| Credit | `NOT PROVIDED` |
| Derivative filename | `anu-cybersecurity-study.webp` |
| Transformations | Metadata strip; WebP q80 at native size. **No upscale.** |
| Crop notes | None. Other adult retained; certificate and National Security College / ANU banner retained. No person removal. |
| Derivative SHA-256 | `25cf2d1994ff4afc3a01e793292a717cdb8d126261aff60bc369796c6b32014f` |
| Derivative bytes | `83854` |
| Derivative dimensions | 1200 × 1600 |
| Derivative MIME | `image/webp` |
| Metadata sanitized | PASS |
| Visual QA | PASS |
| Upload status | `NOT YET UPLOADED` |
| Media row status | `NOT YET CREATED` |
| Intended public surfaces | About Journey timeline, position 1 |

### Journey 2 — Decode 2024 media interview

| Field | Value |
|---|---|
| Selection role | Journey 2 — current professional communication |
| Source filename | `National Media Interview.jpg` |
| Original SHA-256 | `f8869086ce5e40079c2a84f9c81e4a073314590b1b358c4b1ccad57c769ebb5f` |
| Original bytes | `229009` |
| Original MIME | `image/jpeg` |
| Original dimensions | 1600 × 1580 |
| Displayed orientation | Near-square landscape |
| EXIF classification | EXIF PRESENT; CAMERA METADATA ABSENT |
| GPS | ABSENT |
| Rights | `CLEARED` |
| Intended purpose | `journey` |
| Administrative title | Decode 2024 media interview |
| Caption | Speaking with national media at Decode 2024. |
| Alt | Rainier Milanes speaking during a media interview in front of a Decode 2024 event screen. |
| Year label | `2024` |
| Credit | `NOT PROVIDED` |
| Derivative filename | `decode-2024-media-interview.webp` |
| Transformations | Metadata strip; WebP q80 at native size. **No upscale.** |
| Crop notes | None. Foreground adults remain as backs of heads. Event badge is visible but not practically readable as personal data at the 1600px web size; crop not required. No blur. |
| Derivative SHA-256 | `cf57f1c618513c9dc5d906c0ac0762811f715dbac50ebea955b90f3b2a4b9943` |
| Derivative bytes | `251292` |
| Derivative dimensions | 1600 × 1580 |
| Derivative MIME | `image/webp` |
| Metadata sanitized | PASS |
| Visual QA | PASS |
| Upload status | `NOT YET UPLOADED` |
| Media row status | `NOT YET CREATED` |
| Intended public surfaces | About Journey timeline, position 2 |

### Journey 3 — Global privacy assembly session

| Field | Value |
|---|---|
| Selection role | Journey 3 — privacy professional engagement |
| Source filename | `Global Privacy Assembly.HEIC` |
| Original SHA-256 | `a8ea6a72c3e77d38daec738d344a8cbf24826346d11f0cd096c8cc240338d66a` |
| Original bytes | `2553623` |
| Original MIME | `image/heic` |
| Original dimensions | 5712 × 4284 |
| Displayed orientation | Landscape; EXIF Horizontal (normal) |
| EXIF classification | EXIF PRESENT; CAMERA METADATA PRESENT |
| GPS | ABSENT |
| Rights | `CLEARED` |
| Intended purpose | `journey` |
| Administrative title | Global privacy assembly session |
| Caption | Speaking on global privacy from the lectern. |
| Alt | Rainier Milanes speaking at a lectern during a global privacy session. |
| Year label | `2025` |
| Credit | `NOT PROVIDED` |
| Derivative filename | `global-privacy-assembly-session.webp` |
| Transformations | HEIC → working JPEG; orientation already normal; resize long edge 2000px; metadata strip; WebP q80. |
| Crop notes | None. Owner + lectern + session wall retained. Wall text may be sacrificed later by CSS on narrow viewports. |
| Derivative SHA-256 | `94e9d91ebcbce02dcfa4cd243e07fd225d18a6fb64cb4ac73307ff449144e80b` |
| Derivative bytes | `210906` |
| Derivative dimensions | 2000 × 1500 |
| Derivative MIME | `image/webp` |
| Metadata sanitized | PASS |
| Visual QA | PASS |
| Upload status | `NOT YET UPLOADED` |
| Media row status | `NOT YET CREATED` |
| Intended public surfaces | About Journey timeline, position 3 |

### Journey 4 — APEC Peru digital economy meeting

| Field | Value |
|---|---|
| Selection role | Journey 4 — international digital-economy context |
| Source filename | `Apec Peru.HEIC` |
| Original SHA-256 | `c915310cd8af8df8c61e69e4756511efe113763a347858deb5a51a3e7f9452e9` |
| Original bytes | `2893011` |
| Original MIME | `image/heic` |
| Original dimensions | 5712 × 4284 stored; displayed 4284 × 5712 after Rotate 90 CW |
| Displayed orientation | Portrait after EXIF autorotate |
| EXIF classification | EXIF PRESENT; CAMERA METADATA PRESENT |
| GPS | ABSENT |
| Rights | `CLEARED` |
| Intended purpose | `journey` |
| Administrative title | APEC Peru digital economy meeting |
| Caption | At the APEC digital-economy meeting in Peru, 2024. |
| Alt | Rainier Milanes seated at a conference table during an APEC digital-economy meeting. |
| Year label | `2024` |
| Credit | `NOT PROVIDED` |
| Derivative filename | `apec-peru-digital-economy.webp` |
| Transformations | HEIC → working JPEG; bake Rotate 90 CW into pixels; crop `2680×4700` at offset `(60,650)` on the oriented 4284×5712 frame to remove the right-side LED credential band; resize long edge 2000px; metadata strip; WebP q80. |
| Crop notes | **Mandatory privacy crop.** Right-side LED network-credential region excluded entirely (oriented-frame x ≳ 0.70). Owner, table, Philippines nameplate context, and left-side APEC branding retained. Edge participants outside the crop are dropped by framing, not by person-removal editing. |
| Derivative SHA-256 | `fa1afb1e3ad736e626106937636ba56127248d1dd55bdb3b913543b640cacb54` |
| Derivative bytes | `164764` |
| Derivative dimensions | 1140 × 2000 |
| Derivative MIME | `image/webp` |
| Metadata sanitized | PASS |
| Visual QA | PASS — no readable network credentials in the derivative (OCR + close-up inspection). Credential values are not recorded in this manifest. |
| Upload status | `NOT YET UPLOADED` |
| Media row status | `NOT YET CREATED` |
| Intended public surfaces | About Journey timeline, position 4 |

### Journey 5 — GSMA Ministerial Programme 2023

| Field | Value |
|---|---|
| Selection role | Journey 5 — earlier international communication |
| Source filename | `GSMA Speech.HEIC` |
| Original SHA-256 | `e0f905a6a3778b752c2e859d07fda55d05427fe1f0cb47caf8eacd8a2c1b5c16` |
| Original bytes | `875967` |
| Original MIME | `image/heic` |
| Original dimensions | 4032 × 3024 stored; displayed 3024 × 4032 after Rotate 90 CW |
| Displayed orientation | Portrait after EXIF autorotate |
| EXIF classification | EXIF PRESENT; CAMERA METADATA PRESENT |
| GPS | ABSENT |
| Rights | `CLEARED` |
| Intended purpose | `journey` |
| Administrative title | GSMA Ministerial Programme 2023 |
| Caption | Speaking at the GSMA Ministerial Programme in 2023. |
| Alt | Rainier Milanes speaking at a GSMA Ministerial Programme podium. |
| Year label | `2023` |
| Credit | `NOT PROVIDED` |
| Derivative filename | `gsma-ministerial-programme-2023.webp` |
| Transformations | HEIC → working JPEG; bake Rotate 90 CW into pixels; resize long edge 2000px; metadata strip; WebP q80. |
| Crop notes | None. Owner, podium, and GSMA / MWC context retained. |
| Derivative SHA-256 | `36c165dc2552dc76f1e7b53f78889575e60bff57b85699d4e9f8107652f28b88` |
| Derivative bytes | `69486` |
| Derivative dimensions | 1500 × 2000 |
| Derivative MIME | `image/webp` |
| Metadata sanitized | PASS |
| Visual QA | PASS |
| Upload status | `NOT YET UPLOADED` |
| Media row status | `NOT YET CREATED` |
| Intended public surfaces | About Journey timeline, position 5 |

## 8. Integrity model

| Artifact | Hash meaning |
|---|---|
| Original SHA-256 | Provenance of the untouched intake file. Recomputed after derivation: 6/6 unchanged. |
| Derivative SHA-256 | Approved public binary. Future Storage upload must match this hash and byte size. |
| Hosted object (later) | Must equal the derivative, not the original. |

## 9. Credit / year handling

| Asset | Credit | Year |
|---|---|---|
| Portrait | `NOT PROVIDED` | omit |
| ANU cybersecurity study | `NOT PROVIDED` | `PENDING OWNER CONTEXT` |
| Decode 2024 media interview | `NOT PROVIDED` | `2024` |
| Global privacy assembly session | `NOT PROVIDED` | `2025` |
| APEC Peru digital economy meeting | `NOT PROVIDED` | `2024` |
| GSMA Ministerial Programme 2023 | `NOT PROVIDED` | `2023` |

Do not infer the ANU year from file-copy timestamps.

## 10. People contract

No person was digitally removed.

- ANU: other adult remains; not identified in alt or caption.
- Decode 2024: foreground adults remain as backs of heads; not identified.
- APEC: right-side hall/LED area removed by crop only.

## 11. Reserves (not processed)

The following remain intake reserves only. No derivative. No hash freeze required for 50C.

- `Lecture on Cyberattacks.JPG`
- `MSIS Grad Regalia.JPG`
- `Point Zero Forum.heic`

The other 16 intake candidates were not touched.

## 12. Hosted / UI freeze

After Step 50C:

| Check | Expected |
|---|---|
| `media_assets` | 10 publication documents |
| Portrait rows | 0 |
| Journey rows | 0 |
| Storage objects | 10 |
| About / Home / Writing / Focus | unchanged |

Step 50D may draft media rows and upload these exact six WebP files. It must not publish them or cut About/Home in the same step.
