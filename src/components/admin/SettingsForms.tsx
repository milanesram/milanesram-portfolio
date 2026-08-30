"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  saveSiteProfileAction,
  saveSiteSettingsAction,
  type MutationState,
} from "@/app/admin/settings/actions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type {
  AdminSiteProfile,
  AdminSiteSettings,
} from "@/lib/admin/settings/queries";

const initialState: MutationState = { error: null, message: null };

const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

type SiteProfileFormProps = {
  profile?: AdminSiteProfile | null;
};

export function SiteProfileForm({ profile }: SiteProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    saveSiteProfileAction,
    initialState,
  );
  const dirtyRef = useRef(false);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  return (
    <form
      action={formAction}
      className="space-y-5"
      noValidate
      onChange={() => {
        dirtyRef.current = true;
      }}
    >
      {profile ? <input type="hidden" name="id" value={profile.id} /> : null}

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p
          role="status"
          className="rounded-lg border border-accent/20 bg-accent-soft px-3 py-2 text-sm text-ink"
        >
          {state.message}
        </p>
      ) : null}

      {profile ? (
        <p className="text-sm text-ink-soft">
          Status: <StatusBadge status={profile.status} />
        </p>
      ) : (
        <p className="text-sm text-ink-soft">
          No profile row yet. The first save creates the singleton. There is
          no delete action.
        </p>
      )}

      <label className={labelClass}>
        Display name
        <input
          name="display_name"
          required
          maxLength={120}
          defaultValue={profile?.display_name}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Headline
        <input
          name="headline"
          required
          maxLength={200}
          defaultValue={profile?.headline}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Summary
        <textarea
          name="summary"
          required
          maxLength={2000}
          rows={5}
          defaultValue={profile?.summary}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Work authorization
        <input
          name="work_authorization"
          required
          maxLength={200}
          defaultValue={profile?.work_authorization}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Location
        <input
          name="location_display"
          maxLength={160}
          defaultValue={profile?.location_display ?? ""}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        LinkedIn URL
        <input
          name="linkedin_url"
          required
          type="url"
          maxLength={500}
          defaultValue={profile?.linkedin_url}
          disabled={pending}
          className={fieldClass}
          aria-describedby="linkedin-hint"
        />
        <span
          id="linkedin-hint"
          className="mt-1 block text-xs font-normal text-ink-faint"
        >
          https URLs only. This is public profile data, not an admin account
          field.
        </span>
      </label>

      <label className={labelClass}>
        Public email
        <input
          name="public_email"
          required
          type="email"
          maxLength={160}
          defaultValue={profile?.public_email}
          disabled={pending}
          className={fieldClass}
          aria-describedby="public-email-hint"
        />
        <span
          id="public-email-hint"
          className="mt-1 block text-xs font-normal text-ink-faint"
        >
          Public contact address stored on site_profile. This is not the
          owner authentication email.
        </span>
      </label>

      <label className={labelClass}>
        Primary call-to-action label
        <input
          name="hero_cta_primary_label"
          maxLength={80}
          defaultValue={profile?.hero_cta_primary_label ?? ""}
          disabled={pending}
          className={fieldClass}
        />
      </label>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          name="intent"
          value="draft"
          disabled={pending}
          className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-5 text-sm font-medium text-ink disabled:opacity-60"
        >
          Save as draft
        </button>
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={pending}
          className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated disabled:opacity-60"
        >
          Publish
        </button>
        {profile ? (
          <>
            <button
              type="submit"
              name="intent"
              value="unpublish"
              disabled={pending}
              className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-5 text-sm font-medium text-ink disabled:opacity-60"
            >
              Unpublish
            </button>
            <button
              type="submit"
              name="intent"
              value="archive"
              disabled={pending}
              className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-5 text-sm font-medium text-ink-soft disabled:opacity-60"
            >
              Archive
            </button>
          </>
        ) : null}
      </div>
    </form>
  );
}

type SiteSettingsFormProps = {
  settings?: AdminSiteSettings | null;
};

export function SiteSettingsForm({ settings }: SiteSettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    saveSiteSettingsAction,
    initialState,
  );
  const dirtyRef = useRef(false);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  return (
    <form
      action={formAction}
      className="space-y-5"
      onChange={() => {
        dirtyRef.current = true;
      }}
    >
      {settings ? <input type="hidden" name="id" value={settings.id} /> : null}

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p
          role="status"
          className="rounded-lg border border-accent/20 bg-accent-soft px-3 py-2 text-sm text-ink"
        >
          {state.message}
        </p>
      ) : null}

      {!settings ? (
        <p className="text-sm text-ink-soft">
          No settings row yet. The first save creates the singleton. These
          flags are public website configuration, not secrets.
        </p>
      ) : null}

      <label className="flex items-start gap-3 text-sm font-medium text-ink">
        <input
          name="contact_form_enabled"
          type="checkbox"
          defaultChecked={settings?.contact_form_enabled ?? false}
          disabled={pending}
          className="mt-1 h-4 w-4"
        />
        <span>
          Contact form enabled
          <span className="mt-1 block font-normal text-ink-faint">
            Stores the public flag only. The contact form itself is not
            implemented here.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3 text-sm font-medium text-ink">
        <input
          name="site_indexable"
          type="checkbox"
          defaultChecked={settings?.site_indexable ?? true}
          disabled={pending}
          className="mt-1 h-4 w-4"
        />
        <span>
          Site indexable
          <span className="mt-1 block font-normal text-ink-faint">
            Public flag. robots.txt still uses the static Next.js route until
            a later cutover.
          </span>
        </span>
      </label>

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper-elevated disabled:opacity-60"
        >
          Save flags
        </button>
      </div>
    </form>
  );
}
