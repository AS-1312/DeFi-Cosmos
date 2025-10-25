"use client"

import { useState, useEffect } from "react"
import { Settings, Wallet, Box, Grid3x3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileNav } from "./MobileNav"
import { useProtocolStats } from "@/hooks/useProtocolStats"

export function Header() {
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d")
  const { protocols } = useProtocolStats()

  // Get the latest block number from all protocols
  const latestBlock = protocols.reduce((max, protocol) => {
    if (protocol.lastBlockNumber) {
      const blockNum = parseInt(protocol.lastBlockNumber)
      return blockNum > max ? blockNum : max
    }
    return max
  }, 0)

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10 shadow-lg shadow-purple-500/10">
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <span className="text-white font-bold text-base md:text-xl">DC</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                DeFi Cosmos
              </h1>
              <p className="text-[10px] md:text-xs text-white/60 hidden md:block">Real-time Protocol Observatory</p>
            </div>
          </div>

          <div className="hidden md:flex flex-wrap items-center gap-3">
            {/* Block Number */}
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div>
                <div className="text-xs text-white/60">Block</div>
                <div className="text-sm font-bold text-white">{latestBlock.toLocaleString()}</div>
              </div>
            </div>

            {/* Active Protocols */}
            <div className="glass-card px-4 py-2">
              <div className="text-xs text-white/60">Protocols</div>
              <div className="text-sm font-bold text-white">4 Active</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Network Indicator - smaller on mobile */}
            <div className="hidden sm:flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs md:text-sm text-white/80">ETH</span>
            </div>

            {/* View Mode Toggle - hidden on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => setViewMode(viewMode === "3d" ? "2d" : "3d")}
              title={`Switch to ${viewMode === "3d" ? "2D" : "3D"} view`}
            >
              {viewMode === "3d" ? <Box className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
            </Button>

            {/* Settings - hidden on mobile, replaced by hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-white/60 hover:text-white hover:bg-white/10"
            >
              <Settings className="w-5 h-5" />
            </Button>

            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  )
}
