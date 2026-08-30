import "server-only";

const MIN_SECRET_LENGTH = 32;

export function isContactIntakeEnvEnabled(): boolean {
  return process.env.CONTACT_INTAKE_ENABLED === "true";
}

export function getContactRateLimitSecret(): string | null {
  const value = process.env.CONTACT_RATE_LIMIT_SECRET;

  if (!value || value.length < MIN_SECRET_LENGTH) {
    return null;
  }

  return value;
}

export function hasPrivilegedIntakeCredentials(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function isContactIntakeConfigured(): boolean {
  return (
    isContactIntakeEnvEnabled() &&
    getContactRateLimitSecret() != null &&
    hasPrivilegedIntakeCredentials()
  );
}
