"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  saveHomePageAction,
  type MutationState,
} from "@/app/admin/home/actions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type {
  AdminHomeChip,
  AdminHomeCredentialLink,
  AdminHomeExperienceLink,
  AdminHomePage,
  AdminHomePickerCredential,
  AdminHomePickerItem,
  AdminHomePickerProject,
  AdminHomeProofItem,
} from "@/lib/admin/home/queries";

const initialState: MutationState = { error: null, message: null };

const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

const CHIP_SLOTS = 8;
const PROOF_SLOTS = 6;

type HomeFormProps = {
  page?: AdminHomePage | null;
  chips: AdminHomeChip[];
  proofItems: AdminHomeProofItem[];
  experienceLinks: AdminHomeExperienceLink[];
  credentialLinks: AdminHomeCredentialLink[];
  experienceChoices: AdminHomePickerItem[];
  credentialChoices: AdminHomePickerCredential[];
  projectChoices: AdminHomePickerProject[];
};

export function HomeForm({
  page,
  chips,
  proofItems,
  experienceLinks,
  credentialLinks,
  experienceChoices,
  credentialChoices,
  projectChoices,
}: HomeFormProps) {
  const [state, formAction, pending] = useActionState(
    saveHomePageAction,
    initialState,
  );
  const dirtyRef = useRef(false);
  const selectedExperience = new Map(
    experienceLinks.map((link) => [link.experience_item_id, link.sort_order]),
  );
  const selectedCredentials = new Map(
    credentialLinks.map((link) => [link.credential_id, link.sort_order]),
  );

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
          No Home row yet. The first save creates the singleton.
        </p>
      )}

      <fieldset className="space-y-5">
        <legend className="font-serif text-xl text-ink">Hero</legend>
        <label className={labelClass}>
          Headline
          <input
            name="headline"
            required
            maxLength={200}
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
            maxLength={2000}
            rows={4}
            defaultValue={page?.lede}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            Primary CTA label
            <input
              name="primary_cta_label"
              required
              defaultValue={page?.primary_cta_label}
              disabled={pending}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Primary CTA URL
            <input
              name="primary_cta_href"
              required
              defaultValue={page?.primary_cta_href}
              disabled={pending}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Secondary CTA label
            <input
              name="secondary_cta_label"
              required
              defaultValue={page?.secondary_cta_label}
              disabled={pending}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Secondary CTA URL
            <input
              name="secondary_cta_href"
              required
              defaultValue={page?.secondary_cta_href}
              disabled={pending}
              className={fieldClass}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-serif text-xl text-ink">Domain chips</legend>
        <p className="text-sm text-ink-soft">
          Ordered labels. Empty rows are ignored.
        </p>
        {Array.from({ length: CHIP_SLOTS }, (_, index) => {
          const chip = chips[index];
          return (
            <div key={chip?.id ?? `chip-${index}`} className="grid gap-3 md:grid-cols-[1fr_7rem]">
              <label className={labelClass}>
                Chip
                <input
                  name="chip_label"
                  maxLength={40}
                  defaultValue={chip?.label ?? ""}
                  disabled={pending}
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                Order
                <input
                  name="chip_sort"
                  inputMode="numeric"
                  defaultValue={chip?.sort_order ?? (index + 1) * 10}
                  disabled={pending}
                  className={fieldClass}
                />
              </label>
            </div>
          );
        })}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-serif text-xl text-ink">Proof strip</legend>
        {Array.from({ length: PROOF_SLOTS }, (_, index) => {
          const item = proofItems[index];
          return (
            <div
              key={item?.id ?? `proof-${index}`}
              className="grid gap-3 rounded-lg border border-line p-4 md:grid-cols-2"
            >
              <label className={labelClass}>
                Label
                <input
                  name="proof_label"
                  defaultValue={item?.label ?? ""}
                  disabled={pending}
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                Supporting text
                <input
                  name="proof_supporting"
                  defaultValue={item?.supporting ?? ""}
                  disabled={pending}
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                Optional URL
                <input
                  name="proof_href"
                  defaultValue={item?.href ?? ""}
                  disabled={pending}
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                Order
                <input
                  name="proof_sort"
                  inputMode="numeric"
                  defaultValue={item?.sort_order ?? (index + 1) * 10}
                  disabled={pending}
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                Related credential
                <select
                  name="proof_credential_id"
                  defaultValue={item?.credential_id ?? ""}
                  disabled={pending}
                  className={fieldClass}
                >
                  <option value="">None</option>
                  {credentialChoices.map((credential) => (
                    <option key={credential.id} value={credential.id}>
                      {credential.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Related project
                <select
                  name="proof_project_id"
                  defaultValue={item?.project_id ?? ""}
                  disabled={pending}
                  className={fieldClass}
                >
                  <option value="">None</option>
                  {projectChoices.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          );
        })}
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-serif text-xl text-ink">Featured project</legend>
        <label className={labelClass}>
          Project
          <select
            name="featured_project_id"
            defaultValue={page?.featured_project_id ?? ""}
            disabled={pending}
            className={fieldClass}
          >
            <option value="">None</option>
            {projectChoices.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Kicker
          <input
            name="project_kicker"
            required
            defaultValue={page?.project_kicker}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Heading
          <input
            name="project_heading"
            required
            defaultValue={page?.project_heading}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Problem
          <textarea
            name="project_problem"
            required
            rows={3}
            defaultValue={page?.project_problem}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          What I built
          <textarea
            name="project_body"
            required
            rows={3}
            defaultValue={page?.project_body}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Proof points (one per line)
          <textarea
            name="project_proof_points"
            rows={4}
            defaultValue={page?.project_proof_points.join("\n")}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            Project CTA label
            <input
              name="project_cta_label"
              required
              defaultValue={page?.project_cta_label}
              disabled={pending}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Project CTA URL
            <input
              name="project_cta_href"
              required
              defaultValue={page?.project_cta_href}
              disabled={pending}
              className={fieldClass}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-serif text-xl text-ink">Selected experience</legend>
        <p className="text-sm text-ink-soft">
          Selection uses stable item IDs. Editing bullet text does not break Home.
        </p>
        <ul className="space-y-3">
          {experienceChoices.map((choice, index) => {
            const sort = selectedExperience.get(choice.id) ?? (index + 1) * 10;
            return (
              <li key={choice.id} className="rounded-lg border border-line p-3">
                <label className="flex items-start gap-3 text-sm text-ink">
                  <input
                    type="checkbox"
                    name="experience_item_id"
                    value={choice.id}
                    defaultChecked={selectedExperience.has(choice.id)}
                    disabled={pending}
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    <span className="font-medium">
                      {choice.organization} · {choice.title}
                    </span>
                    <span className="mt-1 block text-ink-soft">{choice.excerpt}</span>
                  </span>
                </label>
                <label className={`${labelClass} mt-3 max-w-[8rem]`}>
                  Order
                  <input
                    name={`experience_sort_${choice.id}`}
                    inputMode="numeric"
                    defaultValue={sort}
                    disabled={pending}
                    className={fieldClass}
                  />
                </label>
              </li>
            );
          })}
        </ul>
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            Experience kicker
            <input
              name="experience_kicker"
              required
              defaultValue={page?.experience_kicker}
              disabled={pending}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Experience heading
            <input
              name="experience_heading"
              required
              defaultValue={page?.experience_heading}
              disabled={pending}
              className={fieldClass}
            />
          </label>
        </div>
        <label className={labelClass}>
          Experience lede
          <textarea
            name="experience_lede"
            required
            rows={2}
            defaultValue={page?.experience_lede}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            Experience CTA label
            <input
              name="experience_cta_label"
              required
              defaultValue={page?.experience_cta_label}
              disabled={pending}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Experience CTA URL
            <input
              name="experience_cta_href"
              required
              defaultValue={page?.experience_cta_href}
              disabled={pending}
              className={fieldClass}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-serif text-xl text-ink">Selected credentials</legend>
        <ul className="space-y-3">
          {credentialChoices.map((choice, index) => {
            const sort = selectedCredentials.get(choice.id) ?? (index + 1) * 10;
            const ineligible =
              choice.status !== "published" || choice.needs_verification;
            return (
              <li key={choice.id} className="rounded-lg border border-line p-3">
                <label className="flex items-start gap-3 text-sm text-ink">
                  <input
                    type="checkbox"
                    name="credential_id"
                    value={choice.id}
                    defaultChecked={selectedCredentials.has(choice.id)}
                    disabled={pending}
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    <span className="font-medium">{choice.name}</span>
                    <span className="mt-1 block text-ink-soft">
                      {choice.issuer}
                      {choice.year_label ? ` · ${choice.year_label}` : ""}
                      {ineligible ? " · not publicly eligible" : ""}
                    </span>
                  </span>
                </label>
                <label className={`${labelClass} mt-3 max-w-[8rem]`}>
                  Order
                  <input
                    name={`credential_sort_${choice.id}`}
                    inputMode="numeric"
                    defaultValue={sort}
                    disabled={pending}
                    className={fieldClass}
                  />
                </label>
              </li>
            );
          })}
        </ul>
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            Credentials kicker
            <input
              name="credentials_kicker"
              required
              defaultValue={page?.credentials_kicker}
              disabled={pending}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Credentials heading
            <input
              name="credentials_heading"
              required
              defaultValue={page?.credentials_heading}
              disabled={pending}
              className={fieldClass}
            />
          </label>
        </div>
        <label className={labelClass}>
          Credentials lede
          <textarea
            name="credentials_lede"
            required
            rows={2}
            defaultValue={page?.credentials_lede}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            Credentials CTA label
            <input
              name="credentials_cta_label"
              required
              defaultValue={page?.credentials_cta_label}
              disabled={pending}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Credentials CTA URL
            <input
              name="credentials_cta_href"
              required
              defaultValue={page?.credentials_cta_href}
              disabled={pending}
              className={fieldClass}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-serif text-xl text-ink">Focus framing</legend>
        <p className="text-sm text-ink-soft">
          This section only edits Home heading copy. Track cards read hosted
          Focus records.
        </p>
        <label className={labelClass}>
          Focus kicker
          <input
            name="focus_kicker"
            required
            defaultValue={page?.focus_kicker}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Focus heading
          <input
            name="focus_heading"
            required
            defaultValue={page?.focus_heading}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Focus lede
          <textarea
            name="focus_lede"
            required
            rows={2}
            defaultValue={page?.focus_lede}
            disabled={pending}
            className={fieldClass}
          />
        </label>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-serif text-xl text-ink">Closing CTA</legend>
        <label className={labelClass}>
          Heading
          <input
            name="closing_heading"
            required
            defaultValue={page?.closing_heading}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Body
          <textarea
            name="closing_body"
            required
            rows={2}
            defaultValue={page?.closing_body}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            Primary CTA label
            <input
              name="closing_primary_cta_label"
              required
              defaultValue={page?.closing_primary_cta_label}
              disabled={pending}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Primary CTA URL
            <input
              name="closing_primary_cta_href"
              required
              defaultValue={page?.closing_primary_cta_href}
              disabled={pending}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Secondary CTA label
            <input
              name="closing_secondary_cta_label"
              required
              defaultValue={page?.closing_secondary_cta_label}
              disabled={pending}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Secondary CTA URL
            <input
              name="closing_secondary_cta_href"
              required
              defaultValue={page?.closing_secondary_cta_href}
              disabled={pending}
              className={fieldClass}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-serif text-xl text-ink">Home metadata</legend>
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
