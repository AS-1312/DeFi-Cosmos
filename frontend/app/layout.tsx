import type React from "react";
import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import BottomTicker from "@/components/BottomTicker"

export const metadata: Metadata = {
  title: "DeFi Cosmos",
  description: "A dashboard for DeFi protocols",
  generator: "Next.js",
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${GeistMono.variable} antialiased`}>
      <body className="font-sans">
        <Suspense fallback={<div>Loading...</div>}>
          <Header />
          {children}
          <BottomTicker />
        </Suspense>
      </body>
    </html>
  );
}
