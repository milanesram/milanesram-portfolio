"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  saveJourneyMilestoneAction,
  type MutationState,
} from "@/app/admin/journey/actions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type {
  AdminJourneyMediaChoice,
  AdminJourneyMilestone,
} from "@/lib/admin/journey/queries";

const initialState: MutationState = { error: null, message: null };
const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

type JourneyFormProps = {
  milestone?: AdminJourneyMilestone | null;
  mediaChoices: AdminJourneyMediaChoice[];
};

export function JourneyForm({ milestone, mediaChoices }: JourneyFormProps) {
  const [state, formAction, pending] = useActionState(
    saveJourneyMilestoneAction,
    initialState,
  );
  const dirtyRef = useRef(false);
  const hasMedia = Boolean(milestone?.media_asset_id);
  const mediaRequired = !hasMedia;
  const isGraduationDraft =
    milestone?.id === "c52c0001-0000-4000-8000-000000000046" ||
    (milestone?.title ?? "").includes("MSIS Graduation");

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
      className="space-y-6"
      noValidate
      onChange={() => {
        dirtyRef.current = true;
      }}
    >
      {milestone ? <input type="hidden" name="id" value={milestone.id} /> : null}

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

      {milestone ? (
        <p className="text-sm text-ink-soft">
          Status: <StatusBadge status={milestone.status} />
        </p>
      ) : null}

      {mediaRequired ? (
        <p
          role="status"
          className="rounded-lg border border-line bg-accent-soft px-3 py-2 text-sm text-ink"
        >
          {isGraduationDraft
            ? "NORTHWESTERN GRADUATION MILESTONE — DRAFT / MEDIA REQUIRED. "
            : ""}
          A draft can be saved without an image. Publishing requires an approved
          public image.
        </p>
      ) : null}

      <label className={labelClass}>
        Title
        <input
          name="title"
          required
          defaultValue={milestone?.title}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Year
        <input
          name="year"
          inputMode="numeric"
          defaultValue={milestone?.year ?? ""}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Caption
        <textarea
          name="caption"
          required
          rows={4}
          defaultValue={milestone?.caption}
          disabled={pending}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Media
        <select
          name="media_asset_id"
          defaultValue={milestone?.media_asset_id ?? ""}
          disabled={pending}
          className={fieldClass}
        >
          <option value="">None — draft only</option>
          {mediaChoices.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {choice.title}
              {choice.status !== "published" || !choice.is_public
                ? " · not publicly eligible"
                : ""}
            </option>
          ))}
        </select>
      </label>
      <label className={`${labelClass} max-w-[8rem]`}>
        Order
        <input
          name="sort_order"
          inputMode="numeric"
          required
          defaultValue={milestone?.sort_order ?? 70}
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
        {milestone ? (
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
