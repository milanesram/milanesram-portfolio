import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { AppChrome } from "@/components/layout/AppChrome";
import { getPublishedSiteProfile } from "@/lib/content/profile";
import { profileFromPublishedResult } from "@/lib/content/site-profile";
import { generateRootMetadata } from "@/lib/metadata";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  return generateRootMetadata();
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const profile = profileFromPublishedResult(await getPublishedSiteProfile());

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
        <AppChrome profile={profile}>{children}</AppChrome>
      </body>
    </html>
  );
}
