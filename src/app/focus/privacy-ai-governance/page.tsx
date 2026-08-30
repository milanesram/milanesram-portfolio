import { FocusView } from "@/components/focus/FocusView";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(
  "Privacy and AI Governance",
  "Privacy and AI-governance profile for Rainier (Ram) Milanes — privacy operations, privacy by design, and Shadow AI risk triage.",
  "/focus/privacy-ai-governance",
);

export default function PrivacyFocusPage() {
  return <FocusView trackId="privacy" />;
}
