"use client";

import { useActionState, useState } from "react";
import {
  generateResumeFulfillmentLinkAction,
  type FulfillmentState,
} from "@/app/admin/resume-requests/actions";
import type { DocumentAvailability } from "@/lib/admin/resume-requests/queries";
import {
  CV_UNVERIFIED_DETAIL,
  CV_UNVERIFIED_MESSAGE,
  FULFILLMENT_DOCUMENT_LABELS,
  type FulfillmentDocumentKey,
} from "@/lib/admin/resume-fulfillment/policy";
import type { ResumeRequestChoice } from "@/lib/supabase/database.types";

const initialState: FulfillmentState = {
  error: null,
  link: null,
  expiresAt: null,
  documentLabel: null,
};

function formatExpiry(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function ResumeFulfillmentPanel({
  requestId,
  resumeChoice,
  defaultDocument,
  availability,
}: {
  requestId: string;
  resumeChoice: ResumeRequestChoice;
  defaultDocument: FulfillmentDocumentKey | null;
  availability: DocumentAvailability[];
}) {
  const [state, formAction, pending] = useActionState(
    generateResumeFulfillmentLinkAction,
    initialState,
  );
  const [selected, setSelected] = useState(defaultDocument ?? "");
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const selectedAvailability = availability.find((item) => item.key === selected);
  const selectedUnavailable = !selected || selectedAvailability?.available !== true;
  const cvRequested = resumeChoice === "professional_cv";
  const cvUnavailable = availability.find(
    (item) => item.key === "professional_cv",
  )?.available !== true;

  async function copyLink() {
    if (!state.link) {
      return;
    }

    await navigator.clipboard.writeText(state.link);
    setCopied(true);
  }

  async function downloadDocument() {
    if (selectedUnavailable || downloading) {
      return;
    }

    setDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch("/api/admin/private-document", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ documentKey: selected, requestId }),
      });

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "That document is not available.";
        setDownloadError(message);
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const disposition = response.headers.get("content-disposition") ?? "";
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] ?? "document.pdf";
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setDownloadError("That document is not available.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      {cvRequested ? (
        <p className="text-sm font-medium text-ink">Professional CV requested</p>
      ) : null}
      {cvRequested && cvUnavailable ? (
        <p className="text-sm leading-6 text-ink-soft">{CV_UNVERIFIED_DETAIL}</p>
      ) : null}

      <ul className="space-y-1 text-sm text-ink-soft">
        {availability.map((item) => (
          <li key={item.key}>{item.availabilityLabel}</li>
        ))}
      </ul>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="id" value={requestId} />
        <label className="block text-sm font-medium text-ink" htmlFor="fulfillment-document">
          Document to provide
          <select
            id="fulfillment-document"
            name="documentKey"
            value={selected}
            onChange={(event) => {
              setSelected(event.target.value);
              setCopied(false);
            }}
            disabled={pending || downloading}
            className="mt-2 min-h-11 w-full max-w-xl rounded-lg border border-line bg-paper px-3 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60"
          >
            <option value="">Select a document</option>
            {availability.map((item) => (
              <option key={item.key} value={item.key}>
                {FULFILLMENT_DOCUMENT_LABELS[item.key]}
              </option>
            ))}
          </select>
        </label>

        {state.error ? (
          <p role="alert" className="text-sm text-danger">
            {state.error}
          </p>
        ) : null}
        {downloadError ? (
          <p role="alert" className="text-sm text-danger">
            {downloadError}
          </p>
        ) : null}

        {selected === "professional_cv" && cvUnavailable ? (
          <p className="text-sm text-ink-soft">{CV_UNVERIFIED_MESSAGE}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={pending || downloading || selectedUnavailable}
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60"
          >
            {pending ? "Generating…" : "Generate 15-minute link"}
          </button>
          <button
            type="button"
            onClick={downloadDocument}
            disabled={pending || downloading || selectedUnavailable}
            className="inline-flex min-h-11 items-center rounded-full border border-line bg-paper px-5 text-sm font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60"
          >
            {downloading ? "Downloading…" : "Download private document"}
          </button>
        </div>
      </form>

      {state.link && state.expiresAt ? (
        <div className="space-y-3 rounded-lg border border-line bg-paper p-4">
          <p role="status" className="text-sm text-ink">
            {state.documentLabel} link expires {formatExpiry(state.expiresAt)} UTC.
            It is not saved. Send it only if you decide to share the document.
          </p>
          <p className="break-all text-sm text-ink-soft">{state.link}</p>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
