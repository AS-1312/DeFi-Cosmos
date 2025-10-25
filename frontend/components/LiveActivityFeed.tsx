"use client"

import { useState } from "react"
import { ArrowDownUp, TrendingUp, TrendingDown, Coins, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useActivityFeed } from "@/hooks/useActivityFeed"

type Protocol = "uniswap" | "aave" | "curve" | "lido"

const protocolColors: Record<Protocol, string> = {
  uniswap: "bg-[#ff007a] text-white",
  aave: "bg-[#8b5cf6] text-white",
  curve: "bg-[#3b82f6] text-white",
  lido: "bg-[#f97316] text-white",
}

const getTypeIcon = (txType: string): { icon: typeof ArrowDownUp; color: string } => {
  const type = txType.toLowerCase();
  
  // Uniswap types
  if (type.includes('swap') || type.includes('exchange')) {
    return { icon: ArrowDownUp, color: "text-pink-400" };
  }
  
  // Aave/Lido types
  if (type.includes('supply') || type.includes('deposit') || type.includes('submit')) {
    return { icon: TrendingUp, color: "text-green-400" };
  }
  
  if (type.includes('withdraw') || type.includes('redeem')) {
    return { icon: TrendingDown, color: "text-yellow-400" };
  }
  
  if (type.includes('borrow')) {
    return { icon: Coins, color: "text-blue-400" };
  }
  
  if (type.includes('repay')) {
    return { icon: Coins, color: "text-purple-400" };
  }
  
  if (type.includes('liquidation')) {
    return { icon: TrendingDown, color: "text-red-400" };
  }
  
  // Curve types
  if (type.includes('addliquidity')) {
    return { icon: TrendingUp, color: "text-green-400" };
  }
  
  if (type.includes('removeliquidity')) {
    return { icon: TrendingDown, color: "text-yellow-400" };
  }
  
  // Default
  return { icon: ArrowDownUp, color: "text-gray-400" };
};

export function LiveActivityFeed() {
  const [filter, setFilter] = useState<"all" | "whale" | Protocol>("all")
  const { transactions, loading } = useActivityFeed(100)

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true
    if (filter === "whale") return tx.isWhale
    return tx.protocol === filter
  })

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Live Activity</h2>
          <p className="text-sm text-gray-400">Real-time DeFi transactions</p>
        </div>
        <div className="flex h-2 w-2 items-center justify-center">
          <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className={filter === "all" ? "bg-purple-600 hover:bg-purple-700" : "glass-panel border-white/10"}
        >
          All
        </Button>
        <Button
          variant={filter === "uniswap" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("uniswap")}
          className={filter === "uniswap" ? "bg-[#ff007a] hover:bg-[#ff007a]/80" : "glass-panel border-white/10"}
        >
          🦄 Uniswap
        </Button>
        <Button
          variant={filter === "aave" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("aave")}
          className={filter === "aave" ? "bg-[#8b5cf6] hover:bg-[#8b5cf6]/80" : "glass-panel border-white/10"}
        >
          🏦 Aave
        </Button>
        <Button
          variant={filter === "lido" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("lido")}
          className={filter === "lido" ? "bg-[#f97316] hover:bg-[#f97316]/80" : "glass-panel border-white/10"}
        >
          🌊 Lido
        </Button>
        <Button
          variant={filter === "curve" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("curve")}
          className={filter === "curve" ? "bg-[#3b82f6] hover:bg-[#3b82f6]/80" : "glass-panel border-white/10"}
        >
          🔷 Curve
        </Button>
        <Button
          variant={filter === "whale" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("whale")}
          className={filter === "whale" ? "bg-amber-600 hover:bg-amber-700" : "glass-panel border-white/10"}
        >
          Whale Only 🐋
        </Button>
      </div>

      {/* Transaction Feed */}
      <div className="h-[600px] space-y-3 overflow-y-auto pr-2">
        {filteredTransactions.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            No transactions found
          </div>
        ) : (
          filteredTransactions.map((tx, index) => {
            const typeIconData = getTypeIcon(tx.type)
            const TypeIcon = typeIconData.icon
            return (
              <div
                key={tx.id}
                className={`glass-card-hover rounded-lg p-4 transition-all duration-300 ${
                  tx.isWhale ? "border-2 border-amber-500/50" : ""
                } ${index === 0 ? "animate-in fade-in slide-in-from-top-2 duration-500" : ""}`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Protocol Badge & Type Icon */}
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full px-3 py-1 text-xs font-semibold ${protocolColors[tx.protocol]}`}>
                      {tx.protocol.charAt(0).toUpperCase() + tx.protocol.slice(1)}
                    </div>
                    <TypeIcon className={`h-5 w-5 ${typeIconData.color}`} />
                  </div>

                  {/* Center: Transaction Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-300">
                        {tx.from.length > 42 ? `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}` : tx.from}
                      </span>
                      {tx.isWhale && <span className="text-lg">🐋</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="capitalize">{tx.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(tx.timestamp)}</span>
                    </div>
                  </div>

                  {/* Right: Amount & Link */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-base font-bold text-white">{tx.amount}</div>
                    </div>
                    <a
                      href={`https://etherscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 transition-colors hover:text-purple-300"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
