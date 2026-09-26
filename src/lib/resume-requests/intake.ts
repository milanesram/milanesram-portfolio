import "server-only";
import { issueContactFormToken } from "@/lib/contact/crypto";
import { getContactRateLimitSecret, hasPrivilegedIntakeCredentials } from "@/lib/contact/config";

export function isResumeRequestIntakeConfigured(): boolean {
  return getContactRateLimitSecret() != null && hasPrivilegedIntakeCredentials();
}

export async function getResumeRequestFormToken(): Promise<string | null> {
  if (!isResumeRequestIntakeConfigured()) {
    return null;
  }

  try {
    return issueContactFormToken();
  } catch {
    return null;
  }
}
