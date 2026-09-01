import { ImageResponse } from "next/og";
import { getPublishedSiteProfile } from "@/lib/content/profile";
import {
  SITE_CHROME_FALLBACK,
  profileFromPublishedResult,
} from "@/lib/content/site-profile";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const dynamic = "force-dynamic";

export default async function OpenGraphImage() {
  const profile = profileFromPublishedResult(await getPublishedSiteProfile());
  const displayName = profile?.displayName ?? SITE_CHROME_FALLBACK.displayName;
  const headline = profile?.headline ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F4F1EA",
          color: "#122033",
          padding: "72px",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#7C5340",
          }}
        >
          {displayName}
        </div>
        <div
          style={{
            fontSize: 56,
            lineHeight: 1.15,
            maxWidth: 920,
          }}
        >
          {headline}
        </div>
        <div style={{ fontSize: 24, color: "#3E4B5C" }}>
          Cybersecurity · GRC · IT Risk · Privacy
        </div>
      </div>
    ),
    size,
  );
}
