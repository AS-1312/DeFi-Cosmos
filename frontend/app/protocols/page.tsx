"use client"

import { ProtocolStatsGrid } from "@/components/ProtocolStatsGrid"
import { ProtocolHealthPanel } from "@/components/ProtocolHealthPanel"
import { BarChart3, TrendingUp, Activity, Zap } from "lucide-react"
import { useState } from "react"

export default function ProtocolsPage() {
  const [sortBy, setSortBy] = useState<"tvl" | "volume" | "health">("tvl")

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
            { icon: BarChart3, label: "TVL" },
            { icon: TrendingUp, label: "Volume" },
            { icon: Zap, label: "TPS" },
            { icon: Activity, label: "Health" },
          ].map((metric) => (
            <button
              key={metric.label}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <metric.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{metric.label}</span>
            </button>
          ))}
        </div>

        {/* Comparison Bar Chart */}
        <div className="space-y-4">
          {[
            { name: "Uniswap", value: 24.5, color: "bg-[#ff007a]", percentage: 100 },
            { name: "Aave", value: 18.2, color: "bg-[#8b5cf6]", percentage: 74 },
            { name: "Curve", value: 15.8, color: "bg-[#3b82f6]", percentage: 64 },
            { name: "Lido", value: 22.1, color: "bg-[#f97316]", percentage: 90 },
            { name: "Maker", value: 8.6, color: "bg-[#1aab9b]", percentage: 35 },
          ].map((protocol) => (
            <div key={protocol.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white font-medium">{protocol.name}</span>
                <span className="text-gray-400">${protocol.value}B</span>
              </div>
              <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
                <div
                  className={`h-full ${protocol.color} transition-all duration-500`}
                  style={{ width: `${protocol.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
