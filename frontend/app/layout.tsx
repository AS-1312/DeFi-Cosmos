import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { BottomTicker } from "@/components/BottomTicker"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DeFi Cosmos - Analytics Dashboard",
  description: "Explore the DeFi universe with real-time analytics",
  generator: "Next.js",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased`}>
        {/* Cosmic Background with Gradient */}
        <div className="cosmic-bg fixed inset-0 -z-10" />

        {/* Animated Starfield */}
        <div className="starfield fixed inset-0 -z-10" />

        {/* Main Content */}
        <div className="relative min-h-screen pb-[60px]">{children}</div>

        {/* Bottom Ticker Component */}
        <BottomTicker />
      </body>
    </html>
  )
}
