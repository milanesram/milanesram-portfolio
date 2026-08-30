import { ImageResponse } from "next/og";
import { siteProfile } from "@/content";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
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
          {siteProfile.displayName}
        </div>
        <div
          style={{
            fontSize: 56,
            lineHeight: 1.15,
            maxWidth: 920,
          }}
        >
          {siteProfile.headline}
        </div>
        <div style={{ fontSize: 24, color: "#3E4B5C" }}>
          Cybersecurity · GRC · Privacy · AI Governance
        </div>
      </div>
    ),
    size,
  );
}
