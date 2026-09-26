"use client";

import { useId, useRef, useState } from "react";
import {
  RESUME_REQUEST_CHOICES,
  RESUME_REQUEST_LABELS,
  RESUME_REQUEST_PRIVACY_NOTE,
  RESUME_REQUEST_SUCCESS,
  type ResumeRequestChoice,
} from "@/lib/resume-requests/choices";
import {
  parsePublicResumeRequest,
  RESUME_REQUEST_LIMITS,
  resumeRequestFieldMessage,
  type ResumeRequestField,
  type ResumeRequestFieldErrors,
} from "@/lib/resume-requests/validation";

const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

type ResumeRequestFormProps = {
  token: string;
  initialChoice: ResumeRequestChoice;
};

const FIELD_ORDER: ResumeRequestField[] = [
  "fullName",
  "email",
  "organization",
  "resumeChoice",
  "message",
];

export function ResumeRequestForm({
  token,
  initialChoice,
}: ResumeRequestFormProps) {
  const baseId = useId();
  const successRef = useRef<HTMLParagraphElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ResumeRequestFieldErrors>({});
  const [success, setSuccess] = useState(false);

  function fieldId(name: string) {
    return `${baseId}-${name}`;
  }

  function describedBy(name: ResumeRequestField) {
    return fieldErrors[name] ? fieldId(`${name}-error`) : undefined;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      token,
      company_website: data.get("company_website") ?? "",
      fullName: data.get("fullName"),
      email: data.get("email"),
      organization: data.get("organization"),
      resumeChoice: data.get("resumeChoice"),
      message: data.get("message"),
    };
    const local = parsePublicResumeRequest(payload);

    if (!local.ok) {
      setFieldErrors(local.fields);
      setError("Please check the form and try again.");
      setSuccess(false);
      const first = FIELD_ORDER.find((field) => local.fields[field]);
      if (first) {
        document.getElementById(fieldId(first))?.focus();
      }
      return;
    }

    setPending(true);
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    try {
      const response = await fetch("/api/resume-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json().catch(() => null);
      const body =
        result && typeof result === "object"
          ? (result as { fields?: ResumeRequestFieldErrors; error?: string })
          : null;

      if (response.ok) {
        form.reset();
        setSuccess(true);
        successRef.current?.focus();
        return;
      }

      if (body?.fields && response.status === 400) {
        setFieldErrors(body.fields);
        setError("Please check the form and try again.");
        const first = FIELD_ORDER.find((field) => body.fields?.[field]);
        if (first) {
          document.getElementById(fieldId(first))?.focus();
        }
        return;
      }

      if (response.status === 429) {
        setError("Please try again later.");
        return;
      }

      setError(
        "The request could not be sent. Please try again, or use email or LinkedIn.",
      );
    } catch {
      setError(
        "The request could not be sent. Please try again, or use email or LinkedIn.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      {success ? (
        <p
          ref={successRef}
          tabIndex={-1}
          role="status"
          className="text-sm leading-6 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {RESUME_REQUEST_SUCCESS}
        </p>
      ) : null}

      <div hidden aria-hidden="true">
        <label htmlFor={fieldId("company")}>Company website</label>
        <input
          id={fieldId("company")}
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId("fullName")} className={labelClass}>
            Full name <span className="font-normal text-ink-faint">(required)</span>
          </label>
          <input
            id={fieldId("fullName")}
            name="fullName"
            required
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.fullName)}
            aria-describedby={describedBy("fullName")}
            minLength={RESUME_REQUEST_LIMITS.fullNameMin}
            maxLength={RESUME_REQUEST_LIMITS.fullNameMax}
            autoComplete="name"
            disabled={pending}
            className={fieldClass}
          />
          {fieldErrors.fullName ? (
            <p id={fieldId("fullName-error")} role="alert" className="mt-2 text-sm text-danger">
              {resumeRequestFieldMessage("fullName", fieldErrors.fullName)}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor={fieldId("email")} className={labelClass}>
            Professional email{" "}
            <span className="font-normal text-ink-faint">(required)</span>
          </label>
          <input
            id={fieldId("email")}
            name="email"
            type="email"
            required
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={describedBy("email")}
            maxLength={RESUME_REQUEST_LIMITS.emailMax}
            autoComplete="email"
            inputMode="email"
            disabled={pending}
            className={fieldClass}
          />
          {fieldErrors.email ? (
            <p id={fieldId("email-error")} role="alert" className="mt-2 text-sm text-danger">
              {resumeRequestFieldMessage("email", fieldErrors.email)}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor={fieldId("organization")} className={labelClass}>
          Organization <span className="font-normal text-ink-faint">(required)</span>
        </label>
        <input
          id={fieldId("organization")}
          name="organization"
          required
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.organization)}
          aria-describedby={describedBy("organization")}
          minLength={RESUME_REQUEST_LIMITS.organizationMin}
          maxLength={RESUME_REQUEST_LIMITS.organizationMax}
          autoComplete="organization"
          disabled={pending}
          className={fieldClass}
        />
        {fieldErrors.organization ? (
          <p
            id={fieldId("organization-error")}
            role="alert"
            className="mt-2 text-sm text-danger"
          >
            {resumeRequestFieldMessage("organization", fieldErrors.organization)}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={fieldId("resumeChoice")} className={labelClass}>
          Document requested{" "}
          <span className="font-normal text-ink-faint">(required)</span>
        </label>
        <select
          id={fieldId("resumeChoice")}
          name="resumeChoice"
          required
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.resumeChoice)}
          aria-describedby={describedBy("resumeChoice")}
          defaultValue={initialChoice}
          disabled={pending}
          className={fieldClass}
        >
          {RESUME_REQUEST_CHOICES.map((choice) => (
            <option key={choice} value={choice}>
              {RESUME_REQUEST_LABELS[choice]}
            </option>
          ))}
        </select>
        {fieldErrors.resumeChoice ? (
          <p
            id={fieldId("resumeChoice-error")}
            role="alert"
            className="mt-2 text-sm text-danger"
          >
            {resumeRequestFieldMessage("resumeChoice", fieldErrors.resumeChoice)}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={fieldId("message")} className={labelClass}>
          Opportunity context or message (optional)
        </label>
        <textarea
          id={fieldId("message")}
          name="message"
          rows={5}
          maxLength={RESUME_REQUEST_LIMITS.messageMax}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={describedBy("message")}
          disabled={pending}
          className="mt-2 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60"
        />
        {fieldErrors.message ? (
          <p id={fieldId("message-error")} role="alert" className="mt-2 text-sm text-danger">
            {resumeRequestFieldMessage("message", fieldErrors.message)}
          </p>
        ) : null}
      </div>

      <p id={fieldId("privacy")} className="text-sm leading-6 text-ink-soft">
        {RESUME_REQUEST_PRIVACY_NOTE}
      </p>

      <button
        type="submit"
        disabled={pending}
        aria-describedby={fieldId("privacy")}
        className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
