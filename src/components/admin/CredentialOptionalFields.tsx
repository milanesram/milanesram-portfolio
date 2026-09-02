const fieldClass =
  "mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink disabled:opacity-60";
const labelClass = "block text-sm font-medium text-ink";

export function CredentialOptionalFields({
  verificationUrl,
  expiresOn,
  pending,
}: {
  verificationUrl?: string | null;
  expiresOn?: string | null;
  pending: boolean;
}) {
  return (
    <>
      <label className={labelClass}>
        Verification URL
        <input
          name="verification_url"
          type="url"
          inputMode="url"
          defaultValue={verificationUrl ?? ""}
          disabled={pending}
          className={fieldClass}
          aria-describedby="verification-hint"
        />
        <span
          id="verification-hint"
          className="mt-1 block text-xs font-normal text-ink-faint"
        >
          Optional. HTTPS only. Leave blank unless an approved public
          verification page exists.
        </span>
      </label>
      <label className={labelClass}>
        Expires on
        <input
          name="expires_on"
          type="date"
          defaultValue={expiresOn ?? ""}
          disabled={pending}
          className={fieldClass}
          aria-describedby="expires-hint"
        />
        <span
          id="expires-hint"
          className="mt-1 block text-xs font-normal text-ink-faint"
        >
          Optional. Expiration does not unpublish the record.
        </span>
      </label>
    </>
  );
}
