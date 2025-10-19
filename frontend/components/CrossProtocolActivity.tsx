"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, TrendingDown, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts"

type FlowType = "arbitrage" | "yield" | "rebalancing"

interface ProtocolFlow {
  id: string
  from: string
  to: string
  fromColor: string
  toColor: string
  flowType: FlowType
  walletCount: number
  totalFlow: string
  avgTime: string
  trend: number
  recentFlows: Array<{
    wallet: string
    amount: string
    time: string
  }>
  chartData: Array<{ time: string; value: number }>
  topWallets: Array<{ address: string; amount: string }>
}

const flowTypeConfig = {
  arbitrage: { label: "Arbitrage", icon: "⚡", color: "text-pink-400 bg-pink-500/20 border-pink-500/30" },
  yield: { label: "Yield Seeking", icon: "📈", color: "text-blue-400 bg-blue-500/20 border-blue-500/30" },
  rebalancing: { label: "Rebalancing", icon: "⚖️", color: "text-purple-400 bg-purple-500/20 border-purple-500/30" },
}

const mockFlows: ProtocolFlow[] = [
  {
    id: "1",
    from: "Aave",
    to: "Curve",
    fromColor: "#8b5cf6",
    toColor: "#3b82f6",
    flowType: "yield",
    walletCount: 156,
    totalFlow: "1,850 ETH + 8.2M USDC",
    avgTime: "2m 15s",
    trend: 12.5,
    recentFlows: [
      { wallet: "0x742d...3f8a", amount: "45 ETH", time: "2m ago" },
      { wallet: "0x8f3c...9d2b", amount: "32 ETH", time: "5m ago" },
      { wallet: "0x1a4e...7c6d", amount: "85,000 USDC", time: "8m ago" },
    ],
    chartData: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      value: Math.random() * 5000000 + 1000000,
    })),
    topWallets: [
      { address: "0x742d...3f8a", amount: "850 ETH" },
      { address: "0x8f3c...9d2b", amount: "620 ETH" },
    ],
  },
  {
    id: "2",
    from: "Uniswap",
    to: "Aave",
    fromColor: "#ff007a",
    toColor: "#8b5cf6",
    flowType: "arbitrage",
    walletCount: 89,
    totalFlow: "1,120 ETH",
    avgTime: "1m 45s",
    trend: -5.2,
    recentFlows: [
      { wallet: "0x5b2a...4e1c", amount: "52 ETH", time: "1m ago" },
      { wallet: "0x9c7d...2f3a", amount: "38 ETH", time: "3m ago" },
    ],
    chartData: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      value: Math.random() * 4000000 + 800000,
    })),
    topWallets: [
      { address: "0x5b2a...4e1c", amount: "320 ETH" },
      { address: "0x9c7d...2f3a", amount: "280 ETH" },
    ],
  },
  {
    id: "3",
    from: "Lido",
    to: "Curve",
    fromColor: "#f97316",
    toColor: "#3b82f6",
    flowType: "rebalancing",
    walletCount: 203,
    totalFlow: "2,480 ETH + 12.5M DAI",
    avgTime: "3m 30s",
    trend: 8.7,
    recentFlows: [
      { wallet: "0x3d8f...6a2b", amount: "125 ETH", time: "4m ago" },
      { wallet: "0x7e1c...9f4d", amount: "2.8M DAI", time: "6m ago" },
    ],
    chartData: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      value: Math.random() * 6000000 + 2000000,
    })),
    topWallets: [
      { address: "0x3d8f...6a2b", amount: "1,250 ETH" },
      { address: "0x7e1c...9f4d", amount: "980 ETH" },
    ],
  },
  {
    id: "4",
    from: "Curve",
    to: "Lido",
    fromColor: "#3b82f6",
    toColor: "#f97316",
    flowType: "yield",
    walletCount: 134,
    totalFlow: "965 ETH + 5.4M USDC",
    avgTime: "2m 50s",
    trend: 15.3,
    recentFlows: [
      { wallet: "0x6c4a...8d3e", amount: "95 ETH", time: "3m ago" },
      { wallet: "0x2f9b...5c1a", amount: "1.2M USDC", time: "7m ago" },
    ],
    chartData: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      value: Math.random() * 3500000 + 900000,
    })),
    topWallets: [
      { address: "0x6c4a...8d3e", amount: "720 ETH" },
      { address: "0x2f9b...5c1a", amount: "540 ETH" },
    ],
  },
]

