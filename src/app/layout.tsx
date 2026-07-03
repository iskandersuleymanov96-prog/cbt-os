import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "CBT OS — Осознанность",
  description: "Личная система когнитивно-поведенческой терапии. Понимайте свои мысли, выявляйте паттерны, развивайте осознанность.",
  manifest: "/manifest.json",
  themeColor: "#4a6fa5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CBT OS",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "mobile-web-app-capable": "yes",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`min-h-screen antialiased ${inter.variable}`} style={{ fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif" }}>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
