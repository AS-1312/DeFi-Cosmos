"use client"

import { Flame, Zap, DollarSign, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header role="banner" className="sticky top-0 z-50 h-16 border-b border-white/10">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
      <div className="relative flex items-center justify-between h-full px-6 max-w-[2000px] mx-auto">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/50"
          />
          <div>
            <h1 className="text-xl font-bold text-white">
              DeFi{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Cosmos</span>
            </h1>
          </div>
        </div>

        <div
          aria-label="Network Vitals"
          className="flex items-center gap-6 px-6 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10"
        >
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" aria-hidden="true" />
            <span className="text-xs text-gray-400">Gas:</span>
            <span className="text-sm font-semibold text-white">45 gwei</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" aria-hidden="true" />
            <span className="text-xs text-gray-400">TPS:</span>
            <span className="text-sm font-semibold text-white">147.2</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" aria-hidden="true" />
            <span className="text-xs text-gray-400">TVL:</span>
            <span className="text-sm font-semibold text-white">$12.8B</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <span className="text-xs text-gray-400">Protocols:</span>
            <span className="text-sm font-semibold text-white">4</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            Theme
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            Export Data
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/50 transition-all duration-300"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  )
}
