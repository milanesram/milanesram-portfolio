import { FocusView } from "@/components/focus/FocusView";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(
  "Cybersecurity, GRC, and IT Risk",
  "Cybersecurity, GRC, and IT-risk profile for Rainier (Ram) Milanes — security governance, controls, audit readiness, and technology risk.",
  "/focus/cybersecurity-grc",
);

export default function CyberFocusPage() {
  return <FocusView trackId="cyber" />;
}
