"use client"

import { CosmosVisualization } from "@/components/CosmosVisualization"
import { WelcomeScreen } from "@/components/WelcomeScreen"
import { TrendingUp, Users, DollarSign } from "lucide-react"

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <WelcomeScreen />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
        <p className="text-lg text-gray-400">Real-time DeFi ecosystem observatory</p>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT COLUMN - 60% width (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* 3D Cosmos Visualization - Large and prominent */}
          <div className="h-[70vh] min-h-[600px]">
            <CosmosVisualization />
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-sm text-gray-400">Total TVL</div>
              </div>
              <div className="text-3xl font-bold text-white">$89.2B</div>
              <div className="text-sm text-green-400 mt-2">+2.4% (24h)</div>
            </div>

            <div className="glass-card p-6 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-sm text-gray-400">24h Volume</div>
              </div>
              <div className="text-3xl font-bold text-white">$12.8B</div>
              <div className="text-sm text-green-400 mt-2">+8.1% (24h)</div>
            </div>

            <div className="glass-card p-6 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-sm text-gray-400">Active Wallets</div>
              </div>
              <div className="text-3xl font-bold text-white">234.5K</div>
              <div className="text-sm text-yellow-400 mt-2">-1.2% (24h)</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - 40% width (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Protocol Health Overview - Compact */}
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Protocol Health</h2>
              <a href="/protocols" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                View All →
              </a>
            </div>
            <div className="space-y-3">
              {[
                { name: "Uniswap", health: 95, color: "text-green-400", bg: "bg-green-400" },
                { name: "Aave", health: 88, color: "text-green-400", bg: "bg-green-400" },
                { name: "Curve", health: 72, color: "text-yellow-400", bg: "bg-yellow-400" },
                { name: "Lido", health: 91, color: "text-green-400", bg: "bg-green-400" },
              ].map((protocol) => (
                <div key={protocol.name} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${protocol.bg}`} />
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{protocol.name}</div>
                  </div>
                  <div className={`text-sm font-medium ${protocol.color}`}>{protocol.health}/100</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Preview */}
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              <a href="/feed" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                View All →
              </a>
            </div>
            <div className="space-y-3">
              {[
                { type: "Swap", amount: "$2.3M", protocol: "Uniswap", time: "2m ago" },
                { type: "Deposit", amount: "$1.8M", protocol: "Aave", time: "5m ago" },
                { type: "Withdrawal", amount: "$3.1M", protocol: "Curve", time: "8m ago" },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{activity.type}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {activity.amount} • {activity.protocol}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
