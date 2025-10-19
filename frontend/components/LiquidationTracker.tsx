"use client"

import { useState } from "react"
import { AlertTriangle, TrendingDown, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LiquidationEvent {
  id: string
  protocol: string
  protocolColor: string
  wallet: string
  collateral: string
  debt: string
  liquidatedAmount: string
  timestamp: string
  txHash: string
  healthFactorBefore: number
}

const mockLiquidations: LiquidationEvent[] = [
  {
    id: "1",
    protocol: "Aave",
    protocolColor: "#8b5cf6",
    wallet: "0x742d...3f8a",
    collateral: "125 ETH",
    debt: "180,000 USDC",
    liquidatedAmount: "42 ETH",
    timestamp: "5m ago",
    txHash: "0xabc123",
    healthFactorBefore: 0.95,
  },
  {
    id: "2",
    protocol: "Compound",
    protocolColor: "#00d395",
    wallet: "0x8f3c...9d2b",
    collateral: "85,000 USDC",
    debt: "32 ETH",
    liquidatedAmount: "28,000 USDC",
    timestamp: "15m ago",
    txHash: "0xdef456",
    healthFactorBefore: 0.92,
  },
  {
    id: "3",
    protocol: "Aave",
    protocolColor: "#8b5cf6",
    wallet: "0x1a4e...7c6d",
    collateral: "65 ETH",
    debt: "95,000 DAI",
    liquidatedAmount: "22 ETH",
    timestamp: "28m ago",
    txHash: "0xghi789",
    healthFactorBefore: 0.88,
  },
  {
    id: "4",
    protocol: "Maker",
    protocolColor: "#1aab9b",
    wallet: "0x5b2a...4e1c",
    collateral: "150 ETH",
    debt: "215,000 DAI",
    liquidatedAmount: "58 ETH",
    timestamp: "1h ago",
    txHash: "0xjkl012",
    healthFactorBefore: 0.85,
  },
  {
    id: "5",
    protocol: "Compound",
    protocolColor: "#00d395",
    wallet: "0x9c7d...2f3a",
    collateral: "42 ETH",
    debt: "58,000 USDC",
    liquidatedAmount: "15 ETH",
    timestamp: "2h ago",
    txHash: "0xmno345",
    healthFactorBefore: 0.93,
  },
]

export function LiquidationTracker() {
  const [filter, setFilter] = useState<"all" | "aave" | "compound" | "maker">("all")

  const filteredLiquidations = mockLiquidations.filter((liq) => {
    if (filter === "all") return true
    return liq.protocol.toLowerCase() === filter
  })

  const totalLiquidated24h = mockLiquidations.length
  const avgHealthFactor = (
    mockLiquidations.reduce((sum, liq) => sum + liq.healthFactorBefore, 0) / mockLiquidations.length
  ).toFixed(2)

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <span>Liquidation Events</span>
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-400">24h Count</div>
              <div className="text-xl font-bold text-red-400">{totalLiquidated24h}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Avg Health Before</div>
              <div className="text-xl font-bold text-yellow-400">{avgHealthFactor}</div>
            </div>
          </div>
        </div>
        <p className="text-sm text-white/60">Real-time liquidation monitoring across lending protocols</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className={filter === "all" ? "bg-red-500/20 border-red-500/50 text-red-300" : ""}
        >
          All Protocols
        </Button>
        <Button
          variant={filter === "aave" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("aave")}
          className={filter === "aave" ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : ""}
        >
          Aave
        </Button>
        <Button
          variant={filter === "compound" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("compound")}
          className={filter === "compound" ? "bg-green-500/20 border-green-500/50 text-green-300" : ""}
        >
          Compound
        </Button>
        <Button
          variant={filter === "maker" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("maker")}
          className={filter === "maker" ? "bg-teal-500/20 border-teal-500/50 text-teal-300" : ""}
        >
          Maker
        </Button>
      </div>

      {/* Liquidation List */}
      <div className="space-y-3">
        {filteredLiquidations.map((liq, index) => (
          <div
            key={liq.id}
            className={`glass-card-hover p-4 border border-red-500/20 rounded-lg ${
              index === 0 ? "animate-in fade-in slide-in-from-top-2 duration-500" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Protocol & Wallet */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: liq.protocolColor }}
                  >
                    {liq.protocol}
                  </div>
                  <span className="text-white/60 text-sm font-mono">{liq.wallet}</span>
                  <span className="text-white/40 text-xs">{liq.timestamp}</span>
                </div>

                {/* Position Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Collateral</div>
                    <div className="text-white font-semibold">{liq.collateral}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Debt</div>
                    <div className="text-white font-semibold">{liq.debt}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Liquidated</div>
                    <div className="text-red-400 font-semibold flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      {liq.liquidatedAmount}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Health Factor</div>
                    <div className="text-yellow-400 font-semibold">{liq.healthFactorBefore.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Right: Link */}
              <a
                href={`https://etherscan.io/tx/${liq.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
          <div className="text-sm text-white/70">
            <span className="font-semibold text-red-400">Warning:</span> Liquidations occur when a position's health
            factor drops below 1.0. Monitor your positions to avoid liquidation penalties.
          </div>
        </div>
      </div>
    </div>
  )
}
