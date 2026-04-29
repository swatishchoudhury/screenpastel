import type { Metadata } from "next";
import { Funnel_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const funnelSans = Funnel_Sans({
  variable: "--font-funnel-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Screen Pastel",
  description: "Create Beautiful Screenshots",
  openGraph: {
    images: [
      {
        url: "/og.png",
        width: 1182,
        height: 763,
        alt: "Screen Pastel - Create Beautiful Screenshots",
      },
    ],
  },
  twitter: {
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${funnelSans.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
