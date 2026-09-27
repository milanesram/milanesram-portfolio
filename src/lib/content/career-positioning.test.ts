import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../../..");

function source(path: string): string {
  return readFileSync(resolve(root, path), "utf8");
}

const HOME = source("src/app/page.tsx");
const ABOUT = source("src/app/about/page.tsx");
const CONTACT = source("src/app/contact/page.tsx");
const RESUME = source("src/app/resume/page.tsx");
const METADATA = source("src/lib/metadata.ts");
const ROUTES = source("src/content/site.ts");
const SCHEMA = source(
  "supabase/migrations/20260925193000_add_home_hero_kicker.sql",
);
const MIGRATION = source(
  "supabase/migrations/20260925193100_align_career_positioning_v40.sql",
);
const RESUME_ASSETS = source(
  "supabase/migrations/20260926021000_publish_resume_v40_assets.sql",
);

describe("career positioning 2.0", () => {
  it("renders homepage sections in the approved order", () => {
    const markers = [
      "<HomeHero",
      'aria-label="Current signals"',
      "home.experienceSection.kicker",
      'id="role-focus"',
      'aria-label="Selected work"',
      "home.credentialsSection.kicker",
      "home.closing.heading",
    ];
    let previous = -1;

    for (const marker of markers) {
      const index = HOME.indexOf(marker);
      expect(index, marker).toBeGreaterThan(previous);
      previous = index;
    }

    expect(HOME.indexOf("<HomeFlagshipProject")).toBeGreaterThan(
      HOME.indexOf('id="role-focus"'),
    );
    expect(HOME).toContain("eyebrow={home.heroKicker}");
  });

  it("targets hosted rows by stable keys instead of seed child ids", () => {
    const staleChildIds = [
      "c52b0001-0000-4000-8000-000000000011",
      "c52b0001-0000-4000-8000-000000000014",
      "c52b0001-0000-4000-8000-000000000015",
      "c52b0001-0000-4000-8000-000000000021",
      "c52b0001-0000-4000-8000-000000000022",
      "c52b0001-0000-4000-8000-000000000023",
      "c52b0001-0000-4000-8000-000000000024",
      "c52c0001-0000-4000-8000-000000000011",
      "c52c0001-0000-4000-8000-000000000012",
      "c52c0001-0000-4000-8000-000000000013",
    ];

    for (const id of staleChildIds) {
      expect(MIGRATION, id).not.toContain(id);
    }

    expect(MIGRATION).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );
    expect(MIGRATION).toContain("singleton_key = 'default'");
    expect(MIGRATION).toContain("sort_order = 10 AND label = $t$Cybersecurity$t$");
    expect(MIGRATION).toContain("slug = 'cybersecurity-grc'");
    expect(MIGRATION).toContain("slug = 'privacy-ai-governance'");
    expect(MIGRATION).toContain("slug = 'privai-guard'");
    expect(MIGRATION).toContain("slug = 'dbnms'");
    expect(MIGRATION).toContain("page_key = 'home'");
    expect(MIGRATION).toContain("SELECT id INTO STRICT home_id");
    expect(MIGRATION.indexOf("Content writes begin")).toBeGreaterThan(
      MIGRATION.indexOf("audited pre-V4 state"),
    );
  });

  it("keeps the schema migration free of career-content cutover", () => {
    expect(SCHEMA).toContain("ADD COLUMN IF NOT EXISTS hero_kicker text");
    expect(SCHEMA).toContain("hero_kicker IS NULL");
    expect(SCHEMA).not.toContain("SET NOT NULL");
    expect(SCHEMA).not.toContain("READY NOW. BUILT TO ADAPT.");
    expect(SCHEMA).not.toContain("UPDATE public.");
    expect(MIGRATION).toContain("READY NOW. BUILT TO ADAPT.");
    expect(MIGRATION).not.toContain("ADD COLUMN");
    expect(MIGRATION).not.toContain("SET NOT NULL");
  });

  it("keeps focus route slugs and updates public labels", () => {
    expect(ROUTES).toContain('slug: "cybersecurity-grc"');
    expect(ROUTES).toContain('href: "/focus/cybersecurity-grc"');
    expect(ROUTES).toContain('slug: "privacy-ai-governance"');
    expect(ROUTES).toContain('href: "/focus/privacy-ai-governance"');
    expect(ROUTES).toContain('navLabel: "GRC, IT Risk & Security Compliance"');
    expect(ROUTES).toContain('navLabel: "Privacy, Compliance & Assurance"');
    expect(ROUTES).not.toContain('navLabel: "Cybersecurity / GRC"');
    expect(ROUTES).not.toContain('navLabel: "Privacy / AI Governance"');
  });

  it("does not hardcode the retired about transition headline", () => {
    expect(ABOUT).not.toContain(
      "From privacy and governance work to cybersecurity and risk",
    );
    expect(MIGRATION).toContain(
      "Privacy, compliance and information-security risk across operations, regulation and technology.",
    );
    expect(MIGRATION).not.toContain(
      "Cybersecurity, GRC, IT risk, data privacy, and AI governance practitioner.",
    );
  });

  it("uses the new identity in root metadata and hosted SEO", () => {
    expect(METADATA).toContain(
      "Global Privacy, Compliance & Information Security Risk",
    );
    expect(METADATA).toContain(
      "Global privacy, compliance and information-security risk professional and former privacy regulator",
    );
    expect(METADATA).not.toContain("Privacy, Compliance, GRC & IT Risk");
    expect(METADATA).not.toContain("Cybersecurity, GRC, IT Risk & Privacy");
    expect(MIGRATION).toContain(
      "Rainier (Ram) Milanes | Privacy, Compliance, GRC & IT Risk",
    );
    expect(MIGRATION).toContain("GRC, IT Risk & Security Compliance | Ram Milanes");
    expect(MIGRATION).toContain("Privacy, Compliance & Assurance | Ram Milanes");
    expect(MIGRATION).toContain("Resume | Privacy, GRC & IT Risk");
  });

  it("keeps two resume tracks and does not relabel V3.1 PDFs as V4.0", () => {
    expect(RESUME).toContain("<ResumeTracks");
    expect(RESUME).not.toContain("Resume C");
    expect(MIGRATION).toContain("Resume A — GRC, IT Risk & Security Compliance");
    expect(MIGRATION).toContain("Resume B — Privacy, Compliance & Assurance");
    expect(MIGRATION).toContain("delivery_mode = 'request'");
    expect(MIGRATION).toContain("a V3.1 resume binary was relabeled V4.0");
    expect(MIGRATION).not.toContain("Resume C");
  });

  it("keeps PrivAI Guard's non-production boundary in hosted copy", () => {
    expect(MIGRATION).toContain("Synthetic demonstration data only.");
    expect(MIGRATION).toContain("Human governance review");
    expect(MIGRATION).toContain("No automated legal or regulatory decisioning.");
    expect(MIGRATION).toContain("not a commercial multi-tenant SaaS product");
    expect(MIGRATION).toContain(
      "Public capability claims and screenshots on this page describe the validated capstone MVP unless explicitly identified otherwise.",
    );
  });

  it("does not expose a phone number on the contact page", () => {
    expect(CONTACT).not.toMatch(/tel:/i);
    expect(CONTACT).not.toMatch(/phone/i);
    expect(MIGRATION).toContain("Start a professional conversation");
    expect(MIGRATION).not.toMatch(/phone number/i);
  });

  it("does not relax contact-form or indexability controls", () => {
    expect(MIGRATION).toContain("contact form is not unpublished");
    expect(MIGRATION).toContain("page indexability drifted");
    expect(MIGRATION).not.toMatch(/ENABLE ROW LEVEL SECURITY|CREATE POLICY|GRANT /);
  });
});

