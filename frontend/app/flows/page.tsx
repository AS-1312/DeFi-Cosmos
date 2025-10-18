"use client"

import { CrossProtocolActivity } from "@/components/CrossProtocolActivity"
import { TrendingUp, ArrowRight } from "lucide-react"
import { useState } from "react"

export default function FlowsPage() {
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h" | "7d">("24h")

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Capital Flows</h1>
          <p className="text-lg text-gray-400">Track money moving between DeFi protocols</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(["1h", "6h", "24h", "7d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Main Section - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT - Flow Visualization (60%) */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6 rounded-xl border border-white/10 h-[600px]">
            <h2 className="text-xl font-semibold text-white mb-4">Flow Visualization</h2>
            <div className="flex items-center justify-center h-[500px] text-gray-400">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Interactive Sankey diagram coming soon</p>
                <p className="text-sm mt-2">Visualizing capital flows between protocols</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Hot Protocol Pairs (40%) */}
        <div className="lg:col-span-2">
          <CrossProtocolActivity />
        </div>
      </div>

      {/* Recent Capital Flows Table */}
      <div className="glass-card p-6 rounded-xl border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-6">Recent Capital Flows</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Wallet</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">From</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400"></th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">To</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 20 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-400">{i + 1}m ago</td>
                  <td className="py-3 px-4 text-sm text-white font-mono">
                    0x{Math.random().toString(16).slice(2, 8)}...{Math.random().toString(16).slice(2, 6)}
                  </td>
                  <td className="py-3 px-4 text-sm text-white">Aave</td>
                  <td className="py-3 px-4 text-center">
                    <ArrowRight className="w-4 h-4 text-gray-500 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-sm text-white">Compound</td>
                  <td className="py-3 px-4 text-sm text-purple-400 font-medium text-right">
                    ${(Math.random() * 500 + 100).toFixed(1)}K
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                      Yield Seeking
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
