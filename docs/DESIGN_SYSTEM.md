# Design System

**Subject:** Rainier (Ram) Milanes public portfolio  
**Phase:** 2 — Product / design specification  
**Date:** 29 August 2026  
**Status:** Implementation reference for the public-site shell. Dark mode is intentionally omitted.

The visual system should read as an executive technology brief: cybersecurity and governance credibility without hacker theater, privacy and AI-governance sophistication without a startup landing page.

---

## 1. Principles

1. **Typography first.** Hierarchy does the work that decoration usually tries to do.
2. **Paper, ink, and one restrained accent.** Warm off-white field, deep navy type, deep teal for emphasis only.
3. **Generous whitespace.** Sections breathe. Recruiters scan; they do not hunt.
4. **One identity, two doors.** Focus pathways are clear without splitting the brand.
5. **Evidence over ornament.** Cards, metrics, and case-study structure carry proof.
6. **Accessible by default.** WCAG 2.2 AA contrast, visible focus, reduced motion, semantic HTML.
7. **Photograph-ready.** The hero reserves a portrait slot; the placeholder is clearly not a person.

---

## 2. Color

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F4F1EA` | Page background |
| `--paper-elevated` | `#FFFcf7` | Cards, header, elevated surfaces |
| `--ink` | `#122033` | Primary text, primary buttons |
| `--ink-soft` | `#3E4B5C` | Body copy, secondary labels |
| `--ink-faint` | `#6B7583` | Meta, dates, captions |
| `--line` | `#D5CFC3` | Borders, rules |
| `--accent` | `#1B5551` | Links, chips, pathway emphasis (not neon green) |
| `--accent-soft` | `#E4EEEC` | Accent wash, selected chips |
| `--copper` | `#7C5340` | Rare label color (section kicker) |
| `--focus` | `#1B5551` | Focus ring, matches accent |
| `--danger` | `#8A2F2B` | Form errors later; unused in this phase |

**Contrast:** Ink on paper and paper-elevated on ink exceed 7:1 for body text. Accent teal is used on paper or as text at large/medium sizes only; small accent text sits on `--accent-soft` or uses ink.

**Do not use:** neon green, cyan glows, black-hat palettes, rainbow gradients, or dark-mode inversion in this phase.

---

## 3. Typography

| Role | Family | Notes |
|---|---|---|
| Display / page titles | Source Serif 4 | 1.15 line-height; tracking tight on large sizes |
| UI / body | Geist Sans | 1.6 line-height for body |
| Mono (rare) | Geist Mono | Stack names only |

Scale (approximate, desktop):

| Step | Size | Weight | Use |
|---|---|---|---|
| Display | 2.75–3.5rem | 560 | Home hero |
| H1 | 2.25rem | 560 | Page titles |
| H2 | 1.5rem | 560 | Section titles |
| H3 | 1.125rem | 550 | Card titles |
| Body | 1.0625rem | 400 | Paragraphs |
| Small | 0.8125rem | 500 | Meta, kickers, chips |

Mobile display steps down one increment. Body never goes below 16px.

---

## 4. Layout

| Token | Value |
|---|---|
| `--container` | `72rem` (1152px) |
| `--container-narrow` | `42rem` (reading column) |
| Page gutter | `1.25rem` mobile / `2rem` desktop |
| Section padding | `4.5rem` mobile / `6.5rem` desktop |
| Header height | `4rem` |

**Grid:** 12-column mental model. Common patterns: 7/5 hero, 6/6 pathways, 4/4/4 metrics, 8/4 featured project.

**Breakpoints** (Tailwind defaults): `sm` 640, `md` 768, `lg` 1024, `xl` 1280. Primary layout shift at `lg` (nav, hero split).

---

## 5. Surfaces

**Cards**

- Background: `--paper-elevated`
- Border: `1px solid var(--line)`
- Radius: `0.75rem`
- Shadow: `0 1px 2px rgb(18 32 51 / 4%), 0 8px 24px rgb(18 32 51 / 4%)`
- Hover (interactive only): slightly deeper shadow; no lift theater
- Padding: `1.5rem` / `1.75rem`

**Rules:** 1px `--line` full-bleed inside the container for section breaks when a card grid is not used.

**Header:** elevated paper, 1px bottom line, no blur/glass.

---

## 6. Buttons and links

| Variant | Treatment |
|---|---|
| Primary | Ink fill, paper text, 44px min height |
| Secondary | Transparent, ink text, 1px ink/line border |
| Accent | Accent fill, paper text — reserved for Contact |
| Text | Accent or ink underline on hover; never color-only |

Radius: `999px` for primary CTAs (approachable, not playful); `0.5rem` for compact inline actions.

---

## 7. Navigation

- Desktop: wordmark left; primary links center-right; Resume text + Contact accent button
- Mobile: wordmark + menu button; full-screen sheet with the same links and a close control
- Active route: ink weight 600 + short accent underline
- Work authorization lives in the footer and contact surfaces, not the nav bar
- Primary nav stays short: About, Experience, Projects, Writing, Credentials. Resume and Contact are actions. Focus pages live on Home and in the footer.

---

## 8. Section rhythm

1. Optional copper kicker (small caps / tracked small)
2. Serif H2
3. One-sentence lede in `--ink-soft` (max ~70ch)
4. Content block (grid or stack)
5. Optional text link

Homepage order is fixed in `PORTFOLIO_STRATEGY.md` / the Phase 2 brief: Hero → Pathways → Impact → PrivAI Guard → Experience → Credentials → Writing → Contact.

---

## 9. Focus, motion, icons

**Focus:** 2px solid `--focus` offset 2px. Never remove outlines.

**Motion:** 150–200ms opacity/transform on interactive hover only. Honor `prefers-reduced-motion: reduce` (no transform, instant color). No hero animation, no particle fields, no scroll hijacking.

**Icons:** Stroke icons only, 20–24px, currentColor. Used for LinkedIn, email, external link, menu. No stock shield / lock / skull cybersecurity clip art.

---

## 10. Portrait slot

The hero includes a reserved 1:1 frame (`max-width` ~20rem). Until a real headshot is added:

- Neutral paper/ink geometric panel
- Initials “RM” in serif
- Visible caption: “Portrait to be added”
- Never a generated face or stock headshot

---

## 11. Accessibility checklist

- Landmark regions: banner, nav, main, contentinfo
- One H1 per page
- Skip link as the first focusable control
- Link text that makes sense out of context (“Read the PrivAI Guard case study”, not “Read more” alone)
- Form controls labeled; current contact form is inert and announced as forthcoming
- Target size ≥ 44×44px for nav and primary buttons
- Text zoom to 200% without loss of content
