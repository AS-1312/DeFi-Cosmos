"use client"

import { LiveActivityFeed } from "@/components/LiveActivityFeed"
import { BarChart3, PieChart, Activity } from "lucide-react"

export default function FeedPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Live Activity Feed</h1>
        <p className="text-lg text-gray-400">Real-time DeFi transactions across all protocols</p>
      </div>

      {/* Main Section - 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT - Transaction Feed (35%) */}
        <div className="lg:col-span-3">
          <LiveActivityFeed />
        </div>

        {/* CENTER - Activity Statistics (35%) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 rounded-xl border border-white/10 h-[300px]">
            <h2 className="text-lg font-semibold text-white mb-4">TPS by Protocol</h2>
            <div className="flex items-center justify-center h-[220px] text-gray-400">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Area chart coming soon</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/10 h-[300px]">
            <h2 className="text-lg font-semibold text-white mb-4">Volume Distribution</h2>
            <div className="flex items-center justify-center h-[220px] text-gray-400">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Pie chart coming soon</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/10 h-[300px]">
            <h2 className="text-lg font-semibold text-white mb-4">Transaction Types</h2>
            <div className="flex items-center justify-center h-[220px] text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Bar chart coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Notable Activity (30%) */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Notable Activity</h2>
            <div className="space-y-3">
              {[
                { type: "Whale", amount: "$2.3M", protocol: "Aave", action: "Deposit" },
                { type: "Large", amount: "$1.8M", protocol: "Curve", action: "Swap" },
                { type: "Whale", amount: "$3.1M", protocol: "Uniswap", action: "Withdraw" },
                { type: "Large", amount: "$1.2M", protocol: "Lido", action: "Stake" },
                { type: "Unusual", amount: "$890K", protocol: "Maker", action: "Borrow" },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                      {activity.type}
                    </span>
                    <span className="text-sm text-gray-400">{i + 1}m ago</span>
                  </div>
                  <div className="text-lg font-bold text-white">{activity.amount}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {activity.action} • {activity.protocol}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
