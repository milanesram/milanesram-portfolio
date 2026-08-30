const REQUIRED_PUBLIC_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

type PublicEnvName = (typeof REQUIRED_PUBLIC_ENV)[number];

function readPublicEnv(name: PublicEnvName): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseUrl(): string {
  return readPublicEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabasePublishableKey(): string {
  return readPublicEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
}

export function assertPublicSupabaseEnv(): void {
  for (const name of REQUIRED_PUBLIC_ENV) {
    readPublicEnv(name);
  }
}
