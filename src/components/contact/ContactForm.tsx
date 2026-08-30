"use client";

import { useState } from "react";

const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

type ContactFormProps = {
  token: string;
};

export function ContactForm({ token }: ContactFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token,
          website: data.get("website") ?? "",
          name: data.get("name"),
          email: data.get("email"),
          organization: data.get("organization"),
          context: data.get("context"),
          track: data.get("track"),
          message: data.get("message"),
        }),
      });

      if (response.ok) {
        form.reset();
        setSuccess(true);
        return;
      }

      if (response.status === 429) {
        setError("Please try again later.");
        return;
      }

      if (response.status === 503) {
        setError("This form is not available right now.");
        return;
      }

      setError("Please check the form and try again.");
    } catch {
      setError("This form is not available right now.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-line bg-paper-elevated p-6"
      noValidate
    >
      <p className="text-sm leading-6 text-ink-soft">
        Send a short note. I will review it in the private inbox. Do not
        include secrets or attachments.
      </p>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {success ? (
        <p role="status" className="mt-4 text-sm text-ink">
          Thank you. Your message was received.
        </p>
      ) : null}

      <div aria-hidden="true" className="hidden">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Name <span aria-hidden="true">*</span>
          <input
            name="name"
            required
            maxLength={120}
            autoComplete="name"
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Email <span aria-hidden="true">*</span>
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            disabled={pending}
            className={fieldClass}
          />
        </label>
      </div>

      <label className={`${labelClass} mt-4`}>
        Organization
        <input
          name="organization"
          maxLength={160}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          I am a <span aria-hidden="true">*</span>
          <select
            name="context"
            required
            disabled={pending}
            defaultValue="other"
            className={fieldClass}
          >
            <option value="recruiter">Recruiter</option>
            <option value="hiring_manager">Hiring manager</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className={labelClass}>
          Track <span aria-hidden="true">*</span>
          <select
            name="track"
            required
            disabled={pending}
            defaultValue="either"
            className={fieldClass}
          >
            <option value="either">Either</option>
            <option value="cybersecurity_grc">Cybersecurity / GRC</option>
            <option value="privacy_ai">Privacy / AI</option>
          </select>
        </label>
      </div>

      <label className={`${labelClass} mt-4`}>
        Message <span aria-hidden="true">*</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          disabled={pending}
          className="mt-2 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink disabled:opacity-60"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-5 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