describe("public resume track labels", () => {
  const LABEL_MIGRATION = source(
    "supabase/migrations/20260926080000_reconcile_public_resume_track_labels_v40.sql",
  );

  it("relabels the two current public titles without replaying the V4 cutover", () => {
    expect(LABEL_MIGRATION).toContain(
      "Resume A — GRC, IT Risk & Security Compliance",
    );
    expect(LABEL_MIGRATION).toContain(
      "Resume B — Privacy, Compliance & Assurance",
    );
    expect(LABEL_MIGRATION).toContain(
      "title = $t$GRC, IT Risk & Security Compliance$t$",
    );
    expect(LABEL_MIGRATION).toContain(
      "title = $t$Privacy, Compliance & Assurance$t$",
    );
    expect(LABEL_MIGRATION).toContain("slug = 'cybersecurity-grc'");
    expect(LABEL_MIGRATION).toContain("slug = 'privacy-ai-governance'");
    expect(LABEL_MIGRATION).toContain("delivery_mode = 'request'");
    expect(LABEL_MIGRATION).toContain("ramilanes_resume_grc_it_risk_v4.pdf");
    expect(LABEL_MIGRATION).toContain(
      "ramilanes_resume_privacy_compliance_v4.pdf",
    );
    expect(LABEL_MIGRATION).toContain("byte_size = 123610");
    expect(LABEL_MIGRATION).toContain("byte_size = 123872");
    expect(LABEL_MIGRATION).not.toContain("20260925193100");
    expect(LABEL_MIGRATION).not.toMatch(
      /UPDATE public\.media_assets|storage\.objects|ENABLE ROW LEVEL SECURITY|CREATE POLICY|GRANT /,
    );
    expect(MIGRATION).toContain("Resume A — GRC, IT Risk & Security Compliance");
    expect(MIGRATION).not.toContain(
      "20260926080000_reconcile_public_resume_track_labels_v40.sql",
    );
  });

  it("replaces both homepage card kickers with Professional Focus", () => {
    const grcKicker = LABEL_MIGRATION.indexOf(
      "track.home_kicker = $t$Resume A$t$",
    );
    const privacyKicker = LABEL_MIGRATION.indexOf(
      "track.home_kicker = $t$Resume B$t$",
    );

    expect(grcKicker).toBeGreaterThan(
      LABEL_MIGRATION.indexOf("slug = 'cybersecurity-grc'"),
    );
    expect(privacyKicker).toBeGreaterThan(grcKicker);
    expect(LABEL_MIGRATION.match(/SET home_kicker = \$t\$Professional Focus\$t\$/g))
      .toHaveLength(2);
    expect(LABEL_MIGRATION).toContain(
      "title = $t$GRC, IT Risk & Security Compliance$t$",
    );
    expect(LABEL_MIGRATION).toContain(
      "title = $t$Privacy, Compliance & Assurance$t$",
    );
    expect(LABEL_MIGRATION).not.toMatch(/SET home_kicker = NULL/i);
    expect(LABEL_MIGRATION).not.toContain("Pathway");
    expect(LABEL_MIGRATION).not.toMatch(/UPDATE public\.focus_pages/);
    expect(HOME).toContain("homeKickerByFocusSlug");
    expect(HOME).toContain("{track.title}");
    expect(HOME).not.toContain("Resume A");
    expect(HOME).not.toContain("Resume B");
    expect(HOME).not.toContain(">Professional Focus<");
  });
});

