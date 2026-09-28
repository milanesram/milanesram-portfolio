import type { NextConfig } from "next";
import { PUBLIC_MEDIA_BUCKET } from "./src/lib/content/media-bucket";
import { securityHeaders } from "./src/lib/security-headers";

function supabasePublicMediaRemotePatterns(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!raw) {
    return [];
  }

  try {
    const url = new URL(raw);
    const protocol = url.protocol === "https:" ? "https" : url.protocol === "http:" ? "http" : null;

    if (!protocol) {
      return [];
    }

    return [
      {
        protocol,
        hostname: url.hostname,
        port: url.port,
        pathname: `/storage/v1/object/public/${PUBLIC_MEDIA_BUCKET}/**`,
        search: "",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "16mb",
    },
  },
  images: {
    remotePatterns: supabasePublicMediaRemotePatterns(),
  },
  headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders(process.env.NEXT_PUBLIC_SUPABASE_URL),
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/focus/privacy-ai-governance",
        destination: "/focus/privacy-compliance-assurance",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
