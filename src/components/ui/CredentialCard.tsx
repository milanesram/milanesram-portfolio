import type { Credential } from "@/content/types";
import { formatCredentialExpiry } from "@/lib/content/credential-map";

const kindLabel: Record<Credential["kind"], string> = {
  degree: "Education",
  certification: "Certification",
  training: "Training",
  license: "Licensure",
};

export function CredentialCard({
  credential,
  compact = false,
}: {
  credential: Credential;
  compact?: boolean;
}) {
  return (
    <article className="rounded-xl border border-line bg-paper-elevated p-5">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
        {kindLabel[credential.kind]}
      </p>
      <h3 className="mt-2 font-medium text-ink">{credential.name}</h3>
      <p className="mt-1 text-sm text-ink-soft">
        {credential.issuer}
        {credential.yearLabel ? ` · ${credential.yearLabel}` : null}
      </p>
      {!compact && credential.details ? (
        <p className="mt-3 text-sm leading-6 text-ink-soft">{credential.details}</p>
      ) : null}
      {!compact && credential.expiresOn ? (
        <p className="mt-3 text-sm text-ink-soft">
          {formatCredentialExpiry(credential.expiresOn)}
        </p>
      ) : null}
      {!compact && credential.verificationUrl ? (
        <p className="mt-3">
          <a
            href={credential.verificationUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-accent hover:underline"
          >
            {`Verify ${credential.name}`}
          </a>
        </p>
      ) : null}
    </article>
  );
}
