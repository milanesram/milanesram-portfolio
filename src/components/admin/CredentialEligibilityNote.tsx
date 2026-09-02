import { credentialEligibilityLabel } from "@/lib/admin/credentials/fields";
import type { ContentStatus } from "@/lib/supabase/database.types";

export function CredentialEligibilityNote({
  status,
  needsVerification,
}: {
  status: ContentStatus;
  needsVerification: boolean;
}) {
  return (
    <p className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink-soft">
      Public eligibility:{" "}
      <span className="font-medium text-ink">
        {credentialEligibilityLabel({
          status,
          needs_verification: needsVerification,
        })}
      </span>
      . Public pages show a credential only when it is published and not held
      for verification.
    </p>
  );
}
