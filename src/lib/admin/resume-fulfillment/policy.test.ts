import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ResumeCvRequest } from "@/components/resume/ResumeCvRequest";
import { PRIVATE_PROFESSIONAL_CV } from "./catalog";
import {
  applyResumeRequestLifecycle,
  availabilityLabel,
  CV_UNVERIFIED_MESSAGE,
  defaultFulfillmentDocument,
  fulfillmentAssetError,
  fulfillmentAuditFields,
  isExpiredClosedRequest,
  privateDownloadHeaders,
  resolveFulfillmentDocument,
  SIGNED_LINK_TTL_MAX_SECONDS,
  SIGNED_LINK_TTL_SECONDS,
  signedLinkExpiresAt,
} from "./policy";

const root = resolve(import.meta.dirname, "../../../..");

function source(path: string): string {
  return readFileSync(resolve(root, path), "utf8");
}

const now = new Date("2026-09-26T12:00:00.000Z");

describe("fulfillment document selection", () => {
  it("defaults Resume A and Resume B and requires a choice for not sure", () => {
    expect(defaultFulfillmentDocument("grc_it_risk")).toBe("grc_it_risk");
    expect(defaultFulfillmentDocument("privacy_compliance")).toBe(
      "privacy_compliance",
    );
    expect(defaultFulfillmentDocument("professional_cv")).toBe("professional_cv");
    expect(defaultFulfillmentDocument("not_sure")).toBeNull();
    expect(resolveFulfillmentDocument("not_sure", "").ok).toBe(false);
    expect(resolveFulfillmentDocument("not_sure", "not_sure").ok).toBe(false);
    expect(resolveFulfillmentDocument("grc_it_risk", null)).toEqual({
      ok: true,
      document: "grc_it_risk",
    });
    expect(resolveFulfillmentDocument("not_sure", "privacy_compliance")).toEqual({
      ok: true,
      document: "privacy_compliance",
    });
  });

  it("rejects an unknown document and an unverified CV", () => {
    expect(resolveFulfillmentDocument("grc_it_risk", "executive").ok).toBe(false);
    expect(
      fulfillmentAssetError("professional_cv", {
        professional_cv: { active: false },
      }),
    ).toBe(CV_UNVERIFIED_MESSAGE);
    expect(
      fulfillmentAssetError("grc_it_risk", { grc_it_risk: { active: true } }),
    ).toBeNull();
    expect(availabilityLabel("professional_cv", false)).toBe(
      "Professional CV — Not yet verified",
    );
    expect(availabilityLabel("professional_cv", true)).toBe(
      "Professional CV — Available",
    );
    expect(
      fulfillmentAssetError("professional_cv", {
        professional_cv: { active: true },
      }),
    ).toBeNull();
    expect(availabilityLabel("grc_it_risk", true)).toBe("Resume A — Available");
    expect(availabilityLabel("privacy_compliance", true)).toBe(
      "Resume B — Available",
    );
  });

  it("keeps the signed link inside the allowed lifetime and out of the audit record", () => {
    expect(SIGNED_LINK_TTL_SECONDS).toBe(15 * 60);
    expect(SIGNED_LINK_TTL_SECONDS).toBeLessThanOrEqual(SIGNED_LINK_TTL_MAX_SECONDS);
    const expires = signedLinkExpiresAt(now);
    expect(expires.toISOString()).toBe("2026-09-26T12:15:00.000Z");
    expect(() => signedLinkExpiresAt(now, 31 * 60)).toThrow(/lifetime/);
    const audit = fulfillmentAuditFields(
      "grc_it_risk",
      "11111111-1111-4111-8111-111111111111",
      now,
    );
    expect(audit).toEqual({
      fulfilled_document: "grc_it_risk",
      fulfilled_at: now.toISOString(),
      fulfilled_by: "11111111-1111-4111-8111-111111111111",
    });
    expect(JSON.stringify(audit)).not.toMatch(/signed|token|http/i);
  });

  it("names the owner download without a storage path", () => {
    const headers = privateDownloadHeaders("privacy_compliance");
    expect(headers["content-disposition"]).toBe(
      'attachment; filename="ramilanes_resume_privacy_compliance_v4.pdf"',
    );
    expect(headers["cache-control"]).toBe("no-store");
    expect(JSON.stringify(headers)).not.toContain("private-resumes");
  });
});

describe("resume request retention", () => {
  it("sets closed_at when closing and clears it when reopening", () => {
    const reviewed = applyResumeRequestLifecycle(
      { status: "new", reviewedAt: null, closedAt: null },
      "reviewed",
      now,
    );
    expect(reviewed.reviewedAt).toBe(now.toISOString());
    expect(reviewed.closedAt).toBeNull();

    const closed = applyResumeRequestLifecycle(reviewed, "closed", now);
    expect(closed.closedAt).toBe(now.toISOString());
    expect(closed.reviewedAt).toBe(now.toISOString());

    const reopened = applyResumeRequestLifecycle(closed, "new", now);
    expect(reopened.status).toBe("new");
    expect(reopened.closedAt).toBeNull();
    expect(reopened.reviewedAt).toBe(now.toISOString());
  });

  it("purges only closed requests older than 90 days", () => {
    const older = new Date("2026-06-01T00:00:00.000Z").toISOString();
    const recent = new Date("2026-09-01T00:00:00.000Z").toISOString();

    expect(isExpiredClosedRequest({ status: "closed", closedAt: older }, now)).toBe(
      true,
    );
    expect(
      isExpiredClosedRequest({ status: "closed", closedAt: recent }, now),
    ).toBe(false);
    expect(isExpiredClosedRequest({ status: "new", closedAt: older }, now)).toBe(
      false,
    );
    expect(
      isExpiredClosedRequest({ status: "reviewed", closedAt: older }, now),
    ).toBe(false);
    expect(isExpiredClosedRequest({ status: "closed", closedAt: null }, now)).toBe(
      false,
    );
    expect(isExpiredClosedRequest({ status: "new", closedAt: null }, now)).toBe(
      false,
    );
  });
});