describe("focus evidence order", () => {
  const FOCUS = source("src/components/focus/FocusView.tsx");
  const SOCIAL = source("src/app/opengraph-image.tsx");

  it("places selected roles before featured project evidence", () => {
    const roles = FOCUS.indexOf('kicker="Experience"');
    const project = FOCUS.indexOf('kicker="Featured evidence"');
    const competencies = FOCUS.indexOf("What this track emphasizes");
    const credentials = FOCUS.indexOf('kicker="Credentials"');

    expect(competencies).toBeGreaterThan(FOCUS.indexOf("<PageHero"));
    expect(roles).toBeGreaterThan(competencies);
    expect(project).toBeGreaterThan(roles);
    expect(credentials).toBeGreaterThan(project);
    expect(FOCUS).toContain("/projects/privai-guard");
    expect(FOCUS).toContain('slug === "cybersecurity-grc"');
    expect(FOCUS).not.toContain('href="/focus/');
  });

  it("uses the single-identity social-card line", () => {
    expect(SOCIAL).toContain(
      "Global Privacy · Compliance · Information Security Risk",
    );
    expect(SOCIAL).not.toContain("Cybersecurity · GRC · IT Risk · Privacy");
    expect(SOCIAL).toContain("profile?.headline");
  });
});

describe("resume v4.0 public assets", () => {
  it("publishes exactly two distinct public-file tracks", () => {
    expect(RESUME_ASSETS).toContain(
      "Resume A — GRC, IT Risk & Security Compliance",
    );
    expect(RESUME_ASSETS).toContain(
      "Resume B — Privacy, Compliance & Assurance",
    );
    expect(RESUME_ASSETS).toContain("delivery_mode = 'public_file'");
    expect(RESUME_ASSETS).toContain("slug = 'cybersecurity-grc'");
    expect(RESUME_ASSETS).toContain("slug = 'privacy-ai-governance'");
    expect(RESUME_ASSETS).toContain(
      "Resume A and Resume B share a media asset",
    );
    expect(RESUME_ASSETS).toContain(
      "unexpected third published resume track",
    );
    expect(RESUME_ASSETS).not.toContain("Resume C");
    expect(RESUME_ASSETS).not.toMatch(
      /slug = 'ai-governance'|AI Governance Resume Track/,
    );
  });

  it("keeps V3.1 filenames inactive and does not relabel them as V4", () => {
    expect(RESUME_ASSETS).toContain(
      "ramilanes_resume_grc_it_risk_v4.pdf",
    );
    expect(RESUME_ASSETS).toContain(
      "ramilanes_resume_privacy_compliance_v4.pdf",
    );
    expect(RESUME_ASSETS).toContain(
      "an active track still references a V3.1 resume",
    );
    expect(RESUME_ASSETS).toContain("a V3.1 resume record was altered");
    expect(RESUME_ASSETS).toContain("byte_size = 133746");
    expect(RESUME_ASSETS).toContain("byte_size = 134203");
    expect(RESUME_ASSETS).toContain("123610");
    expect(RESUME_ASSETS).toContain("123872");
    expect(RESUME_ASSETS).toContain(
      "8e3d3cccc789ff770b622750b843d77c83ad4f030d02ad351acf3e8095aca139",
    );
    expect(RESUME_ASSETS).toContain(
      "ff8e0cfe742c048f92d5c0bdc71966fb080fba190696440090face9285d758fb",
    );
    expect(RESUME_ASSETS).not.toMatch(
      /UPDATE public\.media_assets[\s\S]*ramilanes_resume_cybersecurity_grc/,
    );
    expect(RESUME_ASSETS).not.toMatch(/ENABLE ROW LEVEL SECURITY|CREATE POLICY|GRANT /);
  });
});
