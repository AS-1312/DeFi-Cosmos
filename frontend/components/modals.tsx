"use client"

import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X, ExternalLink, Copy, TrendingDown, Activity, AlertTriangle } from "lucide-react"
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

// Protocol Details Modal
export function ProtocolDetailsModal({
  open,
  onOpenChange,
  protocol,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  protocol: {
    name: string
    color: string
    tvl: string
    health: number
    volume24h: string
    transactions24h: string
    apy: string
  }
}) {
  const [activeTab, setActiveTab] = useState("overview")

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "statistics", label: "Statistics" },
    { id: "activity", label: "Recent Activity" },
    { id: "risk", label: "Risk Metrics" },
  ]

  const historicalData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    tvl: Math.random() * 5 + 10,
  }))

  const recentTransactions = [
    { hash: "0x1a2b3c...", type: "Swap", amount: "$12,450", time: "2m ago" },
    { hash: "0x4d5e6f...", type: "Deposit", amount: "$8,200", time: "5m ago" },
    { hash: "0x7g8h9i...", type: "Withdraw", amount: "$15,600", time: "8m ago" },
  ]

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4">
          <div className="glass-card border-white/20">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: `${protocol.color}20`, color: protocol.color }}
                >
                  {protocol.name[0]}
                </div>
                <div>
                  <Dialog.Title className="text-2xl font-bold text-white">{protocol.name}</Dialog.Title>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-400">Health Score:</span>
                    <span
                      className={`text-sm font-semibold ${
                        protocol.health >= 80
                          ? "text-green-400"
                          : protocol.health >= 50
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {protocol.health}/100
                    </span>
                  </div>
                </div>
              </div>
              <Dialog.Close className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </Dialog.Close>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-2 border-b border-white/10 bg-black/20">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card-subtle p-4">
                      <div className="text-sm text-gray-400 mb-1">TVL</div>
                      <div className="text-xl font-bold text-white">{protocol.tvl}</div>
                    </div>
                    <div className="glass-card-subtle p-4">
                      <div className="text-sm text-gray-400 mb-1">24h Volume</div>
                      <div className="text-xl font-bold text-white">{protocol.volume24h}</div>
                    </div>
                    <div className="glass-card-subtle p-4">
                      <div className="text-sm text-gray-400 mb-1">Transactions</div>
                      <div className="text-xl font-bold text-white">{protocol.transactions24h}</div>
                    </div>
                    <div className="glass-card-subtle p-4">
                      <div className="text-sm text-gray-400 mb-1">APY</div>
                      <div className="text-xl font-bold text-green-400">{protocol.apy}</div>
                    </div>
                  </div>

                  {/* Historical TVL Chart */}
                  <div className="glass-card-subtle p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">TVL History (30 Days)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={historicalData}>
                        <XAxis dataKey="day" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.8)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                          }}
                        />
                        <Line type="monotone" dataKey="tvl" stroke={protocol.color} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Description */}
                  <div className="glass-card-subtle p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">About {protocol.name}</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {protocol.name} is a leading DeFi protocol providing innovative financial services on the Ethereum
                      blockchain. With robust security measures and high liquidity, it continues to be a trusted
                      platform for users worldwide.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "statistics" && (
                <div className="space-y-6">
                  <div className="glass-card-subtle p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Detailed Statistics</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Total Users", value: "125,432", change: "+5.2%" },
                        { label: "Active Wallets (24h)", value: "8,234", change: "+12.1%" },
                        { label: "Average Transaction Size", value: "$4,521", change: "-2.3%" },
                        { label: "Protocol Revenue (24h)", value: "$125,000", change: "+8.7%" },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="flex items-center justify-between py-2 border-b border-white/5"
                        >
                          <span className="text-sm text-gray-400">{stat.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{stat.value}</span>
                            <span
                              className={`text-xs ${stat.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}
                            >
                              {stat.change}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "activity" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
                    <select className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-sm text-white">
                      <option>All Types</option>
                      <option>Swaps</option>
                      <option>Deposits</option>
                      <option>Withdrawals</option>
                    </select>
                  </div>
                  {recentTransactions.map((tx) => (
                    <div key={tx.hash} className="glass-card-subtle p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{tx.type}</div>
                            <div className="text-xs text-gray-400">{tx.hash}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-white">{tx.amount}</div>
                          <div className="text-xs text-gray-400">{tx.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "risk" && (
                <div className="space-y-6">
                  <div className="glass-card-subtle p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Risk Breakdown</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Smart Contract Risk", score: 95, color: "green" },
                        { label: "Liquidity Risk", score: 78, color: "yellow" },
                        { label: "Centralization Risk", score: 82, color: "green" },
                        { label: "Market Risk", score: 65, color: "yellow" },
                      ].map((risk) => (
                        <div key={risk.label}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-300">{risk.label}</span>
                            <span
                              className={`text-sm font-semibold ${
                                risk.color === "green" ? "text-green-400" : "text-yellow-400"
                              }`}
                            >
                              {risk.score}/100
                            </span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${risk.color === "green" ? "bg-green-500" : "bg-yellow-500"}`}
                              style={{ width: `${risk.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card-subtle p-4 border-yellow-500/30">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-yellow-400 mb-1">Active Warnings</h4>
                        <p className="text-sm text-gray-300">
                          High utilization detected. Consider monitoring liquidity levels closely.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Whale Details Modal
export function WhaleDetailsModal({
  open,
  onOpenChange,
  whale,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  whale: {
    address: string
    ens?: string
    pattern: string
    totalVolume: string
    txCount: number
    protocols: string[]
  }
}) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(whale.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const protocolUsage = [
    { name: "Aave", value: 35, color: "#8b5cf6" },
    { name: "Uniswap", value: 30, color: "#ff007a" },
    { name: "Curve", value: 20, color: "#3b82f6" },
    { name: "Lido", value: 15, color: "#f97316" },
  ]

  const transactions = [
    { hash: "0x1a2b3c4d...", protocol: "Aave", type: "Deposit", amount: "$125,000", time: "2h ago" },
    { hash: "0x5e6f7g8h...", protocol: "Uniswap", type: "Swap", amount: "$89,500", time: "5h ago" },
    { hash: "0x9i0j1k2l...", protocol: "Curve", type: "Withdraw", amount: "$156,000", time: "1d ago" },
  ]

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4">
          <div className="glass-card border-white/20">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500" />
                    <div>
                      <Dialog.Title className="text-xl font-bold text-white">
                        {whale.ens || "Whale Wallet"}
                      </Dialog.Title>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-400 font-mono">{whale.address}</span>
                        <button onClick={handleCopy} className="p-1 hover:bg-white/10 rounded transition-colors">
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                        {copied && <span className="text-xs text-green-400">Copied!</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <Dialog.Close className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </Dialog.Close>
              </div>

              {/* Pattern Badge */}
              <div className="glass-card-subtle p-4 border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-purple-400">Trading Pattern</span>
                  <span className="px-2 py-1 rounded-full bg-purple-500/20 text-xs text-purple-300">
                    {whale.pattern}
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  This whale exhibits {whale.pattern.toLowerCase()} behavior, consistently moving capital to maximize
                  yields across multiple protocols.
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)] space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-card-subtle p-4">
                  <div className="text-sm text-gray-400 mb-1">Total Volume</div>
                  <div className="text-xl font-bold text-white">{whale.totalVolume}</div>
                </div>
                <div className="glass-card-subtle p-4">
                  <div className="text-sm text-gray-400 mb-1">Transactions</div>
                  <div className="text-xl font-bold text-white">{whale.txCount}</div>
                </div>
                <div className="glass-card-subtle p-4">
                  <div className="text-sm text-gray-400 mb-1">Protocols</div>
                  <div className="text-xl font-bold text-white">{whale.protocols.length}</div>
                </div>
              </div>

              {/* Protocol Usage */}
              <div className="glass-card-subtle p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Protocol Usage</h3>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie
                        data={protocolUsage}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {protocolUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {protocolUsage.map((protocol) => (
                      <div key={protocol.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: protocol.color }} />
                          <span className="text-sm text-gray-300">{protocol.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">{protocol.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.hash} className="glass-card-subtle p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-sm">
                            <div className="font-medium text-white">{tx.type}</div>
                            <div className="text-xs text-gray-400">{tx.protocol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-white">{tx.amount}</div>
                          <div className="text-xs text-gray-400">{tx.time}</div>
                        </div>
                        <a
                          href={`https://etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex items-center justify-between">
              <a
                href={`https://etherscan.io/address/${whale.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                View on Etherscan
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  isFollowing
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/50"
                }`}
              >
                {isFollowing ? "Following" : "Follow Whale"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Transaction Details Modal
export function TransactionDetailsModal({
  open,
  onOpenChange,
  transaction,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: {
    hash: string
    blockNumber: number
    timestamp: string
    from: string
    to: string
    amount: string
    gasUsed: string
    protocol: string
    type: string
  }
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4">
          <div className="glass-card border-white/20">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <Dialog.Title className="text-xl font-bold text-white">Transaction Details</Dialog.Title>
              <Dialog.Close className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-150px)] space-y-4">
              {/* Transaction Hash */}
              <div className="glass-card-subtle p-4">
                <div className="text-sm text-gray-400 mb-2">Transaction Hash</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-white">{transaction.hash}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(transaction.hash)}
                      className="p-2 hover:bg-white/10 rounded transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                    <a
                      href={`https://etherscan.io/tx/${transaction.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-white/10 rounded transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  </div>
                </div>
                {copied && <span className="text-xs text-green-400 mt-1">Copied!</span>}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card-subtle p-4">
                  <div className="text-sm text-gray-400 mb-1">Block Number</div>
                  <div className="text-lg font-semibold text-white">{transaction.blockNumber.toLocaleString()}</div>
                </div>
                <div className="glass-card-subtle p-4">
                  <div className="text-sm text-gray-400 mb-1">Timestamp</div>
                  <div className="text-lg font-semibold text-white">{transaction.timestamp}</div>
                </div>
                <div className="glass-card-subtle p-4">
                  <div className="text-sm text-gray-400 mb-1">Protocol</div>
                  <div className="text-lg font-semibold text-white">{transaction.protocol}</div>
                </div>
                <div className="glass-card-subtle p-4">
                  <div className="text-sm text-gray-400 mb-1">Type</div>
                  <div className="text-lg font-semibold text-white">{transaction.type}</div>
                </div>
              </div>

              {/* Addresses */}
              <div className="glass-card-subtle p-4">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">From</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-white">{transaction.from}</span>
                      <button
                        onClick={() => handleCopy(transaction.from)}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <TrendingDown className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-2">To</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-white">{transaction.to}</span>
                      <button
                        onClick={() => handleCopy(transaction.to)}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount & Gas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card-subtle p-4">
                  <div className="text-sm text-gray-400 mb-1">Amount</div>
                  <div className="text-2xl font-bold text-white">{transaction.amount}</div>
                </div>
                <div className="glass-card-subtle p-4">
                  <div className="text-sm text-gray-400 mb-1">Gas Used</div>
                  <div className="text-2xl font-bold text-white">{transaction.gasUsed}</div>
                </div>
              </div>

              {/* Protocol Interaction */}
              <div className="glass-card-subtle p-4 border-purple-500/30">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Protocol Interaction</h4>
                <p className="text-sm text-gray-300">
                  This transaction interacted with {transaction.protocol} to execute a {transaction.type.toLowerCase()}{" "}
                  operation. The transaction was successfully confirmed on block{" "}
                  {transaction.blockNumber.toLocaleString()}.
                </p>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
