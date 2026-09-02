"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  saveAboutPageAction,
  type MutationState,
} from "@/app/admin/about/actions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type {
  AdminAboutListItem,
  AdminAboutPage,
  AdminAboutParagraph,
} from "@/lib/admin/about/queries";

const initialState: MutationState = { error: null, message: null };
const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";
const PARAGRAPH_SLOTS = 8;
const LIST_SLOTS = 6;

type AboutFormProps = {
  page?: AdminAboutPage | null;
  paragraphs: AdminAboutParagraph[];
  listItems: AdminAboutListItem[];
};

export function AboutForm({
  page,
  paragraphs,
  listItems,
}: AboutFormProps) {
  const [state, formAction, pending] = useActionState(
    saveAboutPageAction,
    initialState,
  );
  const dirtyRef = useRef(false);
  const speakingItems = listItems.filter((item) => item.kind === "speaking");
  const boundaryItems = listItems.filter((item) => item.kind === "boundary");

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
      className="space-y-10"
      noValidate
      onChange={() => {
        dirtyRef.current = true;
      }}
    >
      {page ? <input type="hidden" name="id" value={page.id} /> : null}

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

      {page ? (
        <p className="text-sm text-ink-soft">
          Status: <StatusBadge status={page.status} />
        </p>
      ) : (
        <p className="text-sm text-ink-soft">
          No About row yet. The first save creates the singleton.
        </p>
      )}

      <fieldset className="space-y-5">
        <legend className="font-serif text-xl text-ink">Hero</legend>
        <label className={labelClass}>
          Kicker
          <input
            name="kicker"
            required
            defaultValue={page?.kicker}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Headline
          <input
            name="headline"
            required
            defaultValue={page?.headline}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Lede
          <textarea
            name="lede"
            required
            rows={4}
            defaultValue={page?.lede}
            disabled={pending}
            className={fieldClass}
          />
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-serif text-xl text-ink">Narrative</legend>
        <p className="text-sm text-ink-soft">
          Ordered paragraphs. Empty rows are ignored.
        </p>
        {Array.from({ length: PARAGRAPH_SLOTS }, (_, index) => {
          const paragraph = paragraphs[index];
          return (
            <div key={paragraph?.id ?? `p-${index}`} className="space-y-3">
              <label className={labelClass}>
                Paragraph
                <textarea
                  name="paragraph_body"
                  rows={3}
                  defaultValue={paragraph?.body ?? ""}
                  disabled={pending}
                  className={fieldClass}
                />
              </label>
              <label className={`${labelClass} max-w-[8rem]`}>
                Order
                <input
                  name="paragraph_sort"
                  inputMode="numeric"
                  defaultValue={paragraph?.sort_order ?? (index + 1) * 10}
                  disabled={pending}
                  className={fieldClass}
                />
              </label>
            </div>
          );
        })}
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-serif text-xl text-ink">Section framing</legend>
        <label className={labelClass}>
          Journey heading
          <input
            name="journey_heading"
            required
            defaultValue={page?.journey_heading}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Education heading
          <input
            name="education_heading"
            required
            defaultValue={page?.education_heading}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <p className="text-sm text-ink-soft">
          Education facts remain on static credentials until a later step.
        </p>
        <label className={labelClass}>
          Speaking heading
          <input
            name="speaking_heading"
            required
            defaultValue={page?.speaking_heading}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Speaking body
          <textarea
            name="speaking_body"
            required
            rows={3}
            defaultValue={page?.speaking_body}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        {Array.from({ length: LIST_SLOTS }, (_, index) => {
          const item = speakingItems[index];
          return (
            <div key={item?.id ?? `s-${index}`} className="grid gap-3 md:grid-cols-[1fr_7rem]">
              <label className={labelClass}>
                Speaking item
                <input
                  name="speaking_item"
                  defaultValue={item?.body ?? ""}
                  disabled={pending}
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                Order
                <input
                  name="speaking_sort"
                  inputMode="numeric"
                  defaultValue={item?.sort_order ?? (index + 1) * 10}
                  disabled={pending}
                  className={fieldClass}
                />
              </label>
            </div>
          );
        })}
        <label className={labelClass}>
          Boundaries heading
          <input
            name="boundaries_heading"
            required
            defaultValue={page?.boundaries_heading}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        {Array.from({ length: LIST_SLOTS }, (_, index) => {
          const item = boundaryItems[index];
          return (
            <div key={item?.id ?? `b-${index}`} className="grid gap-3 md:grid-cols-[1fr_7rem]">
              <label className={labelClass}>
                Boundary item
                <input
                  name="boundary_item"
                  defaultValue={item?.body ?? ""}
                  disabled={pending}
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                Order
                <input
                  name="boundary_sort"
                  inputMode="numeric"
                  defaultValue={item?.sort_order ?? (index + 1) * 10}
                  disabled={pending}
                  className={fieldClass}
                />
              </label>
            </div>
          );
        })}
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-serif text-xl text-ink">About metadata</legend>
        <label className={labelClass}>
          SEO title
          <input
            name="seo_title"
            required
            defaultValue={page?.seo_title}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          SEO description
          <textarea
            name="seo_description"
            required
            rows={3}
            defaultValue={page?.seo_description}
            disabled={pending}
            className={fieldClass}
          />
        </label>
      </fieldset>

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
        {page ? (
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
