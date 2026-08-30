import "server-only";
import { getPublicSiteSettings } from "@/lib/content/settings";
import { isContactIntakeConfigured } from "./config";
import { issueContactFormToken } from "./crypto";

export async function getPublicContactFormToken(): Promise<string | null> {
  if (!isContactIntakeConfigured()) {
    return null;
  }

  const settings = await getPublicSiteSettings();

  if (!settings?.contactFormEnabled) {
    return null;
  }

  try {
    return issueContactFormToken();
  } catch {
    return null;
  }
}
