import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Header } from "../components/Header"
import { SideNav } from "../components/SideNav"
import { BottomTicker } from "../components/BottomTicker"
import { Providers } from './providers'

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DeFi Cosmos - Analytics Dashboard",
  description: "Live multi-protocol DeFi analytics powered by Envio",
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
        <Providers>
          {/* Cosmic Background with Gradient */}
          <div className="cosmic-bg fixed inset-0 -z-10" />

          {/* Animated Starfield */}
          <div className="starfield fixed inset-0 -z-10" />

          {/* Header - Fixed at top */}
          <Header />

          {/* Side Navigation - Fixed at left */}
          <SideNav />

          {/* Main Content Area - Offset for header, sidebar, and ticker */}
          <main className="ml-[240px] mt-[64px] mb-[60px] p-8 min-h-[calc(100vh-124px)]">{children}</main>

          {/* Bottom Ticker - Fixed at bottom */}
          <BottomTicker />
        </Providers>
      </body>
    </html>
  )
}
