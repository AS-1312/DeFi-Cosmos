"use client"

import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 py-4 px-6 shadow-lg shadow-purple-500/10 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* LEFT SECTION - Logo & Tagline */}
        <div className="flex flex-col gap-1">
          <h1 className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-600 bg-clip-text text-2xl font-bold text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            DeFi Cosmos
          </h1>
          <p className="text-sm text-gray-400">Real-time Protocol Observatory</p>
        </div>

        {/* CENTER SECTION - Network Vitals */}
        <div className="flex flex-wrap gap-3 lg:flex-1 lg:justify-center">
          {/* Block Number */}
          <div className="glass-card flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Block</span>
              <span className="text-sm font-semibold text-white">19,234,567</span>
            </div>
          </div>

          {/* Gas Price */}
          <div className="glass-card flex items-center gap-2 rounded-lg px-3 py-2">
            <span className="text-lg">🔥</span>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Gas</span>
              <span className="text-sm font-semibold text-white">23 Gwei</span>
            </div>
          </div>

          {/* Active Protocols */}
          <div className="glass-card flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20">
              <span className="text-sm font-bold text-purple-400">5</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Protocols</span>
              <span className="text-sm font-semibold text-white">Active</span>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION - Wallet & Settings */}
        <div className="flex items-center gap-3">
          {/* Network Indicator */}
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-300">Ethereum</span>
          </div>

          {/* Connect Wallet Button */}
          <Button className="rounded-full bg-gradient-to-r from-purple-600 to-violet-600 px-6 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-purple-500/50">
            Connect Wallet
          </Button>

          {/* Settings Button */}
          <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:bg-white/10 hover:text-white">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
