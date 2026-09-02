import type { ContentStatus } from "@/lib/supabase/database.types";

export type PublicIndexChrome = {
  kicker: string;
  headline: string;
  lede: string;
};

export type IndexChromeRow = {
  status: ContentStatus | string;
  kicker: string;
  headline: string;
  lede: string;
};

export function mapIndexChrome(
  row: IndexChromeRow,
  fallbackKicker: string,
): PublicIndexChrome | null {
  if (row.status !== "published") {
    return null;
  }

  const headline = row.headline.trim();
  const lede = row.lede.trim();

  if (!headline || !lede) {
    return null;
  }

  return {
    kicker: row.kicker.trim() || fallbackKicker,
    headline,
    lede,
  };
}