describe("private fulfillment database contract", () => {
  const migration = source(
    "supabase/migrations/20260926061000_private_resume_fulfillment.sql",
  );
  const choice = source(
    "supabase/migrations/20260926060000_add_professional_cv_request_choice.sql",
  );

  it("adds the CV choice without rewriting the request workflow migration", () => {
    expect(choice).toContain("'professional_cv'");
    expect(choice).not.toContain("DELETE FROM");
    expect(migration).toContain("'professional_cv'::public.resume_request_choice");
    expect(migration).toContain("interval '15 minutes'");
    expect(migration).toContain("interval '60 minutes'");
    expect(migration).toContain("interval '24 hours'");
    expect(migration).toContain("interval '2 minutes'");
  });

  it("keeps the private bucket private and withholds anonymous access", () => {
    expect(migration).toContain("'private-resumes'");
    expect(migration).toContain("false");
    expect(migration).toContain("private-resumes bucket is missing or public");
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
    expect(migration).toContain("FORCE ROW LEVEL SECURITY");
    expect(migration).toContain(
      "REVOKE ALL ON TABLE public.private_document_assets",
    );
    expect(migration).toContain("private_document_assets_admin_select");
    expect(migration).not.toMatch(/FOR INSERT|FOR UPDATE|FOR DELETE/);
    expect(migration).toContain(
      "REVOKE ALL ON FUNCTION public.purge_expired_resume_requests()",
    );
    expect(migration).toContain("TO service_role");
    expect(migration).not.toMatch(/GRANT EXECUTE ON FUNCTION public\.purge_expired_resume_requests\(\) TO anon/);
    expect(migration).not.toMatch(/ON storage\.objects/);
    expect(migration).toContain("No storage.objects policy is created");
    expect(migration).not.toMatch(/DELETE FROM public\.media_assets/i);
    expect(migration).not.toMatch(/DELETE FROM storage/i);
  });

  it("limits purge to closed requests older than 90 days", () => {
    const purge = migration.slice(migration.indexOf("FUNCTION public.purge_expired_resume_requests"));
    expect(purge).toContain("status = 'closed'::public.resume_request_status");
    expect(purge).toContain("interval '90 days'");
    expect(purge).not.toContain("status = 'new'");
    expect(purge).not.toContain("status = 'reviewed'");
    expect(migration).toContain("NEW.closed_at := NULL");
    expect(migration).toContain("NEW.closed_at := pg_catalog.now()");
  });
});

describe("verified professional CV catalog", () => {
  const activation = source(
    "supabase/migrations/20260926070000_activate_private_professional_cv.sql",
  );

  it("registers one active private CV and leaves public storage untouched", () => {
    expect(PRIVATE_PROFESSIONAL_CV).toMatchObject({
      documentKey: "professional_cv",
      bucket: "private-resumes",
      objectPath: "cv/v2/ramilanes_professional_cv_v2.pdf",
      byteSize: 176774,
      sha256: "c80500801a7383019a20ecd666430d6cdc69e2fc8fd8cfe49c55de730e24f331",
    });
    expect(activation.match(/'professional_cv'/g)).toHaveLength(1);
    expect(activation).toContain(PRIVATE_PROFESSIONAL_CV.objectPath);
    expect(activation).toContain(String(PRIVATE_PROFESSIONAL_CV.byteSize));
    expect(activation).toContain(PRIVATE_PROFESSIONAL_CV.sha256);
    expect(activation).toContain("true");
    expect(activation).not.toMatch(/DELETE FROM/i);
    expect(activation).not.toMatch(/public-media/i);
    expect(activation).not.toMatch(/ON storage\.objects/);
    expect(source("src/app/resume/page.tsx")).not.toContain(
      PRIVATE_PROFESSIONAL_CV.objectPath,
    );
    expect(source("src/components/contact/ResumeRequestForm.tsx")).not.toContain(
      PRIVATE_PROFESSIONAL_CV.objectPath,
    );
    expect(source("src/app/admin/resume-requests/actions.ts")).toContain(
      "requireAdminMutation",
    );
    expect(SIGNED_LINK_TTL_SECONDS).toBeLessThanOrEqual(SIGNED_LINK_TTL_MAX_SECONDS);
  });
});

describe("public resume and CV presentation", () => {
  it("offers the CV as a separate request, not a third resume card", () => {
    const html = renderToStaticMarkup(createElement(ResumeCvRequest));
    const page = source("src/app/resume/page.tsx");
    const form = source("src/components/contact/ResumeRequestForm.tsx");
    const panel = source("src/components/admin/ResumeFulfillmentPanel.tsx");

    expect(html).toContain("Need the comprehensive professional record?");
    expect(html).toContain("Request the CV");
    expect(html).toContain("/contact?request=professional_cv");
    expect(html).not.toContain("Resume A");
    expect(html).not.toContain(".pdf");
    expect(html).not.toContain("private-resumes");
    expect(page).toContain("<ResumeTracks");
    expect(page).toContain("<ResumeCvRequest");
    expect(page.match(/<ResumeTracks/g)).toHaveLength(1);
    expect(page).not.toContain("private-resumes");
    expect(page).not.toContain("createSignedUrl");
    expect(form).not.toContain("private-resumes");
    expect(form).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(panel).not.toContain("private-resumes");
    expect(panel).not.toContain("object_path");
  });
});
