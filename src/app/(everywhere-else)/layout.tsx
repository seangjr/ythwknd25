import "@/app/globals.css";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SonnerProvider } from "@/components/sonner-provider";
import "@/styles/fonts.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YTHWKND 2025 by YMFGAKL",
  description: "Join us for YTHWKND 2025, an exciting event by YMFGAKL. Experience innovation, networking, and inspiration.",
  keywords: ["YTHWKND", "YMFGAKL", "event", "2025", "networking", "innovation"],
  authors: [{ name: "YMFGAKL" }],
  creator: "YMFGAKL",
  publisher: "YMFGAKL",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ythwknd25.ymfgakl.com"),
  openGraph: {
    title: "YTHWKND 2025 by YMFGAKL",
    description: "Join us for YTHWKND 2025, an exciting event by YMFGAKL. Experience innovation, networking, and inspiration.",
    url: "https://ythwknd25.ymfgakl.com",
    siteName: "YTHWKND 2025",
    images: [
      {
        url: "/landing.png",
        width: 1200,
        height: 630,
        alt: "YTHWKND 2025",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YTHWKND 2025 by YMFGAKL",
    description: "Join us for YTHWKND 2025, an exciting event by YMFGAKL. Experience innovation, networking, and inspiration.",
    images: ["/landing.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/favicon.png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.png",
      },
    ],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased bg-black text-[#BABABA] min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <SonnerProvider />
      </body>
    </html>
  );
}
