import { indexNowKeyTextResponse } from "@/lib/indexnow";

export const dynamic = "force-dynamic";

export function GET() {
  return indexNowKeyTextResponse();
}
