import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

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
        <div className="cosmic-bg fixed inset-0 -z-10" />
        <div className="starfield fixed inset-0 -z-10" />
        <div className="relative min-h-screen">{children}</div>
      </body>
    </html>
  )
}
