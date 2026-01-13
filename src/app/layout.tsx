import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/providers"

// Force dynamic rendering for all pages since we use Clerk
export const dynamic = "force-dynamic"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "HealthReturns - Get Rewarded for Your Health",
    template: "%s | HealthReturns",
  },
  description:
    "HealthReturns helps employers reward employees for improving or maintaining measurable health indicators through ACA-compliant wellness rebates.",
  keywords: [
    "wellness program",
    "health incentives",
    "employee benefits",
    "health rebates",
    "ACA compliant",
    "biomarker tracking",
    "corporate wellness",
  ],
  authors: [{ name: "HealthReturns" }],
  creator: "HealthReturns",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://healthreturns.com",
    siteName: "HealthReturns",
    title: "HealthReturns - Get Rewarded for Your Health",
    description:
      "Earn health rebates by improving or sustaining your health metrics.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HealthReturns - Get Rewarded for Your Health",
    description:
      "Earn health rebates by improving or sustaining your health metrics.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
