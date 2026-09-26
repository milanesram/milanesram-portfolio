import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { ResumeRequestForm } from "@/components/contact/ResumeRequestForm";
import {
  RESUME_REQUEST_LABELS,
  RESUME_REQUEST_PRIVACY_NOTE,
  RESUME_REQUEST_SUCCESS,
} from "./choices";

const root = resolve(import.meta.dirname, "../../..");

function source(path: string): string {
  return readFileSync(resolve(root, path), "utf8");
}

const MIGRATION = source(
  "supabase/migrations/20260926050000_enable_resume_request_workflow.sql",
);
const FORM = source("src/components/contact/ResumeRequestForm.tsx");
const CONTACT = source("src/app/contact/page.tsx");
const ADMIN_LAYOUT = source("src/app/admin/resume-requests/layout.tsx");
const CONTENT_RESUME = source("src/lib/content/resume.ts");

describe("resume request database security", () => {
  it("enables forced RLS and withholds anonymous access", () => {
    expect(MIGRATION).toContain("ENABLE ROW LEVEL SECURITY");
    expect(MIGRATION).toContain("FORCE ROW LEVEL SECURITY");
    expect(MIGRATION).toContain(
      "REVOKE ALL ON TABLE public.resume_requests FROM PUBLIC, anon, authenticated",
    );
    expect(MIGRATION).toContain(
      "GRANT SELECT, UPDATE ON TABLE public.resume_requests TO authenticated",
    );
    expect(MIGRATION).not.toMatch(
      /GRANT\s+(SELECT|INSERT|UPDATE|DELETE)[^;]*resume_requests[^;]*TO anon/i,
    );
    expect(MIGRATION).not.toContain("FOR INSERT");
    expect(MIGRATION).not.toContain("FOR DELETE");
    expect(MIGRATION).toContain("USING ((SELECT public.is_admin()))");
    expect(MIGRATION).toContain("TO service_role");
    expect(MIGRATION).toContain(
      "FROM PUBLIC, anon, authenticated",
    );
  });

  it("keeps both tracks request-only and preserves the V4 records", () => {
    expect(MIGRATION).toContain("delivery_mode = 'request'");
    expect(MIGRATION).toContain("slug = 'cybersecurity-grc'");
    expect(MIGRATION).toContain("slug = 'privacy-ai-governance'");
    expect(MIGRATION).toContain("Resume A — GRC, IT Risk & Security Compliance");
    expect(MIGRATION).toContain("Resume B — Privacy, Compliance & Assurance");
    expect(MIGRATION).toContain(
      "f4739fe2-8d6b-4b13-ad5c-f611e3ab97a5",
    );
    expect(MIGRATION).toContain(
      "29a9954b-5169-45dc-9b82-be04e041ba78",
    );
    expect(MIGRATION).toContain("unexpected third published resume track");
    expect(MIGRATION).not.toMatch(/DELETE FROM public\.media_assets/i);
    expect(MIGRATION).not.toContain("storage.objects");
  });

  it("rate-limits with short-lived hashes and blocks immediate duplicates", () => {
    expect(MIGRATION).toContain("interval '15 minutes'");
    expect(MIGRATION).toContain("interval '60 minutes'");
    expect(MIGRATION).toContain("interval '24 hours'");
    expect(MIGRATION).toContain("interval '2 minutes'");
    expect(MIGRATION).toContain("duplicate_request");
    expect(MIGRATION).toContain("rate_limited");
    expect(MIGRATION).not.toMatch(/inet|ip_address|user_agent/i);
  });

  it("does not expose requests through public content queries", () => {
    expect(CONTENT_RESUME).not.toContain("resume_requests");
    expect(source("src/lib/content/contact.ts")).not.toContain("resume_requests");
    expect(ADMIN_LAYOUT).toContain('redirect("/admin/login")');
    expect(ADMIN_LAYOUT).toContain("context.isAdmin");
  });

  it("does not place the service role in the browser form", () => {
    expect(FORM).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(FORM).not.toContain("NEXT_PUBLIC_");
    expect(CONTACT).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(CONTACT).not.toContain("CONTACT_INTAKE_ENABLED");
  });
});

describe("resume request form", () => {
  it("renders the required professional fields, privacy note, and hidden honeypot", () => {
    const html = renderToStaticMarkup(
      createElement(ResumeRequestForm, {
        token: "issued-token",
        initialChoice: "grc_it_risk",
      }),
    );

    expect(html).toContain("Full name");
    expect(html).toContain("Professional email");
    expect(html).toContain("Organization");
    expect(html).toContain("Resume requested");
    expect(html).toContain("Opportunity context or message (optional)");
    expect(html).toContain("(required)");
    expect(html).toContain(RESUME_REQUEST_PRIVACY_NOTE);
    expect(html).toContain("Send request");
    expect(html).toContain('aria-required="true"');
    expect(html).toContain('name="company_website"');
    expect(html).toContain("hidden");
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain("Resume A — GRC, IT Risk &amp; Security Compliance");
    expect(html).toContain('value="grc_it_risk" selected=""');
    expect(html).not.toMatch(/phone|home address|salary|social security|linkedin url/i);
  });

  it("preselects Resume B and falls back copy stays available", () => {
    const html = renderToStaticMarkup(
      createElement(ResumeRequestForm, {
        token: "issued-token",
        initialChoice: "privacy_compliance",
      }),
    );

    expect(html).toContain("Resume B — Privacy, Compliance &amp; Assurance");
    expect(html).toContain(RESUME_REQUEST_LABELS.not_sure);
    expect(html).toContain('value="privacy_compliance" selected=""');
  });

  it("keeps the success message available to a live region", () => {
    expect(FORM).toContain('role="status"');
    expect(FORM).toContain('role="alert"');
    expect(FORM).toContain("aria-invalid");
    expect(FORM).toContain("aria-describedby");
    expect(FORM).toContain("RESUME_REQUEST_SUCCESS");
    expect(RESUME_REQUEST_SUCCESS).toContain("Request received");
    expect(FORM).not.toContain("automatically");
  });
});
