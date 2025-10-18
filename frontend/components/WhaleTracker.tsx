"use client"

import { useState } from "react"
import {
  Copy,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Target,
  Wheat,
  Zap,
  AlertTriangle,
  Bell,
  BellOff,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type PatternType = "accumulator" | "farmer" | "arbitrageur" | "panic"

interface WhaleData {
  id: string
  address: string
  ensName?: string
  avatar: string
  totalVolume: number
  transactionCount: number
  protocols: string[]
  crossProtocolMoves: number
  lastActive: string
  pattern: PatternType
  confidence: number
  isActive: boolean
  recentTransactions: {
    type: string
    protocol: string
    amount: number
    time: string
    hash: string
  }[]
  patternExplanation: string
  historicalAccuracy: number
  following: boolean
}

const patternConfig = {
  accumulator: {
    label: "Building Position",
    icon: Target,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/50",
  },
  farmer: {
    label: "Yield Harvesting",
    icon: Wheat,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/50",
  },
  arbitrageur: {
    label: "Fast Arbitrage",
    icon: Zap,
    color: "text-pink-400",
    bgColor: "bg-pink-500/20",
    borderColor: "border-pink-500/50",
  },
  panic: {
    label: "Rapid Exit",
    icon: AlertTriangle,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/50",
  },
}

const protocolColors: Record<string, string> = {
  Uniswap: "bg-[#ff007a]",
  Aave: "bg-[#8b5cf6]",
  Curve: "bg-[#3b82f6]",
  Lido: "bg-[#f97316]",
  Maker: "bg-[#1aab9b]",
}

const mockWhales: WhaleData[] = [
  {
    id: "1",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    ensName: "vitalik.eth",
    avatar: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    totalVolume: 12500000,
    transactionCount: 234,
    protocols: ["Uniswap", "Aave", "Curve"],
    crossProtocolMoves: 45,
    lastActive: "2m ago",
    pattern: "accumulator",
    confidence: 94,
    isActive: true,
    recentTransactions: [
      { type: "Deposit", protocol: "Aave", amount: 500000, time: "2m ago", hash: "0xabc123" },
      { type: "Swap", protocol: "Uniswap", amount: 250000, time: "15m ago", hash: "0xdef456" },
      { type: "Deposit", protocol: "Curve", amount: 750000, time: "1h ago", hash: "0xghi789" },
      { type: "Swap", protocol: "Uniswap", amount: 300000, time: "2h ago", hash: "0xjkl012" },
      { type: "Deposit", protocol: "Aave", amount: 450000, time: "3h ago", hash: "0xmno345" },
    ],
    patternExplanation:
      "Consistently accumulating positions across multiple protocols with increasing volume. Shows strong conviction in current market conditions.",
    historicalAccuracy: 87,
    following: false,
  },
  {
    id: "2",
    address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    avatar: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    totalVolume: 8900000,
    transactionCount: 567,
    protocols: ["Curve", "Lido", "Aave"],
    crossProtocolMoves: 89,
    lastActive: "5m ago",
    pattern: "farmer",
    confidence: 91,
    isActive: true,
    recentTransactions: [
      { type: "Withdraw", protocol: "Curve", amount: 200000, time: "5m ago", hash: "0xpqr678" },
      { type: "Deposit", protocol: "Lido", amount: 350000, time: "20m ago", hash: "0xstu901" },
      { type: "Withdraw", protocol: "Aave", amount: 180000, time: "45m ago", hash: "0xvwx234" },
      { type: "Deposit", protocol: "Curve", amount: 400000, time: "1h ago", hash: "0xyz567" },
      { type: "Swap", protocol: "Uniswap", amount: 150000, time: "2h ago", hash: "0xabc890" },
    ],
    patternExplanation:
      "Actively rotating capital between yield farming opportunities. Frequent deposits and withdrawals indicate yield optimization strategy.",
    historicalAccuracy: 82,
    following: true,
  },
  {
    id: "3",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    ensName: "arbitrage.eth",
    avatar: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    totalVolume: 15200000,
    transactionCount: 1234,
    protocols: ["Uniswap", "Curve", "Aave", "Maker"],
    crossProtocolMoves: 234,
    lastActive: "1m ago",
    pattern: "arbitrageur",
    confidence: 98,
    isActive: true,
    recentTransactions: [
      { type: "Swap", protocol: "Uniswap", amount: 800000, time: "1m ago", hash: "0xdef123" },
      { type: "Swap", protocol: "Curve", amount: 750000, time: "3m ago", hash: "0xghi456" },
      { type: "Swap", protocol: "Uniswap", amount: 900000, time: "8m ago", hash: "0xjkl789" },
      { type: "Swap", protocol: "Curve", amount: 650000, time: "12m ago", hash: "0xmno012" },
      { type: "Swap", protocol: "Uniswap", amount: 720000, time: "18m ago", hash: "0xpqr345" },
    ],
    patternExplanation:
      "High-frequency trading across multiple DEXs. Exploiting price differences with rapid execution and minimal slippage.",
    historicalAccuracy: 95,
    following: false,
  },
  {
    id: "4",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    avatar: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    totalVolume: 6700000,
    transactionCount: 89,
    protocols: ["Aave", "Maker", "Uniswap"],
    crossProtocolMoves: 23,
    lastActive: "3m ago",
    pattern: "panic",
    confidence: 88,
    isActive: true,
    recentTransactions: [
      { type: "Withdraw", protocol: "Aave", amount: 1200000, time: "3m ago", hash: "0xstu678" },
      { type: "Withdraw", protocol: "Maker", amount: 950000, time: "5m ago", hash: "0xvwx901" },
      { type: "Swap", protocol: "Uniswap", amount: 800000, time: "8m ago", hash: "0xyz234" },
      { type: "Withdraw", protocol: "Aave", amount: 750000, time: "12m ago", hash: "0xabc567" },
      { type: "Swap", protocol: "Uniswap", amount: 600000, time: "15m ago", hash: "0xdef890" },
    ],
    patternExplanation:
      "Rapid withdrawal of positions across protocols. Large volume exits suggest risk-off behavior or portfolio rebalancing.",
    historicalAccuracy: 79,
    following: false,
  },
]

export function WhaleTracker() {
  const [whales, setWhales] = useState<WhaleData[]>(mockWhales)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"volume" | "active" | "confidence">("volume")
  const [filterPattern, setFilterPattern] = useState<PatternType | "all">("all")

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  const handleToggleFollow = (id: string) => {
    setWhales(whales.map((whale) => (whale.id === id ? { ...whale, following: !whale.following } : whale)))
  }

  const sortedAndFilteredWhales = whales
    .filter((whale) => filterPattern === "all" || whale.pattern === filterPattern)
    .sort((a, b) => {
      if (sortBy === "volume") return b.totalVolume - a.totalVolume
      if (sortBy === "confidence") return b.confidence - a.confidence
      return 0 // For "active", keep current order
    })

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <span>🐋</span>
          <span>Whale Activity</span>
        </h3>
        <p className="text-sm text-white/60">Tracking wallets with 100K+ USD transactions</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Sort */}
        <div className="flex gap-2">
          <Button
            variant={sortBy === "volume" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("volume")}
            className={sortBy === "volume" ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : ""}
          >
            Volume
          </Button>
          <Button
            variant={sortBy === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("active")}
            className={sortBy === "active" ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : ""}
          >
            Last Active
          </Button>
          <Button
            variant={sortBy === "confidence" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("confidence")}
            className={sortBy === "confidence" ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : ""}
          >
            Confidence
          </Button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterPattern === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPattern("all")}
            className={filterPattern === "all" ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : ""}
          >
            All
          </Button>
          {Object.entries(patternConfig).map(([key, config]) => {
            const Icon = config.icon
            return (
              <Button
                key={key}
                variant={filterPattern === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPattern(key as PatternType)}
                className={filterPattern === key ? `${config.bgColor} ${config.borderColor} ${config.color}` : ""}
              >
                <Icon className="w-3 h-3 mr-1" />
                {config.label.split(" ")[0]}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Whale List */}
      <div className="space-y-4">
        {sortedAndFilteredWhales.map((whale) => {
          const pattern = patternConfig[whale.pattern]
          const PatternIcon = pattern.icon
          const isExpanded = expandedId === whale.id

          return (
            <div
              key={whale.id}
              className="glass-card-hover p-4 border border-white/10 rounded-lg transition-all duration-300 hover:border-purple-500/50"
            >
              {/* Header Row */}
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar with pulse animation for active whales */}
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: whale.avatar }}
                  >
                    {whale.address.slice(2, 4).toUpperCase()}
                  </div>
                  {whale.isActive && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-black" />
                  )}
                </div>

                {/* Wallet Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {whale.ensName && <span className="text-white font-semibold">{whale.ensName}</span>}
                    <button
                      onClick={() => handleCopyAddress(whale.address)}
                      className="text-white/60 hover:text-white text-sm font-mono flex items-center gap-1 transition-colors"
                    >
                      {whale.address.slice(0, 6)}...{whale.address.slice(-4)}
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Pattern Badge */}
                  <div className="group relative inline-block">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${pattern.bgColor} ${pattern.borderColor} border ${pattern.color}`}
                    >
                      <PatternIcon className="w-3 h-3" />
                      <span>{pattern.label}</span>
                    </div>
                    {/* Confidence tooltip */}
                    <div className="absolute left-0 top-full mt-1 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      Confidence: {whale.confidence}%
                    </div>
                  </div>
                </div>

                {/* Expand Button */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : whale.id)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                {/* Total Volume */}
                <div>
                  <div className="text-xs text-white/60 mb-1">Total Volume</div>
                  <div className="text-lg font-bold text-white">${(whale.totalVolume / 1000000).toFixed(1)}M</div>
                </div>

                {/* Transaction Count */}
                <div>
                  <div className="text-xs text-white/60 mb-1">Transactions</div>
                  <div className="text-lg font-bold text-white">#{whale.transactionCount}</div>
                </div>

                {/* Protocols */}
                <div>
                  <div className="text-xs text-white/60 mb-1">Protocols</div>
                  <div className="flex gap-1">
                    {whale.protocols.slice(0, 3).map((protocol) => (
                      <div
                        key={protocol}
                        className={`w-6 h-6 rounded-full ${protocolColors[protocol]} flex items-center justify-center text-white text-xs font-bold`}
                        title={protocol}
                      >
                        {protocol[0]}
                      </div>
                    ))}
                    {whale.protocols.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs">
                        +{whale.protocols.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                {/* Cross-Protocol Moves */}
                <div>
                  <div className="text-xs text-white/60 mb-1 flex items-center gap-1">
                    <ArrowLeftRight className="w-3 h-3" />
                    Cross-Protocol
                  </div>
                  <div className="text-lg font-bold text-white">{whale.crossProtocolMoves}</div>
                </div>

                {/* Last Active */}
                <div>
                  <div className="text-xs text-white/60 mb-1">Last Active</div>
                  <div className="text-lg font-bold text-purple-400">{whale.lastActive}</div>
                </div>
              </div>

              {/* Expandable Details */}
              {isExpanded && (
                <div className="border-t border-white/10 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                  {/* Recent Transactions */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Recent Transactions</h4>
                    <div className="space-y-2">
                      {whale.recentTransactions.map((tx, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm bg-white/5 rounded p-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                tx.type === "Deposit"
                                  ? "bg-green-500/20 text-green-400"
                                  : tx.type === "Withdraw"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-pink-500/20 text-pink-400"
                              }`}
                            >
                              {tx.type}
                            </span>
                            <span className="text-white/60">{tx.protocol}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-white font-semibold">${(tx.amount / 1000).toFixed(0)}K</span>
                            <span className="text-white/40 text-xs">{tx.time}</span>
                            <a
                              href={`https://etherscan.io/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pattern Explanation */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Pattern Analysis</h4>
                    <p className="text-sm text-white/70 bg-white/5 rounded p-3">{whale.patternExplanation}</p>
                  </div>

                  {/* Historical Accuracy */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-1">Historical Accuracy</h4>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                            style={{ width: `${whale.historicalAccuracy}%` }}
                          />
                        </div>
                        <span className="text-sm text-white font-semibold">{whale.historicalAccuracy}%</span>
                      </div>
                    </div>

                    {/* Follow Button */}
                    <Button
                      onClick={() => handleToggleFollow(whale.id)}
                      variant={whale.following ? "default" : "outline"}
                      size="sm"
                      className={whale.following ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : ""}
                    >
                      {whale.following ? (
                        <>
                          <Bell className="w-4 h-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <BellOff className="w-4 h-4 mr-2" />
                          Follow Whale
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
