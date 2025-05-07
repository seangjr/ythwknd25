import "@/app/globals.css";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SonnerProvider } from "@/components/sonner-provider";
import "@/styles/fonts.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YTHWKND 2025: The Multiverse of Mystery",
  description: "When Eric Veed mysteriously vanishes, five classmates set out to investigate. Their search leads them to a strange beach where reality begins to unravel. Join the battle to save the multiverse.",
  keywords: ["YTHWKND", "YMFGAKL", "multiverse", "mystery", "sci-fi", "adventure", "2025", "high school event"],
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
    title: "YTHWKND 2025: The Multiverse of Mystery",
    description: "When Eric Veed mysteriously vanishes, five classmates set out to investigate. Their search leads them to a strange beach where reality begins to unravel. Join the battle to save the multiverse.",
    url: "https://ythwknd25.ymfgakl.com",
    siteName: "YTHWKND 2025",
    images: [
      {
        url: "/landing.png",
        width: 1200,
        height: 630,
        alt: "YTHWKND 2025: The Multiverse of Mystery",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YTHWKND 2025: The Multiverse of Mystery",
    description: "When Eric Veed mysteriously vanishes, five classmates set out to investigate. Their search leads them to a strange beach where reality begins to unravel. Join the battle to save the multiverse.",
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
