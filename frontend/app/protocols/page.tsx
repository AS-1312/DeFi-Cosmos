"use client"

import { ProtocolStatsGrid } from "../../components/ProtocolStatsGrid"
import { ProtocolHealthPanel } from "../../components/ProtocolHealthPanel"
import { BarChart3, TrendingUp, Activity, Zap } from "lucide-react"
import { useState } from "react"
import { useProtocolStats } from "@/hooks/useProtocolStats"

export default function ProtocolsPage() {
  const [sortBy, setSortBy] = useState<"tvl" | "volume" | "health">("tvl")
  const [comparisonMetric, setComparisonMetric] = useState<"tvl" | "volume" | "tps" | "health">("tvl")
  const { protocols } = useProtocolStats()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">DeFi Protocols</h1>
          <p className="text-lg text-gray-400">Real-time protocol analytics and health monitoring</p>
        </div>

        {/* Filter/Sort Controls */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Sort by:</span>
          <div className="flex gap-2">
            {[
              { value: "tvl", label: "TVL" },
              { value: "volume", label: "Volume" },
              { value: "health", label: "Health" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === option.value
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Protocol Stats Grid */}
      <ProtocolStatsGrid />

      {/* Protocol Health Panel */}
      <ProtocolHealthPanel />

      {/* Protocol Comparison Chart */}
      <div className="glass-card p-6 rounded-xl border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-6">Protocol Comparison</h2>

        {/* Metric Toggle */}
        <div className="flex gap-2 mb-6">
          {[
            { icon: BarChart3, label: "TVL", value: "tvl" as const },
            { icon: TrendingUp, label: "Volume", value: "volume" as const },
            { icon: Zap, label: "TPS", value: "tps" as const },
            { icon: Activity, label: "Health", value: "health" as const },
          ].map((metric) => (
            <button
              key={metric.label}
              onClick={() => setComparisonMetric(metric.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                comparisonMetric === metric.value
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70"
              }`}
            >
              <metric.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{metric.label}</span>
            </button>
          ))}
        </div>

        {/* Comparison Bar Chart */}
        <div className="space-y-4">
          {protocols.map((protocol) => {
            let value = 0
            let displayValue = ""
            let maxValue = 0

            // Calculate values based on selected metric
            if (comparisonMetric === "tvl") {
              const tvlBigInt = BigInt(protocol.tvl || '0')
              value = Number(tvlBigInt) / 1e18
              maxValue = Math.max(...protocols.map(p => Number(BigInt(p.tvl || '0')) / 1e18))
              displayValue = value > 1000 
                ? `${(value / 1000).toFixed(1)}K ETH` 
                : `${value.toFixed(1)} ETH`
            } else if (comparisonMetric === "volume") {
              if (protocol.volume24h) {
                const volumeBigInt = BigInt(protocol.volume24h)
                value = Number(volumeBigInt) / 1e18
                const protocolsWithVolume = protocols.filter(p => p.volume24h)
                maxValue = Math.max(...protocolsWithVolume.map(p => Number(BigInt(p.volume24h || '0')) / 1e18))
                displayValue = value > 1000 
                  ? `${(value / 1000).toFixed(1)}K ETH` 
                  : `${value.toFixed(1)} ETH`
              } else {
                displayValue = "N/A"
              }
            } else if (comparisonMetric === "tps") {
              value = protocol.tps || 0
              maxValue = Math.max(...protocols.map(p => p.tps || 0))
              displayValue = value.toFixed(2)
            } else if (comparisonMetric === "health") {
              value = protocol.healthScore || 0
              maxValue = 100
              displayValue = value > 0 ? `${value}/100` : "N/A"
            }

            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0

            return (
              <div key={protocol.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{protocol.icon}</span>
                    <span className="text-white font-medium">{protocol.name}</span>
                  </div>
                  <span className="text-gray-400">{displayValue}</span>
                </div>
                <div className="h-8 bg-white/5 rounded-lg overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-500`}
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: protocol.color,
                      boxShadow: `0 0 10px ${protocol.color}40`
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
