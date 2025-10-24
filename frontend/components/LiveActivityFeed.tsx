"use client"

import { useState, useEffect } from "react"
import { ArrowDownUp, TrendingUp, TrendingDown, Coins, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

type TransactionType = "swap" | "deposit" | "withdraw" | "borrow"
type Protocol = "uniswap" | "aave" | "curve" | "lido"

interface Transaction {
  id: string
  protocol: Protocol
  type: TransactionType
  from: string
  amount: string
  timestamp: number
  isWhale: boolean
  txHash: string
}

const protocolColors: Record<Protocol, string> = {
  uniswap: "bg-[#ff007a] text-white",
  aave: "bg-[#8b5cf6] text-white",
  curve: "bg-[#3b82f6] text-white",
  lido: "bg-[#f97316] text-white",
}

const typeIcons: Record<TransactionType, { icon: typeof ArrowDownUp; color: string }> = {
  swap: { icon: ArrowDownUp, color: "text-pink-400" },
  deposit: { icon: TrendingUp, color: "text-green-400" },
  withdraw: { icon: TrendingDown, color: "text-yellow-400" },
  borrow: { icon: Coins, color: "text-blue-400" },
}

// Generate mock transactions
const generateMockTransaction = (): Transaction => {
  const protocols: Protocol[] = ["uniswap", "aave", "curve", "lido"]
  const types: TransactionType[] = ["swap", "deposit", "withdraw", "borrow"]
  const protocol = protocols[Math.floor(Math.random() * protocols.length)]
  const type = types[Math.floor(Math.random() * types.length)]
  
  // Generate random amounts in native tokens
  const tokenTypes = ["ETH", "USDC", "DAI", "USDT"]
  const token = tokenTypes[Math.floor(Math.random() * tokenTypes.length)]
  const baseAmount = Math.random() * 500
  const amount = token === "ETH" 
    ? `${baseAmount.toFixed(2)} ETH`
    : `${(baseAmount * 2000).toFixed(0)} ${token}`
  
  const isWhale = token === "ETH" ? baseAmount > 100 : baseAmount * 2000 > 200000

  return {
    id: Math.random().toString(36).substring(7),
    protocol,
    type,
    from: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
    amount,
    timestamp: Date.now(),
    isWhale,
    txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
  }
}

const initialTransactions = Array.from({ length: 20 }, generateMockTransaction).sort(
  (a, b) => b.timestamp - a.timestamp,
)

export function LiveActivityFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [filter, setFilter] = useState<"all" | "swap" | "deposit" | "withdraw" | "whale">("all")

  // Simulate real-time transactions
  useEffect(() => {
    const interval = setInterval(() => {
      const newTransaction = generateMockTransaction()
      setTransactions((prev) => [newTransaction, ...prev].slice(0, 50))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true
    if (filter === "whale") return tx.isWhale
    return tx.type === filter
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
          variant={filter === "swap" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("swap")}
          className={filter === "swap" ? "bg-pink-600 hover:bg-pink-700" : "glass-panel border-white/10"}
        >
          Swaps
        </Button>
        <Button
          variant={filter === "deposit" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("deposit")}
          className={filter === "deposit" ? "bg-green-600 hover:bg-green-700" : "glass-panel border-white/10"}
        >
          Deposits
        </Button>
        <Button
          variant={filter === "withdraw" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("withdraw")}
          className={filter === "withdraw" ? "bg-yellow-600 hover:bg-yellow-700" : "glass-panel border-white/10"}
        >
          Withdrawals
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
        {filteredTransactions.map((tx, index) => {
          const TypeIcon = typeIcons[tx.type].icon
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
                  <TypeIcon className={`h-5 w-5 ${typeIcons[tx.type].color}`} />
                </div>

                {/* Center: Transaction Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-300">{tx.from}</span>
                    {tx.isWhale && <span className="text-lg">🐋</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="capitalize">{tx.type}</span>
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
        })}
      </div>
    </div>
  )
}
