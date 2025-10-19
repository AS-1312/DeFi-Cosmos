"use client"

import { useState } from "react"
import { Zap, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts"

interface GasUsageData {
  protocol: string
  color: string
  avgGasPerTx: number
  totalGasUsed24h: number
  txCount24h: number
  trend: number
  chartData: { time: string; gas: number }[]
}

const mockGasData: GasUsageData[] = [
  {
    protocol: "Uniswap",
    color: "#ff007a",
    avgGasPerTx: 185000,
    totalGasUsed24h: 2814000000,
    txCount24h: 15234,
    trend: 8.2,
    chartData: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      gas: 150000 + Math.random() * 100000,
    })),
  },
  {
    protocol: "Aave",
    color: "#8b5cf6",
    avgGasPerTx: 320000,
    totalGasUsed24h: 2688000000,
    txCount24h: 8400,
    trend: -3.5,
    chartData: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      gas: 280000 + Math.random() * 120000,
    })),
  },
  {
    protocol: "Curve",
    color: "#3b82f6",
    avgGasPerTx: 245000,
    totalGasUsed24h: 1495000000,
    txCount24h: 6100,
    trend: 5.1,
    chartData: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      gas: 200000 + Math.random() * 150000,
    })),
  },
  {
    protocol: "Lido",
    color: "#f97316",
    avgGasPerTx: 125000,
    totalGasUsed24h: 600000000,
    txCount24h: 4800,
    trend: -1.2,
    chartData: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      gas: 100000 + Math.random() * 80000,
    })),
  },
  {
    protocol: "Maker",
    color: "#1aab9b",
    avgGasPerTx: 280000,
    totalGasUsed24h: 896000000,
    txCount24h: 3200,
    trend: 2.8,
    chartData: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      gas: 220000 + Math.random() * 140000,
    })),
  },
]

export function GasUsageTracker() {
  const [sortBy, setSortBy] = useState<"avgGas" | "totalGas" | "txCount">("totalGas")
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null)

  const sortedData = [...mockGasData].sort((a, b) => {
    if (sortBy === "avgGas") return b.avgGasPerTx - a.avgGasPerTx
    if (sortBy === "totalGas") return b.totalGasUsed24h - a.totalGasUsed24h
    return b.txCount24h - a.txCount24h
  })

  const totalGasUsed = mockGasData.reduce((sum, d) => sum + d.totalGasUsed24h, 0)
  const totalTxCount = mockGasData.reduce((sum, d) => sum + d.txCount24h, 0)
  const avgGasAcrossAll = Math.floor(totalGasUsed / totalTxCount)

  const formatGas = (gas: number) => {
    if (gas >= 1000000000) return `${(gas / 1000000000).toFixed(2)}B`
    if (gas >= 1000000) return `${(gas / 1000000).toFixed(1)}M`
    if (gas >= 1000) return `${(gas / 1000).toFixed(0)}K`
    return gas.toString()
  }

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            <span>Gas Usage Patterns</span>
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-400">Total Gas (24h)</div>
              <div className="text-xl font-bold text-yellow-400">{formatGas(totalGasUsed)}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Avg Gas/Tx</div>
              <div className="text-xl font-bold text-white">{formatGas(avgGasAcrossAll)}</div>
            </div>
          </div>
        </div>
        <p className="text-sm text-white/60">Track gas consumption patterns across protocols</p>
      </div>

      {/* Sort Buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={sortBy === "totalGas" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("totalGas")}
          className={sortBy === "totalGas" ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300" : ""}
        >
          Total Gas
        </Button>
        <Button
          variant={sortBy === "avgGas" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("avgGas")}
          className={sortBy === "avgGas" ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300" : ""}
        >
          Avg Gas/Tx
        </Button>
        <Button
          variant={sortBy === "txCount" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("txCount")}
          className={sortBy === "txCount" ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300" : ""}
        >
          Tx Count
        </Button>
      </div>

      {/* Protocol List */}
      <div className="space-y-4">
        {sortedData.map((protocol) => {
          const isExpanded = expandedProtocol === protocol.protocol

          return (
            <div
              key={protocol.protocol}
              className="glass-card-hover p-4 cursor-pointer transition-all"
              onClick={() => setExpandedProtocol(isExpanded ? null : protocol.protocol)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: protocol.color }}
                  />
                  <span className="text-white font-semibold text-lg">{protocol.protocol}</span>
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    protocol.trend > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {protocol.trend > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(protocol.trend)}%
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <div className="text-gray-400 text-xs mb-1">Avg Gas/Tx</div>
                  <div className="text-white font-semibold">{formatGas(protocol.avgGasPerTx)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">Total Gas (24h)</div>
                  <div className="text-yellow-400 font-semibold">{formatGas(protocol.totalGasUsed24h)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">Transactions</div>
                  <div className="text-white font-semibold">{protocol.txCount24h.toLocaleString()}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${(protocol.totalGasUsed24h / totalGasUsed) * 100}%`,
                    backgroundColor: protocol.color,
                  }}
                />
              </div>

              {/* Expanded Chart */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-2">24h Gas Usage Pattern</h4>
                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={protocol.chartData}>
                      <defs>
                        <linearGradient id={`gradient-${protocol.protocol}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={protocol.color} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={protocol.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="gas"
                        stroke={protocol.color}
                        fill={`url(#gradient-${protocol.protocol})`}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                          padding: "8px",
                        }}
                        formatter={(value: number) => [formatGas(value), "Gas"]}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
