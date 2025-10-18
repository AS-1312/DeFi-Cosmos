"use client"

import { useState, useEffect } from "react"
import { Settings, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [blockNumber, setBlockNumber] = useState(18234567)
  const [gasPrice, setGasPrice] = useState(23)

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockNumber((prev) => prev + 1)
      setGasPrice((prev) => Math.max(15, Math.min(50, prev + (Math.random() - 0.5) * 3)))
    }, 12000)

    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10 shadow-lg shadow-purple-500/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Left Section - Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <span className="text-white font-bold text-xl">DC</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                DeFi Cosmos
              </h1>
              <p className="text-xs text-white/60">Real-time Protocol Observatory</p>
            </div>
          </div>

          {/* Center Section - Network Vitals */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Block Number */}
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div>
                <div className="text-xs text-white/60">Block</div>
                <div className="text-sm font-bold text-white">{blockNumber.toLocaleString()}</div>
              </div>
            </div>

            {/* Gas Price */}
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <div>
                <div className="text-xs text-white/60">Gas</div>
                <div className="text-sm font-bold text-white">{gasPrice.toFixed(1)} Gwei</div>
              </div>
            </div>

            {/* Active Protocols */}
            <div className="glass-card px-4 py-2">
              <div className="text-xs text-white/60">Protocols</div>
              <div className="text-sm font-bold text-white">5 Active</div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3">
            {/* Network Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-white/80">Ethereum</span>
            </div>

            {/* Connect Wallet Button */}
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full px-6 shadow-lg shadow-purple-500/50 transition-all hover:shadow-purple-500/70">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