export function CrossProtocolActivity() {
  const [expandedFlow, setExpandedFlow] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"volume" | "wallets" | "recency">("volume")
  const [filterType, setFilterType] = useState<FlowType | "all">("all")
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h" | "7d">("24h")

  const filteredFlows = mockFlows
    .filter((flow) => filterType === "all" || flow.flowType === filterType)
    .sort((a, b) => {
      if (sortBy === "volume") {
        // Extract first numeric value from totalFlow string for sorting
        const getNumericValue = (flow: string) => parseFloat(flow.replace(/[^0-9.]/g, ''))
        return getNumericValue(b.totalFlow) - getNumericValue(a.totalFlow)
      }
      if (sortBy === "wallets") return b.walletCount - a.walletCount
      return 0
    })

  const totalWallets = mockFlows.reduce((sum, flow) => sum + flow.walletCount, 0)
  const mostActiveFlow = mockFlows.reduce((max, flow) => (flow.walletCount > max.walletCount ? flow : max))

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-1">Capital Flows</h3>
        <p className="text-sm text-gray-400">24-hour cross-protocol movements</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2">
          <Button
            variant={sortBy === "volume" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("volume")}
            className="text-xs"
          >
            Volume
          </Button>
          <Button
            variant={sortBy === "wallets" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("wallets")}
            className="text-xs"
          >
            Wallets
          </Button>
          <Button
            variant={sortBy === "recency" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("recency")}
            className="text-xs"
          >
            Recent
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
            className="text-xs"
          >
            All
          </Button>
          <Button
            variant={filterType === "arbitrage" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("arbitrage")}
            className="text-xs"
          >
            ⚡ Arbitrage
          </Button>
          <Button
            variant={filterType === "yield" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("yield")}
            className="text-xs"
          >
            📈 Yield
          </Button>
          <Button
            variant={filterType === "rebalancing" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("rebalancing")}
            className="text-xs"
          >
            ⚖️ Rebalance
          </Button>
        </div>

        <div className="flex gap-2 ml-auto">
          {(["1h", "6h", "24h", "7d"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="text-xs"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Flow List */}
      <div className="space-y-4 mb-6">
        {filteredFlows.map((flow) => {
          const isExpanded = expandedFlow === flow.id
          const config = flowTypeConfig[flow.flowType]

          return (
            <div
              key={flow.id}
              className="glass-card-hover p-4 cursor-pointer transition-all duration-300"
              onClick={() => setExpandedFlow(isExpanded ? null : flow.id)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <span>{flow.from}</span>
                    <ArrowRight className="w-4 h-4 text-purple-400" />
                    <span>{flow.to}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs border ${config.color}`}>
                    {config.icon} {config.label}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                <div>
                  <div className="text-gray-400 text-xs">Wallets</div>
                  <div className="text-white font-semibold">{flow.walletCount}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Total Flow</div>
                  <div className="text-white font-semibold">{flow.totalFlow}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Avg Time</div>
                  <div className="text-white font-semibold">{flow.avgTime}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Trend</div>
                  <div
                    className={`font-semibold flex items-center gap-1 ${flow.trend > 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {flow.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(flow.trend)}%
                  </div>
                </div>
              </div>

              {/* Animated Flow Bar */}
              <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full animate-pulse"
                  style={{
                    width: `${50 + (flow.walletCount / 3)}%`,
                    background: `linear-gradient(to right, ${flow.fromColor}, ${flow.toColor})`,
                    boxShadow: `0 0 20px ${flow.toColor}40`,
                  }}
                />
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                  {/* Recent Flows */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Recent Flows</h4>
                    <div className="space-y-2">
                      {flow.recentFlows.map((recentFlow, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">{recentFlow.wallet}</span>
                            <ExternalLink className="w-3 h-3 text-gray-500" />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-white font-semibold">{recentFlow.amount}</span>
                            <span className="text-gray-500 text-xs">{recentFlow.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flow Distribution Chart */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Flow Distribution (24h)</h4>
                    <ResponsiveContainer width="100%" height={100}>
                      <AreaChart data={flow.chartData}>
                        <defs>
                          <linearGradient id={`gradient-${flow.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={flow.toColor} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={flow.toColor} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={flow.toColor}
                          fill={`url(#gradient-${flow.id})`}
                          strokeWidth={2}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "8px",
                            padding: "8px",
                          }}
                          formatter={(value: number) => [(value / 1000000).toFixed(2) + "M", "Flow"]}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Top Wallets */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Top Wallets</h4>
                    <div className="space-y-2">
                      {flow.topWallets.map((wallet, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">{wallet.address}</span>
                            <ExternalLink className="w-3 h-3 text-gray-500" />
                          </div>
                          <span className="text-white font-semibold">{wallet.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <div>
          <div className="text-xs text-gray-400 mb-1">Total Unique Wallets</div>
          <div className="text-lg font-bold text-white">{totalWallets}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Most Active Pair</div>
          <div className="text-sm font-bold text-white">
            {mostActiveFlow.from} → {mostActiveFlow.to}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Avg Flow Time</div>
          <div className="text-lg font-bold text-white">{mostActiveFlow.avgTime}</div>
        </div>
      </div>
    </div>
  )
}
